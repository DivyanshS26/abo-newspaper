// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import { Merriweather, Work_Sans } from "next/font/google";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", weight: ["300","400","500","600","700"] });
const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-merriweather", weight: ["300","400","700","900"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="light">
        <head>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />
        </head>

        <body className={`${workSans.variable} ${merriweather.variable}`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
