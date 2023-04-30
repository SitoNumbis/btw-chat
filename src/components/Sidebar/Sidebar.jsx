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
import { faArrowRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// styles
import styles from "./styles.module.css";

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
  }, [width, onClose]);

  return (
    <div
      className={`${styles.sidebar} ${css({
        transform: open ? "translateX(0)" : "translateX(-320px)",
      })} relative z-10 px-4 py-4 ${css({
        backgroundColor: `${localStorage.getItem("chat-other-bg")}CC`,
      })}`}
    >
      <div className="flex w-full justify-between items-center">
        <h2
          className={`${css({
            color: localStorage.getItem("chat-text-basic"),
          })} font-semibold text-xl`}
        >
          {sidebar.single}
        </h2>
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
          aria-label={buttonsArias.closeSidebar}
        >
          <FontAwesomeIcon icon={open ? faArrowLeft : faArrowRight} />
        </button>
      </div>
      <hr
        className={`${css({
          width: "100%",
        })} mx-auto my-3 border-placeholder-dark`}
      />
    </div>
  );
}

Sidebar.propTypes = {
  socket: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Sidebar;
