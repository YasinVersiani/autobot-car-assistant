// Where user accounts and saved chats are written at runtime (file-based persistence).
// Override with DATA_DIR, e.g. to point at a mounted volume in production.

const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "..", "user-data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

module.exports = { DATA_DIR };
