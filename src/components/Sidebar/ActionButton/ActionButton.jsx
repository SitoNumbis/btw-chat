import React, { memo } from "react";
import PropTypes from "prop-types";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// @emotion/css
import { css } from "@emotion/css";

// styles
import styles from "./styles.module.css";

function ActionButton({ icon, ariaLabel, id, onClick, className, active }) {
  return (
    <button
      tabIndex={-1}
      id={`action-${id}`}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${css({
        color: active
          ? localStorage.getItem("chat-text-primary")
          : localStorage.getItem("chat-text-basic"),
        background: active
          ? `${localStorage.getItem("chat-main-bg")}AA`
          : `${localStorage.getItem("chat-main-bg")}11`,
        ":hover": {
          color: localStorage.getItem("chat-text-primary"),
          background: `${localStorage.getItem("chat-main-bg")}88`,
        },
      })} ${styles.actionButton} ${className}`}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}

ActionButton.propTypes = {
  icon: PropTypes.any,
  ariaLabel: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  active: PropTypes.bool,
};

const ActionButtonMemo = memo(
  (props) => <ActionButton {...props} />,
  arePropsEqual
);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.icon === newProps.icon &&
    oldProps.ariaLabel === newProps.ariaLabel &&
    oldProps.id === newProps.id &&
    oldProps.onClick === newProps.onClick &&
    oldProps.className === newProps.className &&
    oldProps.active === newProps.active
  );
}

ActionButtonMemo.displayName = "ActionButton";

export default ActionButtonMemo;
