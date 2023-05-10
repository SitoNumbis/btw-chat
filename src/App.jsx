import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import loadable from "@loadable/component";



// some-javascript-utils
import { getUserLanguage } from "some-javascript-utils/browser";

import config from "./config";

// services
import { validateBasicKey } from "./services/auth";

// contexts
import { useLanguage } from "./context/LanguageProvider";
import { DialogProvider } from "./context/DialogProvider";

// utils
import { logoutUser, userLogged } from "./utils/auth";

// components
import Loading from "./components/Loading/Loading";
const NotificationC = loadable(() =>
  import("./components/Notification/Notification")
);

// layouts
const Auth = loadable(() => import("./layouts/Auth/Auth"));

const NotFound = loadable(() => import("./views/NotFound/NotFound"));
// views
const Chat = loadable(() => import("./views/Chat/Chat"));
const SignIn = loadable(() => import("./views/Auth/SignIn"));
const SignUp = loadable(() => import("./views/Auth/SignUp"));
const SignOut = loadable(() => import("./views/Auth/SignOut"));
const ResetPassword = loadable(() => import("./views/Auth/ResetPassword"));
const EmailValidation = loadable(() => import("./views/Auth/EmailValidation"));

function App() {
  const { setLanguageState } = useLanguage();

  const fetch = async () => {
    try {
      const value = await validateBasicKey();
      if (!value) {
        logoutUser();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else localStorage.setItem(config.userCookie, value);
    } catch (err) {
      if (String(err) !== "AxiosError: Network Error") {
        logoutUser();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  };

  const [loading, setLoading] = useState(true);

  /**
   * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
   */
  async function askUserPermission() {
    if ("Notification" in window) {
      Notification.requestPermission()
        .then(function (permission) {
          if (permission === "granted") {
            // User has granted permission to show notifications
          }
        })
        .catch(function (error) {
          console.error(
            "Error requesting permission for notifications:",
            error
          );
        });
    } else {
      console.error("Notifications are not supported in this browser.");
    }
  }

  useEffect(() => {
    try {
      setLanguageState({ type: "set", lang: getUserLanguage(config.language) });
    } catch (err) {
      console.error(err);
    }
    localStorage.setItem("chat-main-bg", "#222333");
    localStorage.setItem("chat-secondary-bg", "#1b1b2b");
    localStorage.setItem("chat-other-bg", "#222222");
    localStorage.setItem("chat-text-primary", "#Fb2b2b");
    localStorage.setItem("chat-text-basic", "#ffffff");
    if (userLogged()) fetch();
    // else window.location.href = "/auth";
    setLoading(false);

    askUserPermission();
  }, []);

  return (
    <Suspense>
      <NotificationC />

      <BrowserRouter>
        <Routes>
          {localStorage.getItem(config.userCookie) === null ? (
            <>
              <Route
                exact
                path="/"
                element={
                  <Suspense>
                    <Auth />
                  </Suspense>
                }
              >
                <Route index element={<SignIn />} />
                <Route exact path="/sign-up" element={<SignUp />} />
                <Route exact path="/sign-in-as-guest" element={<SignUp />} />
                <Route
                  exact
                  path="/reset-password"
                  element={<ResetPassword />}
                />
                <Route
                  exact
                  path="/email-validation"
                  element={<EmailValidation />}
                />
              </Route>
            </>
          ) : (
            <Route
              exact
              path="/*"
              element={
                <Suspense>
                  <DialogProvider>
                    <Chat />
                  </DialogProvider>
                </Suspense>
              }
            />
          )}
          <Route exact path="/sign-out" element={<SignOut />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
