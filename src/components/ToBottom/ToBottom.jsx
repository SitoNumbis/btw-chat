import React from "react";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

function ToBottom() {
  return (
    <button
      className={`absolute bottom-3 right-3 w-10 h-10 ${css({
        color: localStorage.getItem("chat-text-basic"),
      })}`}
    >
      <FontAwesomeIcon icon={faArrowDown} />
    </button>
  );
}

export default ToBottom;
