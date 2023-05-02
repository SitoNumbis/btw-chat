import React, { memo, useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

function Navbar({ socket, selectedChat }) {
  const { languageState } = useLanguage();

  const { navbar } = useMemo(() => {
    return { navbar: languageState.texts.navbar };
  }, [languageState]);

  return (
    <div className={`${styles.navbar} z-10 flex flex-col px-4 py-4`}>
      <div className="flex gap-3 items-center w-full h-full">
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
      </div>
      <hr
        className={`${css({
          width: "100%",
          marginBottom: "10px",
        })} mx-auto mt-3 border-dark`}
      />
      <p className="text-placeholder-dark italic m-auto">{selectedChat?.bio}</p>
    </div>
  );
}

Navbar.propTypes = {
  socket: PropTypes.object,
  selectedChat: PropTypes.shape({
    photo: PropTypes.string,
    user: PropTypes.string,
    name: PropTypes.string,
    bio: PropTypes.string,
  }),
};

export default Navbar;
