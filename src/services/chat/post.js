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
