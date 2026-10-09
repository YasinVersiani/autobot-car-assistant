// Clears the messages on screen and tells the server to reset the session.
// The server replies with a fresh welcome message.
function handleReset(setMessages, socket) {
  setMessages([]);

  if (socket) {
    socket.emit("reset_conversation");
  }
}

export { handleReset };
