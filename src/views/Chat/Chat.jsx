import { useState, useEffect, Suspense, useReducer, useCallback } from "react";
import io from "socket.io-client";
import loadable from "@loadable/component";

// css
import { css } from "@emotion/css";

// config
import config from "../../config";

// services
import { fetchChat } from "../../services/chat/post";

// styles
import styles from "./styles.module.css";

// utils
import { loadImage } from "../../utils/services";

// components
const Main = loadable(() => import("../../components/Main/Main"));
const Sidebar = loadable(() => import("../../components/Sidebar/Sidebar"));

function Chat() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(config.apiSocketUrl, {
      transports: ["polling"],
    });

    newSocket.on("connect", (data) => {
      console.log(data);
      console.log("connect", localStorage.getItem(config.userCookie));
      newSocket.emit("send-user-id", localStorage.getItem(config.userCookie));
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const pickColor = useCallback((e) => {
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
  }, []);

  const [openSidebar, setOpenSidebar] = useState(true);

  const toggleSidebar = useCallback(
    (to) => {
      if (typeof to === "boolean") return setOpenSidebar(to);

      return setOpenSidebar(!openSidebar);
    },
    [openSidebar, setOpenSidebar]
  );

  const [loading, setLoading] = useState(true);
  const [errorLoadingPerson, setErrorLoadingPerson] = useState(false);

  const chatsReducer = (oldState, action) => {
    const { type } = action;
    switch (type) {
      case "add": {
        const { list, from } = action;
        const newOldState = [...oldState];
        if (from === "back") {
          list.forEach((user) => {
            const found = newOldState.find(
              (localUser) => localUser.id === user.id
            );
            if (!found) newOldState.push(user);
          });
          return newOldState;
        } else {
          list.forEach((user) => {
            const found = newOldState.find(
              (localUser) => localUser.id === user.id
            );
            if (!found) newOldState.push(user);
          });
          return newOldState;
        }
      }
      default:
        return oldState;
    }
  };

  const [chats, setChats] = useReducer(chatsReducer, []);
  const [searchChats, setSearchChats] = useReducer(chatsReducer, []);
  const [multiChats, setMultiChats] = useReducer(chatsReducer, []);

  const fetchPerson = async (name) => {
    setErrorLoadingPerson(false);
    setLoading(true);
    try {
      const response = await fetchChat(name);
      if (response.status !== 200 && response.status !== 204) {
        console.error(response.statusText);
        setErrorLoadingPerson(true);
      }
      const { list } = await response.json();
      if (name && name.length) setSearchChats({ type: "add", list });
      else setChats({ type: "add", list });
    } catch (err) {
      console.error(err);
      setErrorLoadingPerson(true);
    }
    setLoading(false);
  };

  const [selectedChat, setSelectedChat] = useState(undefined);

  const selectChat = useCallback(
    (user, searching) => {
      if (searching) {
        const found = searchChats.find((localUser) => localUser.user === user);
        setSelectedChat(found);
      } else {
        const found = chats.find((localUser) => localUser.user === user);
        setSelectedChat(found);
      }
    },
    [chats, searchChats, multiChats]
  );

  const [imageBG, setImageBG] = useState(
    "https://ik.imagekit.io/lgqp0wffgtp/tr:q-1/Beyon_the_world/Chat/image_12QNJKZ2w.jpg?updatedAt=1683111900098"
  );

  useEffect(() => {
    loadImage(
      "https://ik.imagekit.io/lgqp0wffgtp/Beyon_the_world/Chat/image_12QNJKZ2w.jpg?updatedAt=1683111900098"
    )
      .then((base64) => {
        setImageBG(base64);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className={`flex entrance w-full h-screen ${styles.main}`}>
      <img
        src={imageBG}
        alt="space-background"
        /* onLoad={pickColor} */
        className={css({
          objectFit: "cover",
          width: "100%",
          position: "absolute",
          height: "100vh",
          top: 0,
          left: 0,
        })}
      />
      <div className={`${styles.bg}`}>
        {" "}
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
          />
          <div
            className={`flex flex-col flex-1 ${css({
              transition: "all 500ms ease",
            })}`}
          >
            <Main
              selectedChat={selectedChat}
              sidebar={openSidebar}
              toggleSidebar={toggleSidebar}
              socket={socket}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

export default Chat;
