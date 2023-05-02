import { memo, useMemo, useCallback } from "react";
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

  const printLastMessage = useCallback(() => {
    return (
      <div className="w-full flex items-center justify-between">
        <p>
          {`${
            lastMessage.sender.user === localStorage.getItem(config.userCookie)
              ? aux.you
              : ""
          }${
            lastMessage.message && lastMessage.message.length > 18
              ? `${lastMessage.message.substring(0, 18)}...`
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
      onClick={handleClick}
      className={`flex items-center justify-start px-4 py-3 w-full gap-3 cursor-pointer ${
        index === 0 ? "-mt-0" : ""
      } ${css({
        transition: "all 500ms ease",
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
            className={`font-semibold ${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
            {name.length > 27 ? `${name.substring(0, 27)}...` : name}
          </p>
          {printState()}
        </div>
        <div className={`!text-placeholder-dark !italic !text-left`}>
          {lastMessage ? printLastMessage() : <p>bio.substring(0, 22)</p>}
          {!lastMessage && bio && bio.length > 22 ? "..." : ""}
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
    oldProps.selectChat === newProps.selectChat
  );
}

ChatPersonMemo.displayName = "ChatPerson";

export default ChatPersonMemo;
