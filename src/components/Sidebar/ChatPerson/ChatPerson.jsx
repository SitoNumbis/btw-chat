import { memo, useMemo, useState, useCallback, useEffect } from "react";
import loadable from "@loadable/component";
import PropTypes from "prop-types";
import { useDebounce } from "use-lodash-debounce";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// utils
import { parseSent } from "../../../utils/parseSent";
import { validation } from "../../../utils/validation";

// styles
import Colors from "../../../assets/emotion/color";

// config
import config from "../../../config";

// components
const Typing = loadable(() => import("../../Main/Typing/Typing"));

function ChatPerson(props) {
  const {
    socket,
    user,
    name,
    state,
    lastMessage,
    bio,
    index,
    selectChat,
    searching,
    active,
  } = props;

  const { whiteText } = Colors();

  const [localState, setLocalState] = useState("disconnected");

  useEffect(() => {
    setLocalState(state);
  }, [state]);

  const printState = useCallback(() => {
    switch (localState) {
      case "disconnected":
        return <span className="w-3 h-3 rounded-full bg-l-error"></span>;
      default:
        return <span className="w-3 h-3 rounded-full bg-success"></span>;
    }
  }, [localState]);

  const handleClick = useCallback(() => {
    if (selectChat) selectChat(user, searching);
  }, [user, selectChat, searching]);

  const { languageState } = useLanguage();

  const { aux } = useMemo(() => {
    return {
      aux: languageState.texts.aux,
    };
  }, [languageState]);

  const printDate = useCallback((date) => {
    if (date) return parseSent(date);
  }, []);

  const [updateLastMessage, setUpdateLastMessage] = useState(false);

  useEffect(() => {
    setUpdateLastMessage(true);
    setTimeout(() => {
      setUpdateLastMessage(false);
    }, 100);
  }, [lastMessage]);

  const printLastMessage = useCallback(() => {
    return (
      <div className="w-full flex items-center justify-between">
        <p className="appear-small">
          {`${
            lastMessage.sender?.user === localStorage.getItem(config.userCookie)
              ? aux.you
              : ""
          }${
            lastMessage.message && lastMessage.message.length > 16
              ? `${lastMessage.message.substring(0, 16)}...`
              : lastMessage.message
          }`}
        </p>
        <p>{printDate(lastMessage?.date)}</p>
      </div>
    );
  }, [lastMessage, aux, printDate]);

  const buttonEmotion = useMemo(() => {
    return css({
      ":disabled": {
        cursor: "initial !important",
        background: `${localStorage.getItem("chat-main-bg")}88`,
      },
      ":hover": {
        background: `${localStorage.getItem("chat-main-bg")}88`,
      },
    });
  }, []);

  const [typing, setTyping] = useState(false);
  const [typingV, setTypingV] = useState("");

  const debouncedValue = useDebounce(typingV, 5000);
  useEffect(() => {
    setTyping(false);
    setTypingV("");
  }, [debouncedValue]);

  const targetTyping = useCallback(
    (userR) => {
      if (userR.user === user) {
        setTypingV(typingV + "B");
        setTyping(true);
      }
    },
    [user, setTyping, typingV, setTypingV]
  );

  const personUpdateState = useCallback(
    (options) => {
      const { to } = options;
      if (options.user === user) setLocalState(to);
    },
    [setLocalState, user]
  );

  useEffect(() => {
    if (socket) {
      socket.on("typing", targetTyping);
      socket.on("user-update-state", personUpdateState);
      return () => {
        socket.off("typing", targetTyping);
        socket.off("user-update-state", personUpdateState);
      };
    }
  }, [socket, personUpdateState, targetTyping]);

  const getPhoto = useMemo(() => {
    if (user === localStorage.getItem(config.userCookie))
      return validation(config.userPhotoCookie)
        ? localStorage.getItem(config.userPhotoCookie)
        : noPhoto;
    else
      return validation(`${user}photo`)
        ? localStorage.getItem(`${user}photo`)
        : noPhoto;
  }, [user]);

  return (
    <button
      type="button"
      disabled={active ? true : false}
      onClick={handleClick}
      className={`flex items-center justify-start px-4 py-3 w-full gap-3 main-transition-ease cursor-pointer ${
        index === 0 ? "-mt-0" : ""
      } ${buttonEmotion}`}
    >
      <img
        className="w-10 h-10 rounded-full cursor-pointer"
        src={getPhoto}
        alt={user ? user : ""}
      />
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full">
          <p className={`${whiteText}`}>
            {name && name.length > 27 ? `${name.substring(0, 27)}...` : name}
          </p>
          {printState()}
        </div>

        {!typing ? (
          <div className={`!text-placeholder-dark !italic !text-left h-6`}>
            {!updateLastMessage ? (
              <>
                {lastMessage ? (
                  printLastMessage()
                ) : (
                  <p>
                    {bio?.substring(0, 18)}
                    {!lastMessage && bio && bio.length > 18 ? "..." : ""}
                  </p>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <Typing typing={typing} />
        )}
      </div>
    </button>
  );
}

ChatPerson.propTypes = {
  socket: PropTypes.object,
  name: PropTypes.string,
  user: PropTypes.string,
  state: PropTypes.string,
  lastMessage: PropTypes.any,
  bio: PropTypes.string,
  index: PropTypes.number,
  selectChat: PropTypes.func,
  searching: PropTypes.bool,
  active: PropTypes.bool,
};

const ChatPersonMemo = memo(
  (props) => <ChatPerson {...props} />,
  arePropsEqual
);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.socket === newProps.socket &&
    oldProps.user === newProps.user &&
    oldProps.name === newProps.name &&
    oldProps.state === newProps.state &&
    oldProps.lastMessage === newProps.lastMessage &&
    oldProps.bio === newProps.bio &&
    oldProps.index === newProps.index &&
    oldProps.selectChat === newProps.selectChat &&
    oldProps.active === newProps.active
  );
}

ChatPersonMemo.displayName = "ChatPerson";

export default ChatPersonMemo;
