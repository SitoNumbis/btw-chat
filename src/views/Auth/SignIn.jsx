import { useEffect, useState, useMemo, useCallback } from "react";
import { Base64 } from "js-base64";

import { Link } from "react-router-dom";

// some-javascript-utils
import { createCookie } from "some-javascript-utils/browser";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useUser } from "../../context/UserProvider";
import { useLanguage } from "../../context/LanguageProvider";
import { useNotification } from "../../context/NotificationProvider";

// image
import image from "../../assets/images/logo.svg";

// styles
import styles from "./styles.module.css";

// utils
import { logUser } from "../../utils/auth";

// services
import { login, validateUser } from "../../services/auth";

import config from "../../config";

// styles
import Colors from "../../assets/emotion/color";

// components
import Loading from "../../components/Loading/Loading";
import Input from "../../components/Inputs/Input";
import PrimaryButton from "../../components/Buttons/Primary";
import SecondaryButton from "../../components/Buttons/Secondary";

Base64.extendString();

function SignIn() {
  const { setUserState } = useUser();

  const { whiteText, mainBG } = Colors();

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

  const { auth, buttons, buttonsArias, inputs, errors } = useMemo(() => {
    return {
      aux: languageState.texts.aux,
      auth: languageState.texts.auth,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
      inputs: languageState.texts.inputs,
      errors: languageState.texts.errors,
    };
  }, [languageState]);

  const [user, setUser] = useState("");
  const handleUser = useCallback(
    (e) => {
      setUser(e.target.value);
    },
    [setUser]
  );

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);

  const [remember, setRemember] = useState(false);

  const toggleRemember = useCallback(() => {
    setRemember(!remember);
  }, [remember]);

  const [password, setPassword] = useState("");
  const handlePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
    },
    [setPassword]
  );

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowForm(true);
    }, 550);
  }, []);

  const [userHelperText, setUserHelperText] = useState("");
  const [passwordHelperText, setPasswordHelperText] = useState("");

  const checkUser = useCallback(async () => {
    setUserHelperText("");
    if (!user.length) {
      const userRef = document.getElementById("user");
      userRef?.focus();
      return setUserHelperText(inputs.user.notEmpty);
    }
    setLoading(true);
    try {
      const response = await validateUser(user);
      const userRef = document.getElementById("user");
      const data = response.data;
      if (data.user) {
        setSeeing(1);
        userRef?.blur();
      } else {
        userRef?.focus();
        setUserHelperText(inputs.user.userNotFound);
      }
    } catch (err) {
      console.error(err);
      const { response } = err;
      if (response && response.status === 401) {
        const userRef = document.getElementById("user");
        userRef?.focus();
        setUserHelperText(inputs.user.userNotFound);
      } else if (String(err) === "AxiosError: Network Error")
        showNotification("error", errors.notConnected);
      else showNotification("error", String(err));
      setLoading(false);
    }

    setLoading(false);
  }, [user, inputs, errors, showNotification]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      setPasswordHelperText("");
      const passwordRef = document.getElementById("password");
      if (!password.length) {
        passwordRef?.focus();
        return setPasswordHelperText(inputs.password.notEmpty);
      }

      setLoading(true);

      try {
        const response = await login(user.split("@")[0], password, remember);
        const data = response.data;

        createCookie(
          config.basicKeyCookie,
          response.data.expiration,
          response.data.token
        );
        logUser(remember, data);

        setUserState({ type: "login", user: { ...data } });
        if (data.notifications.length)
          try {
            new Notification("Beyond the World", {
              body: `${data.notifications.length} ${languageState.texts.dialogs.notifications.title}`,
              icon: image,
            });
          } catch (err) {
            console.error(err);
          }
      } catch (err) {
        console.error(err);
        const { response } = err;
        if (response && response.status === 401)
          showNotification("error", inputs.password.wrong);
        else if (String(err) === "AxiosError: Network Error")
          showNotification("error", errors.notConnected);
        else showNotification("error", String(err));
        setLoading(false);
      }
    },
    [
      inputs,
      password,
      user,
      errors,
      remember,
      showNotification,
      languageState,
      setUserState,
    ]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const containerEmotion = useMemo(() => {
    return "";
  }, []);

  const formEmotion = useMemo(() => {
    return css({
      display: !showForm ? "none" : "",
    });
  }, [showForm]);

  const background = useMemo(() => {
    return css({ backgroundColor: localStorage.getItem("chat-main-bg") });
  }, []);

  const [openGrid, setOpenGrid] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setOpenGrid(true);
    }, 450);
  });

  const gridEmotion = useMemo(() => {
    return css({
      transition: "grid-template-rows 1s ease",
      gridTemplateRows: openGrid ? "1fr" : "0fr",
    });
  }, [openGrid]);

  const [seeing, setSeeing] = useState(0);

  const positioned = useMemo(() => {
    return css({
      transform: seeing ? "translateX(-100%)" : "translateX(0)",
    });
  }, [seeing]);

  const goBack = useCallback(() => {
    setSeeing(0);
    const passwordRef = document.getElementById("password");
    passwordRef?.blur();
  }, []);

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden ${background}`}
    >
      {loading ? (
        <Loading
          className={`absolute z-20 w-full h-screen items-center main-backdrop-filter ${mainBG(
            88
          )}`}
        />
      ) : null}
      <div
        className={`z-10 w-full min-h-screen relative entrance flex items-center justify-center ${containerEmotion}`}
      >
        <Link to="/" className={`absolute top-5 left-5 ${whiteText}`}>
          <h2>Beyond the World</h2>
        </Link>
        <p className="text-placeholder-dark absolute top-5 right-5">
          <span className={styles.linkSpan}>{auth.new} </span>
          <Link to="/sign-up" className={`ml-1 ${whiteText}`}>
            {buttons.signUp}
          </Link>
        </p>
        <img />
        <form
          onSubmit={handleSubmit}
          className={`${styles.signIn} appear ${formEmotion}`}
        >
          <img
            width={200}
            height={200}
            className="m-auto"
            loading="lazy"
            src={image}
            alt="Beyond the World logo"
          />
          <div className={`grid ${gridEmotion} w-full`}>
            <div className="overflow-hidden w-full">
              <h2 className={`text-5xl font-bold ${whiteText} mb-3`}>
                {auth.signIn.title}
              </h2>
              <div
                className={`w-full flex overflow-hidden main-transition-ease ${
                  !seeing ? "gap-5" : "gap-1"
                }`}
              >
                <div
                  className={`main-transition-ease pl-1 ${styles.formWidth} ${positioned}`}
                >
                  <Input
                    id="user"
                    value={user}
                    onChange={handleUser}
                    input={inputs.user}
                    helperText={userHelperText}
                  />
                  <PrimaryButton
                    onClick={checkUser}
                    type="button"
                    ariaLabel={buttonsArias.continue}
                    className="w-full"
                  >
                    {buttons.continue}
                  </PrimaryButton>
                </div>
                <div
                  className={`main-transition-ease pr-1 ${styles.formWidth} ${positioned}`}
                >
                  <Input
                    id="password"
                    value={password}
                    onChange={handlePassword}
                    rightIcon={
                      <button onClick={toggleShowPassword} type="button">
                        <FontAwesomeIcon
                          icon={showPassword ? faEyeSlash : faEye}
                        />
                      </button>
                    }
                    type={showPassword ? "text" : "password"}
                    input={inputs.password}
                    helperText={passwordHelperText}
                  />
                  <div
                    className={`cursor-pointer flex items-center gap-2 ${whiteText}`}
                  >
                    <input
                      value={remember}
                      onChange={toggleRemember}
                      id="remember"
                      type="checkbox"
                    />
                    <label className="cursor-pointer" htmlFor="remember">
                      {inputs.remember.label}
                    </label>
                  </div>
                  <PrimaryButton
                    type="submit"
                    ariaLabel={buttonsArias.signIn}
                    className="w-full"
                  >
                    {buttons.signIn}
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={goBack}
                    type="button"
                    ariaLabel={buttonsArias.changeUser}
                    className="w-full"
                  >
                    {buttons.changeUser}
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>
        </form>
        <h2 className={`${styles.footer} text-placeholder-dark`}>
          COPYRIGHTS © {new Date().getFullYear()} Beyond the World
        </h2>
      </div>
    </div>
  );
}

export default SignIn;
