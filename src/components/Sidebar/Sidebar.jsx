import { memo, useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import loadable from "@loadable/component";
import debounce from "lodash.debounce";

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
  faRotateLeft,
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

const ConnectionState = loadable(() =>
  import("../ConnectionState/ConnectionState")
);
const Empty = loadable(() => import("./EmptyChats/Empty"));
const ChatPerson = loadable(() => import("./ChatPerson/ChatPerson"));
const EmptyChats = loadable(() => import("./EmptyChats/EmptyChats"));
const SearchInput = loadable(() => import("./SearchInput/SearchInput"));
const ActionButton = loadable(() => import("./ActionButton/ActionButton"));

function Sidebar({
  socket,
  chats,
  searchChats,
  multiChats,
  error,
  loading,
  fetchPerson,
  selectChat,
  open,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const goSettings = useCallback(() => {
    const { pathname } = location;
    if (pathname.indexOf("/settings" !== 0)) navigate("/settings");
  }, [navigate, location]);

  const onMessageReceived = useCallback(
    (conversation) => {
      console.info("receiving messages");
      const { sender } = conversation;
      const { user } = sender;
      if (!chats.find((localChat) => localChat.user === user))
        fetchPerson(user, true);
    },
    [chats, searchChats, multiChats, fetchPerson]
  );

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      return () => {
        socket.off("message", onMessageReceived);
      };
    }
  }, [socket]);

  const { languageState } = useLanguage();

  const { width } = useScreenSize();

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

  const [showOffState, setShowOffState] = useState(false);

  useEffect(() => {
    if (width < 850) {
      onClose(false);
      setShowOffState(true);
    } else {
      onClose(true);
      setShowOffState(false);
    }
  }, [width]);

  const selectLocalChat = useCallback(
    (user, searching) => {
      if (width < 850) onClose(false);
      selectChat(user, searching);
    },
    [width, selectChat, onClose]
  );

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

  // Define a function to handle the search when the user types
  const handleSearch = debounce((searchText) => {
    // Call the server search function with the current search text
    fetchPerson(searchText);
  }, 500); // Wait 500ms before calling the server search function

  useEffect(() => {
    if (seeing === "simple" || seeing === "multi") fetchPerson();
    else handleSearch(searchInput);
  }, [searchInput, seeing]);

  const reconnect = useCallback(() => {
    fetchPerson(searchInput);
  }, [fetchPerson, searchInput]);

  const printSearchChats = useCallback(() => {
    return searchChats.map((chat, i) => (
      <ChatPerson
        index={i}
        key={chat.id}
        {...chat}
        selectChat={selectLocalChat}
        searching
      />
    ));
  }, [searchChats, selectLocalChat]);

  const printChats = useCallback(() => {
    return chats.map((chat, i) => (
      <ChatPerson
        index={i}
        key={chat.id}
        {...chat}
        selectChat={selectLocalChat}
        searching={false}
      />
    ));
  }, [chats, selectLocalChat]);

  const printState = useMemo(() => {
    switch (localStorage.getItem(config.userStateCookie)) {
      case "disconnected":
        return <span className="w-3 h-3 rounded-full bg-l-error"></span>;
      default:
        return <span className="w-3 h-3 rounded-full bg-success"></span>;
    }
  }, []);

  return (
    <div
      className={`${styles.sidebar} ${css({
        zIndex: 1,
        transform: open ? "translateX(0)" : "translateX(-360px)",
        backgroundColor: `${localStorage.getItem("chat-other-bg")}CC`,
      })} relative z-10 py-4`}
    >
      <div className={styles.userRow}>
        <button
          onClick={goSettings}
          className="flex items-center gap-2 cursor-pointer"
        >
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
            })} text-md`}
          >
            {localStorage.getItem(config.userNameCookie)}
          </h2>
          {printState}
        </button>
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
      {!showOffState ? <ConnectionState socket={socket} /> : null}

      {error ? (
        <div className="flex flex-col px-12 p-5 gap-2 appear items-center justify-start">
          <FontAwesomeIcon icon={faSadCry} className="text-l-error text-4xl" />
          <p className="text-l-error">{sidebar.error}</p>
          <button
            onClick={reconnect}
            className={`w-10 h-10 rounded-full ${css({
              transition: "all 500ms ease",
              color: localStorage.getItem("chat-text-basic"),
              ":hover": {
                color: localStorage.getItem("chat-text-primary"),
                background: localStorage.getItem("chat-text-basic"),
              },
            })}`}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
        </div>
      ) : (
        <div>
          {seeing === "search" ? (
            <div>
              <SearchInput
                value={searchInput}
                onChange={handleSearchInput}
                input={inputs.search}
              />
              {loading ? (
                <Loading />
              ) : (
                <>
                  {searchInput.length ? (
                    <>
                      {searchChats.length ? (
                        <div className="appear">{printSearchChats()}</div>
                      ) : (
                        <Empty />
                      )}
                    </>
                  ) : (
                    <EmptyChats searching />
                  )}
                </>
              )}
            </div>
          ) : null}
          {seeing === "simple" ? (
            <div>
              {loading ? (
                <Loading />
              ) : (
                <>
                  {!chats.length ? (
                    <EmptyChats searching={false} />
                  ) : (
                    <div className="appear h-full overflow-auto">
                      {printChats()}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
          {seeing === "multi" ? (
            <div>
              {!multiChats.length && !loading && !error ? (
                <EmptyChats searching={false} />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

Sidebar.propTypes = {
  socket: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  loading: PropTypes.bool,
  selectChat: PropTypes.func,
  fetchPerson: PropTypes.func,
  error: PropTypes.bool,
  chats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      user: PropTypes.string,
      id: PropTypes.string,
      bio: PropTypes.string,
      photo: PropTypes.string,
    })
  ),
  searchChats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      user: PropTypes.string,
      id: PropTypes.string,
      bio: PropTypes.string,
      photo: PropTypes.string,
    })
  ),
  multiChats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      user: PropTypes.string,
      id: PropTypes.string,
      bio: PropTypes.string,
      photo: PropTypes.string,
    })
  ),
};

export default Sidebar;
