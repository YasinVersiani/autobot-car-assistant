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

// session: the ChatSession of the connection that sent the message
async function handleMessage(session, userText) {
  session.turnCount += 1;

  // check for a repeat BEFORE adding this message to history
  const isRepeat = isRepeatQuestion(userText, session.history);

  session.addMessage({ sender: "user", text: userText });

  if (isRepeat) {
    session.addMessage({ sender: "bot", text: REPEAT_REPLY });
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
    botReply = botReply + " " + getSteeringQuestion(session.history);
  }

  session.addMessage({ sender: "bot", text: botReply });

  return botReply;
}

module.exports = { handleMessage };
