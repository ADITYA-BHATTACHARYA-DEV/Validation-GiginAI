import { LayoutDashboard, UploadCloud, UserSearch } from "lucide-react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecruitAI Auditor",
  description: "Next-gen AI Resume Verification",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Upload Resume", href: "/upload", icon: <UploadCloud size={20} /> },
    { name: "Candidate Search", href: "/", icon: <UserSearch size={20} /> },
  ];

  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen bg-gray-50`}>
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 text-xl font-bold text-blue-600">RecruitAI</div>
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100 text-gray-400 text-sm">v1.0.0-beta</div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </body>
    </html>
  );
}