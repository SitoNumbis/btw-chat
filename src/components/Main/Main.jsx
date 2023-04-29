import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from "react";

import PropTypes from "prop-types";

function Main({ socket }) {
  const [message, setMessage] = useState("");

  const messagesReducer = (state, action) => {
    const { type } = action;
    switch (type) {
      case "init": {
        const { list } = action;
        return list;
      }
      case "new-message": {
        const { message } = action;
        return [...state, message];
      }
      default:
        return state;
    }
  };

  const [messages, setMessages] = useReducer(messagesReducer, []);

  useEffect(() => {
    if (socket) {
      socket.on("message", (message) => {
        setMessages({ type: "new-message", message });
      });
    }
  }, [socket, setMessage]);

  const sendMessage = () => {
    socket.emit("message", message);
    setMessage("");
  };

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

Main.propTypes = {
  socket: PropTypes.object,
};

export default Main;
