import { useEffect, useCallback, useState, useMemo, useReducer } from "react";
import { Link } from "react-router-dom";
import loadable from "@loadable/component";
import { useDebounce } from "use-lodash-debounce";

import CryptoJS from "crypto-js";

import PropTypes from "prop-types";

// contexts
import { useLanguage } from "../../context/LanguageProvider";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

// styles
import styles from "./users.module.css";
import Colors from "../../assets/emotion/color.js";

// services
import { fetchChat } from "../../services/chat/post";

// utils
import { logoutUser } from "../../utils/auth";

import config from "../../config";

// components
import Loading from "../../components/Loading/Loading";
const VList = loadable(() =>
  import("../../components/Externals/ReactVirtualized/List")
);
const ConnectionState = loadable(() =>
  import("../../components/ConnectionState/ConnectionState")
);
const Empty = loadable(() =>
  import("../../components/Sidebar/EmptyChats/Empty")
);
const ChatPerson = loadable(() =>
  import("../../components/Sidebar/ChatPerson/ChatPerson")
);
const EmptyChats = loadable(() =>
  import("../../components/Sidebar/EmptyChats/EmptyChats")
);
const SearchInput = loadable(() =>
  import("../../components/Sidebar/SearchInput/SearchInput")
);
const ActionButton = loadable(() =>
  import("../../components/Sidebar/ActionButton/ActionButton")
);

function compareFn(a, b) {
  if (a.lastMessage.date > b.lastMessage.date) return -1;

  if (a.lastMessage.date < b.lastMessage.date) return 1;

  // a must be equal to b
  return 0;
}

function UserList({ socket }) {
  const { whiteText } = Colors();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const chatsReducer = (oldState, action) => {
    const { type } = action;
    switch (type) {
      case "add-message": {
        const { message, user } = action;
        const newOldState = [...oldState];
        const found = newOldState.find((localUser) => localUser.user === user);
        if (found) found.lastMessage = message;
        return newOldState;
      }
      case "add": {
        const { list, from } = action;
        const newOldState = [...oldState];
        if (from === "back") {
          list.forEach((user) => {
            const found = newOldState.find(
              (localUser) => localUser.id === user.id
            );
            if (!found) newOldState.push(user);
            else found.lastMessage = user.lastMessage;
          });
        } else {
          list.forEach((user) => {
            const found = newOldState.find(
              (localUser) => localUser.id === user.id
            );
            if (!found) newOldState.push(user);
            else found.lastMessage = user.lastMessage;
          });
        }
        return newOldState;
      }
      default:
        return oldState;
    }
  };

  const [chats, setChats] = useReducer(chatsReducer, []);
  const [searchChats, setSearchChats] = useReducer(chatsReducer, []);
  const [multiChats, setMultiChats] = useReducer(chatsReducer, []);

  const fetchPerson = useCallback(
    async (name, newOne, loading = true) => {
      setError(false);
      if (loading) setLoading(true);
      try {
        const response = await fetchChat(name, newOne ? true : false);

        if (response.status !== 200 && response.status !== 204) {
          if (response.status === 401) {
            logoutUser();
            window.location.reload();
          }
          console.error(response.statusText);
          setError(true);
        }
        const { data } = response;
        const list = data.list.map((remoteItem) => {
          const { key, lastMessage, photo, user } = remoteItem;
          if (photo) localStorage.setItem(`${user}photo`, photo);
          if (lastMessage) {
            const parsedMessage = CryptoJS.AES.decrypt(
              lastMessage,
              key
            ).toString(CryptoJS.enc.Utf8);
            remoteItem.lastMessage = JSON.parse(parsedMessage);
          }
          return remoteItem;
        });
        if (name && name.length && !newOne)
          setSearchChats({ type: "add", list });
        else setChats({ type: "add", list });
        if (name?.length)
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        else setLoading(false);
        if (name && name.length && newOne && list) {
          const [lastUser] = list;
          const { lastMessage } = lastUser;
          const theMessage = lastMessage.message;
          if (
            lastMessage.sender.user !== localStorage.getItem(config.userCookie)
          )
            try {
              new Notification(lastUser.name, {
                body: theMessage,
                icon:
                  localStorage.getItem(`${lastMessage.sender.user}photo`) &&
                  localStorage.getItem(`${lastMessage.sender.user}photo`) !==
                    "undefined" &&
                  localStorage.getItem(`${lastMessage.sender.user}photo`) !==
                    null
                    ? localStorage.getItem(`${lastMessage.sender.user}photo`)
                    : noPhoto,
              });
            } catch (err) {
              console.error(err);
            }
        }
      } catch (err) {
        console.error(err);
        const { response } = err;
        if (response.status === 401) {
          logoutUser();
          window.location.reload();
        }
        setError(true);
        setLoading(false);
      }
    },
    [setSearchChats, setChats]
  );

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

  useEffect(() => {
    if (socket) {
      socket.on("message", onMessageReceived);
      return () => {
        socket.off("message", onMessageReceived);
      };
    }
  }, [socket, onMessageReceived]);

  const { languageState } = useLanguage();

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

  const [seeing, setSeeing] = useState("simple");

  const handleSeeing = useCallback((e) => {
    let node = e.target;
    while (node.id.indexOf("action") !== 0) node = node.parentNode;
    const action = node.id.split("-")[1];

    if (action === "multi") return;
    setSeeing(action);
  }, []);

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
    return searchChats.map((chat, i) => (
      <Link
        key={chat.id}
        to={`/chat?user=${chat.user}`}
        className="no-underline"
      >
        <ChatPerson
          index={i}
          key={chat.id}
          {...chat}
          searching
          socket={socket}
        />
      </Link>
    ));
  }, [searchChats, socket]);

  const printChats = useCallback(() => {
    /*  return (
      <VList
        items={}
      />
    ); */
    return [
      ...chats.filter((message) => message.lastMessage).sort(compareFn),
      ...chats.filter((message) => !message.lastMessage),
    ].map((chat, i) => (
      <Link key={chat.id} to={`/chat?user=${chat.user}`} className="no-underline">
        <ChatPerson index={i} {...chat} searching={false} socket={socket} />
      </Link>
    ));
  }, [chats, socket]);

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

  const mainEmotion = useMemo(() => {
    return css({
      zIndex: 1,
      transform: open ? "translateX(0)" : "translateX(-360px)",
      backgroundColor: `${localStorage.getItem("chat-secondary-bg")}`,
    });
  }, []);

  return (
    <div className={`${styles.sidebar} ${mainEmotion} relative z-10 py-4`}>
      <div className={styles.userRow}>
        <Link
          to="/settings"
          className="flex items-center gap-2 cursor-pointer no-underline"
        >
          <img
            className="w-10 h-10 rounded-full cursor-pointer"
            src={
              localStorage.getItem(config.userPhotoCookie) &&
              localStorage.getItem(config.userPhotoCookie) !== "undefined" &&
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
        </Link>

        <Link
          to="/sign-out"
          className={`appear relative flex items-center justify-center main-transition-ease ${whiteText} ${linkEmotion}`}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </Link>
      </div>
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
      <ConnectionState socket={socket} />

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
                    <div className="appear h-full overflow-auto">
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

UserList.propTypes = {
  socket: PropTypes.object,
};

export default UserList;
