// In-memory history of the current conversation (used for steering and repeat detection).

let conversationHistory = [];

function addToHistory(msg) {
  conversationHistory.push(msg);
}

function getHistory() {
  return conversationHistory;
}

function clearHistory() {
  conversationHistory = [];
}

module.exports = { addToHistory, getHistory, clearHistory };
