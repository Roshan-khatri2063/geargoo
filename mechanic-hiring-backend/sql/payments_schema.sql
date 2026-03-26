START TRANSACTION;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  customer_id INT NOT NULL,
  mechanic_id INT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'NPR',
  provider VARCHAR(40) NOT NULL,
  provider_order_id VARCHAR(120) NULL,
  provider_transaction_id VARCHAR(120) NULL,
  idempotency_key VARCHAR(100) NULL,
  status ENUM(
    'pending',
    'authorized',
    'paid',
    'failed',
    'cancelled',
    'refunded',
    'partially_refunded'
  ) NOT NULL DEFAULT 'pending',
  failure_reason VARCHAR(255) NULL,
  paid_at DATETIME NULL,
  refunded_at DATETIME NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payments_customer
    FOREIGN KEY (customer_id) REFERENCES users(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payments_mechanic
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY uq_payments_provider_txn (provider, provider_transaction_id),
  UNIQUE KEY uq_payments_idempotency (idempotency_key),
  KEY idx_payments_request_id (request_id),
  KEY idx_payments_customer_id (customer_id),
  KEY idx_payments_mechanic_id (mechanic_id),
  KEY idx_payments_status (status),
  KEY idx_payments_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  request_id INT NOT NULL,
  mechanic_id INT NOT NULL,
  gross_amount DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  net_amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'NPR',
  status ENUM(
    'pending',
    'processing',
    'paid',
    'failed',
    'reversed'
  ) NOT NULL DEFAULT 'pending',
  payout_reference VARCHAR(120) NULL,
  failure_reason VARCHAR(255) NULL,
  scheduled_at DATETIME NULL,
  paid_out_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payouts_payment
    FOREIGN KEY (payment_id) REFERENCES payments(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payouts_request
    FOREIGN KEY (request_id) REFERENCES service_requests(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payouts_mechanic
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uq_payouts_payment_id (payment_id),
  KEY idx_payouts_mechanic_id (mechanic_id),
  KEY idx_payouts_status (status),
  KEY idx_payouts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS payment_status ENUM('unpaid', 'partially_paid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payout_status ENUM('pending', 'paid', 'failed', 'not_applicable') NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) NULL,
  ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'NPR';

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active_status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active';

ALTER TABLE mechanics
  ADD COLUMN IF NOT EXISTS active_status ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active';

COMMIT;
