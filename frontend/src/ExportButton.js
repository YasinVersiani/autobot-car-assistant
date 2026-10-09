import React from "react";
import { exportChatHistory } from "./exportLogic";

// Downloads the current chat as a JSON file.
function ExportButton(props) {
  function handleClick() {
    exportChatHistory(props.messages);
  }

  return (
    <button onClick={handleClick} className="export-btn">
      Download Chat
    </button>
  );
}

export { ExportButton };
