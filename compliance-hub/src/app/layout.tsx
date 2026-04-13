import type { Metadata } from "next";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Compliance & Governance Hub | Curated Cloud Security Resources",
  description:
    "A curated list of tools, frameworks, and resources for cloud compliance, security, and governance. Covers OPA, Checkov, Prowler, CIS Benchmarks, SOC 2, PCI DSS, NIST 800-53, FedRAMP, HIPAA, and more.",
  keywords: [
    "cloud compliance",
    "terraform security",
    "OPA",
    "Checkov",
    "CIS benchmarks",
    "NIST 800-53",
    "FedRAMP",
    "SOC 2",
    "CSPM",
    "IaC security",
    "policy as code",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
