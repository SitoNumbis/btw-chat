import { useEffect, useState, useCallback, useMemo } from "react";
import loadable from "@loadable/component";

// @emotion*css
import { css } from "@emotion/css";

// some-javascript-utils
import { createCookie } from "some-javascript-utils/browser";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";
import { useNotification } from "../../../context/NotificationProvider";

// utils
import { getUserName, logUser } from "../../../utils/auth";

// services
import { createGuest } from "../../../services/auth";

// config
import config from "../../../config";

// styles
import styles from "../styles.module.css";
import Colors from "../../../assets/emotion/color";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// components
import Loading from "../../../components/Loading/Loading";
const PrimaryButton = loadable(() =>
  import("../../../components/Buttons/Primary")
);

function CreateGuest() {
  const { mainBG, whiteText } = Colors();

  const { setNotificationState } = useNotification();

  const showNotification = useCallback(
    (ntype, message) =>
      setNotificationState({
        type: "set",
        ntype,
        message,
      }),
    [setNotificationState]
  );

  const { languageState } = useLanguage();

  const { auth, buttons, buttonsArias, errors } = useMemo(() => {
    return {
      auth: languageState.texts.auth,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
      errors: languageState.texts.errors,
    };
  }, [languageState]);

  const [loading, setLoading] = useState(true);

  const init = async () => {
    setLoading(true);
    try {
      const response = await createGuest(languageState.lang);
      const data = response.data;
      createCookie(
        config.basicKeyCookie,
        response.data.expiration,
        response.data.token
      );
      logUser(false, { ...data, user: data.guest, name: data.guest });
    } catch (err) {
      console.error(err);
      if (String(err) === "AxiosError: Network Error")
        showNotification("error", errors.notConnected);
      else showNotification("error", String(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    init();
  }, []);

  const formEmotion = useMemo(() => {
    return css({
      alignItems: "center !important",
      width: "400px",
      height: "auto !important",
      backgroundColor: `${localStorage.getItem("chat-secondary-bg")}44`,
    });
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      {loading ? (
        <Loading
          className={`z-10 w-full h-full items-center justify-center flex ${mainBG()}`}
        />
      ) : (
        <div className={`${styles.signIn} appear ${formEmotion}`}>
          <img
            className="rounded-full w-20 h-20 object-fit"
            src={noPhoto}
            alt="no-photo"
          />
          <h2 className={`text-center text-3xl font-semibold ${whiteText}`}>
            {getUserName()}
          </h2>
          <p className={`text-center ${whiteText}`}>{auth.guest.start}</p>
          <a href="/">
            <PrimaryButton ariaLabel={buttonsArias.begin}>
              {buttons.begin}
            </PrimaryButton>
          </a>
        </div>
      )}
    </div>
  );
}

export default CreateGuest;
