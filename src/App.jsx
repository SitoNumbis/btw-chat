import { Suspense, useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import loadable from "@loadable/component";

import io from "socket.io-client";

import useScreenWidth from "use-screen-witdh";
// some-javascript-utils
import { getUserLanguage } from "some-javascript-utils/browser";

import config from "./config";

// services
import { validateBasicKey } from "./services/auth";

// contexts
import { useUser } from "./context/UserProvider";
import { useLanguage } from "./context/LanguageProvider";
import { DialogProvider } from "./context/DialogProvider";
import { CanGoBottomProvider } from "./context/CanGoBottomProvider.jsx";
import { MessagesOperationsProvider } from "./context/MessagesOperations";

// utils
import { logoutUser, userLogged, fromLocal } from "./utils/auth";
import Colors from "./assets/emotion/color";

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

// mobile
const UserList = loadable(() => import("./views/Mobile/UserList"));
const Settings = loadable(() => import("./views/Mobile/Settings"));
const ChatArea = loadable(() => import("./views/Mobile/ChatArea"));

function App() {
  const { mainBG } = Colors();

  const [socket, setSocket] = useState(null);

  const { userState, setUserState } = useUser();

  useEffect(() => {
    if (userState.user) {
      const newSocket = io(config.apiSocketUrl, { transports: ["polling"] });

      newSocket.on("connect", () => {
        console.info("connect", localStorage.getItem(config.userCookie));
        newSocket.emit("send-user-id", localStorage.getItem(config.userCookie));
      });
      newSocket.on("user-logged", (options) => {
        const { date } = options;
        localStorage.setItem("date", date);
      });
      newSocket.on("plus-minute", (date) => {
        localStorage.setItem("date", date);
      });

      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    }
  }, [userState]);

  const { setLanguageState } = useLanguage();

  const { width } = useScreenWidth();

  const fetch = useCallback(async () => {
    try {
      const value = await validateBasicKey();
      if (!value) {
        logoutUser();
        setUserState({ type: "logout" });
      } else setUserState({ type: "login", user: fromLocal() });
    } catch (err) {
      setUserState({ type: "login", user: fromLocal() });
      if (String(err) !== "AxiosError: Network Error") {
        /* logoutUser();
        setUserState({ type: "logout" }); */
      }
    }

    setLoading(false);
  }, [setUserState]);

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

      navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
        serviceWorkerRegistration.pushManager
          .subscribe({
            userVisibleOnly: true,
          })
          .then(function (subscription) {
            console.info("User is subscribed:", subscription);
            // Send the subscription data to your server
          })
          .catch(function (error) {
            console.error("Error subscribing to push notifications:", error);
          });
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
    localStorage.setItem("chat-main-bg", "#390535");
    localStorage.setItem("chat-secondary-bg", "#1b1b2b");
    localStorage.setItem("chat-other-bg", "#222222");
    localStorage.setItem("chat-text-primary", "#0A2C4B");
    localStorage.setItem("chat-text-basic", "#ffffff");

    if (userLogged()) fetch();
    else setLoading(false);

    askUserPermission();
    /* self.addEventListener("push", function (event) {
      if (event.data) {
        const data = event.data.json();
        self.registration.showNotification(data.title, {
          body: data.message,
          icon: "/path/to/icon.png",
        });
      }
    });

    self.addEventListener("notificationclick", function (event) {
      event.notification.close();
      event.waitUntil(
        clients.matchAll({ type: "window" }).then(function (clientList) {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === "/" && "focus" in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow("/");
          }
        })
      );
    }); */
  }, []);

  const routes = useCallback(() => {
    return !userState.user ? (
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
          <Route exact path="/reset-password" element={<ResetPassword />} />
          <Route exact path="/email-validation" element={<EmailValidation />} />
        </Route>
      </>
    ) : (
      <Route
        exact
        path="/"
        element={
          <Suspense>
            <DialogProvider>
              <CanGoBottomProvider>
                <MessagesOperationsProvider>
                  <Outlet />
                </MessagesOperationsProvider>
              </CanGoBottomProvider>
            </DialogProvider>
          </Suspense>
        }
      >
        {width > 850 ? (
          <>
            <Route index element={<Chat socket={socket} />} />
            <Route path="/*" element={<Chat socket={socket} />} />
          </>
        ) : (
          <Route index element={<UserList socket={socket} />} />
        )}
        {width < 850 ? (
          <>
            <Route
              exact
              path="/settings"
              element={<Settings socket={socket} />}
            />
            <Route exact path="/chat" element={<ChatArea socket={socket} />} />
          </>
        ) : null}
      </Route>
    );
  }, [userState, socket, width]);

  return (
    <Suspense>
      <NotificationC />
      {loading ? (
        <Loading
          noEntrance
          className={`w-full h-screen fixed left-0 top-0 z-20 flex items-center justify-center ${mainBG()}`}
        />
      ) : (
        ""
      )}
      <BrowserRouter>
        <Routes>
          {routes()}
          <Route exact path="/sign-out" element={<SignOut />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
