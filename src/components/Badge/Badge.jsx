import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useNotification } from "../../context/NotificationProvider";

// styles
import styles from "./styles.module.css";
import { memo } from "react";

function Badge({ local }) {
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
    return !local
      ? css({
          background: localStorage.getItem("chat-text-primary"),
          border: `2px solid ${localStorage.getItem("chat-main-bg")}`,
        })
      : css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto !important",
          height: "auto !important",
          padding: "5px 7px",
          right: "-13px !important",
          top: "-10px !important",
          background: localStorage.getItem("chat-text-primary"),
          border: `2px solid ${localStorage.getItem("chat-main-bg")}`,
        });
  }, [local]);

  return see ? (
    <div
      className={`${styles.badge} ${see ? "aGrow" : "aShrink"} ${badgeEmotion}`}
    >
      {/* local ? <p className="text-xs">+{notificationState.count}</p> : null */}
    </div>
  ) : null;
}

Badge.propTypes = {
  local: PropTypes.bool,
};

const BadgeMemo = memo((props) => <Badge {...props} />, arePropsEqual);

BadgeMemo.displayName = "Badge";

function arePropsEqual(oldProps, newProps) {
  return oldProps.local === newProps.local;
}

export default Badge;
