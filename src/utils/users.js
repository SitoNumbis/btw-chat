export const isSelf = (id) => {
  const localUser = localStorage.getItem("chat-user-id");
  if (localUser === id) return true;
  return false;
};
