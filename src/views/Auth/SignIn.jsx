import { useEffect, useState, useMemo, useCallback } from "react";
import { Base64 } from "js-base64";
import loadable from "@loadable/component";
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

// styles
import styles from "./styles.module.css";

// utils
import { loadImage } from "../../utils/services";
import { logUser, userLogged } from "../../utils/auth";

// services
import { login } from "../../services/auth";

import config from "../../config";

// components
import Loading from "../../components/Loading/Loading";
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

  const [imageBG, setImageBG] = useState(
    "https://ik.imagekit.io/lgqp0wffgtp/tr:q-1/Beyon_the_world/Chat/auth_vNlQJ5l45.webp?updatedAt=1683111316564"
  );

  useEffect(() => {
    loadImage(
      "https://ik.imagekit.io/lgqp0wffgtp/Beyon_the_world/Chat/auth_vNlQJ5l45.webp?updatedAt=1683111316564"
    )
      .then((base64) => {
        setImageBG(base64);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="min-h-screen w-full">
      <img
        className="w-full h-full object-cover absolute top-0 left-0"
        src={imageBG}
        alt="space-wallpaper"
      />
      {loading ? (
        <Loading
          className={`absolute z-10 w-full h-screen items-center ${css({
            backdropFilter: "blur(4px)",
          })}`}
        />
      ) : null}
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
              backgroundColor: `${localStorage.getItem("chat-secondary-bg")}44`,
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
            <PrimaryButton ariaLabel={buttonsArias.signIn}>
              {buttons.signIn}
            </PrimaryButton>
            <p
              className={css({
                color: localStorage.getItem("chat-text-basic"),
              })}
            >
              {auth.new}{" "}
              <Link
                to="/auth/sign-up"
                className={`underline transition ${css({
                  color: localStorage.getItem("chat-text-basic"),
                  ":hover": {
                    color: localStorage.getItem("chat-text-primary"),
                  },
                })}`}
              >
                {buttons.signUp}
              </Link>{" "}
              {aux.or}{" "}
              <Link
                to="/auth/sign-in-as-guest"
                className={`underline transition ${css({
                  color: localStorage.getItem("chat-text-basic"),
                  ":hover": {
                    color: localStorage.getItem("chat-text-primary"),
                  },
                })}`}
              >
                {buttons.signInAsGuest}
              </Link>
            </p>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default SignIn;
