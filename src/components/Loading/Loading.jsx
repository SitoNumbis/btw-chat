import React from "react";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

function Loading() {
  return (
    <div className="entrance flex items-start justify-center w-full h-full pt-5">
      <FontAwesomeIcon
        icon={faCompass}
        className={`text-4xl ${css({
          animation: "spin 1s ease infinite",
          color: localStorage.getItem("chat-text-basic"),
        })}`}
      />
    </div>
  );
}

export default Loading;
