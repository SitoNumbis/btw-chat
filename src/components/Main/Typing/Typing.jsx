import { memo, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

function Typing({ typing }) {
  const [see, setSee] = useState(false);

  useEffect(() => {
    if (typing) setSee(true);
    else
      setTimeout(() => {
        setSee(false);
      }, 500);
  }, [typing]);

  return <div></div>;
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
