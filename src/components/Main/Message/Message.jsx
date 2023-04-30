import React, { memo, useCallback, useState, useMemo } from "react";
import PropTypes from "prop-types";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// images
import noPhoto from "../../../assets/images/no-photo.webp";

// utils
import { parseSent } from "../../../utils/parseSent";
import { isSelf } from "../../../utils/users";

// styles
import styles from "./styles.module.css";

function Message({ date, sender, message }) {
  const { languageState } = useLanguage();

  const { messageT } = useMemo(() => {
    return { messageT: languageState.texts.main.message };
  }, [languageState]);

  const sent = useCallback(() => {
    console.log(date);
    console.log(new Date().getTime());
    if (date) {
      const { count, type } = parseSent(date);
      console.log(count);
      switch (type) {
        case "hours": {
          if (count === 1)
            return messageT.agoHour.replace("[result]", String(count));
          else return messageT.agoHours.replace("[result]", String(count));
        }
        default: {
          // minutes
          if (count === 0) return messageT.lessThanMin;
          else if (count === 1)
            return messageT.agoMin.replace("[result]", String(count));
          else return messageT.agoMins.replace("[result]", String(count));
        }
      }
    }
  }, [date, messageT]);

  const user = useCallback(() => {
    if (sender !== null && sender) return isSelf(sender.name);
  }, [sender]);

  return (
    <div className={`w-full flex ${user() ? "justify-end" : "justify-start"}`}>
      <div className="appear flex flex-col gap-2">
        <div className="flex items-end justify-start gap-2">
          <p className={styles.message}>{message}</p>
          <img
            className="w-10 h-10 rounded-full cursor-pointer"
            src={
              sender !== null && sender && sender.photo ? sender.photo : noPhoto
            }
            alt={sender !== null && sender ? sender.name : ""}
          />
        </div>
        <span className="italic text-placeholder-dark text-sm ml-5">
          {sent()}
        </span>
      </div>
    </div>
  );
}

Message.propTypes = {
  date: PropTypes.number,
  sender: PropTypes.object,
  message: PropTypes.string,
};

export default Message;
