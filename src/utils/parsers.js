import CryptoJS from "crypto-js";

/**
 *
 * @param {string} queries
 */
export const parseQueries = (queries) => {
  const toReturn = {};
  const queryParams = queries.substring(1).split("&");
  queryParams.forEach((item) => {
    const [param, value] = item.split("=");
    toReturn[param] = value;
  });
  return toReturn;
};

export const parseChats = (encrypted) => {
  const list = encrypted.map((remoteItem) => {
    const parsedItem = { ...remoteItem };
    const { key, lastMessage, photo, user } = parsedItem;
    if (photo) localStorage.setItem(`${user}photo`, photo);
    if (lastMessage) {
      const parsedMessage = CryptoJS.AES.decrypt(lastMessage, key).toString(
        CryptoJS.enc.Utf8
      );
      parsedItem.lastMessage = JSON.parse(parsedMessage);
    }
    return parsedItem;
  });
  return list;
};

export const parseMessages = (messages, key) => {
  const list = messages.map((message) => {
    const parsedMessage = CryptoJS.AES.decrypt(message, key).toString(
      CryptoJS.enc.Utf8
    );
    return JSON.parse(parsedMessage);
  });
  return list;
};

/**
 *
 * @param {string} url
 */
export const parseImageKit = (url, quality = "80", width = "", height = "") => {
  const slashSplitter = url.split("/");
  let result = `${slashSplitter[0]}//${slashSplitter[2]}/${
    slashSplitter[3]
  }/tr:q-${quality}${width.length ? `,w-${width}` : ""}${
    height.length ? `,h-${height}` : ""
  }`;
  for (let i = 4; i < slashSplitter.length; i += 1)
    result += `/${slashSplitter[i]}`;
  return result;
};

export const encryptMessage = (message, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(message), key).toString();
};

export const decryptMessage = (lastMessage, key) =>
  CryptoJS.AES.decrypt(lastMessage, key).toString(CryptoJS.enc.Utf8);
