import { useState, useEffect, Suspense, useCallback } from "react";
import io from "socket.io-client";
import loadable from "@loadable/component";

// css
import { css } from "@emotion/css";

// image
import image from "../../assets/images/image.jpg";
import config from "../../config";

// components
const Main = loadable(() => import("../../components/Main/Main"));
const Sidebar = loadable(() => import("../../components/Sidebar/Sidebar"));

function Chat() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.on("connect", () => {
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

  return (
    <div className="flex entrance w-full">
      <img
        src={image}
        alt="background"
        onLoad={pickColor}
        className={css({
          objectFit: "cover",
          width: "100%",
          position: "absolute",
          height: "100vh",
          top: 0,
          left: 0,
        })}
      />
      <Suspense>
        <Sidebar open={openSidebar} onClose={toggleSidebar} socket={socket} />
        <div
          className={`flex flex-col flex-1 ${css({
            transition: "all 500ms ease",
          })}`}
        >
          <Main open={openSidebar} socket={socket} />
        </div>
      </Suspense>
    </div>
  );
}

export default Chat;
