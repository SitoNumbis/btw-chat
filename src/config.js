const {
  VITE_API_URL,
  // cookies
  VITE_LANGUAGE,
  VITE_BASIC_KEY,
  VITE_APPS_KEY,
  VITE_ACCEPT_COOKIE,
  VITE_DECLINE_COOKIE,
} = import.meta.env;

const config = {
  apiUrl: VITE_API_URL,
  // cookie
  language: VITE_LANGUAGE,
  basicKeyCookie: VITE_BASIC_KEY,
  appsCookie: VITE_APPS_KEY,
  acceptCookie: VITE_ACCEPT_COOKIE,
  declineCookie: VITE_DECLINE_COOKIE,
};

export default config;
