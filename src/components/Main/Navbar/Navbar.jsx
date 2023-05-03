import React, { memo, useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faGear } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

function Navbar({
  socket,
  selectedChat,
  settings,
  goToSettings,
  toggleSidebar,
}) {
  const { languageState } = useLanguage();

  const { navbar, buttonsArias } = useMemo(() => {
    return {
      navbar: languageState.texts.navbar,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const printState = useCallback(() => {
    switch (selectedChat?.state) {
      case "disconnected":
        return <span className="w-3 h-3 rounded-full bg-l-error"></span>;
      default:
        return <span className="w-3 h-3 rounded-full bg-success"></span>;
    }
  }, [selectedChat]);

  return (
    <div className={`${styles.navbar} z-10 flex flex-col px-4 py-4`}>
      <div className="flex gap-3 items-center w-full h-full justify-between">
        <div className="flex gap-3 items-center w-full h-full">
          <button
            tabIndex={-1}
            className={`${styles.closeButton} ${css({
              transition: "all 500ms ease",
              color: localStorage.getItem("chat-text-basic"),
              ":hover": {
                color: localStorage.getItem("chat-text-primary"),
              },
            })} font-bold text-xl`}
            onClick={toggleSidebar}
            aria-label={buttonsArias.openSidebar}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          {selectedChat ? (
            <>
              <img
                className="w-10 h-10 rounded-full cursor-pointer"
                src={selectedChat?.photo ? selectedChat?.photo : noPhoto}
                alt={selectedChat?.user ? selectedChat?.user : ""}
              />
              <p
                className={`font-semibold ${css({
                  color: localStorage.getItem("chat-text-basic"),
                })}`}
              >
                {selectedChat?.name}
              </p>
              {printState()}
            </>
          ) : (
            <h2
              className={`${css({
                color: localStorage.getItem("chat-text-basic"),
              })}`}
            >
              {navbar.title}
            </h2>
          )}
        </div>
        <button
          onClick={goToSettings}
          className={`appear  ${css({
            transition: "all 500ms ease",
            color: !settings
              ? localStorage.getItem("chat-text-basic")
              : localStorage.getItem("chat-text-primary"),
            transform: settings ? "rotate(-45deg)" : "",
            ":hover": {
              color: localStorage.getItem("chat-text-primary"),
              transform: "rotate(-45deg)",
            },
          })}`}
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
      <hr
        className={`${css({
          width: "100%",
          marginBottom: "10px",
        })} mx-auto mt-3 border-dark`}
      />
    </div>
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
  }),
  settings: PropTypes.bool,
  goToSettings: PropTypes.func,
};

export default Navbar;
