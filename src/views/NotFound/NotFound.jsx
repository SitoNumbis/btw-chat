import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// utils
import { loadImage } from "../../utils/services";

// styles
import styles from "./styles.module.css";

function NotFound() {
  const [imageBG, setImageBG] = useState(
    "https://ik.imagekit.io/lgqp0wffgtp/tr:q-1/Beyon_the_world/Chat/auth_vNlQJ5l45.webp?updatedAt=1683111316564"
  );

  useEffect(() => {
    loadImage(
      "https://ik.imagekit.io/lgqp0wffgtp/Beyon_the_world/Chat/auth_vNlQJ5l45.webp?updatedAt=1683111316564"
    )
      .then((base64) => {
        setImageBG(base64);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="w-full h-screen">
      <img
        className="absolute left-0 top-0 w-full min-h-screen object-cover"
        src={imageBG}
        alt="space-background"
      />
      <div
        className={`entrance flex flex-col items-center justify-center w-full h-full ${
          styles.glass
        } ${css({ background: `${localStorage.getItem("chat-main-bg")}77` })}`}
      >
        <h1
          className={`appear z-10 text-9xl font-bold ${css({
            color: `${localStorage.getItem("chat-text-basic")}`,
          })}`}
        >
          {404}
        </h1>
        <Link
          to="/"
          className={`appear mt-10 transition ${css({
            color: localStorage.getItem("chat-text-basic"),
            ":hover": {
              color: localStorage.getItem("chat-text-primary"),
            },
          })}`}
        >
          <FontAwesomeIcon icon={faHome} />
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
