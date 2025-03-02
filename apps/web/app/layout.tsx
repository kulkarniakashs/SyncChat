import "./globals.css";
import "@repo/ui/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Provider from "./Provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SyncChat",
  description: "A real-time messaging platform with seamless group management, instant notifications, and secure authentication",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
     </Provider>
  );
}
