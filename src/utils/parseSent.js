/**
 *
 * @param {number} sentDate
 */
export const parseSent = (sentDate) => {
  const now =
    localStorage.getItem("date") !== null
      ? new Date(Number(localStorage.getItem("date")))
      : new Date();
  const sentTDate = new Date(sentDate);

  let formattedDate;
  if (now.getDate() !== sentTDate.getDate()) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    formattedDate = sentTDate.toLocaleDateString("en-GB", options);
  } else {
    const options = { hour: "2-digit", minute: "2-digit" };
    formattedDate = sentTDate.toLocaleTimeString("en-GB", options);
  }

  return formattedDate;
};
