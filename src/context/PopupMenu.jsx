/* eslint-disable react/function-component-definition */
/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useReducer, useContext } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

const PopupContext = createContext();

const popupReducer = (popupState, action) => {
  const { type } = action;
  switch (type) {
    case "open": {
      const { event, sender } = action;

      return { event, sender };
    }
    case "close": {
      return {};
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const PopupProvider = ({ children }) => {
  const [popupState, setPopupState] = useReducer(popupReducer, {});

  const value = { popupState, setPopupState };
  return (
    <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
  );
};

PopupProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// hooks
const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined)
    throw new Error("popupContext must be used within a Provider");
  return context;
};

export { PopupProvider, usePopup };
