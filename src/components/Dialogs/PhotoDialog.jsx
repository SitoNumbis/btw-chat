import { memo, useMemo, useState, useEffect, useCallback } from "react";

import PropTypes from "prop-types";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// services
import { savePhoto as savePhotoRemote } from "../../services/auth";

// utils
import { logoutUser } from "../../utils/auth";
import { validation } from "../../utils/validation";

// styles
import styles from "./styles.module.css";
import colors from "../../assets/emotion/color";

// images
import noPhoto from "../../assets/images/no-photo.webp";

// contexts
import { useLanguage } from "../../context/LanguageProvider";
import { useNotification } from "../../context/NotificationProvider";

import config from "../../config";

// components
import Loading from "../Loading/Loading";

// heros
import herosJSON from "../../assets/images/heros.json";

function PhotoDialog({ visible, onClose }) {
  const [see, setSee] = useState(false);

  useEffect(() => {
    if (visible) setSee(true);
    else
      setTimeout(() => {
        setSee(false);
      }, 450);
  }, [visible]);

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

  const { whiteText, mainBG, otherBG } = colors();

  const [loading, setLoading] = useState(true);

  const { languageState } = useLanguage();

  const { buttonsArias, dialogs, errors } = useMemo(() => {
    return {
      inputs: languageState.texts.inputs,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
      dialogs: languageState.texts.dialogs,
      errors: languageState.texts.errors,
    };
  }, [languageState]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    setLoading(false);
  }, []);

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
      width: "70px",
      height: "70px",
      borderRadius: "100%",
    });
  }, []);

  const [photo, setPhoto] = useState("");

  const savePhoto = useCallback(
    async (base64) => {
      try {
        await savePhotoRemote(base64);
        localStorage.setItem(config.userPhotoCookie, base64);
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
    },
    [errors, showNotification]
  );

  const onFileLoad = useCallback(
    (elem) => {
      if (elem.target.files[0].size > 152880) {
        showNotification("error", errors.fileToBig);

        elem.target.value = "";
      } else {
        if (!elem.target.files || !elem.target.files[0]) return;

        const FR = new FileReader();

        FR.addEventListener("load", function (evt) {
          setPhoto(evt.target.result);
          savePhoto(evt.target.result);
        });

        FR.readAsDataURL(elem.target.files[0]);
      }
    },
    [errors, showNotification, savePhoto]
  );

  useEffect(() => {
    setPhoto(
      validation(config.userPhotoCookie)
        ? localStorage.getItem(config.userPhotoCookie)
        : noPhoto
    );
  }, []);

  const uploadImage = useCallback(() => {
    const inputs = document.getElementsByTagName("input");
    if (inputs && inputs !== null) {
      for (let index = 0; index < inputs.length; ++index) {
        if (inputs[index].type === "file") inputs[index].click();
      }
    }
  }, []);

  const { heros, athensGal } = useMemo(() => {
    const { heros, athensGal } = herosJSON;
    return { heros, athensGal };
  }, []);

  const selectPhoto = useCallback(
    async (url) => {
      try {
        await savePhotoRemote(url, true);
        localStorage.setItem(config.userPhotoCookie, url);
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
    },
    [errors, showNotification]
  );

  const printHeros = useCallback(() => {
    return Object.values(heros.heros).map((hero) => (
      <button
        key={hero.label}
        onClick={() => selectPhoto(hero.url)}
        className="flex flex-col items-center justify-center gap-2"
        aria-label={`${buttonsArias.select}-${hero.label}`}
      >
        <img
          className={imageEmotion}
          src={`${hero.url}?tr=w:100,h=100`}
          alt={hero.label}
        />
        <p className={whiteText}>{hero.label}</p>
      </button>
    ));
  }, [heros, buttonsArias, imageEmotion, whiteText, selectPhoto]);

  const printAthensGal = useCallback(() => {
    return Object.values(athensGal.heros).map((hero) => (
      <button
        key={hero.label}
        onClick={() => selectPhoto(hero.url)}
        className="flex flex-col items-center justify-center gap-2"
        aria-label={`${buttonsArias.select}-${hero.label}`}
      >
        <img
          className={imageEmotion}
          src={`${hero.url}?tr=w:100,h=100`}
          alt={hero.label}
        />
        <p className={whiteText}>{hero.label}</p>
      </button>
    ));
  }, [athensGal, buttonsArias, imageEmotion, whiteText, selectPhoto]);

  return see ? (
    <div
      className={`${visible ? "appear-small" : "disappear"} ${
        styles.dialogContainer
      } ${mainBG(99)}`}
    >
      <div
        className={`appear relative rounded-sm ${styles.dialog} ${containerEmotion}`}
      >
        <button
          onClick={handleClose}
          aria-label={buttonsArias.closeDialog}
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
          {dialogs.pickPhoto.title}
        </h2>
        <div className="flex flex-wrap gap-4">{printHeros()}</div>
        <div className="flex flex-wrap gap-4">{printAthensGal()}</div>
      </div>
    </div>
  ) : null;
}

PhotoDialog.propTypes = {
  visible: PropTypes.any,
  onClose: PropTypes.func,
};

const PhotoDialogMemo = memo(
  (props) => <PhotoDialog {...props} />,
  arePropsEqual
);

PhotoDialogMemo.displayName = "PhotoDialogDialog";

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.visible === newProps.visible &&
    oldProps.onClose === newProps.onClose
  );
}

export default PhotoDialog;
