import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feria UPDS",
  description: "Explora tu cerebro a través de 4 juegos",
  other: {
    "google-fonts": "Google Sans",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;450;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
