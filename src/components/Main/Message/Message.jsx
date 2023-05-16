import { memo, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// utils
import { isSelf } from "../../../utils/users";

// styles
import styles from "./styles.module.css";

function Message({ sender, message }) {
  const user = useCallback(() => {
    if (sender !== null && sender) return isSelf(sender.user);
  }, [sender]);

  const pEmotion = useMemo(() => {
    return css({
      overflowWrap: "anywhere",
      backgroundColor: user()
        ? `${localStorage.getItem("chat-text-primary")}33`
        : `${localStorage.getItem("chat-other-bg")}99`,
      color: localStorage.getItem("chat-text-basic"),
    });
  }, [user]);

  return <p className={`aGrow ${styles.message} ${pEmotion}`}>{message}</p>;
}

Message.propTypes = {
  sender: PropTypes.object,
  message: PropTypes.string,
};

const MessageMemo = memo((props) => <Message {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.sender?.user === newProps.sender?.user &&
    oldProps.message === newProps.message
  );
}

MessageMemo.displayName = "Message";

export default MessageMemo;
