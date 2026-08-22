import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: "MAILOPS AI — AI-Powered Email Automation",
  description:
    "Automate email processing with AI intent detection, specialized handlers, confidence-based routing, and complete audit trails.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
