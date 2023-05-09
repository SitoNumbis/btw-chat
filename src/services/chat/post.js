import axios from "axios";

// some-javascript-utils
import { getCookie } from "some-javascript-utils/browser";

import config from "../../config";

/**
 *
 * @param {string} target
 * @param {object} sender
 * @param {string} message
 * @returns
 */
export const sendMessage = async (target, sender, message) => {
  const response = await axios.post(
    `${config.apiUrl}/send-message`,
    {
      target,
      sender,
      message,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
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
  const response = await axios.post(
    `${config.apiUrl}/fetch-messages`,
    { target, sender, page, count },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
  return response;
};

/**
 *
 * @param {String} user
 
 * @returns
 */
export const fetchChat = async (target, single) => {
  const response = await axios.post(
    `${config.apiUrl}/fetch-chats`,
    {
      user: localStorage.getItem(config.userCookie),
      target,
      single,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
  return response;
};
