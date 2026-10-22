import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "دستیار هوشمند خرید حضوری ترب — تهران",
  description: "کشف مدل مناسب، مقایسه قیمت واقعی، یافتن فروشگاه‌های فیزیکی نزدیک در تهران، استعلام زنده موجودی و راهنمای داخل پاساژ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
