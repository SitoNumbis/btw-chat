import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import loadable from "@loadable/component";
import config from "./config";

// services
import { validateBasicKey } from "./services/auth";

// utils
import { logoutUser, userLogged } from "./utils/auth";

// components
const Notification = loadable(() =>
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

  useEffect(() => {
    localStorage.setItem("chat-main-bg", "#222333");
    localStorage.setItem("chat-secondary-bg", "#1b1b2b");
    localStorage.setItem("chat-other-bg", "#222222");
    localStorage.setItem("chat-text-primary", "#Fb2b2b");
    localStorage.setItem("chat-text-basic", "#ffffff");
    if (userLogged()) fetch();
    // else window.location.href = "/auth";
    setLoading(false);
  }, []);

  return (
    <Suspense>
      <Notification />
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
                <Route
                  exact
                  path="/sign-in-as-guest"
                  element={<SignUp />}
                />
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
              path="/"
              element={
                <Suspense>
                  <Chat />
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
