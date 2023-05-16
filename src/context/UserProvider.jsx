/* eslint-disable react/function-component-definition */
/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useReducer, useContext } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

const UserContext = createContext();

const userReducer = (userState, action) => {
  switch (action.type) {
    case "photo": {
      const { photo } = action;
      return { ...userState, photo };
    }
    case "login": {
      const { user } = action;
      return { ...user };
    }
    case "logout":
      return {};

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const UserProvider = ({ children }) => {
  const [userState, setUserState] = useReducer(userReducer, {});

  const value = { userState, setUserState };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// hooks
const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined)
    throw new Error("userContext must be used within a Provider");
  return context;
};

export { UserProvider, useUser };
