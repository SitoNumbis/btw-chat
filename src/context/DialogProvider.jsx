/* eslint-disable react/function-component-definition */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext, useReducer, useContext } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

const DialogContext = createContext();

const dialogReducer = (dialogState, action) => {
  const { type } = action;
  switch (type) {
    case "set-value": {
      const { key, value } = action;
      dialogState[key] = value;

      return { ...dialogState };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const DialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useReducer(dialogReducer, {});

  const value = { dialogState, setDialogState };
  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
};

DialogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// hooks
const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined)
    throw new Error("dialogContext must be used within a Provider");
  return context;
};

export { DialogProvider, useDialog };
