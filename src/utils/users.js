import config from "../config";

export const isSelf = (id) => {
  const localUser = localStorage.getItem(config.userCookie);
  if (localUser === id) return true;
  return false;
};
