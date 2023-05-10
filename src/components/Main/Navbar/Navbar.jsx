import { memo, useState, useEffect, useCallback, useMemo } from "react";
import loadable from "@loadable/component";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faGear } from "@fortawesome/free-solid-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useDialog } from "../../../context/DialogProvider";
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";
import Colors from "../../../assets/emotion/color";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

const Badge = loadable(() => import("../../Badge/Badge"));

function Navbar({
  socket,
  selectedChat,
  settings,
  goToSettings,
  toggleSidebar,
}) {
  const { whiteText } = Colors();

  const { setDialogState } = useDialog();

  const goToProfile = useCallback(() => {
    setDialogState({
      type: "set-value",
      key: "editing",
      value: selectedChat.user,
    });
  }, [selectedChat, goToSettings]);

  const { languageState } = useLanguage();

  const { navbar, buttonsArias } = useMemo(() => {
    return {
      navbar: languageState.texts.navbar,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const [localState, setLocalState] = useState(selectedChat?.state);

  useEffect(() => {
    setLocalState(selectedChat?.state);
  }, [selectedChat]);

  const printState = useMemo(() => {
    switch (localState) {
      case "disconnected":
        return <span className="w-3 h-3 rounded-full bg-l-error"></span>;
      default:
        return <span className="w-3 h-3 rounded-full bg-success"></span>;
    }
  }, [localState]);

  const barsEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const settingsEmotion = useMemo(() => {
    return css({
      color: !settings
        ? localStorage.getItem("chat-text-basic")
        : localStorage.getItem("chat-text-primary"),
      transform: settings ? "rotate(-45deg)" : "",
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
        transform: "rotate(-45deg)",
      },
    });
  }, [settings]);

  const gearEmotion = useMemo(() => {
    return css({
      color: !settings
        ? localStorage.getItem("chat-text-basic")
        : localStorage.getItem("chat-text-primary"),
      transform: settings ? "rotate(-45deg)" : "",
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, [settings]);

  const linkEmotion = useMemo(() => {
    return css({
      paddingBottom: "3px",
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const personUpdateState = useCallback(
    (options) => {
      const { to } = options;
      if (selectedChat)
        if (options.user === selectedChat.user) setLocalState(to);
    },
    [setLocalState, selectedChat]
  );

  useEffect(() => {
    if (socket) {
      socket.on("user-update-state", personUpdateState);
      return () => {
        socket.off("user-update-state", personUpdateState);
      };
    }
  }, [socket, personUpdateState]);

  return (
    <header className={`${styles.navbar} z-10 flex flex-col px-4`}>
      <div className="flex gap-3 items-center w-full h-full justify-between">
        <div className="flex gap-3 items-center w-full h-full">
          <div className="relative">
            <Badge />
            <button
              tabIndex={-1}
              className={`${styles.closeButton} main-transition-ease ${whiteText} ${barsEmotion} font-bold text-xl`}
              onClick={toggleSidebar}
              aria-label={buttonsArias.openSidebar}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
          {selectedChat && !settings ? (
            <button
              onClick={goToProfile}
              className="flex gap-3 items-center cursor-pointer"
            >
              <img
                className="w-10 h-10 rounded-full cursor-pointer"
                src={
                  localStorage.getItem(`${selectedChat?.user}photo`) &&
                  localStorage.getItem(`${selectedChat?.user}photo`) !==
                    "undefined" &&
                  localStorage.getItem(`${selectedChat?.user}photo`) !== null
                    ? localStorage.getItem(`${selectedChat?.user}photo`)
                    : noPhoto
                }
                alt={selectedChat?.user ? selectedChat?.user : ""}
              />
              <p className={`font-semibold ${whiteText}`}>
                {selectedChat?.name}
              </p>
              {printState}
            </button>
          ) : (
            <h2 className={`${whiteText}`}>{navbar.title}</h2>
          )}
        </div>
        <button
          onClick={goToSettings}
          className={`appear main-transition-ease ${settingsEmotion}`}
        >
          <FontAwesomeIcon
            className={`appear main-transition-ease ${gearEmotion}`}
            icon={faGear}
          />
        </button>
        <Link
          to="/sign-out"
          className={`appear relative flex items-center justify-center main-transition-ease ${whiteText} ${linkEmotion}`}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </Link>
      </div>
      <hr className={`w-full mx-auto border-dark`} />
    </header>
  );
}

Navbar.propTypes = {
  socket: PropTypes.object,
  sidebar: PropTypes.bool,
  toggleSidebar: PropTypes.func,
  selectedChat: PropTypes.shape({
    photo: PropTypes.string,
    user: PropTypes.string,
    name: PropTypes.string,
    bio: PropTypes.string,
    state: PropTypes.string,
    lastMessage: PropTypes.any,
    key: PropTypes.string,
  }),
  settings: PropTypes.bool,
  goToSettings: PropTypes.func,
};

export default Navbar;
