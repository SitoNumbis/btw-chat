import { useMemo } from "react";

// @emotion/css
import { css } from "@emotion/css";
import { useCallback } from "react";

const Colors = () => {
  const whiteText = useMemo(
    () =>
      css({
        color: localStorage.getItem("chat-text-basic"),
      }),
    []
  );

  const primaryText = useCallback((opacity = "FF", important = false) => {
    return css({
      color: `${localStorage.getItem("chat-text-primary")}${opacity}${
        important ? " !important" : ""
      }`,
    });
  }, []);



  const mainBG = useCallback((opacity = "FF", important = false) => {
    return css({
      background: `${localStorage.getItem("chat-secondary-bg")}${opacity}${
        important ? " !important" : ""
      }`,
    });
  }, []);
5
  const otherBG = useCallback((opacity = "FF", important = false) => {
    return css({
      background: `${localStorage.getItem("chat-other-bg")}${opacity}${
        important ? " !important" : ""
      }`,
    });
  }, []);

  return { whiteText, primaryText, mainBG, otherBG };
};

export default Colors;
