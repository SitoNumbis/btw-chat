import { useCallback, useState, useMemo, useEffect } from "react";
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

function Input({ socket, onSend, selectedChat }) {
  const { mainBG, whiteText } = Colors();

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
      e.preventDefault();
      if (message.length) {
        setMessage("");
        onSend(message);
      }
    },
    [message, onSend]
  );

  const [history, setHistory] = useState([]);

  const onKeyDown = useCallback(() => {}, [history]);
  const onKeyUp = useCallback(() => {}, [history]);

  const [typing, setTyping] = useState(false);

  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    // Set up the timer when the component mounts
    const id = setTimeout(() => {
      console.log("turned off");
      setTyping(false);
    }, 5000);
    setTimerId(id);
    console.log(id);

    // Clear the timer when the component unmounts
    return () => {
      console.log("cleaned");
      clearTimeout(timerId);
      setTyping(false);
    };
  }, [typing]);

  // Cancel the timer when the component updates
  useEffect(() => {
    if (timerId) {
      clearTimeout(timerId);
      setTyping(false);
    }
  }, [timerId]);

  const handleText = useCallback(
    (e) => {
      setMessage(e.target.value);
      console.log(typing);
      if (socket && !typing) {
        setTyping(true);
        socket.emit("typing", {
          user: localStorage.getItem(config.userCookie),
          target: selectedChat.user,
        });
      }
    },
    [socket, typing, selectedChat]
  );

  const inputEmotion = useMemo(() => {
    return css({
      paddingRight: `${buttons.send.length * 10}px`,
    });
  }, [buttons]);

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
      className={`${mainBG()} main-transition-ease ${styles.div}`}
    >
      <input
        type="text"
        value={message}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={input.placeholder}
        onChange={handleText}
        className={`w-full ${whiteText} ${styles.input} ${inputEmotion}`}
      />
      <button
        className={`absolute right-3 text-placeholder-dark transition font-semibold ${styles.button} ${buttonEmotion}`}
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
};

export default Input;
