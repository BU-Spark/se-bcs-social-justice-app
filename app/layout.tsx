import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";

const roboto = Roboto({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Justice App",
  description:
    "Community for underprivileged people to connect and share resources",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  try {
    const user = await checkUser();
    console.log(`user id is ${user?.clerkUserId}, email is: ${user?.email}`);
  } catch (error) {
    console.error("Error ensuring user exists:", error);
  }
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${roboto.className} bg-gray-100 text-gray-900`}>
          <main className="container mx-auto p-4">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}