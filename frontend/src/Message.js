// A single chat bubble (user or bot) with its timestamp.

import React from "react";

function Message(props) {
  var sender = props.sender;
  var text = props.text;
  var timestamp = props.timestamp;

  var bubbleClass = sender === "user" ? "message-bubble user-bubble" : "message-bubble bot-bubble";
  var rowClass = sender === "user" ? "message-row user-row" : "message-row bot-row";

  return (
    <div className={rowClass}>
      <div className={bubbleClass}>
        <p className="message-text">{text}</p>
        <span className="message-timestamp">{timestamp}</span>
      </div>
    </div>
  );
}

export default Message;
