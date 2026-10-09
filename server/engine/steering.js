// Follow-up questions appended to each answer to keep the conversation going.

const questions = [
  "Do you prefer fast sports cars or SUVs?",
  "Whats your favorite car color?",
  "Would you go for petrol or electric?",
  "Which brand has the best design, BMW Audi or Tesla?",
  "Have you ever been inside a luxury car?",
  "If money wasnt a problem which car would you pick?",
  "Do you think self driving cars are the future?",
  "What matters more to you, speed comfort or safety?",
  "Would you buy used or brand new?",
  "Do you think electric cars are actually better for the environment?",
  "What do you know about the BMW M series?",
  "Have you heard of the Audi e-tron?",
  "Whats the longest road trip you would take?",
  "Do you think car prices will keep going up?",
  "Germany Japan or USA, who makes the best cars?",
  "Manual or automatic gearbox?",
  "Do you follow F1 racing?",
  "What do you think about Tesla autopilot?",
  "BMW 3 series or Audi A4, which one?",
  "Would you consider buying electric for your next car?",
  "Do you think petrol cars will disappear in 20 years?",
  "What do you think about car sharing like Uber?",
  "Have you ever done a test drive?",
  "Should all new cars be electric?"
];

// rotates through the list based on how many replies the bot has given
function getSteeringQuestion(history) {
  const botTurns = history.filter((msg) => msg.sender === "bot").length;

  const index = botTurns % questions.length;

  return questions[index];
}

module.exports = { getSteeringQuestion };
