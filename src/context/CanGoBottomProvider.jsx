/* eslint-disable react/function-component-definition */
/* eslint-disable react/jsx-no-constructed-context-values */
import { createContext, useState, useContext } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

const CanGoBottomContext = createContext();

const CanGoBottomProvider = ({ children }) => {
  const [canGoBottomState, setCanGoBottomState] = useState(false);

  const value = { canGoBottomState, setCanGoBottomState };
  return (
    <CanGoBottomContext.Provider value={value}>
      {children}
    </CanGoBottomContext.Provider>
  );
};

CanGoBottomProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// hooks
const useCanGoBottom = () => {
  const context = useContext(CanGoBottomContext);
  if (context === undefined)
    throw new Error("canGoContext must be used within a Provider");
  return context;
};

export { CanGoBottomProvider, useCanGoBottom };
