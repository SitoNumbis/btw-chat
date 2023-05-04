import { useEffect, useState, useCallback } from "react";
import { Base64 } from "js-base64";
import loadable from "@loadable/component";

// utils
import { loadImage } from "../../utils/services";

const Start = loadable(() => import("./SignUpSections/Start"));
const CreateAccount = loadable(() => import("./SignUpSections/CreateAccount"));
const CreateGuest = loadable(() => import("./SignUpSections/CreateGuest"));

Base64.extendString();

function SignIn() {
  const [imageBG, setImageBG] = useState(
    "https://ik.imagekit.io/lgqp0wffgtp/tr:q-1/Beyon_the_world/Chat/auth_vNlQJ5l45.webp?updatedAt=1683111316564"
  );

  useEffect(() => {
    loadImage(
      "https://ik.imagekit.io/lgqp0wffgtp/Beyon_the_world/Chat/auth_vNlQJ5l45.webp?updatedAt=1683111316564"
    )
      .then((base64) => {
        setImageBG(base64);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const [where, setWhere] = useState(0);

  const toCreateAccount = useCallback(() => {
    setWhere(1);
  }, [setWhere]);

  const toCreateGuest = useCallback(() => {
    console.log("hola");
    setWhere(2);
  }, [setWhere]);

  return (
    <div className="min-h-screen w-full">
      <img
        className="w-full h-full object-cover absolute top-0 left-0"
        src={imageBG}
        alt="space-wallpaper"
      />
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
