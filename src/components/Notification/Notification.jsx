import  { useState, useEffect, useCallback } from "react";

// @fortawesome
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// @emotion/css
import { css } from "@emotion/css";

// react-cool-onclickoutside
import useOnclickOutside from "react-cool-onclickoutside";

// contexts
import { useNotification } from "../../context/NotificationProvider";

// styles
import "./styles.css";

export default function Notification() {
  const { notificationState } = useNotification();

  const [open, setOpen] = useState(false);
  const [openR, setOpenR] = useState(false);

  useEffect(() => {
    if (open) setOpenR(true);
    else
      setTimeout(() => {
        setOpenR(false);
      }, 400);
  }, [open]);

  useEffect(() => {
    setOpen(notificationState.visible);
    setTimeout(function () {
      setOpen(false);
    }, 6000);
  }, [notificationState]);

  const handleClose = () => setOpen(false);

  const ref = useOnclickOutside(() => {
    setOpen(false);
  });

  const getColor = useCallback(() => {
    switch (notificationState.type) {
      case "info":
        return "bg-info";
      case "warning":
        return "bg-warning";
      case "success":
        return "bg-success";
      default:
        return "bg-error";
    }
  }, [notificationState]);

  return (
    <div
      className={`fixed left-1 bottom-1 z-40 ${open ? "appear" : "disappear"}`}
    >
      {openR ? (
        <div
          ref={ref}
          className={`relative notification rounded-scard p-5 ${getColor()} ${css(
            {
              width: "300px",
              border: "1px solid #8080804a",
            }
          )}`}
        >
          <button onClick={handleClose} className="absolute top-1 right-2">
            <FontAwesomeIcon className="text-white" icon={faClose} />
          </button>
          <h4 className="text-body1 text-white">{notificationState.message}</h4>
        </div>
      ) : null}
    </div>
  );
}
