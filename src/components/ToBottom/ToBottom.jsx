import { memo, useMemo, useCallback, useState, useEffect } from "react";
import loadable from "@loadable/component";

import { scrollTo } from "some-javascript-utils/browser";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

// contexts
import { useCanGoBottom } from "../../context/CanGoBottomProvider";

// styles
import styles from "./styles.module.css";

// components
const Badge = loadable(() => import("../Badge/Badge"));

function ToBottom() {
  const { canGoBottomState } = useCanGoBottom();

  const toBottom = useCallback(() => {
    const dom = document.getElementById("messages-list");
    if (dom !== null) scrollTo(dom.scrollHeight, 0, dom);
  }, []);

  const [see, setSee] = useState(false);

  useEffect(() => {
    if (!canGoBottomState)
      setTimeout(() => {
        setSee(false);
      }, 450);
    else setSee(true);
  }, [canGoBottomState]);

  const buttonEmotion = useMemo(() => {
    return css({
      color: localStorage.getItem("chat-text-basic"),
      background: localStorage.getItem("chat-main-bg"),
    });
  }, []);

  return see ? (
    <button
      onClick={toBottom}
      className={`${canGoBottomState ? "aGrow" : "aShrink"} ${
        styles["to-bottom"]
      } relative ${buttonEmotion}`}
    >
      <Badge local />
      <FontAwesomeIcon icon={faArrowDown} />
    </button>
  ) : null;
}

const ToBottomMemo = memo((props) => <ToBottom {...props} />);

ToBottomMemo.displayName = "ToBottom";

export default ToBottomMemo;
