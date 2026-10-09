// Clears the messages on screen and tells the server to reset the session.
// The server replies with a fresh welcome message.

// true when there is nothing on screen to reset
function isChatEmpty(messages) {
  return !messages || messages.length === 0;
}

function handleReset(setMessages, socket) {
  setMessages([]);

  if (socket) {
    socket.emit("reset_conversation");
  }
}

export { handleReset, isChatEmpty };
