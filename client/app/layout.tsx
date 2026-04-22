import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/context/AuthContext";
import { AiTokenProvider } from "@/context/AiTokenContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "syntropy",
  description: "Test your exam preparation",
  icons: {
    icon: "/logo.png"
  },

  openGraph: {
    title: "syntropy",
    description: "Test your exam preparation",
    url: "https://syntropy-jet.vercel.app",
    siteName: "syntropy",
    images: [
      {
        url: "https://syntropy-jet.vercel.app/logo.png",
        width: 512,
        height: 512,
        alt: "syntropy logo",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "syntropy",
    description: "Test your exam preparation",
    images: ["https://syntropy-jet.vercel.app/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <AiTokenProvider>
            {children}
          </AiTokenProvider>
        </AuthProvider>
        <ToastContainer
          position="top-center"
          autoClose={2000}
          closeButton={false}
          hideProgressBar
          newestOnTop
        />
      </body>
    </html>
  );
}
