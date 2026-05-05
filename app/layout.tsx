import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Layali Hotel — فندق ليالي",
  description: "Book your stay at Layali Hotel — احجز إقامتك في فندق ليالي",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <BookingProvider>{children}</BookingProvider>
      </body>
    </html>
  );
}
