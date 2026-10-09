// Unit tests for the conversation engine. Run with: npm test
// No OpenAI key is used, so the AI engine answers from the keyword knowledge base.

delete process.env.OPENAI_API_KEY;

const test = require("node:test");
const assert = require("node:assert/strict");

const { ChatSession } = require("../server/engine/chatSession");
const { getBotResponse } = require("../server/engine/keywordIntentScanner");
const { preventRepeat, isRepeatQuestion } = require("../server/engine/repeatGuard");
const { handleFallback, resetFallbackCounter } = require("../server/engine/fallback");
const aiEngine = require("../server/engine/aiEngine");
const keywordEngine = require("../server/engine/keywordEngine");

const REPEAT_REPLY = "I think I already mentioned that";
const HARD_RESET_REPLY = "I got confused sorry";

test.describe("keyword knowledge base", () => {
  test("answers a known brand", () => {
    assert.match(getBotResponse("tell me about BMW"), /German luxury brand/);
  });

  test("combines answers when several keywords match", () => {
    const reply = getBotResponse("compare bmw and tesla");
    assert.match(reply, /BMW/);
    assert.match(reply, /Tesla/);
    assert.match(reply, / Also, /);
  });

  test("returns null when nothing matches", () => {
    assert.equal(getBotResponse("qwertyuiop"), null);
  });
});

test.describe("repeat detection", () => {
  const history = [
    { sender: "user", text: "Tell me about Ferrari" },
    { sender: "bot", text: "Ferrari is an Italian supercar brand. Hand-built in Maranello." }
  ];

  test("spots a repeated question regardless of case and spacing", () => {
    assert.equal(isRepeatQuestion("  tell me about ferrari ", history), true);
    assert.equal(isRepeatQuestion("tell me about audi", history), false);
  });

  test("replaces an answer the bot already gave", () => {
    const reply = preventRepeat("Ferrari is an Italian supercar brand. Something else.", history);
    assert.match(reply, new RegExp(REPEAT_REPLY));
  });
});

test.describe("fallback strategy", () => {
  test("gives two soft hints, then a hard reset", () => {
    const session = new ChatSession();
    assert.notEqual(handleFallback(session), "__HARD_RESET__");
    assert.notEqual(handleFallback(session), "__HARD_RESET__");
    assert.equal(handleFallback(session), "__HARD_RESET__");
  });

  test("starts counting again after a successful answer", () => {
    const session = new ChatSession();
    handleFallback(session);
    handleFallback(session);
    resetFallbackCounter(session);
    assert.notEqual(handleFallback(session), "__HARD_RESET__");
  });
});

test.describe("AI engine", () => {
  test("answers and adds a follow-up question", async () => {
    const session = new ChatSession();
    const reply = await aiEngine.handleMessage(session, "tell me about the porsche 911");

    assert.match(reply, /911/);
    assert.match(reply, /\?$/);
    assert.equal(session.getHistory().length, 2);
  });

  test("does not answer the same question twice", async () => {
    const session = new ChatSession();
    await aiEngine.handleMessage(session, "tell me about volvo");
    const reply = await aiEngine.handleMessage(session, "Tell me about Volvo");

    assert.match(reply, new RegExp(REPEAT_REPLY));
  });

  test("resets the conversation after three replies it cannot answer", async () => {
    const session = new ChatSession();
    await aiEngine.handleMessage(session, "asdf");
    await aiEngine.handleMessage(session, "ghjk");
    const reply = await aiEngine.handleMessage(session, "zxcv");

    assert.match(reply, new RegExp(HARD_RESET_REPLY));
    assert.deepEqual(session.getHistory().map(m => m.sender), ["bot"]);
  });

  test("keeps separate sessions independent", async () => {
    const alice = new ChatSession();
    const bob = new ChatSession();

    await aiEngine.handleMessage(alice, "tell me about audi");
    const bobReply = await aiEngine.handleMessage(bob, "tell me about audi");

    assert.doesNotMatch(bobReply, new RegExp(REPEAT_REPLY));
    assert.equal(alice.getHistory().length, 2);
    assert.equal(bob.getHistory().length, 2);
  });
});

test.describe("keyword engine", () => {
  test("answers from the knowledge base", () => {
    const session = new ChatSession();
    const reply = keywordEngine.handleMessage(session, "what about the mustang");

    assert.match(reply, /Mustang/);
  });
});

test.describe("helpers", () => {
  const { getMatchedKeywords } = require("../server/engine/keywordIntentScanner");
  const { isConversationLong } = require("../server/engine/repeatGuard");
  const { getFailureCount } = require("../server/engine/fallback");

  test("lists the keywords found in a message", () => {
    assert.deepEqual(getMatchedKeywords("bmw or audi?").sort(), ["audi", "bmw"]);
  });

  test("flags conversations longer than 20 turns", () => {
    assert.equal(isConversationLong(20), false);
    assert.equal(isConversationLong(21), true);
  });

  test("tracks turns and failures per session", async () => {
    const session = new ChatSession();
    await aiEngine.handleMessage(session, "tell me about honda");
    await aiEngine.handleMessage(session, "qwerty");

    assert.equal(aiEngine.getTurnCount(session), 2);
    assert.equal(getFailureCount(session), 1);

    aiEngine.resetTurnCount(session);
    assert.equal(keywordEngine.getTurnCount(session), 0);
  });

  test("returns only the bot's messages", async () => {
    const session = new ChatSession();
    await aiEngine.handleMessage(session, "tell me about kia");

    assert.equal(session.getBotMessages().length, 1);
    assert.match(session.getBotMessages()[0], /Kia/);
  });
});
