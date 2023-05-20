import axios from "axios";
import { getAuth } from "../auth/auth";
import config from "../config";

// some-javascript-utils
import { getCookie } from "some-javascript-utils/browser";

import md5 from "md5";

/**
 *
 * @param {string} type
 * @returns
 */
export const validateBasicKey = async (type) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/auth/${type === "admin" ? "is-admin" : "validate"}`,
    {},
    {
      headers: {
        ...getAuth,
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
  const data = await response.data;
  if (data.data.user) return data.data.user;
  return false;
};

/**
 * Takes a user object and sends it to the backend to be authenticated
 * @param {string} user - the user name
 * @returns The response from the server.
 */
export const validateUser = async (user) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/auth/validate-user`,
    { user },
    {
      headers: getAuth,
    }
  );
  const data = await response.data;
  return data;
};

/**
 * Takes a user object and sends it to the backend to be authenticated
 * @param {string} user - the user name
 * @param {string} password - the user password
 * @returns The response from the server.
 */
export const login = async (user, password, remember) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/auth/login`,
    { user, password: md5(password), remember },
    {
      headers: getAuth,
    }
  );
  const data = await response.data;
  return data;
};

/**
 *
 * @param {string} user
 */
export const signOutUser = async (user) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/auth/sign-out`,
    { user },
    {
      headers: {
        ...getAuth,
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
  return await response.data;
};

/**
 * Sends a POST request to the API with the email address of the user who wants to reset their
 * password
 * @param {string} email - The email address of the user who wants to reset their password.
 * @returns The response from the server.
 */
export const passwordRecovery = async (email) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/user/password-reset`,
    { email },
    {
      headers: getAuth,
    }
  );
  return response;
};

/**
 * @param {string} lang - the user language
 * @returns The response from the server.
 */
export const createGuest = async (lang) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/auth/create-guest`,
    { lang },
    {
      headers: getAuth,
    }
  );
  const data = await response.data;
  return data;
};

/**
 * @param {string} name
 * @param {string} bio
 * @returns The response from the server.
 */
export const saveInfo = async (name, bio) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/auth/save-info`,
    { user: localStorage.getItem(config.userCookie), name, bio },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
  const data = await response.data;
  return data;
};

/**
 * @param {string} image
 * @returns The response from the server.
 */
export const savePhoto = async (image, character = false) => {
  const response = await axios.post(
    // @ts-ignore
    `${config.apiUrl}/image/upload`,
    { user: localStorage.getItem(config.userCookie), blob: image, character },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie(config.basicKeyCookie)}`,
      },
    }
  );
  const data = await response.data;
  return data;
};
