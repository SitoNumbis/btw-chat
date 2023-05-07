import { memo, useMemo, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// utils
import { parseSentAsDate } from "../../../utils/parseSent";

// config
import config from "../../../config";
import { useState } from "react";

function ChatPerson(props) {
  const {
    photo,
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

  const printState = useCallback(() => {
    switch (state) {
      case "disconnected":
        return <span className="w-3 h-3 rounded-full bg-l-error"></span>;
      default:
        return <span className="w-3 h-3 rounded-full bg-success"></span>;
    }
  }, [state]);

  const handleClick = useCallback(() => {
    selectChat(user, searching);
  }, [user, selectChat, searching]);

  const { languageState } = useLanguage();

  const { aux, messageT } = useMemo(() => {
    return {
      aux: languageState.texts.aux,
      messageT: languageState.texts.main.message,
    };
  }, [languageState]);

  const printDate = useCallback(
    (date) => {
      if (date) return parseSentAsDate(date, messageT);
    },
    [messageT]
  );

  const [updateLastMessage, setUpdateLastMessage] = useState(false);

  useEffect(() => {
    console.log("cambio");
    setUpdateLastMessage(true);
    setTimeout(() => {
      setUpdateLastMessage(false);
    }, 100);
  }, [lastMessage]);

  const printLastMessage = useCallback(() => {
    return (
      <div className="w-full flex items-center justify-between">
        <p className="appear">
          {`${
            lastMessage.sender.user === localStorage.getItem(config.userCookie)
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

  return (
    <button
      type="button"
      disabled={active}
      onClick={handleClick}
      className={`flex items-center justify-start px-4 py-3 w-full gap-3 ${
        index === 0 ? "-mt-0" : ""
      } ${css({
        transition: "all 500ms ease",
        cursor: "pointer",
        ":disabled": {
          cursor: "initial !important",
          background: `${localStorage.getItem("chat-main-bg")}88`,
        },
        ":hover": {
          background: `${localStorage.getItem("chat-main-bg")}88`,
        },
      })}`}
    >
      <img
        className="w-10 h-10 rounded-full cursor-pointer"
        src={photo ? photo : noPhoto}
        alt={user ? user : ""}
      />
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full">
          <p
            className={`${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
            {name && name.length > 27 ? `${name.substring(0, 27)}...` : name}
          </p>
          {printState()}
        </div>
        <div
          className={`!text-placeholder-dark !italic !text-left ${css({
            height: "24px",
          })}`}
        >
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
      </div>
    </button>
  );
}

ChatPerson.propTypes = {
  photo: PropTypes.string,
  name: PropTypes.string,
  user: PropTypes.string,
  state: PropTypes.string,
  lastMessage: PropTypes.object,
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
    oldProps.photo === newProps.photo &&
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
