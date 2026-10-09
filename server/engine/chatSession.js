// Conversation state for one connection: message history, turn count and fallback counter.
// Each socket connection gets its own ChatSession, so users chatting at the same
// time never share history.

class ChatSession {
  constructor() {
    this.reset();
  }

  addToHistory(msg) {
    this.history.push(msg);
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  // text of every bot reply so far
  getBotMessages() {
    return this.history
      .filter(msg => msg.sender === "bot")
      .map(msg => msg.text);
  }

  // clears the history and all counters
  reset() {
    this.clearHistory();
    this.turnCount = 0;
    this.failureCount = 0;
  }

  // replaces the session with a saved conversation
  load(messages) {
    this.reset();
    messages.forEach(msg => this.addToHistory(msg));
  }
}

module.exports = { ChatSession };
