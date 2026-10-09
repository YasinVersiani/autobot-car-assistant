// Connection layer between the React client and the chat engine.
// Handles auth, message routing and the multi-conversation history sidebar.
// Every connection has its own ChatSession, so concurrent users never share state.

const { handleMessage } = require("./engine/aiEngine");
const { ChatSession } = require("./engine/chatSession");
const { signup, login } = require("./storage/userAccounts");
const { getActiveChat, saveChat, newChat, switchChat, getChatList } = require("./storage/savedChats");

function currentTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function handleSocketEvents(socket, io) {

  // who is logged in on this connection, which chat is open, and its in-memory state
  let currentUser = null;
  let currentChatId = null;
  const session = new ChatSession();

  // opening bot message, used on first login and on a new chat
  function greet() {
    const text = "Welcome to Autobot! I know everything about cars. Which car brand are you curious about, BMW, Tesla, Ferrari, or something else?";
    const timestamp = currentTime();

    socket.emit("bot_message", { text: text, timestamp: timestamp });
    session.addToHistory({ sender: "bot", text: text, timestamp: timestamp });
    saveChat(currentUser, currentChatId, session.getHistory());
  }

  // updates the history sidebar
  function pushChatList() {
    socket.emit("chat_list", {
      chats: getChatList(currentUser),
      activeId: currentChatId
    });
  }

  // marks the user as signed in on this connection and opens their active chat
  function startSession(username) {
    currentUser = username;
    const active = getActiveChat(currentUser);
    currentChatId = active.id;

    // load saved messages back into the session so steering and repeat detection keep working
    session.load(active.messages);

    socket.emit("auth_result", { ok: true, user: { username: currentUser } });

    if (active.messages.length > 0) {
      socket.emit("history_loaded", { history: active.messages });
    } else {
      greet();
    }

    pushChatList();
  }

  // user submitted the signup form; a new account is signed in straight away
  socket.on("signup", function(data) {
    const result = signup(data.username, data.password);

    if (!result.ok) {
      socket.emit("auth_result", result);
      return;
    }

    startSession(data.username);
  });

  // user submitted the login form
  socket.on("login", function(data) {
    const result = login(data.username, data.password);

    if (!result.ok) {
      socket.emit("auth_result", result);
      return;
    }

    startSession(data.username);
  });

  // user clicked logout
  socket.on("logout", function() {
    currentUser = null;
    currentChatId = null;
    session.reset();
  });

  // main event: user sent a message
  socket.on("user_message", function(data) {
    const userText = data.text || "";

    if (userText.trim() === "") return;
    if (!currentUser) return;

    // short delay so replies feel natural; handleMessage is async because it awaits the OpenAI call
    setTimeout(async function() {
      const reply = await handleMessage(session, userText);

      socket.emit("bot_message", { text: reply, timestamp: currentTime() });

      // save the updated history so it persists between sessions
      saveChat(currentUser, currentChatId, session.getHistory());
      pushChatList();
    }, 600);
  });

  // Reset button: clear the session and send the opening message again
  socket.on("reset_conversation", function() {
    session.reset();

    // small delay before responding so the screen clears first
    setTimeout(function() {
      const text = "Chat has been reset. Let us start again! Which car are you curious about?";
      const timestamp = currentTime();

      socket.emit("bot_message", { text: text, timestamp: timestamp });

      if (currentUser) {
        session.addToHistory({ sender: "bot", text: text, timestamp: timestamp });
        saveChat(currentUser, currentChatId, session.getHistory());
        pushChatList();
      }
    }, 300);
  });

  // "New Conversation" button in the sidebar
  socket.on("new_conversation", function() {
    if (!currentUser) return;

    const chat = newChat(currentUser);
    currentChatId = chat.id;
    session.reset();

    greet();
    socket.emit("history_loaded", { history: session.getHistory() });
    pushChatList();
  });

  // clicking an older chat in the sidebar
  socket.on("load_conversation", function(data) {
    if (!currentUser) return;

    const chat = switchChat(currentUser, data.id);
    if (!chat) return;

    currentChatId = chat.id;
    session.load(chat.messages);

    socket.emit("history_loaded", { history: chat.messages });
    pushChatList();
  });

  // user closed the tab or lost connection
  socket.on("disconnect", function() {
    console.log("[socketHandler] user disconnected:", socket.id);
    currentUser = null;
    currentChatId = null;
  });
}

module.exports = { handleSocketEvents };
