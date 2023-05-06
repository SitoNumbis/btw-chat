import { memo, useMemo, useState, useEffect, useCallback } from "react";
import loadable from "@loadable/component";

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

// styles
import styles from "./styles.module.css";

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

  const [name, setName] = useState("");

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
        const response = await saveInfo(name, bio);
        console.log(response);
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

  useEffect(() => {
    if (editing) {
      setName(localStorage.getItem(config.userNameCookie));
      setBio(localStorage.getItem(config.userBioCookie));
    }
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
        <form onSubmit={handleForm}>
          <Input
            id="name"
            type="text"
            input={inputs.name}
            value={name}
            onChange={handleName}
            className={css({
              background: `${localStorage.getItem("chat-main-bg")} !important`,
            })}
          />
          <Input
            id="bio"
            type="textarea"
            input={inputs.bio}
            value={bio}
            onChange={handleBio}
            className={css({
              background: `${localStorage.getItem("chat-main-bg")} !important`,
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
      </div>
    </div>
  );
}

export default ProfileInformationDialog;
