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

function ConnectionState({ socket, main, settings, isInNavbar }) {
  const { languageState } = useLanguage();

  const { states } = useMemo(() => {
    return { states: languageState.texts.states };
  }, [languageState]);

  const [currentState, setCurrentState] = useState("connecting");

  useEffect(() => {
    if (socket) {
      if (socket.connected) setCurrentState("connected");
      else setCurrentState("connecting");
      socket.on("connect", () => {
        console.info("connected");
        setCurrentState("connected");
      });
      socket.on("connect_error", (error) => {
        console.info(`Connection error: ${error.message}`);
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
      return () => {
        socket.off("connect", () => {
          console.info("connected");
          setCurrentState("connected");
        });
        socket.off("connect_error", (error) => {
          console.error(`Connection error: ${error.message}`);
          setCurrentState("disconnected");
        });
        socket.off("reconnect", () => {
          console.info("reconnected");
          setCurrentState("connected");
        });
        socket.off("reconnecting", () => {
          console.info("reconnecting");
          setCurrentState("connecting");
        });
        socket.off("disconnect", () => {
          console.info("disconnected");
          setCurrentState("disconnected");
        });
        socket.off("error", () => {
          console.info("error");
          setCurrentState("disconnected");
        });
        socket.off("reconnect_error", () => {
          console.info("reconnect_error");
          setCurrentState("connected");
        });
        socket.off("reconnect_failed", () => {
          console.info("reconnect_failed");
          setCurrentState("connected");
        });
      };
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
        setTimeout(() => setHeight("0px"), 1000);
        break;
      default:
        return setHeight("44px");
    }
  }, [currentState]);

  const margin = useMemo(() => {
    if (isInNavbar) return "0";
    if (main && settings) return "-13px 0 10px -8px";
    else if (main) return "-3px 0 10px -8px";
  }, [main, settings, isInNavbar]);

  const [dots, setDots] = useState(".");

  useEffect(() => {
    if (currentState === "connecting") {
      setTimeout(() => {
        if (dots.length < 3) setDots(dots + ".");
        else setDots(".");
      }, 800);
    } else setDots("");
  }, [dots, currentState]);

  const faceEmotion = useMemo(() => {
    return css({ animation: "appear-small 0.5s ease 1" });
  }, []);

  const icon = useMemo(() => {
    switch (currentState) {
      case "disconnected":
        return (
          <FontAwesomeIcon
            className={`${faceEmotion} text-2xl`}
            icon={faFaceFrown}
          />
        );
      case "connected":
        return (
          <FontAwesomeIcon
            className={`${faceEmotion} text-2xl`}
            icon={faSmileBeam}
          />
        );
      default: // connecting
        return (
          <FontAwesomeIcon className={`text-2xl fan-rotate`} icon={faFan} />
        );
    }
  }, [currentState]);

  const connectionStateEmotion = useMemo(() => {
    return css({
      margin,
      transition: "all 500ms ease",
      height,
      color: localStorage.getItem("chat-text-basic"),
    });
  }, [margin, height]);

  const buttonEmotion = useMemo(() => {
    return css({
      transition: "all 500ms ease",
      ":hover": {
        background: localStorage.getItem("chat-main-bg"),
      },
    });
  }, []);

  const absoluteEmotion = useMemo(() => {
    return css({
      top: "50px",
      position: "absolute",
      width: "100%",
      zIndex: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    });
  }, []);

  return (
    <div
      className={`${
        isInNavbar ? absoluteEmotion : ""
      } flex items-center justify-between gap-2 overflow-hidden ${color} ${connectionStateEmotion}`}
    >
      <div className="flex items-center gap-2">
        <div className={`pr-2 transform-rotate-y-180`}>{icon}</div>
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
          className={`w-10 h-10 rounded-full ${buttonEmotion}`}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
      ) : null}
    </div>
  );
}

ConnectionState.propTypes = {
  socket: PropTypes.object,
  main: PropTypes.bool,
  settings: PropTypes.bool,
  isInNavbar: PropTypes.bool,
};

const ConnectionStateMemo = memo(
  (props) => <ConnectionState {...props} />,
  arePropsEqual
);

ConnectionStateMemo.displayName = "ConnectionState";

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.socket === newProps.socket &&
    oldProps.main === newProps.main &&
    oldProps.settings === newProps.settings &&
    oldProps.isInNavbar === newProps.isInNavbar
  );
}

export default ConnectionStateMemo;
