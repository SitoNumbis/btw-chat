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

// services
import { saveInfo } from "../../services/auth.js";
import { fetchChat } from "../../services/chat/post";

// styles
import styles from "./styles.module.css";

// images
import noPhoto from "../../assets/images/no-photo.webp";

import config from "../../config";

// components
import Loading from "../../components/Loading/Loading";
const Primary = loadable(() => import("../Buttons/Primary"));
const Secondary = loadable(() => import("../Buttons/Secondary"));
const Input = loadable(() => import("../Inputs/Input"));

function ProfileInformationDialog({ editing }) {
  const { setDialogState } = useDialog();

  const { languageState } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");

  const [name, setName] = useState("");

  const printState = useMemo(() => {
    switch (state) {
      case "disconnected":
        return (
          <div
            className={`flex items-center gap-2 ${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
            {languageState.texts.states.disconnected}
            <div className="w-3 h-3 rounded-full bg-l-error"></div>
          </div>
        );
      default:
        return (
          <div
            className={`flex items-center gap-2 ${css({
              color: localStorage.getItem("chat-text-basic"),
            })}`}
          >
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

  const { buttons, buttonsArias, dialogs, inputs } = useMemo(() => {
    return {
      inputs: languageState.texts.inputs,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
      dialogs: languageState.texts.dialogs,
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
    try {
      const response = await fetchChat(editing);
      const { data } = response;
      const { user, name, photo, bio, state } = data;
      localStorage.setItem(`${editing}user`, user);
      localStorage.setItem(`${editing}name`, name);
      localStorage.setItem(`${editing}photo`, photo);
      localStorage.setItem(`${editing}bio`, bio);
      setState(state);
    } catch (err) {
      console.error(err);
    }
  }, [editing]);

  useEffect(() => {
    if (editing === 1) {
      setName(localStorage.getItem(config.userNameCookie));
      setBio(localStorage.getItem(config.userBioCookie));
    } else fetchTarget();
  }, [editing]);

  return (
    <div
      className={`entrance ${styles.dialogContainer} ${css({
        background: `${localStorage.getItem("chat-secondary-bg")}99`,
      })}`}
    >
      <div
        className={`appear relative rounded-sm ${styles.dialog} ${css({
          width: "400px",
          background: localStorage.getItem("chat-other-bg"),
        })}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-1 right-2 text-xl text-l-error"
        >
          <FontAwesomeIcon icon={faClose} />
        </button>
        {loading ? (
          <Loading
            className={`rounded-sm absolute top-0 left-0 z-10 w-full h-full justify-center items-center flex ${css(
              {
                backdropFilter: "blur(4px)",
                background: `${localStorage.getItem("chat-main-bg")}`,
              }
            )}`}
          />
        ) : null}
        <h2
          className={`text-center ${css({
            color: localStorage.getItem("chat-text-basic"),
          })} text-2xl`}
        >
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
              className={css({
                background: `${localStorage.getItem(
                  "chat-main-bg"
                )} !important`,
              })}
            />
            <Input
              id="bio"
              type="textarea"
              input={inputs.bio}
              value={bio}
              onChange={handleBio}
              className={css({
                background: `${localStorage.getItem(
                  "chat-main-bg"
                )} !important`,
              })}
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
          <div>
            {" "}
            <div
              className={`relative ${css({
                width: "130px",
                height: "130px",
              })} rounded-sm cursor-pointer`}
            >
              <img
                className={`w-full h-full cursor-pointer rounded-full`}
                src={
                  localStorage.getItem(`${editing}photo`) !== null
                    ? localStorage.getItem(`${editing}photo`)
                    : noPhoto
                }
              />
            </div>
            <div className="relative flex items-center gap-2 px-5">
              <h2
                className={`text-center ${css({
                  color: localStorage.getItem("chat-text-basic"),
                })} text-2xl`}
              >
                {localStorage.getItem(`${editing}user`)}
              </h2>
            </div>
            <div className="flex items-center gap-3">{printState}</div>
            <div className="flex items-center gap-3 px-5">
              <p
                className={`text-center ${css({
                  color: localStorage.getItem("chat-text-basic"),
                })}`}
              >
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
