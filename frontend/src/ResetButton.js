// Reset button in the chat header; asks for confirmation before clearing the conversation.

import React from "react";

function ResetButton({ onReset }) {

  function clickconfirm() {
        const confirmed = window.confirm("Reset the conversation? All messages will be cleared.");

    if (confirmed) {
      onReset();
    }
  }

  return (
   <button className="reset-button" onClick={clickconfirm}>
      Reset Chat
    </button>
  );

}

export default ResetButton;
