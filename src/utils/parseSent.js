/**
 *
 * @param {number} sentDate
 */
export const parseSent = (sentDate) => {
  const now = new Date();
  const subs = now.getTime() - sentDate;
  // checking minutes
  const minutes = Math.floor(subs / 1000 / 60)
  if (minutes < 60) return { count: minutes, type: "minutes" };

  // checking hours
  const hours = Math.floor(subs / 1000 / 60);
  if (hours < 24) return { count: hours, type: "hours" };
  // checking days
};
