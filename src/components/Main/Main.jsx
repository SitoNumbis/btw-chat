import { useCallback, useState, useEffect, useReducer } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useDebounce } from "use-lodash-debounce";

import useScreenSize from "use-screen-witdh";

import PropTypes from "prop-types";
import loadable from "@loadable/component";

// utils
import { validation } from "../../utils/validation";
import {
  encryptMessage,
  parseMessages,
  encryptMessages,
} from "../../utils/parsers";

// contexts
import { useMessagesOperations } from "../../context/MessagesOperations";
import { useNotification } from "../../context/NotificationProvider";
import { useCanGoBottom } from "../../context/CanGoBottomProvider";

// styles
import styles from "./styles.module.css";
import Colors from "../../assets/emotion/color";

import config from "../../config";

// services
import {
  fetchChatLastDate,
  sendMessage as sendMessageRemote,
  fetchMessages as fetchMessagesRemote,
  deleteMessage,
  fetchDeletedMessage,
} from "../../services/chat/post";

// sound
import good from "../../assets/sounds/good.mp3";
import sound from "../../assets/sounds/message.mp3";
import error from "../../assets/sounds/error.mp3";
import received from "../../assets/sounds/received.mp3";

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

  const { messagesOperationsState } = useMessagesOperations();

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
      case "prepare-delete": {
        const { id } = action;
        const found = state.find((message) => message.id === id);
        if (found) found.deleted = true;
        return [...state];
      }
      case "delete": {
        const { id } = action;
        const foundIndex = state.findIndex((message) => message.id === id);
        if (foundIndex >= 0) {
          state.splice(foundIndex, 1);
          deleteMessage(id);
        }
        return [...state];
      }
      case "delete-multiple": {
        const { messages } = action;
        const newMessages = [];
        state.forEach((message) => {
          const found = messages.find(
            (remoteMessage) => remoteMessage === message.id
          );
          if (!found) newMessages.push(messages);
        });
        return newMessages;
      }
      case "add": {
        const { messages } = action;
        const toReturn = [...state];
        messages.forEach((message) => {
          const found = toReturn.find((localMessage) => {
            return localMessage.id === message.id;
          });
          if (!found) toReturn.push(message);
        });

        return toReturn;
      }
      case "add-new": {
        const { message } = action;
        const toReturn = [...state];
        const found = toReturn.find((localMessage) => {
          return localMessage.id === message.id;
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
          (localMessage) => localMessage.id === message.id
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
        const found = state.find((item) => item.id === date);
        if (found) {
          found.date = theDate;
          delete found.loading;
          delete found.error;
        }
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
      //! reading from cache
      try {
        if (validation("last-date") && validation(`chat-${target}`)) {
          //* should read from cache
          const localConversation = JSON.parse(
            localStorage.getItem(`chat-${target}`)
          );
          const list = parseMessages(localConversation, selectedChat.key);
          setMessages({
            type: "init",
            messages: list.map((message) => ({ ...message, cached: true })),
          });

          const response = await fetchChatLastDate(
            target,
            sender,
            Number(localStorage.getItem("last-date"))
          );
          const { data } = response;
          if (!data.result) {
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
      if (!loading) {
        if (loadingL) setLoading(true);
        try {
          const response = await fetchMessagesRemote(target, sender, page, 100);
          const { data } = response;
          localStorage.setItem("date", data.date);
          if (data.list) {
            const list = parseMessages(data.list, selectedChat.key);

            if (list) {
              if (oldChat === target) {
                setMessages({
                  type: "add",
                  messages: list,
                });
                playReceived();
              } else
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
    if (selectedChat && validation(config.userCookie) && !loading)
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
      } else if (sender.user !== localStorage.getItem(config.userCookie))
        setNotificationState({ type: "set-badge", count: 1 });
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

  const targetDeletedMessage = useCallback(
    async (target) => {
      if (selectedChat && selectedChat.user === target)
        try {
          const response = await fetchDeletedMessage(target);
          const { list } = response.data;
          setMessages({ type: "delete-multiple", messages: list });
        } catch (err) {
          console.error(err);
        }
    },
    [selectedChat]
  );

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      socket.on("typing", targetTyping);
      socket.on("delete-message", targetDeletedMessage);
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

  const playReceived = () => {
    const audio = new Audio(received);
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
            encryptMessage(parsedMessage, selectedChat.key)
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
            encryptMessage(parsedMessage, selectedChat.key)
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

  const onReplyMessage = useCallback(() => {
    console.log(messagesOperationsState);
  }, [messagesOperationsState]);

  const onForwardMessage = useCallback(() => {
    console.log(messagesOperationsState);
  }, [messagesOperationsState]);

  const onDeleteMessage = useCallback(() => {
    setMessages({ type: "prepare-delete", id: messagesOperationsState.id });
    setTimeout(() => {
      setMessages({ type: "delete", id: messagesOperationsState.id });
    }, 450);
  }, [messagesOperationsState]);

  useEffect(() => {
    switch (messagesOperationsState.event) {
      case "forward":
        onForwardMessage();
        break;
      case "reply":
        onReplyMessage();
        break;
      default: // delete
        onDeleteMessage();
        break;
    }
  }, [messagesOperationsState]);

  const saveChatToCache = useCallback(() => {
    if (selectedChat)
      localStorage.setItem(
        `chat-${selectedChat.user}`,
        JSON.stringify(encryptMessages(messages, selectedChat.key))
      );
  }, [messages, selectedChat]);

  useEffect(() => {
    saveChatToCache();
  }, [messages]);

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
