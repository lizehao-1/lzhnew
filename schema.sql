CREATE TABLE IF NOT EXISTS users (
  phone TEXT PRIMARY KEY,
  pin TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  result TEXT NOT NULL,
  question_set TEXT,
  ts INTEGER NOT NULL,
  viewed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  out_trade_no TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  credits_delta INTEGER NOT NULL,
  is_recharge INTEGER NOT NULL DEFAULT 0,
  processed INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_phone_ts ON records(phone, ts);