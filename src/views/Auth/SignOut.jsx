import { useEffect } from "react";

// @emotion/css
import { css } from "@emotion/css";

// contexts
// import { useUser } from "../../contexts/UserProvider";

// utils
import { getUserName, logoutUser } from "../../utils/auth.js";

// services
import { signOutUser } from "../../services/auth.js";

// components
import Loading from "../../components/Loading/Loading";

export default function SignOut() {
  //   const { setUserState } = useUser();

  const logOut = async () => {
    try {
      await signOutUser(getUserName());
    } catch (err) {
      console.error(err);
    }
    logoutUser();
    // setUserState({ type: "logged-out" });
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  useEffect(() => {
    logOut();
  }, []);

  return (
    <div className="w-full h-screen">
      <Loading
        className={`w-full h-full items-center justify-center flex ${css({
          background: localStorage.getItem("chat-main-bg"),
        })}`}
      />
    </div>
  );
}
