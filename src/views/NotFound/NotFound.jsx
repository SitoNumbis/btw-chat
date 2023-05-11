import { useMemo } from "react";
import { Link } from "react-router-dom";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// styles
import styles from "./styles.module.css";
import Colors from "../../assets/emotion/color";

function NotFound() {
  const { whiteText } = Colors();

  const background = useMemo(() => {
    return css({ backgroundColor: localStorage.getItem("chat-other-bg") });
  }, []);

  const linkEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  return (
    <div className={`w-full h-screen ${background}`}>
      <div
        className={`entrance flex flex-col items-center justify-center w-full h-full ${
          styles.glass
        } ${css({ background: `${localStorage.getItem("chat-main-bg")}77` })}`}
      >
        <h1 className={`appear z-10 text-9xl font-bold ${whiteText}`}>{404}</h1>
        <Link
          to="/"
          className={`appear mt-10 transition ${whiteText} ${linkEmotion}`}
        >
          <FontAwesomeIcon icon={faHome} />
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
