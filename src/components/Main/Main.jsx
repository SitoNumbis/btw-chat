import {
  memo,
  useRef,
  useCallback,
  useState,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { scrollTo } from "some-javascript-utils/browser";

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

  const messagesList = useRef(null);

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

  const [oldChat, setOldChat] = useState("");

  const fetchMessages = useCallback(
    async (target, sender, loading = true) => {
      if (loading) setLoading(true);
      try {
        const response = await fetchMessagesRemote(
          target,
          sender.user ? sender.user : sender,
          page,
          20
        );
        const data = await response.json();
        const { list } = data;
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
        setTimeout(() => {
          messagesList.current.scrollTo({
            top: messagesList.current.scrollHeight,
            left: 0,
            behavior: "smooth",
          });
        }, 10);
        setOldChat(target);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    },
    [page, oldChat]
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (selectedChat && localStorage.getItem(config.userCookie) !== null)
      fetchMessages(selectedChat.user, localStorage.getItem(config.userCookie));
  }, [selectedChat, location]);

  const onMessageReceived = (conversation) => {
    console.info("receiving messages");
    const { target, sender } = conversation;
    fetchMessages(target, sender, false);
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
        setTimeout(() => {
          messagesList.current.scrollTo({
            top: messagesList.current.scrollHeight,
            left: 0,
            behavior: "smooth",
          });
        }, 10);
        const response = await sendMessageRemote(parsedMessage);
        const data = await response.json();
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    },
    [selectedChat, messagesList]
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
    const { pathname } = location;
    if (pathname.indexOf("/settings" !== 0)) navigate("/settings");
    selectChat(undefined);
  }, [navigate, location, selectChat]);

  useEffect(() => {
    const { pathname } = location;
    if (pathname.indexOf("/settings" === 0)) setSettings(true);
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

  useEffect(() => {
    if (selectedChat && !loading) {
      scrollTo(window.innerHeight);
      setTimeout(() => {
        if (messagesList.current !== null)
          messagesList.current.scrollTo({
            top: messagesList.current.scrollHeight,
            left: 0,
            behavior: "smooth",
          });
      }, 500);
    }
  }, [selectedChat, messagesList, loading]);

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
              <div
                id="messages-list"
                ref={messagesList}
                className={`${styles.messages} ${css({
                  height: showConnectionState
                    ? `calc(${window.innerHeight}px - 170px)`
                    : `calc(${window.innerHeight}px - 130px)`,
                })}`}
              >
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
