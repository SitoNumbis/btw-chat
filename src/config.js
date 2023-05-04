const {
  VITE_API_URL,
  // cookies
  VITE_USER_COOKIE,
  VITE_USER_STATE_COOKIE,
  VITE_USER_ID_COOKIE,
  VITE_USER_NAME_COOKIE,
  VITE_USER_PHOTO_COOKIE,
  VITE_USER_BIO_COOKIE,
  // general
  VITE_LANGUAGE,
  VITE_BASIC_KEY,
  VITE_ACCEPT_COOKIE,
  VITE_DECLINE_COOKIE,
} = import.meta.env;

const config = {
  apiUrl: VITE_API_URL,
  // cookie
  language: VITE_LANGUAGE,
  userCookie: VITE_USER_COOKIE,
  userStateCookie: VITE_USER_STATE_COOKIE,
  userIdCookie: VITE_USER_ID_COOKIE,
  userNameCookie: VITE_USER_NAME_COOKIE,
  userPhotoCookie: VITE_USER_PHOTO_COOKIE,
  userBioCookie: VITE_USER_BIO_COOKIE,
  // general
  basicKeyCookie: VITE_BASIC_KEY,
  acceptCookie: VITE_ACCEPT_COOKIE,
  declineCookie: VITE_DECLINE_COOKIE,
};

export default config;
