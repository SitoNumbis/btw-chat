import { useMemo, useState, useEffect } from "react";

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

  const badgeEmotion = useMemo(() => {
    return css({
      background: localStorage.getItem("chat-text-primary"),
      border: `2px solid ${localStorage.getItem("chat-main-bg")}`,
    });
  }, []);

  return see ? (
    <div
      className={`${styles.badge} ${see ? "aGrow" : "aShrink"} ${badgeEmotion}`}
    ></div>
  ) : null;
}

export default Badge;
