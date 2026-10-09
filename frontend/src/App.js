// Root component: holds chat and auth state and talks to the server over Socket.IO.

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import MessageArea from "./MessageArea";
import UserInput from "./UserInput";
import { ExportButton } from "./ExportButton";
import ResetButton from "./ResetButton";
import LoginPage from "./LoginPage";
import HistorySidebar from "./HistorySidebar";
import { handleReset } from "./resetLogic";
import "./styles.css";

var socket = io(window.location.origin);

function App() {
  var [messages, setMessages] = useState([]);
  var [loggedInUser, setLoggedInUser] = useState(null);
  var [authError, setAuthError] = useState("");
  var [conversations, setConversations] = useState([]);
  var [activeConvId, setActiveConvId] = useState(null);

  useEffect(function() {
    socket.on("bot_message", function(data) {
      var newMessage = {
        sender: "bot",
        text: data.text,
        timestamp: data.timestamp || new Date().toLocaleTimeString()
      };
      setMessages(function(prev) {
        return [...prev, newMessage];
      });
    });

    // replaces the message list when a saved chat is opened
    socket.on("history_loaded", function(data) {
      setMessages(data.history);
    });

    // updates the sidebar list
    socket.on("chat_list", function(data) {
      setConversations(data.chats);
      setActiveConvId(data.activeId);
    });

    // login / signup response
    socket.on("auth_result", function(result) {
      if (result.ok) {
        setAuthError("");
        setLoggedInUser(result.user.username);
      } else {
        setAuthError(result.message);
      }
    });

    return function() {
      socket.off("bot_message");
      socket.off("history_loaded");
      socket.off("chat_list");
      socket.off("auth_result");
    };
  }, []);

  function onLogin(username, password) {
    socket.emit("login", { username: username, password: password });
  }

  function onSignup(username, password) {
    socket.emit("signup", { username: username, password: password });
  }

  function onLogout() {
    socket.emit("logout");
    setLoggedInUser(null);
    setMessages([]);
    setAuthError("");
    setConversations([]);
    setActiveConvId(null);
  }

  function onNewConversation() {
    socket.emit("new_conversation");
  }

  function onLoadConversation(id) {
    socket.emit("load_conversation", { id: id });
  }

  function onSubmitMessage(text) {
    var userMessage = {
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(function(prev) {
      return [...prev, userMessage];
    });
    socket.emit("user_message", { text: text });
  }

  function onReset() {
    handleReset(setMessages, socket);
  }

  if (!loggedInUser) {
    return <LoginPage onLogin={onLogin} onSignup={onSignup} authError={authError} />;
  }

  return (
    <div className="app-shell">
      <HistorySidebar
        chats={conversations}
        activeId={activeConvId}
        onNewChat={onNewConversation}
        onLoadChat={onLoadConversation}
      />
      <div className="app-wrapper">
        <div className="chat-header">
          <h1>Car Assistant Bot</h1>
          <div className="header-buttons">
            <ExportButton messages={messages} />
            <ResetButton onReset={onReset} />
            <button className="logout-btn" onClick={onLogout}>Log Out</button>
          </div>
        </div>
        <MessageArea messages={messages} />
        <UserInput onSubmit={onSubmitMessage} />
      </div>
    </div>
  );
}

export default App;
