import React, { memo, useCallback, useMemo, useState } from "react";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

function Navbar({ socket }) {
  const { languageState } = useLanguage();

  const { navbar } = useMemo(() => {
    return { navbar: languageState.texts.navbar };
  }, [languageState]);

  return (
    <div className={`${styles.navbar} z-10 flex flex-col px-4`}>
      <div className="justify-between items-center w-full h-full"></div>
      <hr
        className={`${css({
          width: "100%",
          marginBottom: "2px",
        })} mx-auto mt-3 border-placeholder-dark`}
      />
    </div>
  );
}

export default Navbar;
