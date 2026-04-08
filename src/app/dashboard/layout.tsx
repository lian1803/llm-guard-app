'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '📊' },
    { href: '/dashboard/projects', label: 'Projects', icon: '📁' },
    { href: '/dashboard/alerts', label: 'Alerts', icon: '🔔' },
    { href: '/dashboard/keys', label: 'API Keys', icon: '🔑' },
    { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
  ];

  return (
    <div className="flex h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-64' : 'w-0 md:w-64'
      } bg-[#161b22] border-r border-[#30363d] transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-[#30363d]">
          <h1 className="text-xl font-bold">LLM Guard</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 hover:bg-[#21262d] transition-colors text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#30363d]">
          <Button variant="outline" className="w-full text-sm" size="sm">
            Upgrade to Pro
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-[#8b949e]">Free Plan</span>
            <div className="w-10 h-10 rounded-full bg-[#30363d]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
