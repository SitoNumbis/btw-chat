import React, {
  memo,
  useCallback,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from "react";

// @emotion/css
import { css } from "@emotion/css";

import PropTypes from "prop-types";
import loadable from "@loadable/component";

// styles
import styles from "./styles.module.css";
import config from "../../config";

// components
const Input = loadable(() => import("./Input/Input"));
const Message = loadable(() => import("./Message/Message"));
const Navbar = loadable(() => import("./Navbar/Navbar"));

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
        console.info("receiving messages");
        setMessages({
          type: "new-message",
          message,
        });
      });
    }
  }, [socket]);

  const sendMessage = useCallback(async (message) => {
    try {
      const response = await fetch("http://localhost:3000/send-message", {
        method: "POST",
        body: JSON.stringify({
          message,
          date: new Date().getTime(),
          target: localStorage.getItem(config.userCookie),
          sender: {
            user: localStorage.getItem(config.userCookie),
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const [minuteOut, setMinuteOut] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMinuteOut(!minuteOut);
      setMessages({
        type: "plus-minute",
      });
    }, 60000);
  }, [minuteOut]);

  return (
    <div
      className={`${styles.main} ${css({
        backgroundColor: `${localStorage.getItem("chat-main-bg")}88`,
      })}`}
    >
      <Navbar />
      <div className={styles.messages}>
        {messages.map((message, i) => {
          console.log(i, message.sender.user);
          if (i === 0 && messages.length === 0)
            return <Message key={message.date} {...message} />;
          else {
            if (i < messages.length - 1)
              return (
                <Message
                  key={message.date}
                  {...message}
                  join={message.sender.user === messages[i + 1].sender.user}
                />
              );
            else return <Message key={message.date} {...message} />;
          }
        })}
      </div>
      <div className={styles.inputContainer}>
        <Input onSend={sendMessage} />
      </div>
    </div>
  );
}

Main.propTypes = {
  socket: PropTypes.object,
};

export default Main;
