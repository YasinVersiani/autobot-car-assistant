// Timestamp helpers for chat messages, e.g. "10:24 AM".

function getTimestamp() {
  return new Date().toISOString();
}

// takes an ISO string and returns a time like "10:24 AM"
function formatTime(isoString) {
  if (!isoString) return "";

  return new Date(isoString).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit"
  });
}

// normalizes any timestamp format to a clean "08:13 PM",
// so bot and user message timestamps look the same
function normalizeTimestamp(input) {
  if (!input) return "";

  // ISO strings are converted; values like "08:13 PM" are re-parsed below
  if (input.includes("T") || input.includes("Z")) {
    return formatTime(input);
  }

  // try parsing it anyway in case it is a different format
  const parsed = new Date("1970-01-01 " + input);
  if (!isNaN(parsed)) {
    return parsed.toLocaleTimeString([], {
      hour:   "2-digit",
      minute: "2-digit"
    });
  }

  return input;
}

export { getTimestamp, formatTime, normalizeTimestamp };
