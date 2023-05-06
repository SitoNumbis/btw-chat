import { memo } from "react";
import PropTypes from "prop-types";

// @emotion/css
import { css } from "@emotion/css";

import "./styles.css";

function Input({
  input,
  value,
  onChange,
  id,
  type,
  leftIcon,
  rightIcon,
  helperText,
  className,
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      {input.label && input.label.length ? (
        <label
          className={`${css({
            color: localStorage.getItem("chat-text-basic"),
          })}`}
          htmlFor={id}
        >
          {input.label}
        </label>
      ) : null}
      <div
        className={`relative w-full ${css({
          ":hover": {
            ".simple-input-left-icon": {
              color: localStorage.getItem("chat-text-primary"),
            },
            ".simple-input-right-icon": {
              color: localStorage.getItem("chat-text-primary"),
            },
          },
        })}`}
      >
        {input?.type === "textarea" || type === "textarea" ? (
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            type={type ? type : input.type}
            placeholder={input.placeholder}
            className={`simple-input w-full ${css({
              resize: "none",
              height: "150px",
              paddingLeft: leftIcon ? "30px" : "20px",
              paddingRight: rightIcon ? "30px" : "20px",
              color: localStorage.getItem("chat-text-basic"),
              background: `${localStorage.getItem("chat-other-bg")}AA`,
              ":focus": {
                borderColor: localStorage.getItem("chat-text-primary"),
                boxShadow: `0px 0px 0 2px ${localStorage.getItem(
                  "chat-text-primary"
                )}`,
                outline: "0 none",
              },
              ":focus - .simple-input-left-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
              ":focus - .simple-input-right-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
              ":focus + .simple-input-left-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
              ":focus + .simple-input-right-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
            })} ${className}`}
          />
        ) : (
          <input
            id={id}
            value={value}
            onChange={onChange}
            type={type ? type : input.type}
            placeholder={input.placeholder}
            className={`simple-input w-full ${css({
              paddingLeft: leftIcon ? "30px" : "20px",
              paddingRight: rightIcon ? "30px" : "20px",
              color: localStorage.getItem("chat-text-basic"),
              background: `${localStorage.getItem("chat-other-bg")}AA`,
              ":focus": {
                borderColor: localStorage.getItem("chat-text-primary"),
                boxShadow: `0px 0px 0 2px ${localStorage.getItem(
                  "chat-text-primary"
                )}`,
                outline: "0 none",
              },
              ":focus - .simple-input-left-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
              ":focus - .simple-input-right-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
              ":focus + .simple-input-left-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
              ":focus + .simple-input-right-icon": {
                color: `${localStorage.getItem(
                  "chat-text-primary"
                )} !important`,
              },
            })} ${className}`}
          />
        )}
        {leftIcon ? (
          <div
            className={`simple-input-left-icon ${css({
              transition: "all 500ms ease",
              color: `${localStorage.getItem("chat-text-primary")}88`,
            })}`}
          >
            {leftIcon}
          </div>
        ) : null}
        {rightIcon ? (
          <div
            className={`simple-input-right-icon ${css({
              transition: "all 500ms ease",
              color: `${localStorage.getItem("chat-text-primary")}88`,
            })}`}
          >
            {rightIcon}
          </div>
        ) : null}
      </div>
      {helperText && helperText.length ? (
        <p className="appear bg-error text-white rounded-2xl px-3 py-1">
          {helperText}
        </p>
      ) : (
        <div className=""></div>
      )}
    </div>
  );
}

Input.propTypes = {
  id: PropTypes.string,
  input: PropTypes.shape({
    label: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
  }),
  type: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  leftIcon: PropTypes.any,
  rightIcon: PropTypes.any,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

const InputMemo = memo((props) => <Input {...props} />, arePropsEqual);

function arePropsEqual(oldProps, newProps) {
  return (
    oldProps.id === newProps.id &&
    oldProps.type === newProps.type &&
    oldProps.input === newProps.input &&
    oldProps.value === newProps.value &&
    oldProps.onChange === newProps.onChange &&
    oldProps.leftIcon === newProps.leftIcon &&
    oldProps.rightIcon === newProps.rightIcon &&
    oldProps.helperText === newProps.helperText &&
    oldProps.className === newProps.className
  );
}

InputMemo.displayName = "Input";

export default InputMemo;
