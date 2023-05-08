/**
 *
 * @param {number} sentDate
 */
export const parseSent = (sentDate) => {
  const now = new Date();
  const subs =
    localStorage.getItem("date") !== null
      ? Number(localStorage.getItem("date")) - sentDate
      : now - sentDate;
  // checking minutes
  const minutes = Math.floor(subs / 1000 / 60);
  if (minutes < 60) return { count: minutes, type: "minutes" };

  // checking hours
  const hours = Math.floor(subs / 1000 / 60 / 60);
  if (hours < 24) return { count: hours, type: "hours" };
  // checking days
  const days = Math.floor(subs / 1000 / 60 / 60 / 24);
  if (days < 30) return { count: days, type: "days" };
  const theSentDate = new Date(sentDate);
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const formattedDate = theSentDate.toLocaleDateString("en-GB", options);
  return { result: formattedDate };
};

export const parseSentAsDate = (date, messageT) => {
  const { count, type, result } = parseSent(date);
  switch (type) {
    case "hours": {
      if (count === 1)
        return messageT.agoHour.replace("[result]", String(count));
      else return messageT.agoHours.replace("[result]", String(count));
    }
    case "minutes": {
      // minutes
      if (count === 0) return messageT.lessThanMin;
      else if (count === 1)
        return messageT.agoMin.replace("[result]", String(count));
      else return messageT.agoMins.replace("[result]", String(count));
    }
    case "days": {
      // days
      if (count === 0) return messageT.lessThanMin;
      else if (count === 1)
        return messageT.agoDay.replace("[result]", String(count));
      else return messageT.agoDays.replace("[result]", String(count));
    }
    default:
      return result;
  }
};
