/* eslint-disable react/function-component-definition */
/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useReducer, useContext } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

const MessagesOperationsContext = createContext();

const messagesOperationsReducer = (messagesOperationsState, action) => {
  const { type } = action;
  switch (type) {
    case "reply": {
      const { message } = action;
      return { message, event: "reply" };
    }
    case "forward": {
      const { message } = action;
      return { message, event: "forward" };
    }
    case "delete": {
      const { id, sender } = action;
      return { id, sender, event: "delete" };
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const MessagesOperationsProvider = ({ children }) => {
  const [messagesOperationsState, setMessagesOperationsState] = useReducer(
    messagesOperationsReducer,
    {}
  );

  const value = { messagesOperationsState, setMessagesOperationsState };
  return (
    <MessagesOperationsContext.Provider value={value}>
      {children}
    </MessagesOperationsContext.Provider>
  );
};

MessagesOperationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// hooks
const useMessagesOperations = () => {
  const context = useContext(MessagesOperationsContext);
  if (context === undefined)
    throw new Error("messagesOperationsContext must be used within a Provider");
  return context;
};

export { MessagesOperationsProvider, useMessagesOperations };
