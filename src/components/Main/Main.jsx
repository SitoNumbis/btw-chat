import { useCallback, useState, useEffect, useReducer } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useDebounce } from "use-lodash-debounce";

import useScreenSize from "use-screen-witdh";

// @emotion/css

import PropTypes from "prop-types";
import loadable from "@loadable/component";

// contexts
import { useNotification } from "../../context/NotificationProvider";
import { useCanGoBottom } from "../../context/CanGoBottomProvider";

// styles
import styles from "./styles.module.css";
import Colors from "../../assets/emotion/color";

import config from "../../config";

// services
import {
  sendMessage as sendMessageRemote,
  fetchMessages as fetchMessagesRemote,
} from "../../services/chat/post";

// sound
import good from "../../assets/sounds/good.mp3";
import sound from "../../assets/sounds/message.mp3";
import error from "../../assets/sounds/error.mp3";

// components
const Input = loadable(() => import("./Input/Input"));
const Typing = loadable(() => import("./Typing/Typing"));
const Navbar = loadable(() => import("./Navbar/Navbar"));
const Settings = loadable(() => import("./Settings/Settings"));
const ConnectionState = loadable(() =>
  import("../ConnectionState/ConnectionState")
);
const Messages = loadable(() => import("./Messages/Messages"));

function Main({
  socket,
  selectedChat,
  selectChat,
  toggleSidebar,
  noSidebarSearching,
}) {
  const { mainBG } = Colors();

  const { canGoBottomState } = useCanGoBottom();
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
          const found = toReturn.find((localMessage) => {
            return localMessage.date === message.date;
          });
          if (!found) toReturn.push(message);
        });

        return toReturn;
      }
      case "add-new": {
        const { message } = action;
        const toReturn = [...state];
        const found = toReturn.find((localMessage) => {
          return localMessage.date === message.date;
        });
        if (!found) toReturn.push(message);
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
      case "re-sent": {
        const { message } = action;
        delete message.error;
        const toReturn = [...state];
        const findIndex = toReturn.findIndex(
          (localMessage) => localMessage.date === message.date
        );
        if (findIndex >= 0) toReturn.splice(findIndex, 1);
        toReturn.push(message);
        return toReturn;
      }
      case "set-as-error": {
        const { date } = action;
        const found = state.find((localMessage) => localMessage.date === date);
        if (found) {
          found.error = true;
          delete found.loading;
        }
        return [...state];
      }
      case "set-as-sent": {
        const { date, theDate } = action;
        const newState = [...state];
        const found = state.find((item) => item.date === date);
        found.date = theDate;
        delete found.loading;
        delete found.error;
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
          const { data } = response;
          localStorage.setItem("date", data.date);
          if (data.list) {
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
          }
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
      if (selectedChat && selectedChat.user === senderUser) {
        fetchMessages(target, senderUser, false);

        if (canGoBottomState)
          setNotificationState({ type: "set-badge", count: 1 });
      } else setNotificationState({ type: "set-badge", count: 1 });
    },
    [selectedChat, fetchMessages, setNotificationState, canGoBottomState]
  );

  const [typing, setTyping] = useState(false);
  const [typingV, setTypingV] = useState("");

  const debouncedValue = useDebounce(typingV, 5000);

  useEffect(() => {
    setTyping(false);
    setTypingV("");
  }, [debouncedValue]);

  const targetTyping = useCallback(
    (user) => {
      if (selectedChat && user.user === selectedChat.user) {
        setTypingV(typingV + "a");
        setTyping(true);
      }
    },
    [selectedChat, setTyping, typingV, setTypingV]
  );

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      socket.on("typing", targetTyping);
      return () => {
        socket.off("message", onMessageReceived);
        socket.off("typing", targetTyping);
      };
    }
  }, [socket, targetTyping, onMessageReceived]);

  const play = () => {
    const audio = new Audio(sound);
    audio.volume = 0.1;
    audio.play();
  };

  const playGood = () => {
    const audio = new Audio(good);
    audio.volume = 0.1;
    audio.play();
  };

  const playError = () => {
    const audio = new Audio(error);
    audio.volume = 0.2;
    audio.play();
  };

  const sendMessage = useCallback(
    async (message, resent = false) => {
      const date = new Date().getTime();
      let parsedMessage = undefined;
      if (typeof message === "string")
        parsedMessage = {
          id: date,
          message,
          date,
          target: selectedChat?.user,
          sender: {
            user: localStorage.getItem(config.userCookie),
          },
        };
      else parsedMessage = message;
      try {
        let data = undefined;
        play();
        if (!resent) {
          setMessages({
            type: "add-new",
            message: { ...parsedMessage, loading: true },
          });

          const response = await sendMessageRemote(
            selectedChat.user,
            { user: localStorage.getItem(config.userCookie) },
            CryptoJS.AES.encrypt(
              JSON.stringify(parsedMessage),
              selectedChat.key
            ).toString()
          );
          data = response.data;
        } else {
          setMessages({
            type: "re-sent",
            message: { ...message, loading: true },
          });
          const response = await sendMessageRemote(
            selectedChat.user,
            { user: localStorage.getItem(config.userCookie) },
            CryptoJS.AES.encrypt(
              JSON.stringify(parsedMessage),
              selectedChat.key
            ).toString()
          );
          data = response.data;
        }

        localStorage.setItem("date", data.date);
        playGood();
        setMessages({
          type: "set-as-sent",
          date,
          theDate: data.date,
        });
      } catch (err) {
        console.error(err);
        playError();
        setMessages({
          type: "set-as-error",
          date: parsedMessage.date,
        });
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

  const onRetry = useCallback(
    (date) => {
      const find = messages.find((localMessage) => localMessage.date === date);
      if (find) sendMessage(find, true);
    },
    [messages, sendMessage]
  );

  return (
    <div className={`${styles.main} ${mainBG(88)}`}>
      <Navbar
        socket={socket}
        settings={settings}
        goToSettings={goToSettings}
        toggleSidebar={toggleSidebar}
        selectedChat={selectedChat}
      />
      {showOffState ? (
        <ConnectionState isInNavbar main socket={socket} settings={settings} />
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
                onRetry={onRetry}
              />
              <div className={styles.inputContainer}>
                <Typing typing={typing} main />
                <Input
                  onSend={sendMessage}
                  socket={socket}
                  selectedChat={selectedChat}
                  noSidebarSearching={noSidebarSearching}
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
    lastMessage: PropTypes.any,
    key: PropTypes.string,
  }),
  noSidebarSearching: PropTypes.bool,
};

export default Main;
