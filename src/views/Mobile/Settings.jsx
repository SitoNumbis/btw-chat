import { useCallback, useMemo, useEffect, useState } from "react";
import loadable from "@loadable/component";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

// @emotion/css
import { css } from "@emotion/css";

// contexts
import { useUser } from "../../context/UserProvider";
import { useDialog } from "../../context/DialogProvider";
import { useLanguage } from "../../context/LanguageProvider";
import { useNotification } from "../../context/NotificationProvider";

// utils
import { logoutUser } from "../../utils/auth";

// services
import { savePhoto as savePhotoRemote } from "../../services/auth";

// images
import noPhoto from "../../assets/images/no-photo.webp";

// styles
import Colors from "../../assets/emotion/color";

// config
import config from "../../config";

// components
const Navbar = loadable(() => import("../../components/Main/Navbar/Navbar"));
const PhotoDialog = loadable(() =>
  import("../../components/Dialogs/PhotoDialog")
);
const ProfileInformationDialog = loadable(() =>
  import("../../components/Dialogs/ProfileInformationDialog")
);

function Settings() {
  const { userState, setUserState } = useUser();

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

  const { setDialogState } = useDialog();

  const { languageState } = useLanguage();

  const { buttons, buttonsArias, errors } = useMemo(() => {
    return {
      errors: languageState.texts.errors,
      buttons: languageState.texts.buttons,
      buttonsArias: languageState.texts.buttonsArias,
    };
  }, [languageState]);

  const handleEditing = useCallback(() => {
    setDialogState({ type: "set-value", key: "editing", value: 1 });
  }, [setDialogState]);

  const imageEmotion = useMemo(() => {
    return css({
      label: {
        display: "none !important",
      },
      width: "130px",
      height: "130px",
    });
  }, []);

  const cameraEmotion = useMemo(() => {
    return css({
      color: localStorage.getItem("chat-text-primary"),
      background: localStorage.getItem("chat-text-basic"),
      ":hover": {
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const editEmotion = useMemo(() => {
    return css({
      background: localStorage.getItem("chat-other-bg"),
      ":hover": {
        color: localStorage.getItem("chat-text-basic"),
        background: localStorage.getItem("chat-text-primary"),
      },
    });
  }, []);

  const printState = useMemo(() => {
    switch (userState.user) {
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
  }, [languageState, whiteText]);

  const uploadImage = useCallback(() => {
    const inputs = document.getElementsByTagName("input");
    if (inputs && inputs !== null) {
      for (let index = 0; index < inputs.length; ++index) {
        if (inputs[index].type === "file") inputs[index].click();
      }
    }
  }, []);

  const [photo, setPhoto] = useState("");

  const savePhoto = useCallback(
    async (base64) => {
      try {
        await savePhotoRemote(base64);
        setUserState({ type: "photo", photo: base64 });
        localStorage.setItem(config.userPhotoCookie, base64);
      } catch (err) {
        console.error(err);
        const { response } = err;
        if (response && response.status === 401) {
          logoutUser();
          setUserState({ type: "logout" });
        }
        if (String(err) === "AxiosError: Network Error")
          showNotification("error", errors.notConnected);
        else showNotification("error", String(err));
      }
    },
    [errors, showNotification, setUserState]
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
    setPhoto(userState.photo ? userState.photo : noPhoto);
  }, [userState]);

  const emotion = useMemo(() => {
    return css({
      backgroundColor: `${localStorage.getItem("chat-secondary-bg")}`,
    });
  }, []);

  const [showDialog, setShowDialog] = useState(false);

  const handleDialog = useCallback(() => {
    setShowDialog(!showDialog);
  }, [setShowDialog, showDialog]);

  const { dialogState } = useDialog();

  return (
    <div
      className={`w-full h-screen flex flex-col items-center justify-center ${emotion}`}
    >
      <Navbar />
      {dialogState.editing !== undefined ? (
        <ProfileInformationDialog editing={dialogState.editing} />
      ) : null}
      <PhotoDialog visible={showDialog} onClose={handleDialog} />
      <div className="entrance w-full h-full flex flex-col items-center justify-center gap-2">
        <div className={`relative ${imageEmotion} rounded-sm cursor-pointer`}>
          <input type="file" onChange={onFileLoad} />
          <img
            className={`w-full h-full cursor-pointer rounded-full`}
            src={photo}
          />
          <button
            onClick={handleDialog}
            className={`!cursor-pointer top-0 right-0 absolute text-2xl rounded-full w-10 h-10 main-transition-ease ${cameraEmotion}`}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
        </div>
        <div className="relative flex items-center gap-2 px-5">
          <h2 className={`text-center ${whiteText} text-2xl`}>
            {userState.name}
          </h2>
        </div>
        <div className="flex items-center gap-3">{printState}</div>
        <div className="flex items-center gap-3 px-5">
          <p className={`text-center ${whiteText}`}>{userState.bio}</p>
        </div>
        <button
          onClick={handleEditing}
          aria-label={buttonsArias.editProfile}
          className={`text-md rounded-sm py-2 px-5 main-transition-ease ${whiteText} ${editEmotion}`}
        >
          {buttons.editProfile}
        </button>
      </div>
    </div>
  );
}

export default Settings;
