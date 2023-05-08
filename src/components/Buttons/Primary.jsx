import { memo, useMemo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// styles
import "./styles.css";

function Primary({ children, ariaLabel, onClick, type }) {
  const primaryEmotion = useMemo(() => {
    return css({
      color: localStorage.getItem("chat-text-basic"),
      background: localStorage.getItem("chat-text-primary"),
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
      className={`button ${primaryEmotion}`}
    >
      {children}
    </button>
  );
}

Primary.defaultProps = {
  type: "submit",
};

Primary.propTypes = {
  type: PropTypes.string,
  children: PropTypes.any,
  ariaLabel: PropTypes.string,
  onClick: PropTypes.func,
};

const PrimaryMemo = memo((props) => <Primary {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.children === newProps.children &&
    oldProps.type === newProps.type &&
    oldProps.ariaLabel === newProps.ariaLabel &&
    oldProps.onClick === newProps.onClick
  );
}

PrimaryMemo.displayName = "Primary";

export default PrimaryMemo;
