import React, { useCallback, useState, useEffect } from "react";

import { scrollTo } from "some-javascript-utils/browser";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

function ToBottom({ canGoBottom }) {
  const toBottom = useCallback(() => {
    const dom = document.getElementById("messages-list");
    if (dom !== null) scrollTo(dom.scrollHeight, 0, dom);
  }, [scrollTo]);

  const [see, setSee] = useState(false);

  useEffect(() => {
    if (!canGoBottom)
      setTimeout(() => {
        setSee(false);
      }, 450);
    else setSee(true);
  }, [canGoBottom]);

  return see ? (
    <button
      onClick={toBottom}
      className={`${
        canGoBottom ? "aGrow" : "aShrink"
      } rounded-full fixed w-10 h-10 ${css({
        bottom: "70px",
        right: "40px",
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
      })}`}
    >
      <FontAwesomeIcon icon={faArrowDown} />
    </button>
  ) : null;
}

export default ToBottom;
