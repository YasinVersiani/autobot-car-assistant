// takes the messages array and triggers a download in the browser
function exportChatHistory(messages) {
  // turn the messages into a json string so we can save it
  const chatText = JSON.stringify(messages, null, 2);

  // create a blob which is basically a file in memory
  const blob = new Blob([chatText], { type: "application/json" });

  // create a temporary link element to trigger the download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat_history.json";

  // click it automatically so the file saves
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export { exportChatHistory };
