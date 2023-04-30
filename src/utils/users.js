export const isSelf = (name) => {
  const localUser = localStorage.getItem("chat-user-name");
  if (localUser === name) return true;
  return false;
};
