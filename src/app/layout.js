import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata = {
  title: "Receipt Gobbler",
  description: "URL Receipt Analysis Automation Services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <AuthProvider>
        <body className="antialiased bg-gradient-to-br from-background to-background/95 min-h-screen">
          <div className="flex min-h-screen flex-col">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            {children}
          </div>
        </body>
      </AuthProvider>
    </html>
  );
}
