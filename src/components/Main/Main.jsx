import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from "react";

import PropTypes from "prop-types";
import loadable from "@loadable/component";

// styles
import styles from "./styles.module.css";

// components
const Input = loadable(() => import("./Input/Input"));
const Message = loadable(() => import("./Message/Message"));

function Main({ socket }) {
  const messagesReducer = (state, action) => {
    const { type } = action;
    switch (type) {
      case "init": {
        const { list } = action;
        return list;
      }
      case "plus-minute": {
        const newState = state.map((item) => {
          const parsedItem = { ...item };
          parsedItem.tick = item.tick ? 0 : item.tick + 1;
          return parsedItem;
        });
        return newState;
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
        console.log(message);
        setMessages({
          type: "new-message",
          message,
        });
      });
    }
  }, [socket]);

  const sendMessage = useCallback(
    (message) => {
      socket.emit("message", {
        message,
        date: new Date().getTime(),
        sender: { name: "Tester" },
      });
    },
    [socket]
  );

  const [minuteOut, setMinuteOut] = useState(false);

  useEffect(() => {
    console.log("tick start");
    setTimeout(() => {
      console.log("tick ends");
      setMinuteOut(!minuteOut);
      setMessages({
        type: "plus-minute",
      });
    }, 5000);
  }, [minuteOut]);

  return (
    <div className={styles.main}>
      <div className={styles.messages}>
        {messages.map((message) => (
          <Message key={message.date} {...message} />
        ))}
      </div>
      <Input onSend={sendMessage} />
    </div>
  );
}

Main.propTypes = {
  socket: PropTypes.object,
};

export default Main;
