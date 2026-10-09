import React, { useState } from "react";

// Sign-in / register screen. Car photo from Unsplash (free to use).

function LoginPage(props) {
  var [username, setUsername] = useState("");
  var [password, setPassword] = useState("");
  var [mode, setMode] = useState("login");
  var [error, setError] = useState("");

  function handleSubmit() {
    if (!username || !password) {
      setError("please fill in both fields");
      return;
    }

    setError("");

    if (mode === "login") {
      props.onLogin(username, password);
    } else {
      props.onSignup(username, password);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-image-side">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80"
            alt="car"
            className="login-image"
          />
        </div>

        <div className="login-form-side">
          <h1>AutoBot</h1>
          <p className="login-subtitle">your personal car expert</p>

          <div className="login-tabs">
            <button
              className={mode === "login" ? "login-tab active" : "login-tab"}
              onClick={function() { setMode("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={mode === "signup" ? "login-tab active" : "login-tab"}
              onClick={function() { setMode("signup"); setError(""); }}
            >
              Register
            </button>
          </div>

          <label className="login-label">Username</label>
          <input
            type="text"
            placeholder="enter your username"
            value={username}
            onChange={function(e) { setUsername(e.target.value); }}
            onKeyDown={handleKeyDown}
            className="login-input"
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            placeholder="enter your password"
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            onKeyDown={handleKeyDown}
            className="login-input"
          />

          {error && <p className="login-error">{error}</p>}
          {props.authError && <p className="login-error">{props.authError}</p>}

          <button onClick={handleSubmit} className="login-btn">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
