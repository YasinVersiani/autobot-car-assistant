// State for one conversation: message history, turn count and fallback counter.
// Each socket connection gets its own ChatSession, so users chatting at the same
// time never share history.

class ChatSession {
  constructor() {
    this.reset();
  }

  reset() {
    this.history = [];
    this.turnCount = 0;
    this.failureCount = 0;
  }

  addMessage(msg) {
    this.history.push(msg);
  }

  // replaces the session with a saved conversation
  load(messages) {
    this.reset();
    messages.forEach(msg => this.addMessage(msg));
  }
}

module.exports = { ChatSession };
