const {
  VITE_API_URL,
  // cookies
  VITE_USER_COOKIE,
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
  basicKeyCookie: VITE_BASIC_KEY,
  acceptCookie: VITE_ACCEPT_COOKIE,
  declineCookie: VITE_DECLINE_COOKIE,
};

export default config;
