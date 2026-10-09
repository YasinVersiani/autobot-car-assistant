// User accounts stored in a JSON file, with passwords hashed using bcrypt.

const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")
const { DATA_DIR } = require("./dataDir")

const usersFile = path.join(DATA_DIR, "users.json")

// create the file on first run
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]))
}

function loadUsers() {
  const raw = fs.readFileSync(usersFile, "utf8")
  return JSON.parse(raw)
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2))
}

function signup(username, password) {
  const users = loadUsers()

  const exists = users.find(u => u.username === username)
  if (exists) {
    return { ok: false, message: "that username is already taken" }
  }

  const hashed = bcrypt.hashSync(password, 10)
  users.push({ username, password: hashed })
  saveUsers(users)

  return { ok: true, user: { username } }
}

function login(username, password) {
  const users = loadUsers()
  const user = users.find(u => u.username === username)

  if (!user) {
    return { ok: false, message: "no account with that username" }
  }

  const match = bcrypt.compareSync(password, user.password)
  if (!match) {
    return { ok: false, message: "wrong password" }
  }

  return { ok: true, user: { username } }
}

module.exports = { signup, login }
