'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Pages', href: '/dashboard/pages', icon: '📄' },
  { label: 'Templates', href: '/dashboard/templates', icon: '🎨' },
  { label: 'Users', href: '/dashboard/users', icon: '👥' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  description,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          {sidebarOpen && <h1 className="text-xl font-bold">ComércioPago</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 ${
                sidebarOpen ? '' : 'justify-center'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors ${
              sidebarOpen ? '' : 'justify-center'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center">
              👤
            </div>
            {sidebarOpen && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Profile</p>
                <p className="text-xs text-gray-400">Logout</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {title && (
          <header className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </header>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
};

DashboardLayout.displayName = 'DashboardLayout';
