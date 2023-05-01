import React, {
  memo,
  useEffect,
  useCallback,
  useState,
  useReducer,
  useMemo,
} from "react";
import loadable from "@loadable/component";

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

// components
const Input = loadable(() => import("../Inputs/Input"));
const ActionButton = loadable(() => import("./ActionButton/ActionButton"));

function Sidebar({ socket, open, onClose }) {
  const { languageState } = useLanguage();

  const { width } = useScreenSize();

  const { buttonsArias, sidebar, inputs } = useMemo(() => {
    return {
      buttonsArias: languageState.texts.buttonsArias,
      sidebar: languageState.texts.sidebar,
      inputs: languageState.texts.inputs,
    };
  }, [languageState]);

  const [searchInput, setSearchInput] = useState("");
  const handleSearchInput = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  useEffect(() => {
    if (width < 850) onClose(false);
    else onClose(true);
  }, [width]);

  const [seeing, setSeeing] = useState("simple");

  const handleSeeing = useCallback((e) => {
    let node = e.target;
    while (node.id.indexOf("action") !== 0) node = node.parentNode;
    const action = node.id.split("-")[1];
    setSeeing(action);
  }, []);

  return (
    <div
      className={`${styles.sidebar} ${css({
        transform: open ? "translateX(0)" : "translateX(-320px)",
      })} relative z-10 py-4 ${css({
        backgroundColor: `${localStorage.getItem("chat-other-bg")}CC`,
      })}`}
    >
      <div className={styles.userRow}>
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
      {/* <hr
        className={`${css({
          width: "100%",
        })} mx-auto my-3 border-placeholder-dark`}
      /> */}
      <div className={`${styles.actionButtonRow}`}>
        <ActionButton
          id="search"
          aria-label={buttonsArias.showSearchChats}
          onClick={handleSeeing}
          icon={faSearch}
          active={seeing === "search"}
        />
        <ActionButton
          id="simple"
          ariaLabel={buttonsArias.showSimpleChats}
          onClick={handleSeeing}
          icon={faUser}
          active={seeing === "simple"}
        />
        <ActionButton
          id="multi"
          ariaLabel={buttonsArias.showMultiChats}
          onClick={handleSeeing}
          icon={faUserGroup}
          active={seeing === "multi"}
        />
      </div>
      {/* <hr
        className={`${css({
          width: "100%",
        })} mx-auto my-0 border-placeholder-dark`}
      /> */}
      <div>
        {seeing === "search" ? (
          <div>
            <div className="appear">
              <Input
                id="search"
                type="search"
                leftIcon={
                  <button className={css({ marginLeft: "10px" })}>
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                }
                input={inputs.search}
                value={searchInput}
                onChange={handleSearchInput}
                className={`!rounded-none ${css({
                  height: "45px",
                  color: localStorage.getItem("chat-text-basic"),
                  background: localStorage.getItem("chat-main-bg"),
                  paddingLeft: "45px!important",
                })}`}
              />
            </div>
          </div>
        ) : null}
        {seeing === "simple" ? <div></div> : null}
        {seeing === "multi" ? <div></div> : null}
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
