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
    return css({
      background: localStorage.getItem("chat-text-primary"),
      border: `2px solid ${localStorage.getItem("chat-main-bg")}`,
    });
  }, []);

  return see ? (
    <div
      className={`${styles.badge} ${see ? "aGrow" : "aShrink"} ${badgeEmotion}`}
    >
      +{notificationState.count}
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
