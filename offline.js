(() => {
  if (!('serviceWorker' in navigator)) return;
  const nestedPage = /\/(?:twiceasclever|thatsprettyclever|clevercubed|euchre|pickleball)(?:\/index\.html|\/)$/
    .test(location.pathname);
  const workerUrl = new URL(nestedPage ? '../sw.js' : './sw.js', document.baseURI);
  navigator.serviceWorker.register(workerUrl, { scope: nestedPage ? '../' : './' }).catch(() => {});
})();
