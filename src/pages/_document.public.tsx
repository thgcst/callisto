import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-gray-100">
      <Head>
        <meta name="theme-color" content={"rgb(31, 41, 55)"} />
      </Head>
      <body className="h-full antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
