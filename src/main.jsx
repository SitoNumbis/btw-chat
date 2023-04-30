import React from "react";
import ReactDOM from "react-dom/client";

import { LanguageProvider } from "./context/LanguageProvider";

// App
import App from "./App.jsx";

// styles
import "./index.css";
import "./assets/animations/appear.css";
import "./assets/animations/entrance.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
