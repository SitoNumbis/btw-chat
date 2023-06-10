import { memo, useEffect, useCallback, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import loadable from "@loadable/component";
import { useDebounce } from "use-lodash-debounce";
import useOnclickOutside from "react-cool-onclickoutside";

import useScreenSize from "use-screen-witdh";

import PropTypes from "prop-types";

// contexts
import { useLanguage } from "../../context/LanguageProvider";

// utils
import { validation } from "../../utils/validation";

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
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// images
import noPhoto from "../../assets/images/no-photo.webp";

// utils
import { parseQueries } from "../../utils/parsers";

// styles
import styles from "./styles.module.css";
import Colors from "../../assets/emotion/color.js";

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

function compareFn(a, b) {
  if (a.lastMessage.date > b.lastMessage.date) return -1;

  if (a.lastMessage.date < b.lastMessage.date) return 1;

  // a must be equal to b
  return 0;
}

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
  handleSidebarSearching,
}) {
  const { whiteText } = Colors();

  const navigate = useNavigate();
  const location = useLocation();

  const goSettings = useCallback(() => {
    const { pathname } = location;
    if (pathname.indexOf("/settings" !== 0)) navigate("/settings");
  }, [navigate, location]);

  const onMessageReceived = useCallback(
    (conversation) => {
      const { sender, target } = conversation;

      const { user } = sender;
      if (user !== localStorage.getItem(config.userCookie))
        fetchPerson(user, true, false);
      else fetchPerson(target, true, false);
    },
    [fetchPerson]
  );

  const targetDeletedMessage = useCallback(
    async (target) => {
      fetchPerson(target, true, false);
    },
    [fetchPerson]
  );

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      socket.on("delete-message", targetDeletedMessage);
      return () => {
        socket.off("message", onMessageReceived);
        socket.off("delete-message", targetDeletedMessage);
      };
    }
  }, [socket, onMessageReceived, targetDeletedMessage]);

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
  const debouncedValue = useDebounce(searchInput, 500);

  useEffect(() => {
    // do search stuff
    fetchPerson(debouncedValue);
  }, [debouncedValue]);

  const handleSearchInput = useCallback(
    (e) => {
      setSearchInput(e.target.value);
    },
    [setSearchInput]
  );

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

  const handleSeeing = useCallback(
    (e) => {
      let node = e.target;
      while (node.id.indexOf("action") !== 0) node = node.parentNode;
      const action = node.id.split("-")[1];

      if (action === "multi") return;
      if (action === "search") handleSidebarSearching(false);
      else handleSidebarSearching(true);
      setSeeing(action);
    },
    [handleSidebarSearching]
  );

  useEffect(() => {
    if (seeing === "search")
      setTimeout(() => {
        const inputRef = document.getElementById("search-user");
        if (inputRef !== null) inputRef.focus();
      }, 500);
  }, [seeing]);

  const reconnect = useCallback(() => {
    fetchPerson(searchInput);
  }, [fetchPerson, searchInput]);

  const printSearchChats = useCallback(() => {
    const { search } = location;
    const params = parseQueries(search);
    const user = params.chat;
    return searchChats.map((chat, i) => (
      <ChatPerson
        index={i}
        key={chat.id}
        {...chat}
        selectChat={selectLocalChat}
        searching
        socket={socket}
        active={chat.user === user}
      />
    ));
  }, [searchChats, selectLocalChat, location, socket]);

  const printChats = useCallback(() => {
    const { search } = location;
    const params = parseQueries(search);
    const user = params.chat;

    /*  return (
      <VList
        items={}
      />
    ); */
    return [
      ...chats.filter((message) => message.lastMessage).sort(compareFn),
      ...chats.filter((message) => !message.lastMessage),
    ].map((chat, i) => (
      <ChatPerson
        index={i}
        key={chat.id}
        {...chat}
        selectChat={selectLocalChat}
        searching={false}
        socket={socket}
        active={chat.user === user}
      />
    ));
  }, [chats, selectLocalChat, location, socket]);

  const printState = useMemo(() => {
    switch (localStorage.getItem(config.userStateCookie)) {
      case "disconnected":
        return <span className="w-3 h-3 rounded-full bg-l-error"></span>;
      default:
        return <span className="w-3 h-3 rounded-full bg-success"></span>;
    }
  }, []);

  const reconnectEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
        background: localStorage.getItem("chat-text-basic"),
      },
    });
  }, []);

  const linkEmotion = useMemo(() => {
    return css({
      "@media (min-width:851px)": {
        display: "none",
      },
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const ref = useOnclickOutside(() => {
    if (width < 850 && open) onClose();
  }, [width, open]);

  return (
    <div
      className={`${styles.sidebar} ${css({
        zIndex: 1,
        transform: open ? "translateX(0)" : "translateX(-360px)",
        backgroundColor: `${localStorage.getItem("chat-other-bg")}CC`,
      })} `}
    >
      <div className={styles.userRow} ref={ref}>
        <button
          onClick={goSettings}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            className="w-9 h-9 rounded-full cursor-pointer"
            src={
              validation(config.userPhotoCookie)
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
          <Link
            to="/sign-out"
            className={`appear relative flex items-center justify-center main-transition-ease ${whiteText} ${linkEmotion}`}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </Link>
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
      <hr className={`w-full mx-auto border-dark`} />
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
      <hr className={`w-full mx-auto border-dark`} />
      {!showOffState ? <ConnectionState socket={socket} /> : null}
      {error ? (
        <div className="flex flex-col px-12 p-5 gap-2 appear items-center justify-start">
          <FontAwesomeIcon icon={faSadCry} className="text-l-error text-4xl" />
          <p className="text-l-error">{sidebar.error}</p>
          <button
            onClick={reconnect}
            className={`w-10 h-10 rounded-full main-transition-ease ${whiteText} ${reconnectEmotion}`}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
        </div>
      ) : (
        <div>
          {seeing === "search" ? (
            <>
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
                        <div className={`appear ${styles.listSearch}`}>
                          {printSearchChats()}
                        </div>
                      ) : (
                        <Empty />
                      )}
                    </>
                  ) : (
                    <EmptyChats searching />
                  )}
                </>
              )}
            </>
          ) : null}
          {seeing === "simple" ? (
            <>
              {loading ? (
                <Loading />
              ) : (
                <>
                  {!chats.length ? (
                    <EmptyChats searching={false} />
                  ) : (
                    <div className={`appear ${styles.list}`}>
                      {printChats()}
                    </div>
                  )}
                </>
              )}
            </>
          ) : null}
          {seeing === "multi" ? (
            <>
              {!multiChats.length && !loading && !error ? (
                <EmptyChats searching={false} />
              ) : null}
            </>
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
  handleSidebarSearching: PropTypes.func,
};

export default Sidebar;
