// Keyword intent detection: finds known car keywords in the user's message and
// returns the matching answers from data/car_data.json.

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "car_data.json");

let carData = {};

try {
  carData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  console.log("[keywordIntentScanner] car_data.json loaded");
} catch (err) {
  console.log("[keywordIntentScanner] could not load car_data.json:", err.message);
}

// Collects every matching keyword so "compare bmw and tesla" gets both answers.
// Returns null when nothing matches so the fallback system takes over.
function getBotResponse(userText) {
  const lower = userText.toLowerCase();
  const matched = [];

  for (const keyword in carData) {
    if (lower.includes(keyword)) {
      matched.push(carData[keyword]);
    }
  }

  return matched.length > 0 ? matched.join(" Also, ") : null;
}

// returns just the keyword names that matched, useful for debugging
function getMatchedKeywords(userText) {
  const lower = userText.toLowerCase();
  const keys = [];

  for (const keyword in carData) {
    if (lower.includes(keyword)) {
      keys.push(keyword);
    }
  }

  return keys;
}

module.exports = { getBotResponse, getMatchedKeywords };
