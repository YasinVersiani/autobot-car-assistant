// Conversation engine (v1): rule-based keyword spotting against the car knowledge base.
// Superseded by aiEngine.js, kept to show how the bot evolved and for offline use.

const { getBotResponse } = require("./keywordIntentScanner");
const { getSteeringQuestion } = require("./steering");
const { handleFallback, resetFallbackCounter } = require("./fallback");
const { preventRepeat } = require("./repeatGuard");

const HARD_RESET_REPLY = "I got confused sorry! Let us start fresh. Which car brand are you curious about, BMW, Tesla, or Audi?";

function incrementTurn(session) {
  session.turnCount += 1;
}

function getTurnCount(session) {
  return session.turnCount;
}

function resetTurnCount(session) {
  session.turnCount = 0;
}

// session: the ChatSession of the connection that sent the message
function handleMessage(session, userText) {
  incrementTurn(session);

  session.addToHistory({ sender: "user", text: userText });

  let botReply = getBotResponse(userText);

  if (!botReply) {
    botReply = handleFallback(session);

    if (botReply === "__HARD_RESET__") {
      session.reset();
      botReply = HARD_RESET_REPLY;
    }
  } else {
    botReply = preventRepeat(botReply, session.getHistory());
    resetFallbackCounter(session);
    botReply = botReply + " " + getSteeringQuestion(session.getHistory());
  }

  session.addToHistory({ sender: "bot", text: botReply });

  return botReply;
}

module.exports = { handleMessage, getTurnCount, resetTurnCount };
