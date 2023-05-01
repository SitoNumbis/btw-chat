import { memo, useCallback } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// utils
import { parseSent } from "../../../utils/parseSent";

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

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-start px-4 py-3 w-full gap-3 cursor-pointer ${
        index === 0 ? "-mt-3" : ""
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
        <p className={`text-placeholder-dark italic text-left`}>
          {lastMessage ? lastMessage.substring(0, 34) : bio.substring(0, 34)}
          {lastMessage && lastMessage.length > 34 ? "..." : ""}
          {!lastMessage && bio && bio.length > 34 ? "..." : ""}
        </p>
      </div>
      <div className="flex flex-col"></div>
    </button>
  );
}

ChatPerson.propTypes = {
  photo: PropTypes.string,
  name: PropTypes.string,
  user: PropTypes.string,
  state: PropTypes.string,
  lastMessage: PropTypes.string,
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
