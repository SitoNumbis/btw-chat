import React, { useMemo } from "react";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faCamera } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// config
import config from "../../../config";

function Settings() {
  const { languageState } = useLanguage();

  const printState = useMemo(() => {
    switch (localStorage.getItem(config.userStateCookie)) {
      case "disconnected":
        return (
          <div
            className={`flex items-center gap-2 ${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
            {languageState.texts.states.disconnected}
            <div className="w-3 h-3 rounded-full bg-l-error"></div>
          </div>
        );
      default:
        return (
          <div
            className={`flex items-center gap-2 ${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
            {languageState.texts.states.connected}
            <div className="w-3 h-3 rounded-full bg-success"></div>
          </div>
        );
    }
  }, [languageState]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="appear w-full flex flex-col items-center justify-center gap-2">
        <div
          className={`relative ${css({
            width: "130px",
            height: "130px",
          })} rounded-sm cursor-pointer`}
        >
          <img
            className={`w-full h-full cursor-pointer rounded-full`}
            src={
              localStorage.getItem(config.userPhotoCookie) !== null
                ? localStorage.getItem(config.userPhotoCookie)
                : noPhoto
            }
          />
          <button
            className={`top-0 right-0 absolute text-2xl rounded-full ${css({
              width: "40px",
              height: "40px",
              color: localStorage.getItem("chat-text-primary"),
              transition: "all 500ms ease",
              ":hover": {
                color: localStorage.getItem("chat-text-basic"),
                background: localStorage.getItem("chat-text-primary"),
              },
            })}`}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h2
            className={`${css({
              color: localStorage.getItem("chat-text-basic"),
            })} text-2xl`}
          >
            {localStorage.getItem(config.userNameCookie)}
          </h2>
          <button
            className={`text-md rounded-full ${css({
              width: "30px",
              height: "30px",
              color: localStorage.getItem("chat-text-basic"),
              transition: "all 500ms ease",
              ":hover": {
                color: localStorage.getItem("chat-text-basic"),
                background: localStorage.getItem("chat-text-primary"),
              },
            })}`}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {printState}
          <button
            className={`text-md rounded-full ${css({
              width: "30px",
              height: "30px",
              color: localStorage.getItem("chat-text-basic"),
              transition: "all 500ms ease",
              ":hover": {
                color: localStorage.getItem("chat-text-basic"),
                background: localStorage.getItem("chat-text-primary"),
              },
            })}`}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p
            className={`${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
            {localStorage.getItem(config.userBioCookie)}
          </p>
          <button
            className={`text-md rounded-full ${css({
              width: "30px",
              height: "30px",
              color: localStorage.getItem("chat-text-basic"),
              transition: "all 500ms ease",
              ":hover": {
                color: localStorage.getItem("chat-text-basic"),
                background: localStorage.getItem("chat-text-primary"),
              },
            })}`}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
