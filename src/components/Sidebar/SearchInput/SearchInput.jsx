import { memo } from "react";
import PropTypes from "prop-types";
import loadable from "@loadable/component";

// @emotion/css
import { css } from "@emotion/css";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Input = loadable(() => import("../../Inputs/Input"));

function SearchInput({ value, onChange, input }) {
  return (
    <div className="appear">
      <Input
        id="search-user"
        type="search"
        leftIcon={
          <button className={css({ marginLeft: "10px" })}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        }
        input={input}
        value={value}
        onChange={onChange}
        className={`!rounded-none ${css({
          height: "45px",
          color: localStorage.getItem("chat-text-basic"),
          background: localStorage.getItem("chat-main-bg"),
          paddingLeft: "45px !important",
        })}`}
      />
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  input: PropTypes.shape({
    label: PropTypes.string,
    placeholder: PropTypes.string,
  }),
};

const SearchInputMemo = memo(
  (props) => <SearchInput {...props} />,
  arePropsEqual
);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.value === newProps.value &&
    oldProps.onChange === newProps.onChange &&
    oldProps.input === newProps.input
  );
}

SearchInputMemo.displayName = "SearchInput";

export default SearchInputMemo;
