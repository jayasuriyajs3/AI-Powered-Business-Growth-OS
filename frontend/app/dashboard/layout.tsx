'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { 
  Sun, 
  Building, 
  BarChart3, 
  Dna, 
  Compass, 
  Users, 
  Sliders, 
  Megaphone, 
  Radar, 
  Bot, 
  AlertTriangle,
  LogOut
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Sun, label: 'Morning Brief' },
  { href: '/dashboard/boardroom', icon: Building, label: 'Boardroom' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Dashboard' },
  { href: '/dashboard/dna', icon: Dna, label: 'Growth DNA' },
  { href: '/dashboard/strategy', icon: Compass, label: 'Strategy' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/simulator', icon: Sliders, label: 'What-If' },
  { href: '/dashboard/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/dashboard/opportunity', icon: Radar, label: 'Radar' },
  { href: '/dashboard/copilot', icon: Bot, label: 'Copilot' },
  { href: '/dashboard/crisis', icon: AlertTriangle, label: 'Crisis' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { businessName, industry, clearBusiness } = useStore();

  return (
    <div className="flex overflow-hidden" style={{ height: '100vh', width: '100vw', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="sidebar flex flex-col shrink-0" style={{ width: '240px' }}>
        {/* Logo */}
        <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center text-base font-bold text-white" style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}>🚀</div>
            <div>
              <p className="font-bold text-sm text-white" style={{ letterSpacing: '0.5px' }}>GrowthOS AI</p>
              <p className="text-xs text-gray-500 font-medium">Executive OS</p>
            </div>
          </div>
        </div>

        {/* Business Context Info */}
        {businessName && (
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Active Company</p>
            <p className="text-sm font-bold text-white truncate mt-1">{businessName}</p>
            <p className="text-xs text-indigo-400 font-medium mt-0.5">{industry}</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`sidebar-item ${active ? 'active' : ''}`}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ color: active ? 'var(--primary)' : 'inherit' }} />
                <span style={{ fontSize: '13px' }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-5 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => { clearBusiness(); router.push('/'); }}
            className="btn-ghost text-xs py-2 w-full justify-start gap-2.5"
            style={{ 
              borderColor: 'transparent',
              color: 'var(--text-muted)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={14} />
            <span>Switch Business</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
        {children}
      </main>
    </div>
  );
}
