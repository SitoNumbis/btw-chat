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

// services
import {
  sendMessage as sendMessageRemote,
  fetchMessages as fetchMessagesRemote,
} from "../../services/chat/post";

// components
const Input = loadable(() => import("./Input/Input"));
const Message = loadable(() => import("./Message/Message"));
const Navbar = loadable(() => import("./Navbar/Navbar"));

function Main({ socket, selectedChat, sidebar, toggleSidebar }) {
  const messagesReducer = (state, action) => {
    const { type } = action;
    switch (type) {
      case "init": {
        const { list } = action;
        return list;
      }
      case "add": {
        const { messages } = action;
        const toReturn = [...state];
        messages.forEach((message) => {
          const found = toReturn.find(
            (localMessage) => localMessage.date === message.date
          );
          if (!found) toReturn.push(message);
        });
        return toReturn;
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
  const [page, setPage] = useState(0);

  const fetchMessages = useCallback(
    async (target, sender) => {
      try {
        const response = await fetchMessagesRemote(target, sender, page, 20);
        const data = await response.json();
        const { list } = data;
        setMessages({
          type: "add",
          messages: list,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [page]
  );

  useEffect(() => {
    if (selectedChat && localStorage.getItem(config.userCookie) !== null)
      fetchMessages(selectedChat.user, localStorage.getItem(config.userCookie));
  }, [selectedChat]);

  useEffect(() => {
    if (socket) {
      socket.on("message", (conversation) => {
        console.info("receiving messages");
        const { target, sender } = conversation;
        fetchMessages(target, sender);
      });
    }
  }, [socket]);

  const sendMessage = useCallback(
    async (message) => {
      try {
        const parsedMessage = {
          message,
          date: new Date().getTime(),
          target: selectedChat?.user,
          sender: {
            user: localStorage.getItem(config.userCookie),
          },
        };
        setMessages({
          type: "add",
          messages: [parsedMessage],
        });
        const response = await sendMessageRemote(parsedMessage);
        const data = await response.json();
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    },
    [selectedChat]
  );

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
      {selectedChat ? (
        <>
          <Navbar
            toggleSidebar={toggleSidebar}
            sidebar={sidebar}
            selectedChat={selectedChat}
          />

          <div className={styles.messages}>
            <p className="text-placeholder-dark italic m-auto">
              {selectedChat?.bio}
            </p>
            {messages.map((message, i) => {
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
        </>
      ) : null}
    </div>
  );
}

Main.propTypes = {
  socket: PropTypes.object,
  sidebar: PropTypes.bool,
  toggleSidebar: PropTypes.func,
  selectedChat: PropTypes.shape({
    photo: PropTypes.string,
    user: PropTypes.string,
    name: PropTypes.string,
    bio: PropTypes.string,
  }),
};

export default Main;
