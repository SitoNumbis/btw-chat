import { useState, useEffect, Suspense } from "react";
import io from "socket.io-client";
import loadable from "@loadable/component";

// css
import { css } from "@emotion/css";

// image
import image from "./assets/images/image.jpg";

// components
const Main = loadable(() => import("./components/Main/Main"));

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    localStorage.setItem("chat-user-name", "Sito");
    return () => newSocket.close();
  }, []);

  return (
    <div
      className={css({
        backgroundImage: `url("${image}")`,
        backgroundSize: "cover",
      })}
    >
      <Suspense>
        <Main socket={socket} />
      </Suspense>
    </div>
  );
}

export default App;
