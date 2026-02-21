import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

export const metadata: Metadata = {
  title: "Bitcoin Tax Calculator",
  description: "Calculate Bitcoin capital gains for NZ IRD using WAC method",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          <nav className="bg-gray-950 text-white shadow-lg border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold">
                    Bitcoin Tax Calculator
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/"
                    className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tax-year"
                    className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Tax Year
                  </Link>
                  <Link
                    href="/import"
                    className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Import
                  </Link>
                  <Link
                    href="/transactions"
                    className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Transactions
                  </Link>
                  <Link
                    href="/calculations"
                    className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Calculations
                  </Link>
                  <Link
                    href="/report"
                    className="hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Report
                  </Link>
                  <div className="border-l border-gray-700 h-6 mx-1"></div>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="bg-gray-950 text-gray-400 py-4 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
              Bitcoin Tax Calculator - NZ IRD WAC Method
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
