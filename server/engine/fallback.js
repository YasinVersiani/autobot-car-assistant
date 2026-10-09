// Fallback strategy when the bot can't answer: a few soft rephrase prompts,
// then a hard reset of the conversation after 3 failures in a row.

const softFallbacks = [
  "I am not sure what car you mean, can you rephrase?",
  "Hmm I didnt get that, can you mention a brand like BMW or Tesla?",
  "Can you say that differently? Try typing a car brand.",
  "That went over my head! Try asking about a specific car."
];

function handleFallback(session) {
  session.failureCount += 1;

  if (session.failureCount >= 3) {
    return "__HARD_RESET__";
  }

  const index = (session.failureCount - 1) % softFallbacks.length;
  return softFallbacks[index];
}

// called after every successful answer
function resetFallbackCounter(session) {
  session.failureCount = 0;
}

module.exports = { handleFallback, resetFallbackCounter };
