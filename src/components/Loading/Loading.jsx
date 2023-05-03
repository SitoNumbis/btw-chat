import { memo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

function Loading({ className }) {
  return (
    <div
      className={`entrance flex items-start justify-center w-full h-full pt-5 ${className}`}
    >
      <FontAwesomeIcon
        icon={faCompass}
        className={`text-4xl ${css({
          animation: "spin 1s ease infinite",
          color: localStorage.getItem("chat-text-basic"),
        })}`}
      />
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string,
};

const LoadingMemo = memo((props) => <Loading {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return oldProps.className === newProps.className;
}

LoadingMemo.displayName = "Loading";

export default LoadingMemo;
