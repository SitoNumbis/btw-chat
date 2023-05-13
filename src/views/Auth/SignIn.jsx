import { useEffect, useState, useMemo, useCallback } from "react";
import { Base64 } from "js-base64";

import { Link } from "react-router-dom";

// some-javascript-utils
import { createCookie } from "some-javascript-utils/browser";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useLanguage } from "../../context/LanguageProvider";
import { useNotification } from "../../context/NotificationProvider";

// image
import image from "../../assets/images/250.jpg";

// styles
import styles from "./styles.module.css";

// utils
import { logUser, userLogged } from "../../utils/auth";

// services
import { login } from "../../services/auth";

import config from "../../config";

// styles
import Colors from "../../assets/emotion/color";

// components
import Loading from "../../components/Loading/Loading";
import Input from "../../components/Inputs/Input";
import PrimaryButton from "../../components/Buttons/Primary";

Base64.extendString();

function SignIn() {
  const { whiteText } = Colors();

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

  const { auth, aux, buttons, buttonsArias, inputs, errors } = useMemo(() => {
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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setUserHelperText("");
      setPasswordHelperText("");

      if (!user.length) {
        const userRef = document.getElementById("user");
        userRef?.focus();
        return setUserHelperText(inputs.user.notEmpty);
      }

      if (!password.length) {
        const passwordRef = document.getElementById("password");
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
        if (data.notifications.length)
          try {
            new Notification("Beyond the World", {
              body: `${data.notifications.length} ${languageState.texts.dialogs.notifications.title}`,
              icon: image,
            });
          } catch (err) {
            console.error(err);
          }
        setTimeout(() => {
          if (userLogged()) window.location.href = "/";
        }, 100);
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
    [inputs, password, user, errors, remember, showNotification]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const containerEmotion = useMemo(() => {
    return css({
      backgroundColor: `${localStorage.getItem("chat-main-bg")}88`,
      backdropFilter: "blur(10px)",
    });
  }, []);

  const formEmotion = useMemo(() => {
    return css({
      display: !showForm ? "none" : "",
      backgroundColor: `${localStorage.getItem("chat-secondary-bg")}44`,
    });
  }, [showForm]);

  const linkEmotion = useMemo(() => {
    return css({
      ":hover": {
        color: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const background = useMemo(() => {
    return css({ backgroundColor: localStorage.getItem("chat-other-bg") });
  }, []);

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden ${background}`}
    >
      {loading ? (
        <Loading
          className={`absolute z-10 w-full h-screen items-center main-backdrop-filter`}
        />
      ) : null}
      <div
        className={`z-10 w-full min-h-screen entrance flex items-center justify-center ${containerEmotion}`}
      >
        <form
          onSubmit={handleSubmit}
          className={`${styles.signIn} appear ${formEmotion}`}
        >
          <h2 className={`text-5xl font-bold ${whiteText}`}>
            {auth.signIn.title}
          </h2>
          <Input
            id="user"
            value={user}
            onChange={handleUser}
            leftIcon={<FontAwesomeIcon icon={faUser} />}
            input={inputs.user}
            helperText={userHelperText}
          />
          <Input
            id="password"
            value={password}
            onChange={handlePassword}
            leftIcon={<FontAwesomeIcon icon={faLock} />}
            rightIcon={
              <button onClick={toggleShowPassword} type="button">
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
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
          <PrimaryButton ariaLabel={buttonsArias.signIn}>
            {buttons.signIn}
          </PrimaryButton>
          <p className={whiteText}>
            {auth.new}{" "}
            <Link
              to="/sign-up"
              className={`underline transition ${whiteText} ${linkEmotion}`}
            >
              {buttons.signUp}
            </Link>{" "}
            {aux.or}{" "}
            <Link
              to="/sign-in-as-guest"
              className={`underline transition ${whiteText} ${linkEmotion}`}
            >
              {buttons.signInAsGuest}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
