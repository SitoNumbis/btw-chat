import React, {
  memo,
  useEffect,
  useCallback,
  useState,
  useReducer,
  useMemo,
} from "react";

import useScreenSize from "use-screen-witdh";

import PropTypes from "prop-types";

// contexts
import { useLanguage } from "../../context/LanguageProvider";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faSearch,
  faUser,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// images
import noPhoto from "../../assets/images/no-photo.webp";

// styles
import styles from "./styles.module.css";
import config from "../../config";

function Sidebar({ socket, open, onClose }) {
  const { languageState } = useLanguage();

  const { width } = useScreenSize();

  const { buttonsArias, sidebar } = useMemo(() => {
    return {
      buttonsArias: languageState.texts.buttonsArias,
      sidebar: languageState.texts.sidebar,
    };
  }, [languageState]);

  useEffect(() => {
    if (width < 850) onClose(false);
    else onClose(true);
  }, [width]);

  const [seeing, setSeeing] = useState("simple");

  const handleSeeing = useCallback(() => {}, []);

  return (
    <div
      className={`${styles.sidebar} ${css({
        transform: open ? "translateX(0)" : "translateX(-320px)",
      })} relative z-10 px-4 py-4 ${css({
        backgroundColor: `${localStorage.getItem("chat-other-bg")}CC`,
      })}`}
    >
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            className="w-10 h-10 rounded-full cursor-pointer"
            src={
              localStorage.getItem(config.userPhotoCookie) !== null
                ? localStorage.getItem(config.userPhotoCookie)
                : noPhoto
            }
          />
          <h2
            className={`${css({
              color: localStorage.getItem("chat-text-basic"),
            })} font-semibold text-md`}
          >
            {localStorage.getItem(config.userNameCookie)}
          </h2>
        </div>
        <button
          tabIndex={-1}
          className={`${styles.closeButton} ${css({
            transition: "all 500ms ease",
            color: localStorage.getItem("chat-text-basic"),
            ":hover": {
              color: localStorage.getItem("chat-text-primary"),
            },
          })} font-bold text-xl`}
          onClick={onClose}
          aria-label={
            open ? buttonsArias.closeSidebar : buttonsArias.openSidebar
          }
        >
          <FontAwesomeIcon icon={open ? faArrowLeft : faArrowRight} />
        </button>
      </div>
      <hr
        className={`${css({
          width: "100%",
        })} mx-auto my-3 border-placeholder-dark`}
      />
      <div className={`${styles.actionButtonRow}`}>
        <button
          id="search"
          aria-label={buttonsArias.showSearchChats}
          onClick={handleSeeing}
          className={`${css({
            color: localStorage.getItem("chat-text-basic"),
            ":hover": {
              color: localStorage.getItem("chat-text-primary"),
              background: `${localStorage.getItem("chat-main-bg")}88`,
            },
          })} ${styles.actionButton}`}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
        <button
          id="simple"
          aria-label={buttonsArias.showSimpleChats}
          onClick={handleSeeing}
          className={`${css({
            color: localStorage.getItem("chat-text-basic"),
            ":hover": {
              color: localStorage.getItem("chat-text-primary"),
              background: `${localStorage.getItem("chat-main-bg")}88`,
            },
          })} ${styles.actionButton}`}
        >
          <FontAwesomeIcon icon={faUser} />
        </button>
        <button
          id="multi"
          aria-label={buttonsArias.showMultiChats}
          onClick={handleSeeing}
          className={`${css({
            color: localStorage.getItem("chat-text-basic"),
            ":hover": {
              color: localStorage.getItem("chat-text-primary"),
              background: `${localStorage.getItem("chat-main-bg")}88`,
            },
          })} ${styles.actionButton}`}
        >
          <FontAwesomeIcon icon={faUserGroup} />
        </button>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  socket: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Sidebar;
