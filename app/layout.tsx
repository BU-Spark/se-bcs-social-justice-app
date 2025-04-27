import { Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "./components/SidebarContext";
import Script from "next/script";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Social Justice Platform",
  description:
    "A platform for social justice initiatives and community building",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="beforeInteractive"
          />
        </head>
        <body className={roboto.className}>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <main className="flex-1">{children}</main>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
