import { useCallback, useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

// config
import config from "../../../config";

function Input({ socket, onSend, selectedChat }) {
  const [message, setMessage] = useState("");

  const { languageState } = useLanguage();

  const { input, buttons, buttonsArias } = useMemo(() => {
    return {
      input: languageState.texts.main.input,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const onSubmit = useCallback(
    (e) => {
      setMessage("");
      onSend(message);
      e.preventDefault();
    },
    [message, onSend]
  );

  const [history, setHistory] = useState([]);

  const onKeyDown = useCallback(() => {}, [history]);
  const onKeyUp = useCallback(() => {}, [history]);

  const handleText = useCallback(
    (e) => {
      setMessage(e.target.value);
      if (socket)
        socket.emit("typing", {
          user: localStorage.getItem(config.userCookie),
          target: selectedChat.user,
        });
    },
    [socket]
  );

  return (
    <form
      onSubmit={onSubmit}
      className={`relative w-full h-10 ${css({
        background: localStorage.getItem("chat-main-bg"),
      })} flex items-center justify-between p-3 rounded-sm ${styles.div}`}
    >
      <input
        type="text"
        value={message}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={input.placeholder}
        onChange={handleText}
        className={`w-full text-white ${styles.input} ${css({
          paddingRight: `${buttons.send.length * 10}px`,
        })}`}
      />
      <button
        className={`absolute right-3 text-placeholder-dark transition font-semibold ${
          styles.button
        } ${css({
          ":hover": {
            color: localStorage.getItem("chat-text-primary"),
          },
        })}`}
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
    lastMessage: PropTypes.string,
    key: PropTypes.string,
  }),
};

export default Input;
