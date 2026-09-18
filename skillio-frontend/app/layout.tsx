// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Skillio - Map Skills. Close Gaps.",
  description: "Skill mapping and gap analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <Suspense fallback={<Loading></Loading>}>{children}</Suspense>
      </body>
    </html>
  );
}
