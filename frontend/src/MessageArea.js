// Scrollable list of chat messages.

import React from "react";
import Message from "./Message";

function MessageArea(props) {
  var messages = props.messages;

  return (
    <div className="message-area">
      {messages.map(function(msg, index) {
        return (
          <Message
            key={index}
            sender={msg.sender}
            text={msg.text}
            timestamp={msg.timestamp}
          />
        );
      })}
    </div>
  );
}

export default MessageArea;
