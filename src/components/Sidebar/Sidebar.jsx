import {
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
  faSadCry,
} from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// images
import noPhoto from "../../assets/images/no-photo.webp";

// styles
import styles from "./styles.module.css";

import config from "../../config";

// components
import Loading from "../Loading/Loading";
const EmptyChats = loadable(() => import("./EmptyChats/EmptyChats"));
const SearchInput = loadable(() => import("./SearchInput/SearchInput"));
const ActionButton = loadable(() => import("./ActionButton/ActionButton"));

function Sidebar({ socket, error, loading, fetchPerson, open, onClose }) {
  const { languageState } = useLanguage();

  const { width } = useScreenSize();

  const chatsReducer = (oldState, action) => {
    const { type } = action;
    switch (type) {
      default:
        return oldState;
    }
  };

  const [chats, setChats] = useReducer(chatsReducer, []);

  const { buttonsArias, inputs, sidebar } = useMemo(() => {
    return {
      buttonsArias: languageState.texts.buttonsArias,
      inputs: languageState.texts.inputs,
      sidebar: languageState.texts.sidebar,
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

  useEffect(() => {
    if (seeing === "search")
      setTimeout(() => {
        const inputRef = document.getElementById("search-user");
        if (inputRef !== null) inputRef.focus();
      }, 500);
  }, [seeing]);

  useEffect(() => {
    fetchPerson(searchInput);
  }, [searchInput]);

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
            <SearchInput
              value={searchInput}
              onChange={handleSearchInput}
              input={inputs.search}
            />
          </div>
        ) : null}
        {seeing === "simple" ? <div></div> : null}
        {seeing === "multi" ? <div></div> : null}
      </div>
      {!chats.length && !searchInput.length && !loading && !error ? (
        <EmptyChats searching={seeing === "search"} />
      ) : null}{" "}
      {error ? (
        <div className="flex flex-col px-12 p-5 gap-2 appear">
          <FontAwesomeIcon icon={faSadCry} className="text-l-error text-4xl" />
          <p className="text-l-error">{sidebar.error}</p>
        </div>
      ) : null}
      {console.log(loading)}
      {loading ? <Loading /> : null}
    </div>
  );
}

Sidebar.propTypes = {
  socket: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  loading: PropTypes.bool,
  fetchPerson: PropTypes.func,
  error: PropTypes.bool,
};

export default Sidebar;
