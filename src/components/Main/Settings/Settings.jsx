import { useCallback, useMemo } from "react";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useDialog } from "../../../context/DialogProvider";
import { useLanguage } from "../../../context/LanguageProvider";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// styles
import Colors from "../../../assets/emotion/color";

// config
import config from "../../../config";

function Settings() {
  const { whiteText, mainBG } = Colors();

  const { setDialogState } = useDialog();

  const { languageState } = useLanguage();

  const { buttons, buttonsArias } = useMemo(() => {
    return {
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const handleEditing = useCallback(() => {
    setDialogState({ type: "set-value", key: "editing", value: 1 });
  }, [setDialogState]);

  const imageEmotion = useMemo(() => {
    return css({
      width: "130px",
      height: "130px",
    });
  }, []);

  const cameraEmotion = useMemo(() => {
    return css({
      color: localStorage.getItem("chat-text-primary"),
      background: localStorage.getItem("chat-text-basic"),
      ":hover": {
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const editEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const printState = useMemo(() => {
    switch (localStorage.getItem(config.userStateCookie)) {
      case "disconnected":
        return (
          <div className={`flex items-center gap-2 ${whiteText}`}>
            {languageState.texts.states.disconnected}
            <div className="w-3 h-3 rounded-full bg-l-error"></div>
          </div>
        );
      default:
        return (
          <div className={`flex items-center gap-2 ${whiteText}`}>
            {languageState.texts.states.connected}
            <div className="w-3 h-3 rounded-full bg-success"></div>
          </div>
        );
    }
  }, [languageState]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="appear w-full flex flex-col items-center justify-center gap-2">
        <div className={`relative ${imageEmotion} rounded-sm cursor-pointer`}>
          <img
            className={`w-full h-full cursor-pointer rounded-full`}
            src={
              localStorage.getItem(config.userPhotoCookie) !== null
                ? localStorage.getItem(config.userPhotoCookie)
                : noPhoto
            }
          />
          <button
            className={`top-0 right-0 absolute text-2xl rounded-full w-10 h-10 main-transition-ease ${cameraEmotion}`}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
        </div>
        <div className="relative flex items-center gap-2 px-5">
          <h2 className={`text-center ${whiteText} text-2xl`}>
            {localStorage.getItem(config.userNameCookie)}
          </h2>
        </div>
        <div className="flex items-center gap-3">{printState}</div>
        <div className="flex items-center gap-3 px-5">
          <p className={`text-center ${whiteText}`}>
            {localStorage.getItem(config.userBioCookie)}
          </p>
        </div>
        <button
          onClick={handleEditing}
          aria-label={buttonsArias.editProfile}
          className={`text-md rounded-sm py-2 px-5 main-transition-ease ${whiteText} ${mainBG(
            99
          )} ${editEmotion}`}
        >
          {buttons.editProfile}
        </button>
      </div>
    </div>
  );
}

export default Settings;
