const crypto = require("crypto");
const { pool } = require("../config/db");

const PAYMENTS_TABLE = "payments";
const PAYOUTS_TABLE = "payouts";
const REQUESTS_TABLE = "service_requests";
const EVENTS_TABLE = "payment_events";

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const parseCurrency = (value) => String(value || "NPR").toUpperCase();

const tableExists = async (tableName, connection = pool) => {
  try {
    const [rows] = await connection.query("SHOW TABLES LIKE ?", [tableName]);
    return rows.length > 0;
  } catch (_err) {
    return false;
  }
};

const getTableColumns = async (tableName, connection = pool) => {
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
    return rows.map((item) => item.Field);
  } catch (_err) {
    return [];
  }
};

const ensureEventsTable = async (connection = pool) => {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS ${EVENTS_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      payment_id INT NOT NULL,
      event_hash VARCHAR(64) NOT NULL,
      event_type VARCHAR(80) NOT NULL,
      from_status VARCHAR(40) NULL,
      to_status VARCHAR(40) NULL,
      payload JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_payment_events_hash (event_hash),
      KEY idx_payment_events_payment (payment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  );
};

const logPaymentEvent = async (
  connection,
  { paymentId, eventType, fromStatus, toStatus, payload },
) => {
  const eventHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({ paymentId, eventType, fromStatus, toStatus, payload }),
    )
    .digest("hex");

  await ensureEventsTable(connection);
  await connection.query(
    `INSERT IGNORE INTO ${EVENTS_TABLE}
      (payment_id, event_hash, event_type, from_status, to_status, payload)
      VALUES (?, ?, ?, ?, ?, ?)`,
    [
      Number(paymentId) || 0,
      eventHash,
      eventType,
      fromStatus || null,
      toStatus || null,
      JSON.stringify(payload || {}),
    ],
  );
};

const computeServiceAmount = (serviceType) => {
  const value = String(serviceType || "").toLowerCase();
  if (!value) return 1200;
  if (value.includes("engine")) return 2500;
  if (value.includes("brake")) return 1800;
  if (value.includes("battery")) return 1400;
  if (value.includes("oil")) return 900;
  if (value.includes("tire") || value.includes("tyre")) return 1100;
  return 1200;
};

const computePayableAmount = (requestRow) => {
  const candidates = [
    requestRow.final_cost,
    requestRow.estimated_cost,
    requestRow.amount,
  ];

  for (const value of candidates) {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed > 0) return Number(parsed.toFixed(2));
  }

  return Number(
    computeServiceAmount(requestRow.service_type || requestRow.title).toFixed(
      2,
    ),
  );
};

const getEsewaConfig = () => {
  const gatewayUrl =
    process.env.ESEWA_GATEWAY_URL ||
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
  const productCode = String(
    process.env.ESEWA_PRODUCT_CODE ||
      process.env.ESEWA_MERCHANT_CODE ||
      process.env.ESEWA_PRODUCT ||
      "EPAYTEST",
  ).trim();
  const secretKey = String(
    process.env.ESEWA_SECRET_KEY ||
      process.env.ESEWA_SECRET ||
      "8gBm/:&EnhH.1/q",
  ).trim();
  const backendBaseUrl =
    process.env.BACKEND_BASE_URL || "http://localhost:5000";
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || "http://localhost:3000";

  return {
    gatewayUrl,
    productCode,
    secretKey,
    backendBaseUrl,
    frontendBaseUrl,
  };
};

const buildEsewaSignature = ({ message, secretKey }) =>
  crypto.createHmac("sha256", secretKey).update(message).digest("base64");

const buildEsewaCheckout = ({ payment, amount, currency }) => {
  const cfg = getEsewaConfig();
  const totalAmount = Number(amount).toFixed(2);
  const transactionUuid = `REQ-${payment.request_id}-PAY-${payment.id}`;
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${cfg.productCode}`;
  const signature = buildEsewaSignature({ message, secretKey: cfg.secretKey });

  return {
    checkoutUrl: cfg.gatewayUrl,
    formFields: {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: cfg.productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${cfg.backendBaseUrl}/api/payments/callback/esewa/success`,
      failure_url: `${cfg.backendBaseUrl}/api/payments/callback/esewa/failure`,
      signed_field_names: signedFieldNames,
      signature,
      currency,
    },
  };
};

const decodeBase64Json = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;

  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (_err) {
    return null;
  }
};

const parseCallbackPayload = (req) => {
  const body = req.body || {};
  const query = req.query || {};

  if (body.data) {
    const parsed = decodeBase64Json(body.data);
    if (parsed) return parsed;
  }

  if (query.data) {
    const parsed = decodeBase64Json(query.data);
    if (parsed) return parsed;
  }

  return {
    ...query,
    ...body,
  };
};

const verifyEsewaSignature = (payload) => {
  const cfg = getEsewaConfig();
  const signedFieldNames = String(payload?.signed_field_names || "").trim();
  const signature = String(payload?.signature || "").trim();
  if (!signedFieldNames || !signature) return false;

  const fields = signedFieldNames
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!fields.length) return false;

  const message = fields
    .map((field) => `${field}=${payload?.[field] ?? ""}`)
    .join(",");

  const expected = buildEsewaSignature({ message, secretKey: cfg.secretKey });
  return expected === signature;
};

const parseTransactionUuid = (value) => {
  const tx = String(value || "");
  const match = tx.match(/REQ-(\d+)-PAY-(\d+)/);
  if (!match) return { requestId: null, paymentId: null };
  return {
    requestId: Number(match[1]),
    paymentId: Number(match[2]),
  };
};

const isMechanicAssignedToRequest = async (
  userId,
  requestRow,
  connection = pool,
) => {
  if (!requestRow?.mechanic_id) return false;
  if (Number(requestRow.mechanic_id) === Number(userId)) return true;

  const [rows] = await connection.query(
    "SELECT id FROM mechanics WHERE id = ? AND user_id = ? LIMIT 1",
    [requestRow.mechanic_id, userId],
  );
  return rows.length > 0;
};

const getRequestWithOwnership = async (
  requestId,
  userId,
  role,
  connection = pool,
) => {
  const [rows] = await connection.query(
    `SELECT * FROM ${REQUESTS_TABLE} WHERE id = ? LIMIT 1`,
    [requestId],
  );

  if (!rows.length) return { request: null, authorized: false };
  const request = rows[0];

  if (role === "admin") return { request, authorized: true };

  if (role === "customer" && Number(request.customer_id) === Number(userId)) {
    return { request, authorized: true };
  }

  if (role === "mechanic") {
    const assigned = await isMechanicAssignedToRequest(
      userId,
      request,
      connection,
    );
    return { request, authorized: assigned };
  }

  return { request, authorized: false };
};

const getLatestPaymentByRequest = async (requestId, connection = pool) => {
  const [rows] = await connection.query(
    `SELECT * FROM ${PAYMENTS_TABLE} WHERE request_id = ? ORDER BY id DESC LIMIT 1`,
    [requestId],
  );
  return rows[0] || null;
};

const setRequestStatuses = async (
  connection,
  requestId,
  { paymentStatus, payoutStatus },
) => {
  const columns = await getTableColumns(REQUESTS_TABLE, connection);
  const updates = [];
  const values = [];

  if (paymentStatus && columns.includes("payment_status")) {
    updates.push("payment_status = ?");
    values.push(paymentStatus);
  }

  if (payoutStatus && columns.includes("payout_status")) {
    updates.push("payout_status = ?");
    values.push(payoutStatus);
  }

  if (!updates.length) return;

  await connection.query(
    `UPDATE ${REQUESTS_TABLE} SET ${updates.join(", ")} WHERE id = ?`,
    [...values, requestId],
  );
};

const setRequestAmountAndCurrency = async (
  connection,
  requestId,
  amount,
  currency,
) => {
  const columns = await getTableColumns(REQUESTS_TABLE, connection);
  const updates = [];
  const values = [];

  if (columns.includes("amount")) {
    updates.push("amount = ?");
    values.push(amount);
  }

  if (columns.includes("currency")) {
    updates.push("currency = ?");
    values.push(currency);
  }

  if (!updates.length) return;

  await connection.query(
    `UPDATE ${REQUESTS_TABLE} SET ${updates.join(", ")} WHERE id = ?`,
    [...values, requestId],
  );
};

const applyRequestOnlyOutcome = async ({ requestId, payload, nextStatus }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT * FROM ${REQUESTS_TABLE} WHERE id = ? FOR UPDATE`,
      [requestId],
    );
    if (!rows.length) {
      await connection.rollback();
      return { updated: false };
    }

    const requestRow = rows[0];
    const fromStatus = normalizeStatus(requestRow.payment_status || "unpaid");
    const targetStatus = normalizeStatus(nextStatus);

    if (targetStatus === "paid") {
      await setRequestStatuses(connection, requestId, {
        paymentStatus: "paid",
        payoutStatus: "pending",
      });
    } else if (targetStatus === "failed" || targetStatus === "cancelled") {
      await setRequestStatuses(connection, requestId, {
        paymentStatus: "unpaid",
      });
    } else if (
      targetStatus === "refunded" ||
      targetStatus === "partially_refunded"
    ) {
      await setRequestStatuses(connection, requestId, {
        paymentStatus: "refunded",
        payoutStatus: "failed",
      });
    }

    await logPaymentEvent(connection, {
      paymentId: requestId,
      eventType: "request_only_status_update",
      fromStatus,
      toStatus: targetStatus,
      payload,
    });

    await connection.commit();
    return { updated: true };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const applyWebhookOutcome = async ({
  payment,
  payload,
  nextStatus,
  providerTransactionId,
}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? FOR UPDATE`,
      [payment.id],
    );
    if (!rows.length) {
      await connection.rollback();
      return { updated: false, payment: null };
    }

    const locked = rows[0];
    const fromStatus = normalizeStatus(locked.status);
    const targetStatus = normalizeStatus(nextStatus);

    const isDuplicateSuccess =
      fromStatus === targetStatus &&
      !!locked.provider_transaction_id &&
      !!providerTransactionId &&
      String(locked.provider_transaction_id) === String(providerTransactionId);

    if (isDuplicateSuccess) {
      await logPaymentEvent(connection, {
        paymentId: locked.id,
        eventType: "webhook_duplicate",
        fromStatus,
        toStatus: targetStatus,
        payload,
      });
      await connection.commit();
      return { updated: false, payment: locked };
    }

    await connection.query(
      `UPDATE ${PAYMENTS_TABLE}
       SET status = ?, provider_transaction_id = COALESCE(?, provider_transaction_id), paid_at = ?, refunded_at = ?, metadata = ?
       WHERE id = ?`,
      [
        targetStatus,
        providerTransactionId || null,
        targetStatus === "paid" ? new Date() : locked.paid_at,
        targetStatus.includes("refund") ? new Date() : locked.refunded_at,
        JSON.stringify(payload || {}),
        locked.id,
      ],
    );

    if (targetStatus === "paid") {
      await setRequestStatuses(connection, locked.request_id, {
        paymentStatus: "paid",
        payoutStatus: "pending",
      });

      if (await tableExists(PAYOUTS_TABLE, connection)) {
        await connection.query(
          `INSERT INTO ${PAYOUTS_TABLE}
            (payment_id, request_id, mechanic_id, gross_amount, platform_fee, net_amount, currency, status)
           SELECT ?, ?, ?, ?, ?, ?, ?, ?
           FROM DUAL
           WHERE NOT EXISTS (SELECT 1 FROM ${PAYOUTS_TABLE} WHERE payment_id = ?)`,
          [
            locked.id,
            locked.request_id,
            locked.mechanic_id,
            locked.amount,
            0,
            locked.amount,
            parseCurrency(locked.currency),
            "pending",
            locked.id,
          ],
        );
      }
    }

    if (targetStatus === "failed" || targetStatus === "cancelled") {
      await setRequestStatuses(connection, locked.request_id, {
        paymentStatus: "unpaid",
      });
    }

    if (targetStatus === "refunded" || targetStatus === "partially_refunded") {
      await setRequestStatuses(connection, locked.request_id, {
        paymentStatus: "refunded",
        payoutStatus: "failed",
      });

      if (await tableExists(PAYOUTS_TABLE, connection)) {
        await connection.query(
          `UPDATE ${PAYOUTS_TABLE} SET status = 'reversed' WHERE payment_id = ?`,
          [locked.id],
        );
      }
    }

    await logPaymentEvent(connection, {
      paymentId: locked.id,
      eventType: "webhook_status_update",
      fromStatus,
      toStatus: targetStatus,
      payload,
    });

    await connection.commit();

    const [updatedRows] = await pool.query(
      `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
      [locked.id],
    );

    return { updated: true, payment: updatedRows[0] || null };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const role = String(req.user?.role || "").toLowerCase();
    const requestId = Number(req.body?.requestId);
    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ message: "requestId is required" });
    }

    const { request, authorized } = await getRequestWithOwnership(
      requestId,
      userId,
      role,
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!authorized) return res.status(403).json({ message: "Not authorized" });

    if (normalizeStatus(request.payment_status) === "paid") {
      const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);
      if (hasPaymentsTable) {
        const latestPaid = await getLatestPaymentByRequest(requestId);
        return res.json({ alreadyPaid: true, payment: latestPaid || null });
      }

      return res.json({
        alreadyPaid: true,
        payment: {
          id: request.id,
          request_id: request.id,
          customer_id: request.customer_id,
          mechanic_id: request.mechanic_id,
          amount: computePayableAmount(request),
          currency: parseCurrency(request.currency),
          provider: "esewa",
          status: "paid",
          paid_at: request.completed_at || request.requested_at || null,
          provider_transaction_id: null,
        },
      });
    }

    const idempotencyKey = String(
      req.headers["x-idempotency-key"] ||
        req.body?.idempotencyKey ||
        `${userId}-${requestId}-${Date.now()}`,
    );

    const amount = computePayableAmount(request);
    const currency = parseCurrency(request.currency || "NPR");
    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    if (!hasPaymentsTable) {
      await setRequestStatuses(pool, request.id, {
        paymentStatus: "partially_paid",
      });

      const syntheticPayment = {
        id: request.id,
        request_id: request.id,
        customer_id: request.customer_id,
        mechanic_id: request.mechanic_id,
        amount,
        currency,
        provider: "esewa",
        provider_order_id: `ESEWA-${requestId}-${Date.now()}`,
        idempotency_key: idempotencyKey,
        status: "pending",
      };

      await logPaymentEvent(pool, {
        paymentId: request.id,
        eventType: "intent_created_request_only",
        fromStatus: normalizeStatus(request.payment_status || "unpaid"),
        toStatus: "partially_paid",
        payload: {
          requestId,
          amount,
          currency,
          idempotencyKey,
        },
      });

      return res.status(201).json({
        payment: syntheticPayment,
        checkout: buildEsewaCheckout({
          payment: syntheticPayment,
          amount,
          currency,
        }),
        qrCodeUrl: "/QR_payment.jpeg",
        requestOnlyMode: true,
      });
    }

    const [replayedRows] = await pool.query(
      `SELECT * FROM ${PAYMENTS_TABLE} WHERE idempotency_key = ? LIMIT 1`,
      [idempotencyKey],
    );

    if (replayedRows.length) {
      const replayed = replayedRows[0];

      if (
        normalizeStatus(replayed.status) === "pending" ||
        normalizeStatus(replayed.status) === "authorized"
      ) {
        await setRequestStatuses(pool, request.id, {
          paymentStatus: "partially_paid",
        });
      }

      return res.json({
        payment: replayed,
        checkout: buildEsewaCheckout({
          payment: replayed,
          amount: replayed.amount,
          currency: parseCurrency(replayed.currency),
        }),
        qrCodeUrl: "/QR_payment.jpeg",
        idempotentReplay: true,
      });
    }

    const providerOrderId = `ESEWA-${requestId}-${Date.now()}`;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [insertResult] = await connection.query(
        `INSERT INTO ${PAYMENTS_TABLE}
          (request_id, customer_id, mechanic_id, amount, currency, provider, provider_order_id, idempotency_key, status, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.id,
          request.customer_id,
          request.mechanic_id,
          amount,
          currency,
          "esewa",
          providerOrderId,
          idempotencyKey,
          "pending",
          JSON.stringify({ source: "create_intent" }),
        ],
      );

      const [paymentRows] = await connection.query(
        `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
        [insertResult.insertId],
      );
      const payment = paymentRows[0];

      await setRequestStatuses(connection, request.id, {
        paymentStatus: "partially_paid",
      });

      await logPaymentEvent(connection, {
        paymentId: payment.id,
        eventType: "intent_created",
        fromStatus: null,
        toStatus: "pending",
        payload: {
          requestId,
          amount,
          currency,
          idempotencyKey,
        },
      });

      await connection.commit();

      res.status(201).json({
        payment,
        checkout: buildEsewaCheckout({ payment, amount, currency }),
        qrCodeUrl: "/QR_payment.jpeg",
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
};

const createMockPayment = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const role = String(req.user?.role || "").toLowerCase();
    const requestId = Number(req.body?.requestId);
    const enteredAmount = Number(req.body?.amount);
    const currency = parseCurrency(req.body?.currency || "NPR");

    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ message: "requestId is required" });
    }

    if (Number.isNaN(enteredAmount) || enteredAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Please provide a valid payment amount" });
    }

    const amount = Number(enteredAmount.toFixed(2));
    const { request, authorized } = await getRequestWithOwnership(
      requestId,
      userId,
      role,
    );

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!authorized) return res.status(403).json({ message: "Not authorized" });

    if (role !== "customer" && role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only customers can create payments" });
    }

    const currentPaymentStatus = normalizeStatus(
      request.payment_status || "unpaid",
    );
    if (currentPaymentStatus === "paid") {
      return res.status(400).json({ message: "Request is already paid" });
    }

    const transactionId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    if (!hasPaymentsTable) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [lockedRows] = await connection.query(
          `SELECT * FROM ${REQUESTS_TABLE} WHERE id = ? FOR UPDATE`,
          [requestId],
        );

        if (!lockedRows.length) {
          await connection.rollback();
          return res.status(404).json({ message: "Request not found" });
        }

        await setRequestAmountAndCurrency(
          connection,
          requestId,
          amount,
          currency,
        );
        await setRequestStatuses(connection, requestId, {
          paymentStatus: "paid",
          payoutStatus: "paid",
        });

        await logPaymentEvent(connection, {
          paymentId: requestId,
          eventType: "mock_payment_paid_request_only",
          fromStatus: normalizeStatus(lockedRows[0].payment_status || "unpaid"),
          toStatus: "paid",
          payload: {
            requestId,
            amount,
            currency,
            paidBy: userId,
            providerTransactionId: transactionId,
          },
        });

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

      return res.status(201).json({
        message: "Mock payment sent to mechanic",
        payment: {
          id: requestId,
          request_id: requestId,
          customer_id: request.customer_id,
          mechanic_id: request.mechanic_id,
          amount,
          currency,
          provider: "esewa_mock",
          status: "paid",
          paid_at: new Date().toISOString(),
          provider_transaction_id: transactionId,
        },
        requestOnlyMode: true,
      });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [lockedRequestRows] = await connection.query(
        `SELECT * FROM ${REQUESTS_TABLE} WHERE id = ? FOR UPDATE`,
        [requestId],
      );

      if (!lockedRequestRows.length) {
        await connection.rollback();
        return res.status(404).json({ message: "Request not found" });
      }

      if (
        normalizeStatus(lockedRequestRows[0].payment_status || "unpaid") ===
        "paid"
      ) {
        await connection.rollback();
        return res.status(400).json({ message: "Request is already paid" });
      }

      const [insertResult] = await connection.query(
        `INSERT INTO ${PAYMENTS_TABLE}
          (request_id, customer_id, mechanic_id, amount, currency, provider, provider_order_id, provider_transaction_id, status, paid_at, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          request.id,
          request.customer_id,
          request.mechanic_id,
          amount,
          currency,
          "esewa_mock",
          `MOCK-ORDER-${requestId}-${Date.now()}`,
          transactionId,
          "paid",
          new Date(),
          JSON.stringify({ source: "mock_pay", paidBy: userId }),
        ],
      );

      await setRequestAmountAndCurrency(
        connection,
        requestId,
        amount,
        currency,
      );
      await setRequestStatuses(connection, requestId, {
        paymentStatus: "paid",
        payoutStatus: "paid",
      });

      if (await tableExists(PAYOUTS_TABLE, connection)) {
        await connection.query(
          `INSERT INTO ${PAYOUTS_TABLE}
            (payment_id, request_id, mechanic_id, gross_amount, platform_fee, net_amount, currency, status, paid_out_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insertResult.insertId,
            request.id,
            request.mechanic_id,
            amount,
            0,
            amount,
            currency,
            "paid",
            new Date(),
          ],
        );
      }

      await logPaymentEvent(connection, {
        paymentId: insertResult.insertId,
        eventType: "mock_payment_paid",
        fromStatus: "unpaid",
        toStatus: "paid",
        payload: {
          requestId,
          amount,
          currency,
          paidBy: userId,
          providerTransactionId: transactionId,
        },
      });

      const [paymentRows] = await connection.query(
        `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
        [insertResult.insertId],
      );

      await connection.commit();

      return res.status(201).json({
        message: "Mock payment sent to mechanic",
        payment: paymentRows[0] || null,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
};

const processEsewaPayload = async (
  payload,
  { strictSignature = true } = {},
) => {
  const verified = verifyEsewaSignature(payload);
  if (strictSignature && !verified) {
    return { ok: false, reason: "Invalid eSewa signature", statusCode: 400 };
  }

  const ids = parseTransactionUuid(payload.transaction_uuid);
  if (!ids.requestId || Number.isNaN(ids.requestId)) {
    return { ok: false, reason: "Invalid transaction UUID", statusCode: 400 };
  }

  const providerStatus = normalizeStatus(
    payload.status || payload.transaction_status,
  );
  const providerTransactionId =
    payload.transaction_code ||
    payload.ref_id ||
    payload.transaction_id ||
    null;

  let nextStatus = "failed";
  if (providerStatus === "complete" || providerStatus === "success") {
    nextStatus = "paid";
  } else if (providerStatus === "cancelled" || providerStatus === "canceled") {
    nextStatus = "cancelled";
  }

  const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

  if (!hasPaymentsTable || !ids.paymentId || ids.paymentId <= 0) {
    const [requestRows] = await pool.query(
      `SELECT id FROM ${REQUESTS_TABLE} WHERE id = ? LIMIT 1`,
      [ids.requestId],
    );
    if (!requestRows.length) {
      return {
        ok: false,
        reason: "Request not found",
        statusCode: 404,
        paymentId: ids.requestId,
      };
    }

    const result = await applyRequestOnlyOutcome({
      requestId: ids.requestId,
      payload,
      nextStatus,
    });

    return {
      ok: true,
      verified,
      paymentId: ids.requestId,
      nextStatus,
      updated: result.updated,
      requestOnlyMode: true,
    };
  }

  const [paymentRows] = await pool.query(
    `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
    [ids.paymentId],
  );
  if (!paymentRows.length) {
    return {
      ok: false,
      reason: "Payment not found",
      statusCode: 404,
      paymentId: ids.paymentId,
    };
  }

  const result = await applyWebhookOutcome({
    payment: paymentRows[0],
    payload,
    nextStatus,
    providerTransactionId,
  });

  return {
    ok: true,
    verified,
    paymentId: ids.paymentId,
    nextStatus,
    updated: result.updated,
    payment: result.payment,
  };
};

const handleEsewaWebhook = async (req, res, next) => {
  try {
    const payload = parseCallbackPayload(req);
    const processed = await processEsewaPayload(payload, {
      strictSignature: true,
    });

    if (!processed.ok) {
      return res.status(processed.statusCode || 400).json({
        message: processed.reason,
      });
    }

    res.json({
      message: "Webhook processed",
      verified: processed.verified,
      paymentId: processed.paymentId,
      status: processed.nextStatus,
      updated: processed.updated,
      requestOnlyMode: !!processed.requestOnlyMode,
    });
  } catch (err) {
    next(err);
  }
};

const handleEsewaSuccessCallback = async (req, res, next) => {
  try {
    const cfg = getEsewaConfig();
    const payload = parseCallbackPayload(req);
    const processed = await processEsewaPayload(payload, {
      strictSignature: true,
    });

    const paymentId = processed.paymentId || "";
    const status = processed.ok ? processed.nextStatus : "failed";

    res.redirect(
      `${cfg.frontendBaseUrl}/customer/job-tracking?paymentStatus=${status}&paymentId=${paymentId}`,
    );
  } catch (err) {
    next(err);
  }
};

const handleEsewaFailureCallback = async (req, res, next) => {
  try {
    const cfg = getEsewaConfig();
    const payload = parseCallbackPayload(req);
    const ids = parseTransactionUuid(payload.transaction_uuid);

    if (ids.requestId) {
      const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

      if (!hasPaymentsTable || !ids.paymentId || ids.paymentId <= 0) {
        await applyRequestOnlyOutcome({
          requestId: ids.requestId,
          payload,
          nextStatus: "failed",
        });
      } else {
        const [rows] = await pool.query(
          `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
          [ids.paymentId],
        );

        if (rows.length) {
          await applyWebhookOutcome({
            payment: rows[0],
            payload,
            nextStatus: "failed",
            providerTransactionId: null,
          });
        }
      }
    }

    const receiptId = ids.paymentId || ids.requestId || "";
    res.redirect(
      `${cfg.frontendBaseUrl}/customer/job-tracking?paymentStatus=failed&paymentId=${receiptId}`,
    );
  } catch (err) {
    next(err);
  }
};

const getPaymentByRequest = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const role = String(req.user?.role || "").toLowerCase();
    const requestId = Number(req.params.requestId);
    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const { request, authorized } = await getRequestWithOwnership(
      requestId,
      userId,
      role,
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!authorized) return res.status(403).json({ message: "Not authorized" });

    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    if (!hasPaymentsTable) {
      const paymentStatus = normalizeStatus(request.payment_status || "unpaid");
      if (!paymentStatus) return res.json({ payment: null });

      const receipt = {
        paymentId: request.id,
        requestId: request.id,
        amount: computePayableAmount(request),
        currency: parseCurrency(request.currency),
        status: paymentStatus,
        paidAt: request.completed_at || null,
        provider: "esewa",
        providerTransactionId: null,
        refundedAt:
          paymentStatus === "refunded" ? new Date().toISOString() : null,
      };

      return res.json({
        payment: {
          id: request.id,
          request_id: request.id,
          customer_id: request.customer_id,
          mechanic_id: request.mechanic_id,
          amount: receipt.amount,
          currency: receipt.currency,
          provider: "esewa",
          status: receipt.status,
          paid_at: receipt.paidAt,
          provider_transaction_id: receipt.providerTransactionId,
        },
        receipt,
        requestOnlyMode: true,
      });
    }

    const payment = await getLatestPaymentByRequest(requestId);
    if (!payment) return res.json({ payment: null });

    res.json({
      payment,
      receipt: {
        paymentId: payment.id,
        requestId: payment.request_id,
        amount: Number(payment.amount || 0),
        currency: parseCurrency(payment.currency),
        status: payment.status,
        paidAt: payment.paid_at,
        provider: payment.provider,
        providerTransactionId: payment.provider_transaction_id,
        refundedAt: payment.refunded_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPaymentReceipt = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const role = String(req.user?.role || "").toLowerCase();
    const paymentId = Number(req.params.paymentId);
    if (!paymentId || Number.isNaN(paymentId)) {
      return res.status(400).json({ message: "Invalid payment id" });
    }

    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    if (!hasPaymentsTable) {
      const { request, authorized } = await getRequestWithOwnership(
        paymentId,
        userId,
        role,
      );
      if (!request)
        return res.status(404).json({ message: "Receipt not found" });
      if (!authorized)
        return res.status(403).json({ message: "Not authorized" });

      const status = normalizeStatus(request.payment_status || "unpaid");

      return res.json({
        receipt: {
          paymentId: request.id,
          requestId: request.id,
          amount: computePayableAmount(request),
          currency: parseCurrency(request.currency),
          status,
          paidAt: request.completed_at || null,
          provider: "esewa",
          providerTransactionId: null,
          refundedAt: status === "refunded" ? new Date().toISOString() : null,
        },
        requestOnlyMode: true,
      });
    }

    const [rows] = await pool.query(
      `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
      [paymentId],
    );
    if (!rows.length)
      return res.status(404).json({ message: "Payment not found" });

    const payment = rows[0];
    const hasAccess =
      role === "admin" ||
      Number(payment.customer_id) === userId ||
      Number(payment.mechanic_id) === userId;

    if (!hasAccess) return res.status(403).json({ message: "Not authorized" });

    res.json({
      receipt: {
        paymentId: payment.id,
        requestId: payment.request_id,
        amount: Number(payment.amount || 0),
        currency: parseCurrency(payment.currency),
        status: payment.status,
        paidAt: payment.paid_at,
        provider: payment.provider,
        providerTransactionId: payment.provider_transaction_id,
        refundedAt: payment.refunded_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAdminTransactions = async (req, res, next) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    if (!hasPaymentsTable) {
      const [rows] = await pool.query(
        `SELECT
          r.id,
          r.id AS requestId,
          r.customer_id AS customerId,
          r.mechanic_id AS mechanicId,
          COALESCE(r.amount, r.final_cost, r.estimated_cost, 0) AS amount,
          COALESCE(r.currency, 'NPR') AS currency,
          'esewa' AS provider,
          COALESCE(r.payment_status, 'unpaid') AS status,
          r.completed_at AS paidAt,
          r.requested_at AS createdAt,
          NULL AS providerTransactionId,
          c.name AS customerName,
          mu.name AS mechanicName
        FROM ${REQUESTS_TABLE} r
        LEFT JOIN users c ON c.id = r.customer_id
        LEFT JOIN mechanics m ON m.id = r.mechanic_id
        LEFT JOIN users mu ON mu.id = m.user_id
        ORDER BY r.id DESC
        LIMIT ?`,
        [limit],
      );

      const [summaryRows] = await pool.query(
        `SELECT
          COUNT(*) AS totalTransactions,
          SUM(CASE WHEN LOWER(COALESCE(payment_status, '')) = 'paid' THEN 1 ELSE 0 END) AS paidTransactions,
          COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_status, '')) = 'paid' THEN COALESCE(amount, final_cost, estimated_cost, 0) ELSE 0 END), 0) AS grossPaidAmount,
          COALESCE(SUM(CASE WHEN LOWER(COALESCE(payment_status, '')) IN ('refunded', 'partially_refunded') THEN COALESCE(amount, final_cost, estimated_cost, 0) ELSE 0 END), 0) AS refundedAmount
        FROM ${REQUESTS_TABLE}`,
      );

      return res.json({
        summary: {
          totalTransactions: Number(summaryRows[0]?.totalTransactions || 0),
          paidTransactions: Number(summaryRows[0]?.paidTransactions || 0),
          grossPaidAmount: Number(summaryRows[0]?.grossPaidAmount || 0),
          refundedAmount: Number(summaryRows[0]?.refundedAmount || 0),
        },
        transactions: rows.map((row) => ({
          ...row,
          amount: Number(row.amount || 0),
        })),
        requestOnlyMode: true,
      });
    }

    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.request_id AS requestId,
         p.customer_id AS customerId,
         p.mechanic_id AS mechanicId,
         p.amount,
         p.currency,
         p.provider,
         p.status,
         p.paid_at AS paidAt,
         p.created_at AS createdAt,
         p.provider_transaction_id AS providerTransactionId,
         c.name AS customerName,
         muser.name AS mechanicName
       FROM ${PAYMENTS_TABLE} p
       LEFT JOIN users c ON c.id = p.customer_id
       LEFT JOIN mechanics m ON m.id = p.mechanic_id
       LEFT JOIN users muser ON muser.id = m.user_id
       ORDER BY p.id DESC
       LIMIT ?`,
      [limit],
    );

    const [summaryRows] = await pool.query(
      `SELECT
         COUNT(*) AS totalTransactions,
         SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paidTransactions,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS grossPaidAmount,
         COALESCE(SUM(CASE WHEN status IN ('refunded', 'partially_refunded') THEN amount ELSE 0 END), 0) AS refundedAmount
       FROM ${PAYMENTS_TABLE}`,
    );

    res.json({
      summary: {
        totalTransactions: Number(summaryRows[0]?.totalTransactions || 0),
        paidTransactions: Number(summaryRows[0]?.paidTransactions || 0),
        grossPaidAmount: Number(summaryRows[0]?.grossPaidAmount || 0),
        refundedAmount: Number(summaryRows[0]?.refundedAmount || 0),
      },
      transactions: rows.map((row) => ({
        ...row,
        amount: Number(row.amount || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
};

const refundPaymentByAdmin = async (req, res, next) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const paymentId = Number(req.params.paymentId);
    if (!paymentId || Number.isNaN(paymentId)) {
      return res.status(400).json({ message: "Invalid payment id" });
    }

    const hasPaymentsTable = await tableExists(PAYMENTS_TABLE);

    if (!hasPaymentsTable) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
          `SELECT * FROM ${REQUESTS_TABLE} WHERE id = ? FOR UPDATE`,
          [paymentId],
        );
        if (!rows.length) {
          await connection.rollback();
          return res.status(404).json({ message: "Payment not found" });
        }

        const requestRow = rows[0];
        const currentStatus = normalizeStatus(
          requestRow.payment_status || "unpaid",
        );
        if (currentStatus !== "paid" && currentStatus !== "partially_paid") {
          await connection.rollback();
          return res
            .status(400)
            .json({ message: "Only paid payments can be refunded" });
        }

        await setRequestStatuses(connection, paymentId, {
          paymentStatus: "refunded",
          payoutStatus: "failed",
        });

        await logPaymentEvent(connection, {
          paymentId,
          eventType: "refund_admin_request_only",
          fromStatus: currentStatus,
          toStatus: "refunded",
          payload: { reason: req.body?.reason || null, adminId: req.user.id },
        });

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }

      return res.json({ message: "Payment refunded successfully", paymentId });
    }

    const [rows] = await pool.query(
      `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? LIMIT 1`,
      [paymentId],
    );
    if (!rows.length)
      return res.status(404).json({ message: "Payment not found" });

    const currentStatus = normalizeStatus(rows[0].status);
    if (currentStatus !== "paid" && currentStatus !== "partially_refunded") {
      return res
        .status(400)
        .json({ message: "Only paid payments can be refunded" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [lockedRows] = await connection.query(
        `SELECT * FROM ${PAYMENTS_TABLE} WHERE id = ? FOR UPDATE`,
        [paymentId],
      );
      if (!lockedRows.length) {
        await connection.rollback();
        return res.status(404).json({ message: "Payment not found" });
      }

      const locked = lockedRows[0];
      await connection.query(
        `UPDATE ${PAYMENTS_TABLE}
         SET status = ?, refunded_at = ?, metadata = ?
         WHERE id = ?`,
        [
          "refunded",
          new Date(),
          JSON.stringify({
            refundedBy: req.user.id,
            reason: req.body?.reason || null,
          }),
          paymentId,
        ],
      );

      await setRequestStatuses(connection, locked.request_id, {
        paymentStatus: "refunded",
        payoutStatus: "failed",
      });

      if (await tableExists(PAYOUTS_TABLE, connection)) {
        await connection.query(
          `UPDATE ${PAYOUTS_TABLE} SET status = 'reversed' WHERE payment_id = ?`,
          [paymentId],
        );
      }

      await logPaymentEvent(connection, {
        paymentId,
        eventType: "refund_admin",
        fromStatus: currentStatus,
        toStatus: "refunded",
        payload: { reason: req.body?.reason || null, adminId: req.user.id },
      });

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    res.json({ message: "Payment refunded successfully", paymentId });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPaymentIntent,
  createMockPayment,
  handleEsewaWebhook,
  handleEsewaSuccessCallback,
  handleEsewaFailureCallback,
  getPaymentByRequest,
  getPaymentReceipt,
  getAdminTransactions,
  refundPaymentByAdmin,
};
