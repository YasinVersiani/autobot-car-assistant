// Per-user chat history: each user has a JSON file holding all their conversations
// and which one is currently open.

const fs = require("fs")
const path = require("path")
const { DATA_DIR } = require("./dataDir")

const dataDir = path.join(DATA_DIR, "chats")

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function getFilePath(username) {
  const safeName = username.replace(/[^a-zA-Z0-9_-]/g, "")
  return path.join(dataDir, safeName + ".json")
}

function readFile(username) {
  const filePath = getFilePath(username)

  if (!fs.existsSync(filePath)) {
    return { chats: [], activeId: null }
  }

  const raw = fs.readFileSync(filePath, "utf8")
  const data = JSON.parse(raw)

  // older save format was a plain array of messages; wrap it as a single chat
  if (Array.isArray(data)) {
    if (data.length === 0) return { chats: [], activeId: null }

    const wrapped = {
      id: Date.now(),
      title: "Old chat",
      startedAt: new Date().toISOString(),
      messages: data
    }
    return { chats: [wrapped], activeId: wrapped.id }
  }

  return data
}

function writeFile(username, data) {
  const filePath = getFilePath(username)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function makeTitle(msg) {
  const short = msg.trim().substring(0, 24)
  if (short === "") return "New chat"
  return short[0].toUpperCase() + short.substring(1)
}

// gets the chat that should open when the user logs back in
// if they dont have one yet, just make an empty one
function getActiveChat(username) {
  const data = readFile(username)

  if (data.chats.length === 0) {
    const chat = {
      id: Date.now(),
      title: "New chat",
      startedAt: new Date().toISOString(),
      messages: []
    }
    data.chats.push(chat)
    data.activeId = chat.id
    writeFile(username, data)
    return chat
  }

  let active = data.chats.find(c => c.id === data.activeId)

  // fall back to the most recent chat if the stored active id is missing
  if (!active) {
    active = data.chats[data.chats.length - 1]
    data.activeId = active.id
    writeFile(username, data)
  }

  return active
}

function saveChat(username, chatId, history) {
  const data = readFile(username)
  const chat = data.chats.find(c => c.id === chatId)

  if (!chat) return

  chat.messages = history

  if (chat.title === "New chat") {
    const firstUser = history.find(m => m.sender === "user")
    if (firstUser) chat.title = makeTitle(firstUser.text)
  }

  data.activeId = chatId
  writeFile(username, data)
}

function newChat(username) {
  const data = readFile(username)

  const chat = {
    id: Date.now(),
    title: "New chat",
    startedAt: new Date().toISOString(),
    messages: []
  }

  data.chats.push(chat)
  data.activeId = chat.id
  writeFile(username, data)

  return chat
}

function switchChat(username, chatId) {
  const data = readFile(username)
  const chat = data.chats.find(c => c.id === chatId)

  if (!chat) return null

  data.activeId = chatId
  writeFile(username, data)

  return chat
}

function getChatList(username) {
  const data = readFile(username)

  const list = data.chats.map(c => ({
    id: c.id,
    title: c.title,
    startedAt: c.startedAt,
    messageCount: c.messages.length
  }))

  // newest chat first
  list.sort((a, b) => b.id - a.id)

  return list
}

module.exports = { getActiveChat, saveChat, newChat, switchChat, getChatList }
