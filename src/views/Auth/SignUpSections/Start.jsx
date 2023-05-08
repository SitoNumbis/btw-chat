import { useMemo, useState, useEffect } from "react";
import loadable from "@loadable/component";

import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "../styles.module.css";
import Colors from "../../../assets/emotion/color";

// components
import Loading from "../../../components/Loading/Loading";
const PrimaryButton = loadable(() =>
  import("../../../components/Buttons/Primary")
);
const SecondaryButton = loadable(() =>
  import("../../../components/Buttons/Secondary")
);

function Start({ toCreateAccount, toCreateGuest }) {
  const { whiteText } = Colors();

  useEffect(() => {
    setLoading(false);
  }, []);

  const [loading, setLoading] = useState(true);

  const { languageState } = useLanguage();

  const { auth, buttons, buttonsArias } = useMemo(() => {
    return {
      auth: languageState.texts.auth,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const containerEmotion = useMemo(() => {
    return css({
      backgroundColor: `${localStorage.getItem("chat-main-bg")}88`,
      backdropFilter: "blur(10px)",
    });
  }, []);

  const formEmotion = useMemo(() => {
    return css({
      height: "auto !important",
      width: "auto !important",
      backgroundColor: `${localStorage.getItem("chat-secondary-bg")}44`,
    });
  }, []);

  const titleEmotion = useMemo(() => {
    return css({
      fontFamily: "'Times New Roman', Times, serif !important",
      color: localStorage.getItem("chat-text-basic"),
    });
  }, []);

  const appearOneSec = useMemo(() => {
    return css({
      animation: "appear 1s 1 ease",
    });
  }, []);

  return (
    <div>
      {loading ? (
        <Loading
          className={`absolute z-10 w-full h-screen items-center main-backdrop-filter`}
        />
      ) : null}
      <div
        className={`z-10 w-full min-h-screen entrance flex items-center justify-center ${containerEmotion}`}
      >
        <div className={`${styles.signIn} appear ${formEmotion}`}>
          <h1 className={`text-6xl font-bold ${appearOneSec} ${titleEmotion}`}>
            {auth.signUp.sub}
          </h1>
          <p className={`mt-2 ${whiteText} ${appearOneSec}`}>
            {auth.signUp.content}
          </p>
          <div className={`flex gap-2 ${appearOneSec}`}>
            <PrimaryButton
              onClick={toCreateAccount}
              ariaLabel={buttonsArias.signUp}
            >
              {buttons.signUp}
            </PrimaryButton>
            <SecondaryButton
              onClick={toCreateGuest}
              ariaLabel={buttonsArias.signInAsGuest}
            >
              {buttons.signInAsGuest}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

Start.propTypes = {
  toCreateAccount: PropTypes.func,
  toCreateGuest: PropTypes.func,
};

export default Start;
