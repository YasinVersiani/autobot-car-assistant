// Conversation engine (v1): rule-based keyword spotting against the car knowledge base.
// Superseded by aiEngine.js, kept to show how the bot evolved and for offline use.

const { getBotResponse } = require("./keywordIntentScanner");
const { getSteeringQuestion } = require("./steering");
const { handleFallback, resetFallbackCounter } = require("./fallback");
const { addToHistory, getHistory, clearHistory } = require("./historyHandler");
const { preventRepeat } = require("./repeatGuard");

let turnCount = 0;

function resetTurnCount() {
  turnCount = 0;
}

function handleMessage(userText) {
  turnCount += 1;

  addToHistory({ sender: "user", text: userText });

  let botReply = getBotResponse(userText);

  if (!botReply) {
    botReply = handleFallback();

    if (botReply === "__HARD_RESET__") {
      clearHistory();
      resetTurnCount();
      resetFallbackCounter();
      botReply = "I got confused sorry! Let us start fresh. Which car brand are you curious about, BMW, Tesla, or Audi?";
    }
  } else {
    botReply = preventRepeat(botReply, getHistory());
    resetFallbackCounter();
    botReply = botReply + " " + getSteeringQuestion(getHistory());
  }

  addToHistory({ sender: "bot", text: botReply });

  return botReply;
}

module.exports = { handleMessage, resetTurnCount };
