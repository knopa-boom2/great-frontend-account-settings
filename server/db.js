const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'data.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS account (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    avatar_filename TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS account_username_ci_unique
  ON account (lower(username));
`);

const columns = db.prepare("PRAGMA table_info('account')").all();
const columnNames = new Set(columns.map((column) => column.name));

if (!columnNames.has('first_name')) {
  db.exec('ALTER TABLE account ADD COLUMN first_name TEXT');
}

if (!columnNames.has('last_name')) {
  db.exec('ALTER TABLE account ADD COLUMN last_name TEXT');
}

const existing = db.prepare('SELECT id FROM account WHERE id = 1').get();
if (!existing) {
  db.prepare(
    'INSERT INTO account (id, first_name, last_name, email, username, avatar_filename) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(1, 'Ada', 'Lovelace', 'ada@example.com', 'adal', null);
}

function getAccount() {
  return db
    .prepare('SELECT first_name, last_name, email, username, avatar_filename FROM account WHERE id = 1')
    .get();
}

function updateAccount({ firstName, lastName, email, username }) {
  db.prepare(
    'UPDATE account SET first_name = ?, last_name = ?, email = ?, username = ? WHERE id = 1'
  ).run(firstName, lastName, email, username);
  return getAccount();
}

function isUsernameUnique(username) {
  const row = db
    .prepare('SELECT COUNT(1) AS count FROM account WHERE lower(username) = lower(?) AND id != 1')
    .get(username);
  return row.count === 0;
}

function updateAvatar(filename) {
  db.prepare('UPDATE account SET avatar_filename = ? WHERE id = 1').run(filename);
  return getAccount();
}

module.exports = {
  getAccount,
  updateAccount,
  isUsernameUnique,
  updateAvatar,
};

