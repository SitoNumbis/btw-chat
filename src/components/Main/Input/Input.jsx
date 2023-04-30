import { useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

function Input({ onSend }) {
  const [message, setMessage] = useState("");

  const { languageState } = useLanguage();

  const { input } = useMemo(() => {
    return { input: languageState.texts.main.input };
  }, [languageState]);

  const onSubmit = useCallback(
    (e) => {
      setMessage("");
      onSend(message);
      e.preventDefault();
    },
    [message, onSend]
  );

  return (
    <form
      onSubmit={onSubmit}
      className={`relative w-full h-10 bg-dark-background2 flex items-center justify-between p-3 rounded-sm ${styles.div}`}
    >
      <input
        type="text"
        value={message}
        placeholder={input.placeholder}
        onChange={(e) => setMessage(e.target.value)}
        className={`w-full text-white ${styles.input}`}
      />
      <button
        className={`absolute right-3 text-placeholder-dark hover:text-primary transition font-semibold ${styles.button}`}
        onClick={onSubmit}
      >
        Send
      </button>
    </form>
  );
}

Input.propTypes = {
  onSend: PropTypes,
};

export default Input;
