import ReactDOM from "react-dom/client";

import { LanguageProvider } from "./context/LanguageProvider";
import { NotificationProvider } from "./context/NotificationProvider";

// font
import "@fontsource/roboto";
import "@fontsource/poppins";

// App
import App from "./App.jsx";

// styles
import "./index.css";
import "./assets/animations/spin.css";
import "./assets/animations/appear.css";
import "./assets/animations/entrance.css";
import "./assets/animations/expand.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </LanguageProvider>
);
