import { memo, useMemo, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFan,
  faFaceFrown,
  faSmileBeam,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../context/LanguageProvider";

// styles
import "./styles.css";

function ConnectionState({ socket }) {
  const { languageState } = useLanguage();

  const { states } = useMemo(() => {
    return { states: languageState.texts.states };
  }, [languageState]);

  const [currentState, setCurrentState] = useState("connecting");

  useEffect(() => {
    console.log(socket);
    if (socket) {
      if (socket.connected) setCurrentState("connected");
      else setCurrentState("disconnected");
      socket.on("connect", () => {
        console.info("connected");
        setCurrentState("connected");
      });
      socket.on("connect_error", (error) => {
        console.log(`Connection error: ${error.message}`);
        setCurrentState("disconnected");
      });
      socket.on("reconnect", () => {
        console.info("reconnected");
        setCurrentState("connected");
      });
      socket.on("reconnecting", () => {
        console.info("reconnecting");
        setCurrentState("connecting");
      });
      socket.on("disconnect", () => {
        console.info("disconnected");
        setCurrentState("disconnected");
      });
      socket.on("error", () => {
        console.info("error");
        setCurrentState("disconnected");
      });
      socket.on("reconnect_error", () => {
        console.info("reconnect_error");
        setCurrentState("connected");
      });
      socket.on("reconnect_failed", () => {
        console.info("reconnect_failed");
        setCurrentState("connected");
      });
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    if (socket) {
      // Disconnect the socket
      socket.disconnect();

      // Reconnect the socket
      socket.connect();
      setCurrentState("connecting");
    }
  }, [socket]);

  const color = useMemo(() => {
    switch (currentState) {
      case "disconnected":
        return "bg-l-error";
      case "connecting":
        return "bg-warning";
      default: // connected
        return "bg-success";
    }
  }, [currentState]);

  const [height, setHeight] = useState("44px");

  useEffect(() => {
    switch (currentState) {
      case "connected":
        setTimeout(() => setHeight("0"), 1000);
        break;
      default:
        return setHeight("44px");
    }
  }, [currentState]);

  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (currentState === "connecting") {
      setTimeout(() => {
        if (dots.length < 3) setDots(dots + ".");
        else setDots(".");
      }, 800);
    } else setDots("");
  }, [dots, currentState]);

  const icon = useMemo(() => {
    switch (currentState) {
      case "disconnected":
        return (
          <FontAwesomeIcon className={`appear text-2xl`} icon={faFaceFrown} />
        );
      case "connected":
        return (
          <FontAwesomeIcon className={`appear text-2xl`} icon={faSmileBeam} />
        );
      default: // connecting
        return (
          <FontAwesomeIcon className={`text-2xl fan-rotate`} icon={faFan} />
        );
    }
  }, [currentState]);

  return (
    <div
      className={`flex items-center justify-between gap-2 overflow-hidden ${color} ${css(
        {
          transition: "all 500ms ease",
          height,
          color: localStorage.getItem("chat-text-basic"),
        }
      )}`}
    >
      <div className="flex items-center gap-2">
        <div className={`pr-2 ${css({ transform: "rotateY(-180deg)" })}`}>
          {icon}
        </div>
        <p
          className={`text-md ${currentState === "connecting" ? "italic" : ""}`}
        >
          {states[currentState]}
          {dots}
        </p>
      </div>
      {currentState === "disconnected" ? (
        <button
          onClick={reconnect}
          className={`w-10 h-10 rounded-full ${css({
            transition: "all 500ms ease",
            ":hover": {
              background: localStorage.getItem("chat-main-bg"),
            },
          })}`}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
      ) : null}
    </div>
  );
}

ConnectionState.propTypes = {
  socket: PropTypes.object,
};

const ConnectionStateMemo = memo(
  (props) => <ConnectionState {...props} />,
  arePropsEqual
);

ConnectionStateMemo.displayName = "ConnectionState";

function arePropsEqual(oldProps, newProps) {
  return oldProps.socket === newProps.socket;
}

export default ConnectionStateMemo;
