import { useEffect, useState, useMemo } from "react";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { usePopup } from "../../context/MessagesOperations";
import { useLanguage } from "../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";
import Colors from "../../assets/emotion/color";

function Popup() {
  const { mainBG, whiteText } = Colors();

  const { languageState } = useLanguage();

  const { buttons, buttonsArias } = useMemo(() => {
    return {
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const { popupState, setPopupState } = usePopup();
  const [see, setSee] = useState(false);
  const [visible, setVisible] = useState(false);

  const [position, setPosition] = useState("");

  useEffect(() => {
    if (popupState.event) {
      setVisible(true);
      setSee(false);
      setTimeout(() => {
        setSee(true);
        const target = popupState.event.target;
        var rect = target.getBoundingClientRect();
        const messagesList = document.getElementById("messages-list");
        if (messagesList) {
          messagesList.scrollTo({
            top: target.offsetTop - 20,
            left: 0,
            behavior: "smooth",
          });
        }
        console.log(rect, rect.top + target.offsetHeight + 10);
        setPosition(
          css({ left: rect.left, top: rect.top + target.offsetHeight + 10 })
        );
      }, 150);
    } else {
      setSee(false);
      setTimeout(() => {
        setVisible(false);
      }, 150);
    }
  }, [popupState]);

  return visible ? (
    <div
      className={`${styles.popup} ${mainBG()} ${position} ${
        see ? "aGrow" : "aShrink-small"
      }`}
    >
      <button
        className={`${whiteText} flex items-center justify-start gap-2`}
        aria-label={buttonsArias.deleteMessage}
      >
        <FontAwesomeIcon icon={faTrash} />
        {buttons.deleteMessage}
      </button>
      <button
        className={`${whiteText} flex items-center justify-start gap-2`}
        aria-label={buttonsArias.reply}
      >
        <FontAwesomeIcon icon={faComment} />
        {buttons.reply}
      </button>
      <button
        className={`${whiteText} flex items-center justify-start gap-2`}
        aria-label={buttonsArias.forward}
      >
        <FontAwesomeIcon icon={faShare} />
        {buttons.forward}
      </button>
    </div>
  ) : null;
}

export default Popup;
