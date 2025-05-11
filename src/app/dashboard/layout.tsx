'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Building2, 
  PieChart, 
  MessageSquare, 
  BellRing, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  Search,
  UserCircle
} from 'lucide-react';

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => (
  <Link
    href={href}
    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-primary-50 text-primary-600' 
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { href: '/dashboard/accounts', icon: <Building2 size={20} />, label: 'Accounts' },
    { href: '/dashboard/contacts', icon: <Users size={20} />, label: 'Contacts' },
    { href: '/dashboard/campaigns', icon: <MessageSquare size={20} />, label: 'Campaigns' },
    { href: '/dashboard/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
  ];
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-neutral-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Sidebar panel */}
        <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo-full.svg"
                width={140}
                height={32}
                alt="RelateAI"
                className="h-8 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-neutral-500 hover:text-neutral-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pt-5 pb-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </div>
          
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-neutral-300"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700">John Smith</p>
                <p className="text-xs text-neutral-500">Acme Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-neutral-200 lg:bg-white">
        <div className="flex items-center h-16 px-4 border-b border-neutral-200">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo-full.svg"
              width={140}
              height={32}
              alt="RelateAI"
              className="h-8 w-auto"
            />
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
            
            <div className="pt-6 mt-6 border-t border-neutral-200">
              <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-3 space-y-2">
                <NavItem
                  href="/dashboard/settings"
                  icon={<Settings size={20} />}
                  label="Settings"
                  isActive={pathname === '/dashboard/settings'}
                />
              </div>
            </div>
          </nav>
        </div>
        
        <div className="border-t border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-neutral-300"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">John Smith</p>
              <p className="text-xs text-neutral-500">Acme Inc.</p>
            </div>
            <button className="ml-auto text-neutral-500 hover:text-neutral-700">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Menu button (mobile) & search */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-neutral-400" />
                  </div>
                  <input
                    type="search"
                    className="block w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
                    placeholder="Search accounts, contacts..."
                  />
                </div>
              </div>
            </div>
            
            {/* Right: Notifications & profile */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="relative p-1 rounded-full text-neutral-400 hover:text-neutral-500"
              >
                <BellRing className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white" />
              </button>
              
              <button
                type="button"
                className="flex items-center space-x-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 lg:hidden"
              >
                <UserCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}