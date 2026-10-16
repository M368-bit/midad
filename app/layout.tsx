import type { Metadata, Viewport } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مداد | MIDAD — المنصة الإسلامية الموثقة للمعرفة والدروس والكتب والأحاديث",
  description:
    "منصة إسلامية معاصرة للمعرفة الشرعية الموثقة، تضم تراجم العلماء، والدروس المسندة، والمكتبة الإسلامية، وأحاديث صحيح البخاري ومسلم المحققة.",
  keywords: [
    "مداد",
    "MIDAD",
    "الحديث الشريف",
    "صحيح البخاري",
    "صحيح مسلم",
    "العلماء والدعاة",
    "المكتبة الإسلامية",
    "الدروس الإسلامية",
  ],
  authors: [{ name: "فريق منصة مداد" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#080c14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${amiri.variable} font-sans min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
