import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "../components/common/Modal";

const DialogContext = createContext(null);

const toneStyles = {
  info: {
    badge: "bg-sky-500/15 text-sky-300 border-sky-400/40",
    confirm: "from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300",
  },
  success: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
    confirm:
      "from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300",
  },
  warning: {
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/40",
    confirm:
      "from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300",
  },
  danger: {
    badge: "bg-rose-500/15 text-rose-300 border-rose-400/40",
    confirm: "from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400",
  },
};

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({
    open: false,
    mode: "alert",
    title: "",
    message: "",
    tone: "info",
    confirmText: "OK",
    cancelText: "Cancel",
  });

  const resolverRef = useRef(null);

  const closeDialog = useCallback((result = false) => {
    setDialog((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const openDialog = useCallback((config) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        open: true,
        mode: config.mode || "alert",
        title: config.title || "Notice",
        message: config.message || "",
        tone: config.tone || "info",
        confirmText: config.confirmText || "OK",
        cancelText: config.cancelText || "Cancel",
      });
    });
  }, []);

  const confirm = useCallback(
    async ({
      title = "Are you sure?",
      message = "Please confirm to continue.",
      tone = "warning",
      confirmText = "Confirm",
      cancelText = "Cancel",
    } = {}) => {
      return openDialog({
        mode: "confirm",
        title,
        message,
        tone,
        confirmText,
        cancelText,
      });
    },
    [openDialog],
  );

  const notify = useCallback(
    async ({
      title = "Notice",
      message = "",
      tone = "info",
      confirmText = "OK",
    } = {}) => {
      return openDialog({
        mode: "alert",
        title,
        message,
        tone,
        confirmText,
      });
    },
    [openDialog],
  );

  const value = useMemo(() => ({ confirm, notify }), [confirm, notify]);
  const currentTone = toneStyles[dialog.tone] || toneStyles.info;

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Modal
        isOpen={dialog.open}
        onClose={() => closeDialog(false)}
        title={dialog.title}
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${currentTone.badge}`}
          >
            {dialog.tone}
          </span>
          <p className="text-sm leading-relaxed text-slate-300">
            {dialog.message}
          </p>
          <div className="flex items-center justify-end gap-3">
            {dialog.mode === "confirm" && (
              <button
                onClick={() => closeDialog(false)}
                className="rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                {dialog.cancelText}
              </button>
            )}
            <button
              onClick={() => closeDialog(true)}
              className={`rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-lg transition ${currentTone.confirm}`}
            >
              {dialog.confirmText}
            </button>
          </div>
        </div>
      </Modal>
    </DialogContext.Provider>
  );
};

export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return context;
};
