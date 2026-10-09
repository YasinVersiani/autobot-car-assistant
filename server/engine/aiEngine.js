// Conversation engine (v2): answers with OpenAI, then adds a steering question.
// If the AI is unavailable (no API key, network error, bad response) it falls back to the
// keyword knowledge base, and only then to the soft/hard fallback messages.

const { getBotResponse: getAiResponse } = require("./aiIntentScanner");
const { getBotResponse: getKeywordResponse } = require("./keywordIntentScanner");
const { getSteeringQuestion } = require("./steering");
const { handleFallback, resetFallbackCounter } = require("./fallback");
const { isRepeatQuestion } = require("./repeatGuard");

const REPEAT_REPLY = "I think I already mentioned that! Let me think of something else. What other car are you curious about?";
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
async function handleMessage(session, userText) {
  incrementTurn(session);

  // check for a repeat BEFORE adding this message to history
  const isRepeat = isRepeatQuestion(userText, session.getHistory());

  session.addToHistory({ sender: "user", text: userText });

  if (isRepeat) {
    session.addToHistory({ sender: "bot", text: REPEAT_REPLY });
    return REPEAT_REPLY;
  }

  let botReply = (await getAiResponse(userText)) || getKeywordResponse(userText);

  if (!botReply) {
    botReply = handleFallback(session);

    if (botReply === "__HARD_RESET__") {
      session.reset();
      botReply = HARD_RESET_REPLY;
    }
  } else {
    resetFallbackCounter(session);
    botReply = botReply + " " + getSteeringQuestion(session.getHistory());
  }

  session.addToHistory({ sender: "bot", text: botReply });

  return botReply;
}

module.exports = { handleMessage, getTurnCount, resetTurnCount };
