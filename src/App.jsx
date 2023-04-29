import React, { useState, useEffect, Suspense } from "react";
import io from "socket.io-client";
import loadable from "@loadable/component";

// components
const Main = loadable(() => import("./components/Main/Main"));

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <div>
      <Suspense>
        <Main socket={socket} />
      </Suspense>
    </div>
  );
}

export default App;
