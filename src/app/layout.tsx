import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trello Clone : ドラッグアンドドロップの練習用アプリ created by @yujiteshima",
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
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen`}>
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center px-4 sm:px-6">
            <h1 className="text-xl font-bold">Trello Clone : ドラッグアンドドロップの練習用アプリ created by @yujiteshima</h1>
          </div>
        </header>
        <main className="container mx-auto py-6 px-4 sm:px-6">
          {children}
        </main>
        <footer className="mt-auto p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <div className="space-y-2">
            <p>© {new Date().getFullYear()} Trello Clone: ドラッグアンドドロップの練習用アプリ created by @yujiteshima</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              技術スタック: Next.js 15 | React 19 | TailwindCSS | TanStack Table | dnd-kit | Zustand
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
