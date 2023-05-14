import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";
import Colors from "../../../assets/emotion/color";

// config
import config from "../../../config";

function Input({ socket, onSend, selectedChat, noSidebarSearching }) {
  const { otherBG, whiteText } = Colors();

  const [message, setMessage] = useState("");

  const { languageState } = useLanguage();

  const { input, buttons, buttonsArias } = useMemo(() => {
    return {
      input: languageState.texts.main.input,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const [history, setHistory] = useState([]);

  const inputRef = useRef();

  const onKeyDown = useCallback(() => {}, [history]);
  const onKeyUp = useCallback(() => {}, [history]);

  const gainFocus = useCallback(() => {
    if (inputRef.current !== null && noSidebarSearching)
      inputRef.current.focus();
  }, [inputRef, noSidebarSearching]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (message.length) {
        setMessage("");
        onSend(message);
      }
      gainFocus();
    },
    [message, onSend, gainFocus]
  );
  useEffect(() => {
    window.addEventListener("keydown", gainFocus);
    return () => {
      window.removeEventListener("keydown", gainFocus);
    };
  }, [gainFocus]);

  const handleText = useCallback(
    (e) => {
      setMessage(e.target.value);
      if (socket) {
        socket.emit("typing", {
          user: localStorage.getItem(config.userCookie),
          target: selectedChat.user,
        });
      }
    },
    [socket, selectedChat]
  );

  const buttonEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  return (
    <form
      onSubmit={onSubmit}
      className={`${otherBG()} main-transition-ease ${styles.div}`}
    >
      <p
        contentEditable
        ref={inputRef}
        type="text"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={input.placeholder}
        onChange={handleText}
        className={`${whiteText} ${styles.input}`}
      >
        {message}
      </p>
      <button
        className={`${styles.button} ${buttonEmotion}`}
        onClick={onSubmit}
        aria-label={buttonsArias.send}
      >
        {buttons.send}
      </button>
    </form>
  );
}

Input.propTypes = {
  socket: PropTypes.object,
  onSend: PropTypes.func,
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

export default Input;
