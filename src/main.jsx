import ReactDOM from "react-dom/client";

import { UserProvider } from "./context/UserProvider";
import { LanguageProvider } from "./context/LanguageProvider";
import { NotificationProvider } from "./context/NotificationProvider";

// font
import "@fontsource/roboto";
import "@fontsource/poppins";
import "@fontsource/bebas-neue";

// App
import App from "./App.jsx";

// styles
import "./index.css";
import "./assets/animations/kerbuns.css";
import "./assets/animations/spin.css";
import "./assets/animations/appear.css";
import "./assets/animations/entrance.css";
import "./assets/animations/expand.css";
import "./assets/animations/agrow.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <LanguageProvider>
    <NotificationProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </NotificationProvider>
  </LanguageProvider>
);
