import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { detectLanguage, I18nProvider } from "@/i18n/i18n.tsx";

import styles from "@/styles.css?url";

export const Route = createRootRoute({
  beforeLoad: () => ({ language: detectLanguage() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "light dark" },
      { title: "kantonq" },
    ],
    links: [{ rel: "stylesheet", href: styles }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const { language } = Route.useRouteContext();
  return (
    <html lang={language}>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <I18nProvider language={language}>
          <Outlet />
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}
