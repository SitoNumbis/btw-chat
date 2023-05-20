import { memo, useMemo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// styles
import "./styles.css";

function Secondary({ children, ariaLabel, onClick, type, className }) {
  const secondaryEmotion = useMemo(() => {
    return css({
      color: localStorage.getItem("chat-text-basic"),
      border: "1px solid",
      borderColor: `${localStorage.getItem("chat-text-primary")}99`,
      ":hover": {
        color: localStorage.getItem("chat-text-basic"),
        background: `${localStorage.getItem("chat-text-primary")}99`,
      },
    });
  }, []);

  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      type={type}
      className={`button ${secondaryEmotion} ${className}`}
    >
      {children}
    </button>
  );
}

Secondary.defaultProps = {
  type: "button",
};

Secondary.propTypes = {
  type: PropTypes.string,
  children: PropTypes.any,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

const SecondaryMemo = memo((props) => <Secondary {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.children === newProps.children &&
    oldProps.type === newProps.type &&
    oldProps.ariaLabel === newProps.ariaLabel &&
    oldProps.onClick === newProps.onClick &&
    oldProps.className === newProps.className
  );
}

SecondaryMemo.displayName = "Secondary";

export default SecondaryMemo;
