import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "설스터디(SeolStudy) - 멘티",
    description: "학습 코칭 플랫폼 멘티용 모바일 앱",
    icons: {
        icon: "/seoul_logo.svg",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body>
                {children}
            </body>
        </html>
    );
}
