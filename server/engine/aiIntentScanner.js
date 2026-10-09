// AI intent detection: sends the message to OpenAI with a car-expert system prompt,
// so the bot understands free-form questions instead of relying on exact keywords.
// Returns null on any failure so the engine can fall back gracefully.

const carContext = "You are AutoBot, a friendly car assistant chatbot. You know about car brands, models, car types like SUV sedan hybrid electric, engines, horsepower, safety, and general car topics. Keep answers short, around 2 to 4 sentences, casual but informative, like a friend who knows a lot about cars. Stick to car related topics only, if the user asks something totally unrelated just say you can only help with car stuff.";

async function getBotResponse(userText) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("[aiIntentScanner] missing api key, skipping");
    return null;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: carContext },
          { role: "user",   content: userText }
        ],
        max_tokens: 150
      })
    });

    if (!res.ok) {
      console.log("[aiIntentScanner] openai returned bad status", res.status);
      return null;
    }

    const data = await res.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message.content;

    if (!reply) {
      return null;
    }

    return reply.trim();

  } catch (err) {
    console.log("[aiIntentScanner] something went wrong calling openai:", err.message);
    return null;
  }
}

module.exports = { getBotResponse };
