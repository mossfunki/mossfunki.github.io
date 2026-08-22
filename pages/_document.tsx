import { Html, Head, Main, NextScript } from 'next/document';

const THEME_INIT = `
(function () {
  try {
    var stored = window.localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored ? stored === 'dark' : prefersDark;
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#1b1d1f" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
