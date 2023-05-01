import config from "../../config";

/**
 *
 * @param {object} message
 * @returns
 */
export const sendMessage = async (message) => {
  const response = await fetch("http://localhost:3000/send-message", {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};

/**
 *
 * @param {String} user
 
 * @returns
 */
export const fetchChat = async (target) => {
  const response = await fetch("http://localhost:3000/fetch-chats", {
    method: "POST",
    body: JSON.stringify({
      user: localStorage.getItem(config.userIdCookie),
      target,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};
