import { memo, useMemo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

// styles
import Colors from "../../assets/emotion/color";

function Loading({ className, noEntrance }) {
  const { whiteText } = Colors();

  const loadingEmotion = useMemo(() => {
    return css({
      animation: "spin 1s ease infinite",
    });
  }, []);

  return (
    <div
      className={`${
        noEntrance ? "" : "entrance"
      } flex items-start justify-center w-full h-full pt-5 ${className}`}
    >
      <FontAwesomeIcon
        icon={faCompass}
        className={`text-4xl ${whiteText} ${loadingEmotion}`}
      />
    </div>
  );
}

Loading.propTypes = {
  className: PropTypes.string,
  noEntrance: PropTypes.bool,
};

const LoadingMemo = memo((props) => <Loading {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.className === newProps.className &&
    oldProps.noEntrance === newProps.noEntrance
  );
}

LoadingMemo.displayName = "Loading";

export default LoadingMemo;
