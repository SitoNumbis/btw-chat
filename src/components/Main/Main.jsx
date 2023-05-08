import { useCallback, useState, useEffect, useReducer } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import { sortBy } from "some-javascript-utils/array";

import useScreenSize from "use-screen-witdh";

// @emotion/css
import { css } from "@emotion/css";

import PropTypes from "prop-types";
import loadable from "@loadable/component";

// contexts
import { useNotification } from "../../context/NotificationProvider";

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
const Typing = loadable(() => import("./Typing/Typing"));
const Navbar = loadable(() => import("./Navbar/Navbar"));
const Settings = loadable(() => import("./Settings/Settings"));
const ConnectionState = loadable(() =>
  import("../ConnectionState/ConnectionState")
);
const Messages = loadable(() => import("./Messages/Messages"));

function Main({ socket, selectedChat, selectChat, toggleSidebar }) {
  const { setNotificationState } = useNotification();

  const [showOffState, setShowOffState] = useState(false);

  const [settings, setSettings] = useState(true);

  const { width } = useScreenSize();

  useEffect(() => {
    if (width < 850) setShowOffState(true);
    else setShowOffState(false);
  }, [width]);

  const messagesReducer = (state, action) => {
    const { type } = action;
    switch (type) {
      case "init": {
        const { messages } = action;
        return messages;
      }
      case "add": {
        const { messages } = action;
        const toReturn = [...state];
        messages.forEach((message) => {
          const found = toReturn.find(
            (localMessage) =>
              localMessage.date === message.date &&
              localMessage.target === message.target
          );
          if (!found) toReturn.push(message);
        });

        return sortBy(toReturn, "date", true);
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

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useReducer(messagesReducer, []);
  const [page, setPage] = useState(0);

  const [oldChat, setOldChat] = useState("");

  const fetchMessages = useCallback(
    async (target, sender, loadingL = true) => {
      if (!loading) {
        if (loadingL) setLoading(true);
        try {
          const response = await fetchMessagesRemote(target, sender, page, 100);
          const data = await response.json();
          const list = data.list.map((message) => {
            const parsedMessage = CryptoJS.AES.decrypt(
              message,
              selectedChat.key
            ).toString(CryptoJS.enc.Utf8);
            return JSON.parse(parsedMessage);
          });
          if (list) {
            if (oldChat === target)
              setMessages({
                type: "add",
                messages: list,
              });
            else
              setMessages({
                type: "init",
                messages: list,
              });
          }

          setOldChat(target);
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
        setTyping(false);
      }
    },
    [page, oldChat, loading, selectedChat]
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      selectedChat &&
      localStorage.getItem(config.userCookie) !== null &&
      !loading
    )
      fetchMessages(selectedChat.user, localStorage.getItem(config.userCookie));
  }, [selectedChat, location]);

  const onMessageReceived = useCallback(
    (conversation) => {
      console.info("receiving messages");
      const { target, sender } = conversation;
      const senderUser = sender.user;
      if (selectedChat && selectedChat.user === senderUser)
        fetchMessages(target, senderUser, false);
      else setNotificationState({ type: "set-badge", count: 1 });
    },
    [selectedChat, fetchMessages]
  );

  const [typing, setTyping] = useState(false);
  const targetTyping = useCallback(() => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
    }, 5000);
  }, [selectedChat, setTyping]);

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      socket.on("typing", targetTyping);
      return () => {
        socket.off("message", onMessageReceived);
        socket.off("typing", targetTyping);
      };
    }
  }, [socket, selectedChat]);

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

  const goToSettings = useCallback(() => {
    setSettings(true);
    const { pathname } = location;
    if (pathname.indexOf("/settings" !== 0)) navigate("/settings");
    selectChat(undefined);
  }, [navigate, location, selectChat]);

  useEffect(() => {
    const { pathname } = location;
    if (pathname.indexOf("/settings") === 0) {
      setSettings(true);
      selectChat(undefined);
    }
  }, [location]);

  useEffect(() => {
    if (selectedChat) setSettings(false);
  }, [selectedChat]);

  const [showConnectionState, setShowConnectionState] = useState(true);
  const handleShowConnectionState = useCallback(
    (value) => {
      setShowConnectionState(value);
    },
    [setShowConnectionState]
  );

  return (
    <div
      className={`${styles.main} ${css({
        backgroundColor: `${localStorage.getItem("chat-main-bg")}88`,
      })}`}
    >
      <Navbar
        settings={settings}
        goToSettings={goToSettings}
        toggleSidebar={toggleSidebar}
        selectedChat={selectedChat}
      />
      {showOffState ? (
        <ConnectionState
          main
          socket={socket}
          settings={settings}
          stateConnectionState={showConnectionState}
          listenChangeState={handleShowConnectionState}
        />
      ) : null}
      {!settings ? (
        <>
          {selectedChat ? (
            <>
              <Messages
                loading={loading}
                settings={settings}
                messages={messages}
                selectedChat={selectedChat}
                showConnectionState={showConnectionState}
              />
              <Typing typing={typing} />
              <div className={styles.inputContainer}>
                <Input
                  onSend={sendMessage}
                  socket={socket}
                  selectedChat={selectedChat}
                />
              </div>
            </>
          ) : null}
        </>
      ) : (
        <Settings />
      )}
    </div>
  );
}

Main.propTypes = {
  socket: PropTypes.object,
  sidebar: PropTypes.bool,
  toggleSidebar: PropTypes.func,
  selectChat: PropTypes.func,
  selectedChat: PropTypes.shape({
    photo: PropTypes.string,
    user: PropTypes.string,
    name: PropTypes.string,
    bio: PropTypes.string,
    state: PropTypes.string,
    lastMessage: PropTypes.string,
    key: PropTypes.string,
  }),
};

export default Main;
