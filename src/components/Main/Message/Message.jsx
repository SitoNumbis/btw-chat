import { memo, useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faShare, faTrash } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// utils
import { isSelf } from "../../../utils/users";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";
import Colors from "../../../assets/emotion/color";

function Message({ sender, message, onReply, onForward, onDelete }) {
  const { languageState } = useLanguage();

  const { whiteText } = Colors();

  const { buttons, buttonsArias } = useMemo(() => {
    return {
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const user = useCallback(() => {
    if (sender !== null && sender) return isSelf(sender.user);
  }, [sender]);

  const [showOperations, setShowOperations] = useState(false);

  const pEmotion = useMemo(() => {
    return css({
      overflowWrap: "anywhere",
      backgroundColor: user()
        ? `${localStorage.getItem("chat-text-primary")}33`
        : `${localStorage.getItem("chat-other-bg")}99`,
      color: localStorage.getItem("chat-text-basic"),
      ":hover": {
        backgroundColor: user()
          ? `${localStorage.getItem("chat-text-primary")}55`
          : `${localStorage.getItem("chat-secondary-bg")}99`,
      },
    });
  }, [user]);

  const toggleOperations = useCallback(() => {
    setShowOperations(!showOperations);
  }, [showOperations]);

  const gridEmotion = useMemo(() => {
    return css({
      gridTemplateRows: showOperations ? "1fr" : "0fr",
      padding: showOperations ? "5px" : "",
    });
  }, [showOperations]);

  const buttonEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: `${localStorage.getItem("chat-text-primary")}55`,
      },
    });
  }, []);

  return (
    <div>
      <p
        onClick={toggleOperations}
        className={`aGrow main-transition-ease ${styles.message} ${pEmotion}`}
      >
        {message}
      </p>
      <div className={`grid main-transition-ease ${gridEmotion}`}>
        <div className={`flex items-center justify-end gap-3 overflow-hidden`}>
          <button
            onClick={onReply}
            className={`${whiteText} ${buttonEmotion} main-transition-ease flex items-center justify-start gap-2`}
            aria-label={buttonsArias.reply}
          >
            <FontAwesomeIcon icon={faComment} />
            {/* {buttons.reply} */}
          </button>
          <button
            onClick={onForward}
            className={`${whiteText} ${buttonEmotion} flex items-center main-transition-ease justify-start gap-2 -rotate-180`}
            aria-label={buttonsArias.forward}
          >
            <FontAwesomeIcon icon={faShare} />
            {/* {buttons.forward} */}
          </button>
          <button
            onClick={onDelete}
            className={`${whiteText} ${buttonEmotion} flex items-center main-transition-ease justify-start gap-2`}
            aria-label={buttonsArias.deleteMessage}
          >
            <FontAwesomeIcon icon={faTrash} />
            {/* {buttons.deleteMessage} */}
          </button>
        </div>
      </div>
    </div>
  );
}

Message.propTypes = {
  sender: PropTypes.object,
  message: PropTypes.string,
  onReply: PropTypes.func,
  onForward: PropTypes.func,
  onDelete: PropTypes.func,
};

const MessageMemo = memo((props) => <Message {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.sender?.user === newProps.sender?.user &&
    oldProps.message === newProps.message &&
    oldProps.onReply === newProps.onReply &&
    oldProps.onForward === newProps.onForward &&
    oldProps.onDelete === newProps.onDelete
  );
}

MessageMemo.displayName = "Message";

export default MessageMemo;
