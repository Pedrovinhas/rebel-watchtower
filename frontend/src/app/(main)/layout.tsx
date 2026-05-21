import { SideNav } from '@/shared/ui/SideNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
