import {
  memo,
  useCallback,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from "react";

import useScreenSize from "use-screen-witdh";

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
import Loading from "../../components/Loading/Loading";
const Input = loadable(() => import("./Input/Input"));
const Message = loadable(() => import("./Message/Message"));
const Navbar = loadable(() => import("./Navbar/Navbar"));
const Settings = loadable(() => import("./Settings/Settings"));
const ConnectionState = loadable(() =>
  import("../ConnectionState/ConnectionState")
);

function Main({ socket, selectedChat, selectChat, toggleSidebar }) {
  const [showOffState, setShowOffState] = useState(false);

  const { width } = useScreenSize();

  useEffect(() => {
    if (width < 850) setShowOffState(true);
    else setShowOffState(false);
  }, [width]);

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

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useReducer(messagesReducer, []);
  const [page, setPage] = useState(0);

  const fetchMessages = useCallback(
    async (target, sender) => {
      setLoading(true);
      try {
        const response = await fetchMessagesRemote(target, sender, page, 20);
        const data = await response.json();
        const { list } = data;
        console.log(list);
        if (list)
          setMessages({
            type: "add",
            messages: list,
          });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    },
    [page]
  );

  useEffect(() => {
    if (selectedChat && localStorage.getItem(config.userCookie) !== null)
      fetchMessages(selectedChat.user, localStorage.getItem(config.userCookie));
  }, [selectedChat]);

  const onMessageReceived = (conversation) => {
    console.info("receiving messages");
    const { target, sender } = conversation;
    fetchMessages(target, sender);
  };

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      return () => {
        socket.off("message", onMessageReceived);
      };
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

  const [settings, setSettings] = useState(true);

  const goToSettings = useCallback(() => {
    setSettings(true);
    selectChat(undefined);
  }, [setSettings]);

  useEffect(() => {
    if (selectedChat) setSettings(false);
  }, [selectedChat]);

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
      {showOffState ? <ConnectionState main socket={socket} /> : null}
      {!settings ? (
        <>
          {selectedChat ? (
            <>
              <div className={styles.messages}>
                <p className="text-placeholder-dark italic mx-auto">
                  {selectedChat?.bio}
                </p>
                {loading ? (
                  <Loading />
                ) : (
                  <>
                    {messages.map((message, i) => {
                      if (i === 0 && messages.length === 0)
                        return <Message key={message.date} {...message} />;
                      else {
                        if (i < messages.length - 1)
                          return (
                            <Message
                              key={message.date}
                              {...message}
                              join={
                                message.sender.user ===
                                messages[i + 1].sender.user
                              }
                            />
                          );
                        else return <Message key={message.date} {...message} />;
                      }
                    })}
                  </>
                )}
              </div>
              <div className={styles.inputContainer}>
                <Input onSend={sendMessage} />
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
  }),
};

export default Main;
