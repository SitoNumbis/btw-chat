import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import loadable from "@loadable/component";

// components
const Notification = loadable(() =>
  import("./components/Notification/Notification")
);

// layouts
const Auth = loadable(() => import("./layouts/Auth/Auth"));

// views
const Chat = loadable(() => import("./views/Chat/Chat"));
const SignIn = loadable(() => import("./views/Auth/SignIn"));
const SignUp = loadable(() => import("./views/Auth/SignUp"));
const ResetPassword = loadable(() => import("./views/Auth/ResetPassword"));
const EmailValidation = loadable(() => import("./views/Auth/EmailValidation"));

function App() {
  useEffect(() => {
    localStorage.setItem("chat-user-name", "Sito");
    localStorage.setItem("chat-main-bg", "#222333");
    localStorage.setItem("chat-secondary-bg", "#1b1b2b");
    localStorage.setItem("chat-other-bg", "#222222");
    localStorage.setItem("chat-text-primary", "#Fb2b2b");
    localStorage.setItem("chat-text-basic", "#ffffff");
  }, []);

  return (
    <Suspense>
      <Notification />
      <BrowserRouter>
        <Routes>
          <Route
            exact
            path="/"
            element={
              <Suspense>
                <Chat />
              </Suspense>
            }
          />
          <Route
            exact
            path="/auth"
            element={
              <Suspense>
                <Auth />
              </Suspense>
            }
          >
            <Route index element={<SignIn />} />
            <Route exact path="/auth/sign-up" element={<SignUp />} />
            <Route
              exact
              path="/auth/reset-password"
              element={<ResetPassword />}
            />
            <Route
              exact
              path="/auth/email-validation"
              element={<EmailValidation />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
