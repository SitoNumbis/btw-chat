// some-javascript-utils
import { getCookie } from "some-javascript-utils/browser";

import config from "../../config";

/**
 *
 * @param {object} message
 * @returns
 */
export const sendMessage = async (message) => {
  const response = await fetch(`${config.apiUrl}/send-message`, {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
    },
  });
  return response;
};

/**
 *
 * @param {string} target
 * @param {string} sender
 * @param {number} page
 * @param {number} counts
 * @returns
 */
export const fetchMessages = async (target, sender, page = 1, count = 20) => {
  const response = await fetch(`${config.apiUrl}/fetch-messages`, {
    method: "POST",
    body: JSON.stringify({ target, sender, page, count }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
    },
  });
  return response;
};

/**
 *
 * @param {String} user
 
 * @returns
 */
export const fetchChat = async (target, single) => {
  const response = await fetch(`${config.apiUrl}/fetch-chats`, {
    method: "POST",
    body: JSON.stringify({
      user: localStorage.getItem(config.userCookie),
      target,
      single,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
    },
  });
  return response;
};
