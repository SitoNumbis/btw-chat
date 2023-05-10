import { memo, useMemo, useState, useEffect, useCallback } from "react";
import loadable from "@loadable/component";

import PropTypes from "prop-types";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useDialog } from "../../context/DialogProvider";
import { useLanguage } from "../../context/LanguageProvider";
import { useNotification } from "../../context/NotificationProvider";

// services
import { saveInfo } from "../../services/auth.js";
import { fetchChat } from "../../services/chat/post";

// styles
import styles from "./styles.module.css";
import colors from "../../assets/emotion/color";

// utils
import { logoutUser } from "../../utils/auth";

// images
import noPhoto from "../../assets/images/no-photo.webp";

import config from "../../config";

// components
import Loading from "../../components/Loading/Loading";
const Input = loadable(() => import("../Inputs/Input"));
const Primary = loadable(() => import("../Buttons/Primary"));
const Secondary = loadable(() => import("../Buttons/Secondary"));

function ProfileInformationDialog({ editing }) {
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

  const { setDialogState } = useDialog();

  const { languageState } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");

  const [name, setName] = useState("");

  const { whiteText, mainBG, otherBG } = colors();

  const printState = useMemo(() => {
    switch (state) {
      case "disconnected":
        return (
          <div className={`flex items-center gap-2 ${whiteText}`}>
            {languageState.texts.states.disconnected}
            <div className="w-3 h-3 rounded-full bg-l-error"></div>
          </div>
        );
      default:
        return (
          <div className={`flex items-center gap-2 ${whiteText}`}>
            {languageState.texts.states.connected}
            <div className="w-3 h-3 rounded-full bg-success"></div>
          </div>
        );
    }
  }, [languageState, state]);

  const handleName = useCallback(
    (e) => {
      setName(e.target.value);
    },
    [setName]
  );

  const [bio, setBio] = useState("");
  const handleBio = useCallback(
    (e) => {
      setBio(e.target.value);
    },
    [setBio]
  );

  const { buttons, buttonsArias, dialogs, inputs, errors } = useMemo(() => {
    return {
      inputs: languageState.texts.inputs,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
      dialogs: languageState.texts.dialogs,
      errors: languageState.texts.errors,
    };
  }, [languageState]);

  const handleClose = useCallback(() => {
    setDialogState({ type: "set-value", key: "editing", value: undefined });
  }, [setDialogState]);

  const handleForm = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        await saveInfo(name, bio);
        localStorage.setItem(config.userNameCookie, name);
        localStorage.setItem(config.userBioCookie, bio);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    },
    [name, bio]
  );

  useEffect(() => {
    setLoading(false);
  }, []);

  const fetchTarget = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchChat(editing, true);
      if (response.status === 401) {
        logoutUser();
        window.location.reload();
      }
      const { list } = response.data;
      const [data] = list;
      const { user, name, photo, bio, state } = data;
      localStorage.setItem(`${user}user`, user);
      localStorage.setItem(`${user}name`, name);
      localStorage.setItem(`${user}photo`, photo?.url);
      localStorage.setItem(`${user}bio`, bio);

      setState(state);
    } catch (err) {
      console.error(err);
      const { response } = err;
      if (response && response.status === 401) {
        logoutUser();
        window.location.reload();
      }
      if (String(err) === "AxiosError: Network Error")
        showNotification("error", errors.notConnected);
      else showNotification("error", String(err));
    }
    setLoading(false);
  }, [editing]);

  useEffect(() => {
    if (editing === 1) {
      setName(localStorage.getItem(config.userNameCookie));
      setBio(localStorage.getItem(config.userBioCookie));
    } else fetchTarget();
  }, [editing]);

  const containerEmotion = useMemo(() => {
    return `${css({
      width: "400px",
    })} ${otherBG()}`;
  }, [otherBG]);

  const loadingEmotion = useMemo(() => {
    return `${css({
      backdropFilter: "blur(4px)",
    })} ${mainBG()}`;
  }, [mainBG]);

  const imageEmotion = useMemo(() => {
    return css({
      width: "130px",
      height: "130px",
    });
  }, []);

  return (
    <div className={`entrance ${styles.dialogContainer} ${mainBG(99)}`}>
      <div
        className={`appear relative rounded-sm ${styles.dialog} ${containerEmotion}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-1 right-2 text-xl text-l-error"
        >
          <FontAwesomeIcon icon={faClose} />
        </button>
        {loading ? (
          <Loading
            className={`rounded-sm absolute top-0 left-0 z-10 w-full h-full justify-center items-center flex ${loadingEmotion}`}
          />
        ) : null}
        <h2 className={`text-center ${whiteText} text-2xl`}>
          {dialogs.profileInfo.title}
        </h2>
        {editing === 1 ? (
          <form onSubmit={handleForm}>
            <Input
              id="name"
              type="text"
              input={inputs.name}
              value={name}
              onChange={handleName}
              className={mainBG("FF", true)}
            />
            <Input
              id="bio"
              type="textarea"
              input={inputs.bio}
              value={bio}
              onChange={handleBio}
              className={mainBG("FF", true)}
            />
            <div className="flex items-center gap-5">
              <Primary type="submit" ariaLabel={buttonsArias.save}>
                {buttons.save}
              </Primary>
              <Secondary
                onClick={handleClose}
                type="button"
                ariaLabel={buttonsArias.cancel}
              >
                {buttons.cancel}
              </Secondary>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-start gap-3">
            <div className={`relative ${imageEmotion} rounded-sm`}>
              <img
                className={`w-full h-full rounded-full`}
                src={
                  localStorage.getItem(`${editing}photo`) &&
                  localStorage.getItem(`${editing}photo`) !== "undefined" &&
                  localStorage.getItem(`${editing}photo`) !== null
                    ? localStorage.getItem(`${editing}photo`)
                    : noPhoto
                }
              />
            </div>
            <div className="relative flex items-center gap-2 px-5">
              <h2 className={`text-center ${whiteText} text-2xl`}>
                {localStorage.getItem(`${editing}user`)}
              </h2>
            </div>
            <div className="flex items-center gap-3">{printState}</div>
            <div className="flex items-center gap-3 px-5">
              <p className={`text-center ${whiteText}`}>
                {localStorage.getItem(`${editing}bio`)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ProfileInformationDialog.propTypes = {
  editing: PropTypes.any,
};

const ProfileInformationDialogMemo = memo(
  (props) => <ProfileInformationDialog {...props} />,
  arePropsEqual
);

ProfileInformationDialogMemo.displayName = "ProfileInformationDialog";

function arePropsEqual(oldProps, newProps) {
  return oldProps.editing === newProps.editing;
}

export default ProfileInformationDialogMemo;
