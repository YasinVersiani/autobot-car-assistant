// Conversation engine (v2): answers with OpenAI, then adds a steering question.
// If the AI is unavailable (no API key, network error, bad response) it falls back to the
// keyword knowledge base, and only then to the soft/hard fallback messages.

const { getBotResponse: getAiResponse } = require("./aiIntentScanner");
const { getBotResponse: getKeywordResponse } = require("./keywordIntentScanner");
const { getSteeringQuestion } = require("./steering");
const { handleFallback, resetFallbackCounter } = require("./fallback");
const { addToHistory, getHistory, clearHistory } = require("./historyHandler");
const { isRepeatQuestion } = require("./repeatGuard");

let turnCount = 0;

function resetTurnCount() {
  turnCount = 0;
}

async function handleMessage(userText) {
  turnCount += 1;

  // check for a repeat BEFORE adding this message to history
  const isRepeat = isRepeatQuestion(userText, getHistory());

  addToHistory({ sender: "user", text: userText });

  if (isRepeat) {
    const botReply = "I think I already mentioned that! Let me think of something else. What other car are you curious about?";
    addToHistory({ sender: "bot", text: botReply });
    return botReply;
  }

  let botReply = (await getAiResponse(userText)) || getKeywordResponse(userText);

  if (!botReply) {
    botReply = handleFallback();

    if (botReply === "__HARD_RESET__") {
      clearHistory();
      resetTurnCount();
      resetFallbackCounter();
      botReply = "I got confused sorry! Let us start fresh. Which car brand are you curious about, BMW, Tesla, or Audi?";
    }
  } else {
    resetFallbackCounter();
    botReply = botReply + " " + getSteeringQuestion(getHistory());
  }

  addToHistory({ sender: "bot", text: botReply });

  return botReply;
}

module.exports = { handleMessage, resetTurnCount };
