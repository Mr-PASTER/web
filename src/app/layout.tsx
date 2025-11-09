import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "PASTER ECO SYSTEM",
  description: "PASTER ECO SYSTEM Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
