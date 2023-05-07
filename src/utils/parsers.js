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
