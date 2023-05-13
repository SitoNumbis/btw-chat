export const validation = (string, value = undefined) => {
  if (
    localStorage.getItem(string) !== undefined &&
    localStorage.getItem(string) !== "undefined" &&
    localStorage.getItem(string) !== null
  ) {
    if (
      value === undefined ||
      (value !== undefined && localStorage.getItem(string) === value)
    )
      return true;
    return false;
  }
  return false;
};
