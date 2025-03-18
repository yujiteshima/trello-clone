import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trello Clone",
  description: "A Trello clone app built with Next.js and TanStack Table",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-4 sm:px-6">
            <h1 className="text-xl font-bold">Trello Clone</h1>
          </div>
        </header>
        <main className="container mx-auto py-6 px-4 sm:px-6">
          {children}
        </main>
        <footer className="mt-auto p-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Trello Clone</p>
        </footer>
      </body>
    </html>
  );
}
