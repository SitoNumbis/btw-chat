import {
  useState,
  useEffect,
  Suspense,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

import loadable from "@loadable/component";

import PropTypes from "prop-types";

// css
import { css } from "@emotion/css";

// services
import { fetchChat } from "../../services/chat/post";

// styles
import styles from "./styles.module.css";

// utils
import { logoutUser } from "../../utils/auth";
import { decryptMessage, parseQueries } from "../../utils/parsers";
import { validation } from "../../utils/validation";
import { isMyReactAppActive } from "../../utils/services";

// contexts
import { useUser } from "../../context/UserProvider";
import { useDialog } from "../../context/DialogProvider";
import { useCanGoBottom } from "../../context/CanGoBottomProvider.jsx";
import { useNotification } from "../../context/NotificationProvider";

// images
import noPhoto from "../../assets/images/no-photo.webp";

// components
import Loading from "../../components/Loading/Loading";

const ProfileInformationDialog = loadable(() =>
  import("../../components/Dialogs/ProfileInformationDialog")
);
const Main = loadable(() => import("../../components/Main/Main"));
const Sidebar = loadable(() => import("../../components/Sidebar/Sidebar"));

function Chat({ socket }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { userState, setUserState } = useUser();
  const { setNotificationState } = useNotification();

  const { canGoBottomState } = useCanGoBottom();

  const { dialogState } = useDialog();

  /*  const pickColor = useCallback((e) => {
    const img = e.target;
    // Create a canvas element to draw the image onto
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Create an array to store the color counts
    const colorCounts = {};

    // Loop through each pixel and count its color
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const color = `rgb(${r},${g},${b})`;
      if (colorCounts[color]) {
        colorCounts[color]++;
      } else {
        colorCounts[color] = 1;
      }
    }

    // Find the most common color
    let maxCount = 0;
    let primaryColor = "";
    for (const color in colorCounts) {
      if (colorCounts[color] > maxCount) {
        maxCount = colorCounts[color];
        primaryColor = color;
      }
    }

    console.log(primaryColor); // Output the primary color
  }, []); */

  const [openSidebar, setOpenSidebar] = useState(true);

  const toggleSidebar = useCallback(
    (to) => {
      if (typeof to === "boolean") return setOpenSidebar(to);
      setNotificationState({ type: "set-badge", count: 0 });
      return setOpenSidebar(!openSidebar);
    },
    [openSidebar, setOpenSidebar]
  );

  const [loading, setLoading] = useState(true);
  const [loadingF, setLoadingF] = useState(true);
  const [errorLoadingPerson, setErrorLoadingPerson] = useState(false);

  const chatsReducer = (oldState, action) => {
    const { type } = action;
    switch (type) {
      case "set": {
        const { list } = action;
        return list;
      }
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

  const [selectedChat, setSelectedChat] = useState(undefined);

  const fetchPerson = useCallback(
    async (name, newOne, loading = true) => {
      setErrorLoadingPerson(false);
      if (loading) setLoading(true);
      //! reading from cache
      try {
        if (validation("chats")) {
          const chatsLocal = JSON.parse(localStorage.getItem("chats"));
          setChats({ type: "add", list: chatsLocal });
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }

      try {
        const response = await fetchChat(name, newOne ? true : false);
        if (response.status !== 200 && response.status !== 204) {
          if (response.status === 401) {
            logoutUser();
            setUserState({ type: "logout" });
          }
          console.error(response.statusText);
          setErrorLoadingPerson(true);
        }
        const { data } = response;
        const list = data.list.map((remoteItem) => {
          const { key, lastMessage, photo, user } = remoteItem;
          if (photo) localStorage.setItem(`${user}photo`, photo);
          if (lastMessage) {
            const parsedMessage = decryptMessage(lastMessage, key);
            remoteItem.lastMessage = JSON.parse(parsedMessage);
          }
          return remoteItem;
        });
        localStorage.setItem("chats", JSON.stringify(data.list));
        if (name && name.length && !newOne)
          setSearchChats({ type: "set", list });
        else setChats({ type: "add", list });
        if (name?.length)
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        else setLoading(false);
        if (name && name.length && newOne && list) {
          if (
            (selectedChat?.user !== name && !canGoBottomState) ||
            (selectedChat?.user === name && canGoBottomState) ||
            !isMyReactAppActive()
          ) {
            const [lastUser] = list;
            const { lastMessage } = lastUser;
            const theMessage = lastMessage.message;
            if (lastMessage.sender.user !== userState.user) {
              try {
                new Notification(lastUser.name, {
                  body: theMessage,
                  icon: validation(`${lastMessage.sender.user}photo`)
                    ? localStorage.getItem(`${lastMessage.sender.user}photo`)
                    : noPhoto,
                });
              } catch (err) {
                console.error(err);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
        const { response } = err;
        if (response.status === 401) {
          logoutUser();
          setUserState({ type: "logout" });
        }
        setErrorLoadingPerson(true);
        setLoading(false);
      }
    },
    [
      setSearchChats,
      setChats,
      selectedChat,
      canGoBottomState,
      userState,
      setUserState,
    ]
  );

  const selectChat = useCallback(
    async (user, searching, from = "") => {
      if (selectedChat !== undefined && from === "location") return;
      if (!user) return setSelectedChat(undefined);
      if (searching) {
        const found = searchChats.find((localUser) => localUser.user === user);
        setSelectedChat(found);
        navigate(`/?chat=${found.user}`);
      } else if (from === "location") {
        const response = await fetchChat(user, true);

        if (response.status !== 200 && response.status !== 204) {
          if (response.status === 401) {
            logoutUser();
            setUserState({ type: "logout" });
          }
          console.error(response.statusText);
          setErrorLoadingPerson(true);
        }
        const { data } = response;

        const list = data.list.map((remoteItem) => {
          const { key, lastMessage, user, photo } = remoteItem;
          if (photo) localStorage.setItem(`${user}photo`, photo);
          if (lastMessage) {
            remoteItem.lastMessage = JSON.parse(
              decryptMessage(lastMessage, key)
            );
          }
          return remoteItem;
        });

        if (list.length) setSelectedChat(list[0]);
      } else {
        const found = chats.find((localUser) => localUser.user === user);
        setSelectedChat(found);
        navigate(`/?chat=${found.user}`);
      }
    },
    [chats, searchChats, multiChats, selectedChat, setSelectedChat, navigate]
  );

  useEffect(() => {
    const { search } = location;
    const params = parseQueries(search);
    if (params.chat) selectChat(params.chat, false, "location");
  }, [location]);

  useEffect(() => {
    setLoadingF(false);
  }, []);

  const [noSidebarSearching, setNoSidebarSearching] = useState(true);

  const handleSidebarSearching = (value) => {
    setNoSidebarSearching(value);
  };

  const background = useMemo(() => {
    return css({ backgroundColor: localStorage.getItem("chat-other-bg") });
  }, []);

  return (
    <div className={`entrance ${styles.main} ${background}`}>
      {dialogState.editing !== undefined ? (
        <ProfileInformationDialog editing={dialogState.editing} />
      ) : null}

      {loadingF ? (
        <Loading
          className={`absolute z-10 w-full h-screen items-center main-backdrop-filter`}
        />
      ) : null}
      <div className={`${styles.bg}`}>
        <Suspense>
          <Sidebar
            chats={chats}
            multiChats={multiChats}
            searchChats={searchChats}
            error={errorLoadingPerson}
            fetchPerson={fetchPerson}
            selectChat={selectChat}
            loading={loading}
            open={openSidebar}
            onClose={toggleSidebar}
            socket={socket}
            handleSidebarSearching={handleSidebarSearching}
          />
          <div className={`flex flex-col flex-1 main-transition-ease`}>
            <Main
              selectChat={selectChat}
              selectedChat={selectedChat}
              sidebar={openSidebar}
              toggleSidebar={toggleSidebar}
              socket={socket}
              noSidebarSearching={noSidebarSearching}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

Chat.propTypes = {
  socket: PropTypes.object,
};

export default Chat;
