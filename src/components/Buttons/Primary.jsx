import { memo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// styles
import "./styles.css";

function Primary({ children }) {
  return (
    <button
      type="submit"
      className={`primary-button ${css({
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
        ":hover": {
          color: localStorage.getItem("chat-text-basic"),
          background: `${localStorage.getItem("chat-text-primary")}99`,
        },
      })}`}
    >
      {children}
    </button>
  );
}

Primary.propTypes = {
  children: PropTypes.any,
};

const PrimaryMemo = memo((props) => <Primary {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return oldProps.children === newProps.children;
}

PrimaryMemo.displayName = "Primary";

export default PrimaryMemo;
