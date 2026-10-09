// Integration tests for the socket layer: signup, chatting and saved history,
// using in-memory fake sockets and a temporary data folder.

const fs = require("fs");
const os = require("os");
const path = require("path");

delete process.env.OPENAI_API_KEY;
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "autobot-test-"));

const test = require("node:test");
const assert = require("node:assert/strict");

const { handleSocketEvents } = require("../server/socketHandler");

// Minimal stand-in for a Socket.IO socket: records what the server sends
// and lets the test trigger client events.
function createFakeSocket() {
  const handlers = {};
  const sent = [];

  const socket = {
    id: "fake-" + Math.random().toString(36).slice(2),
    on(event, fn) { handlers[event] = fn; },
    emit(event, data) { sent.push({ event, data }); }
  };

  handleSocketEvents(socket, null);

  return {
    sent,
    send(event, data) { handlers[event](data); },
    botMessages() { return sent.filter(m => m.event === "bot_message").map(m => m.data.text); }
  };
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function readChats(username) {
  const file = path.join(process.env.DATA_DIR, "chats", username + ".json");
  return JSON.parse(fs.readFileSync(file, "utf8")).chats;
}

test.after(() => {
  fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true });
});

test("a new account is signed in and greeted right after registering", () => {
  const client = createFakeSocket();
  client.send("signup", { username: "newuser", password: "secret" });

  const auth = client.sent.find(m => m.event === "auth_result");
  assert.equal(auth.data.ok, true);
  assert.match(client.botMessages()[0], /Welcome to Autobot/);
});

test("login fails with a wrong password", () => {
  const client = createFakeSocket();
  client.send("signup", { username: "carol", password: "right" });

  const other = createFakeSocket();
  other.send("login", { username: "carol", password: "wrong" });

  const auth = other.sent.find(m => m.event === "auth_result");
  assert.equal(auth.data.ok, false);
});

test("two users chatting at the same time keep separate histories", async () => {
  const alice = createFakeSocket();
  const bob = createFakeSocket();
  alice.send("signup", { username: "alice", password: "pw" });
  bob.send("signup", { username: "bob", password: "pw" });

  alice.send("user_message", { text: "tell me about the porsche 911" });
  bob.send("user_message", { text: "tell me about the porsche 911" });
  await wait(800);

  // bob must get a real answer, not "I already mentioned that"
  assert.match(alice.botMessages()[1], /911/);
  assert.match(bob.botMessages()[1], /911/);

  // each user's saved chat holds only their own messages
  assert.equal(readChats("alice")[0].messages.length, 3);
  assert.equal(readChats("bob")[0].messages.length, 3);
});

test("messages are ignored until the user is signed in", async () => {
  const client = createFakeSocket();
  client.send("user_message", { text: "tell me about bmw" });
  await wait(800);

  assert.equal(client.botMessages().length, 0);
});
