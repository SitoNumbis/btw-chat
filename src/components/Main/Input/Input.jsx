import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useDebounce } from "use-lodash-debounce";

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

  const gainFocus = useCallback(() => {
    if (inputRef.current !== null && noSidebarSearching)
      inputRef.current.focus();
  }, [inputRef, noSidebarSearching]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (message.length && inputRef.current !== null) {
        inputRef.current.textContent = "";
        setMessage("");
        onSend(message);
      }
      gainFocus();
    },
    [message, onSend, gainFocus, inputRef]
  );

  const onKeyDown = useCallback(
    (e) => {
      const { shiftKey, keyCode } = e;
      if (!shiftKey && keyCode === 13) onSubmit(e);
    },
    [onSubmit]
  );

  const onKeyUp = useCallback(() => {}, [history]);

  useEffect(() => {
    window.addEventListener("keydown", gainFocus);
    return () => {
      window.removeEventListener("keydown", gainFocus);
    };
  }, [gainFocus]);

  const [typing, setTyping] = useState(false);
  const debouncedValue = useDebounce(message, 1000);

  useEffect(() => {
    setTyping(false);
  }, [debouncedValue]);

  const handleText = useCallback(
    (e) => {
      setMessage(e.target.textContent);
      if (socket && !typing) {
        setTyping(true);
        socket.emit("typing", {
          user: localStorage.getItem(config.userCookie),
          target: selectedChat.user,
        });
      }
    },
    [socket, selectedChat, typing]
  );

  const buttonEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-basic"),
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
        value={message}
        type="text"
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={input.placeholder}
        onInput={handleText}
        className={`${whiteText} ${styles.input}`}
      />

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
