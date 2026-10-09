// Message input bar at the bottom of the chat.

import React, { useState } from "react";

function UserInput(props) {
  var [inputText, setInputText] = useState("");

  function handleChange(event) {
    setInputText(event.target.value);
  }

  function handleSend() {
    var trimmed = inputText.trim();
    if (trimmed === "") {
      return;
    }
    props.onSubmit(trimmed);
    setInputText("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSend();
    }
  }

  return (
    <div className="user-input-area">
      <input
        type="text"
        className="user-input-field"
        placeholder="Ask me about a car brand..."
        value={inputText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button className="send-button" onClick={handleSend}>
        Send
      </button>
    </div>
  );
}

export default UserInput;
