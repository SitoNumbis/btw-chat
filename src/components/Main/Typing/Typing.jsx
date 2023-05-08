import { memo, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import "./styles.css";

function Typing({ typing }) {
  const { languageState } = useLanguage();

  const { aux } = useMemo(() => {
    return { aux: languageState.texts.aux };
  }, [languageState]);

  const [see, setSee] = useState(false);

  useEffect(() => {
    if (typing) setSee(true);
    else
      setTimeout(() => {
        setSee(false);
      }, 500);
  }, [typing]);

  const typingEmotionOn = useMemo(() => {
    return css({
      animation: "appear 0.5s ease 1",
    });
  }, []);

  const typingEmotionOff = useMemo(() => {
    return css({
      animation: "disappear 0.5s ease 1",
    });
  }, []);

  return see ? (
    <div
      className={`${
        typing ? typingEmotionOn : typingEmotionOff
      } flex items-center gap-2`}
    >
      <p className="italic text-placeholder-dark text-sm">{aux.typing}</p>
      <div className="ticontainer">
        <div className="tiblock">
          <div className="tidot"></div>
          <div className="tidot"></div>
          <div className="tidot"></div>
        </div>
      </div>
    </div>
  ) : null;
}

Typing.propTypes = {
  typing: PropTypes.bool,
};

const TypingMemo = memo((props) => <Typing {...props} />, arePropEqual);

TypingMemo.displayName = "Typing";

function arePropEqual(oldProps, newProps) {
  return oldProps.typing === newProps.typing;
}

export default TypingMemo;
