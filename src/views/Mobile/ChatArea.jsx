import { useMemo, useCallback, useState, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";

import { useDebounce } from "use-lodash-debounce";

// @emotion/css
import { css } from "@emotion/css";

import PropTypes from "prop-types";
import loadable from "@loadable/component";

// contexts
import { useNotification } from "../../context/NotificationProvider";
import { useCanGoBottom } from "../../context/CanGoBottomProvider";
import { useDialog } from "../../context/DialogProvider";
import { useUser } from "../../context/UserProvider";

// styles
import styles from "./chat.module.css";
import Colors from "../../assets/emotion/color";

// utils
import { logoutUser } from "../../utils/auth";
import {
  encryptMessage,
  parseChats,
  parseMessages,
  parseQueries,
} from "../../utils/parsers";
import { validation } from "../../utils/validation";

// services
import {
  fetchChat as fetchChatRemote,
  sendMessage as sendMessageRemote,
  fetchMessages as fetchMessagesRemote,
  fetchChatLastDate,
  deleteMessage,
  fetchDeletedMessage,
} from "../../services/chat/post";

// sound
import good from "../../assets/sounds/good.mp3";
import sound from "../../assets/sounds/message.mp3";
import error from "../../assets/sounds/error.mp3";

// components
import Loading from "../../components/Loading/Loading";

const Input = loadable(() => import("../../components/Main/Input/Input"));
const Typing = loadable(() => import("../../components/Main/Typing/Typing"));
const Navbar = loadable(() => import("../../components/Main/Navbar/Navbar"));
const ProfileInformationDialog = loadable(() =>
  import("../../components/Dialogs/ProfileInformationDialog")
);
const ConnectionState = loadable(() =>
  import("../../components/ConnectionState/ConnectionState")
);
const Messages = loadable(() =>
  import("../../components/Main/Messages/Messages")
);

function ChatArea({ socket }) {
  const { mainBG } = Colors();

  const { userState, setUserState } = useUser();
  const { dialogState } = useDialog();
  const { canGoBottomState } = useCanGoBottom();
  const { setNotificationState } = useNotification();

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
          deleteMessage(id, selectedChat.user);
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
        const found = state.find((localMessage) => localMessage.id === date);
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

  const [bigLoading, setBigLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useReducer(messagesReducer, []);
  const [page, setPage] = useState(0);

  const [errorE, setError] = useState(false);
  const [selectedChat, setSelectedChat] = useState(undefined);

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
          setLoading(false);
          setBigLoading(false);
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

            localStorage.setItem(`chat-${target}`, JSON.stringify(data.list));
            setMessages({
              type: "add",
              messages: list,
            });
          }
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
        setTimeout(() => {
          setBigLoading(false);
        }, 501);

        setTyping(false);
      }
    },
    [page, loading, selectedChat]
  );

  const location = useLocation();

  const fetchPerson = useCallback(
    async (user) => {
      //! reading from cache
      try {
        if (validation("chats")) {
          const chatsLocal = JSON.parse(localStorage.getItem("chats"));

          const list = parseChats(chatsLocal);
          const found = list.find((localChat) => localChat.user === user);
          if (found) {
            setSelectedChat(found);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
      try {
        const response = await fetchChatRemote(user, true);
        if (response.status !== 200 && response.status !== 204) {
          if (response.status === 401) {
            logoutUser();
            setUserState({ type: "logout" });
          }
          console.error(response.statusText);
          setError(true);
        }

        const { data } = response;
        const list = parseChats(data.list);
        setSelectedChat(list[0]);
        setLoading(false);
        setBigLoading(false);
      } catch (err) {
        console.error(err);
        const { response } = err;
        if (response && response.status === 401) {
          logoutUser();
          setUserState({ type: "logout" });
        }
        setError(true);
        setLoading(false);
      }
    },
    [setUserState]
  );

  useEffect(() => {
    setBigLoading(true);
    const { search } = location;
    const params = parseQueries(search);
    if (params.user) fetchPerson(params.user);
  }, [location]);

  useEffect(() => {
    if (selectedChat && selectedChat.user && userState.user && !loading)
      fetchMessages(selectedChat.user, userState.user);
  }, [selectedChat, userState]);

  const onMessageReceived = useCallback(
    (conversation) => {
      console.info("receiving messages");
      const { target, sender } = conversation;
      const senderUser = sender.user;
      if (selectedChat && selectedChat.user === senderUser) {
        fetchMessages(target, senderUser, false);

        if (canGoBottomState)
          setNotificationState({ type: "set-badge", count: 1 });
      } else if (sender.user !== userState.user)
        setNotificationState({ type: "set-badge", count: 1 });
    },
    [
      selectedChat,
      fetchMessages,
      setNotificationState,
      canGoBottomState,
      userState,
    ]
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
    [setTyping, typingV, setTypingV, selectedChat]
  );

  const targetDeletedMessage = useCallback(
    async (target) => {
      if (selectedChat && selectedChat.user === target)
        try {
          const response = await fetchDeletedMessage(selectedChat.user);
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
        socket.off("delete-message", targetDeletedMessage);
      };
    }
  }, [socket, targetTyping, onMessageReceived, targetDeletedMessage]);

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
            user: userState.user,
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
            { user: userState.user },
            encryptMessage(parsedMessage, selectedChat.key),
            date
          );
          data = response.data;
        } else {
          setMessages({
            type: "re-sent",
            message: { ...parsedMessage, loading: true },
          });
          const response = await sendMessageRemote(
            selectedChat.user,
            { user: userState.user },
            encryptMessage(parsedMessage, selectedChat.key),
            parsedMessage.id
          );
          data = response.data;
        }

        localStorage.setItem("date", data.date);
        playGood();
        setMessages({
          type: "set-as-sent",
          date: parsedMessage.id,
          theDate: data.date,
        });
      } catch (err) {
        console.error(err);
        playError();
        setMessages({
          type: "set-as-error",
          date: parsedMessage.id,
        });
      }
    },
    [selectedChat, playError, userState]
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

  const onRetry = useCallback(
    (date) => {
      const find = messages.find((localMessage) => localMessage.date === date);
      if (find) sendMessage(find, true);
    },
    [messages, sendMessage]
  );

  const mainEmotion = useMemo(() => {
    return css({
      background: localStorage.getItem("chat-secondary-bg"),
      height: `${window.innerHeight}px`,
    });
  }, []);

  return (
    <div className={`${styles.main} ${mainEmotion}`}>
      <>
        {bigLoading ? (
          <Loading
            noEntrance
            className={`fixed w-full h-screen flex items-center justify-center z-50 ${mainBG()}`}
          />
        ) : null}
        <Navbar socket={socket} selectedChat={selectedChat} />
        <ConnectionState isInNavbar main socket={socket} settings={false} />
        {dialogState.editing !== undefined ? (
          <ProfileInformationDialog editing={dialogState.editing} />
        ) : null}
        {selectedChat ? (
          <>
            <Messages
              loading={loading}
              settings={false}
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
                noSidebarSearching={true}
              />
            </div>
          </>
        ) : null}
      </>
    </div>
  );
}

ChatArea.propTypes = {
  socket: PropTypes.object,
};

export default ChatArea;
