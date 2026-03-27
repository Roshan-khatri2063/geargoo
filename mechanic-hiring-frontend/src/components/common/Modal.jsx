const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-lg",
  closeOnOverlay = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8">
      <button
        aria-label="Close dialog overlay"
        className="dialog-overlay absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`dialog-panel relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/95 shadow-[0_28px_80px_rgba(2,6,23,0.75)]`}
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative border-b border-slate-700/70 px-5 py-4 sm:px-6">
          {title ? (
            <h3 className="pr-10 text-lg font-semibold tracking-wide text-slate-100">
              {title}
            </h3>
          ) : null}
          <button
            onClick={onClose}
            className="absolute right-4 top-3 rounded-lg border border-slate-700 px-2 py-1 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            x
          </button>
        </div>

        <div className="relative px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
