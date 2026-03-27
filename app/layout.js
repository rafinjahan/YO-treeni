import "./globals.css";

export const metadata = {
  title: "YO-Treeni | Älykäs Abitti-harjoittelu",
  description: "Harjoittele ylioppilaskokeisiin älykkäästi tekoälypalautteen avulla. Pitkä matematiikka, lyhyt matematiikka, fysiikka.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fi">
      <body className="antialiased selection:bg-blue-200 selection:text-blue-900 bg-slate-50 min-h-screen relative overflow-x-hidden text-slate-900">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
