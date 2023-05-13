import { memo, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useDialog } from "../../../context/DialogProvider";

// utils
import { validation } from "../../../utils/validation";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

import config from "../../../config";

// components
import Loading from "../../Loading/Loading";

function Bubble({ join, loading, sender }) {
  const { setDialogState } = useDialog();

  const seeProfile = useCallback(() => {
    setDialogState({
      type: "set-value",
      key: "editing",
      value:
        sender.user === localStorage.getItem(config.userCookie)
          ? 1
          : sender.user,
    });
  }, [setDialogState, sender]);

  const imageEmotion = useMemo(() => {
    return css({
      minWidth: "28px",
      minHeight: "28px",
    });
  }, []);

  const loadingEmotion = useMemo(() => {
    return css({
      padding: "0 !important",
      svg: {
        fontSize: "20px !important",
      },
    });
  }, []);

  const growEmotion = useMemo(() => {
    return css({
      animation: "aGrow 0.4s ease 1",
    });
  }, []);

  const getPhoto = useMemo(() => {
    if (sender.user === localStorage.getItem(config.userCookie))
      return validation(config.userPhotoCookie)
        ? localStorage.getItem(config.userPhotoCookie)
        : noPhoto;
    else
      return validation(`${sender.user}photo`)
        ? localStorage.getItem(`${sender.user}photo`)
        : noPhoto;
  }, [sender]);

  return (
    <div>
      {!join ? (
        <div className={`w-7 h-7 ${imageEmotion}`}>
          {loading ? (
            <Loading className={loadingEmotion} />
          ) : (
            <button className="w-full h-full" onClick={seeProfile}>
              <img
                className={`w-full h-full rounded-full cursor-pointer ${growEmotion}`}
                src={getPhoto}
                alt={sender !== null && sender ? sender.user : ""}
              />
            </button>
          )}
        </div>
      ) : (
        <div className={`w-7 h-7 ${imageEmotion}`}></div>
      )}
    </div>
  );
}

Bubble.propTypes = {
  join: PropTypes.bool,
  sender: PropTypes.object,
  loading: PropTypes.bool,
};

const BubbleMemo = memo((props) => <Bubble {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.join === newProps.join &&
    oldProps.sender === newProps.sender &&
    oldProps.loading === newProps.loading
  );
}

BubbleMemo.displayName = "Bubble";

export default BubbleMemo;
