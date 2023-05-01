import { useEffect, useState, useMemo, useCallback } from "react";
import { Base64 } from "js-base64";
import loadable from "@loadable/component";

// some-javascript-utils
import { createCookie, getCookie } from "some-javascript-utils/browser";

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

// images
import authBG from "../../assets/images/auth.webp";

// styles
import styles from "./styles.module.css";

// utils
import { logUser, userLogged } from "../../utils/auth";

// services
import { login } from "../../services/auth";

import config from "../../config";

// components
const Input = loadable(() => import("../../components/Inputs/Input"));
const PrimaryButton = loadable(() =>
  import("../../components/Buttons/Primary")
);

Base64.extendString();

function SignIn() {
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

  const [user, setUser] = useState("");
  const handleUser = useCallback(
    (e) => {
      setUser(e.target.value);
    },
    [setUser]
  );

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

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

  const { auth, buttons, inputs, errors } = useMemo(() => {
    return {
      auth: languageState.texts.auth,
      buttons: languageState.texts.buttons,
      inputs: languageState.texts.inputs,
      errors: languageState.texts.errors,
    };
  }, [languageState]);

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
        const response = await login(user, password, remember);
        const data = response.data;

        createCookie(
          config.basicKeyCookie,
          response.data.expiration,
          response.data.token
        );
        logUser(remember, data);

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
      }
      setLoading(false);
    },
    [inputs, password, user, errors, remember, showNotification]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <div className="min-h-screen w-full">
      <img
        className="w-full h-full object-cover absolute top-0 left-0"
        src={authBG}
        alt="space-wallpaper"
      />
      <div
        className={`z-10 w-full min-h-screen entrance flex items-center justify-center ${css(
          {
            backgroundColor: `${localStorage.getItem("chat-main-bg")}88`,
            backdropFilter: "blur(10px)",
          }
        )}`}
      >
        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className={`${styles.signIn} appear ${css({
              backgroundColor: `${localStorage.getItem("chat-secondary-bg")}88`,
            })}`}
          >
            <h2
              className={`text-5xl font-bold ${css({
                color: localStorage.getItem("chat-text-basic"),
              })}`}
            >
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
              className={`cursor-pointer flex items-center gap-2 ${css({
                color: localStorage.getItem("chat-text-basic"),
              })}`}
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
            <PrimaryButton>{buttons.signIn}</PrimaryButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default SignIn;
