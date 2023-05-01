import { memo, useMemo } from "react";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsersSlash } from "@fortawesome/free-solid-svg-icons";

// contexts
import { useLanguage } from "../../../context/LanguageProvider";

// styles
import styles from "./styles.module.css";

function Empty() {
  const { languageState } = useLanguage();

  const { sidebar } = useMemo(() => {
    return { sidebar: languageState.texts.sidebar };
  }, [languageState]);

  return (
    <div className={`appear ${styles.emptyChats} flex-col`}>
      <FontAwesomeIcon
        className="text-placeholder-dark text-3xl"
        icon={faUsersSlash}
      />
      <p className="italic font-semibold text-placeholder-dark">
        {sidebar.empty}
      </p>
    </div>
  );
}

const EmptyMemo = memo((props) => <Empty {...props} />);

EmptyMemo.displayName = "Empty";

export default EmptyMemo;
