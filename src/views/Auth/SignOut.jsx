import { useEffect, useMemo } from "react";

// @emotion/css
import { css } from "@emotion/css";

// contexts
// import { useUser } from "../../contexts/UserProvider";

// utils
import { getUserName, logoutUser } from "../../utils/auth.js";

// services
import { signOutUser } from "../../services/auth.js";

// styles
import Colors from "../../assets/emotion/color.js";

// components
import Loading from "../../components/Loading/Loading";

export default function SignOut() {
  const { mainBG } = Colors();

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

  const background = useMemo(() => {
    return css({ backgroundColor: localStorage.getItem("chat-other-bg") });
  }, []);

  return (
    <div className={`w-full h-screen ${background}`}>
      <Loading
        className={`w-full h-full items-center justify-center flex ${mainBG}`}
      />
    </div>
  );
}
