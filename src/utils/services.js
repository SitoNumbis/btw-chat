export async function loadImage(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
}

export const isMyReactAppActive = () => {
  const myAppIdentifier = "Chat Beyond the World";
  const isActiveTab = !document.hidden;
  const currentTitle = document.title;
  const currentMetaTags = Array.from(document.getElementsByTagName("meta")).map(
    (tag) => tag.getAttribute("name")
  );

  return (
    isActiveTab &&
    (currentTitle.includes(myAppIdentifier) ||
      currentMetaTags.includes(myAppIdentifier))
  );
};
