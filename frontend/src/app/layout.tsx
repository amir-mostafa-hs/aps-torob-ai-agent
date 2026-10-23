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
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
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
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-[#0c1017] dark:text-[#f0f6fc] antialiased selection:bg-rose-500/20">
        {children}
      </body>
    </html>
  );
}
