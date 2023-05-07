import { useState, useEffect } from "react";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useNotification } from "../../context/NotificationProvider";

// styles
import styles from "./styles.module.css";

function Badge() {
  const { notificationState } = useNotification();
  const [see, setSee] = useState(false);

  useEffect(() => {
    if (notificationState.count > 0) setSee(true);
    else
      setTimeout(() => {
        setSee(false);
      }, 450);
  }, [notificationState.count]);

  return see ? (
    <div
      className={`${styles.badge} ${see ? "aGrow" : "aShrink"} ${css({
        background: localStorage.getItem("chat-text-primary"),
      })}`}
    ></div>
  ) : null;
}

export default Badge;
