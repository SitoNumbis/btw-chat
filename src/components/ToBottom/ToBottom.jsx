import { memo, useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { scrollTo } from "some-javascript-utils/browser";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

// styles
import styles from "./styles.module.css";

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
      className={`${canGoBottom ? "aGrow" : "aShrink"} ${
        styles["to-bottom"]
      }  ${css({
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
      })}`}
    >
      <FontAwesomeIcon icon={faArrowDown} />
    </button>
  ) : null;
}

ToBottom.propTypes = {
  canGoBottom: PropTypes.bool,
};

const ToBottomMemo = memo((props) => <ToBottom {...props} />, propsAreEqual);

ToBottomMemo.displayName = "ToBottom";

function propsAreEqual(oldProps, newProps) {
  return oldProps.canGoBottom === newProps.canGoBottom;
}

export default ToBottomMemo;
