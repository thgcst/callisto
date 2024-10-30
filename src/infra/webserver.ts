function getHost() {
  let url =
    process.env?.NEXT_PUBLIC_SITE_URL ??
    process.env?.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";

  url = url.includes("http") ? url : `https://${url}`;

  if (url.charAt(url.length - 1) === "/") {
    url = url.slice(0, -1);
  }

  return url;
}

export default Object.freeze({
  getHost,
});
