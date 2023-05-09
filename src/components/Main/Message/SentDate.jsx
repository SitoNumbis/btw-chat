import { memo, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// utils
import { isSelf } from "../../../utils/users";
import { parseSent } from "../../../utils/parseSent";

function SentDate({ join, date, loading, error, onRetry, sender }) {
  const { languageState } = useLanguage();

  const { errors } = useMemo(() => {
    return {
      errors: languageState.texts.errors,
    };
  }, [languageState]);

  const sent = useCallback(() => {
    if (date) return parseSent(date);
  }, [date]);

  const onLocalRetry = useCallback(() => {
    return onRetry(date);
  }, [onRetry, date]);

  const user = useCallback(() => {
    if (sender !== null && sender) return isSelf(sender.user);
  }, [sender]);

  return (
    <div className={user() ? "mr-8" : "ml-8"}>
      {!loading ? (
        <>
          {!join && !error ? (
            <span className="italic text-placeholder-dark text-sm">
              {sent()}
            </span>
          ) : null}
          {error ? (
            <button
              onClick={onLocalRetry}
              className="italic text-l-error text-sm"
            >
              {errors.notSent}
              <FontAwesomeIcon className="ml-2" icon={faRotateLeft} />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

SentDate.propTypes = {
  join: PropTypes.bool,
  date: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  onRetry: PropTypes.func,
  sender: PropTypes.object,
};

const SentDateMemo = memo((props) => <SentDate {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.join === newProps.join &&
    oldProps.date === newProps.date &&
    oldProps.loading === newProps.loading &&
    oldProps.error === newProps.error &&
    oldProps.onRetry === newProps.onRetry &&
    oldProps.sender === newProps.sender
  );
}

SentDateMemo.displayName = "SentDate";

export default SentDateMemo;
