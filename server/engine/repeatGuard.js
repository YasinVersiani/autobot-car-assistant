// Stops the bot from repeating itself.

const REPEAT_REPLY = "I think I already mentioned that! Let me think of something else. What other car are you curious about?";

// Keyword engine: answers are fixed text, so compare against earlier bot replies.
function preventRepeat(reply, history) {
  const previousBotMsgs = history
    .filter(msg => msg.sender === "bot")
    .map(msg => msg.text);

  const firstSentence = reply.split(".")[0];
  return previousBotMsgs.some(msg => msg.includes(firstSentence)) ? REPEAT_REPLY : reply;
}

// AI engine: the model rephrases its answers, so compare the user's questions instead.
function isRepeatQuestion(userText, history) {
  const previousUserMsgs = history
    .filter(msg => msg.sender === "user")
    .map(msg => msg.text.toLowerCase().trim());

  return previousUserMsgs.includes(userText.toLowerCase().trim());
}

// true once a conversation has gone past 20 turns
function isConversationLong(turnCount) {
  return turnCount > 20;
}

module.exports = { preventRepeat, isRepeatQuestion, isConversationLong };
