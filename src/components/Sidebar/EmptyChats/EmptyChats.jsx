import { memo, useMemo } from "react";
import PropTypes from "prop-types";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faKeyboard } from "@fortawesome/free-solid-svg-icons";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

function EmptyChats({ searching }) {
  const { languageState } = useLanguage();

  const { sidebar } = useMemo(() => {
    return { sidebar: languageState.texts.sidebar };
  }, [languageState]);

  return (
    <div className={`appear ${styles.emptyChats}`}>
      <FontAwesomeIcon
        className="text-placeholder-dark text-3xl"
        icon={searching ? faKeyboard : faSearch}
      />
      <p className="italic font-semibold text-placeholder-dark">
        {!searching ? sidebar.goToSearch : sidebar.typeToSearch}
      </p>
    </div>
  );
}

EmptyChats.propTypes = {
  searching: PropTypes.bool,
};

export default EmptyChats;
