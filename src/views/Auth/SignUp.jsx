import { useMemo, useState, useCallback } from "react";
import { Base64 } from "js-base64";
import loadable from "@loadable/component";

// @emotion/css
import { css } from "@emotion/css";

const Start = loadable(() => import("./SignUpSections/Start"));
const CreateAccount = loadable(() => import("./SignUpSections/CreateAccount"));
const CreateGuest = loadable(() => import("./SignUpSections/CreateGuest"));

Base64.extendString();

function SignIn() {
  const [where, setWhere] = useState(0);

  const background = useMemo(() => {
    return css({ backgroundColor: localStorage.getItem("chat-other-bg") });
  }, []);

  const toCreateAccount = useCallback(() => {
    setWhere(1);
  }, [setWhere]);

  const toCreateGuest = useCallback(() => {
    setWhere(2);
  }, [setWhere]);

  return (
    <div className={`min-h-screen w-full ${background}`}>
      {where === 0 ? (
        <Start
          toCreateAccount={toCreateAccount}
          toCreateGuest={toCreateGuest}
        />
      ) : null}
      {where === 1 ? <CreateAccount /> : null}
      {where === 2 ? <CreateGuest /> : null}
    </div>
  );
}

export default SignIn;
