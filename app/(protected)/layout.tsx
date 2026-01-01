import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "./components/LogoutButton";
import MobileNav from "./components/MobileNav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  return (
    <div className="min-h-screen">
      <nav className="border-b relative" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex gap-4 sm:gap-6 items-center">
            <Link href="/profile" className="font-bold text-lg sm:text-xl" aria-label="CV AI Enhancer - Home">
              CV AI Enhancer
            </Link>
            <div className="hidden md:flex gap-4" role="menubar">
              <Link href="/profile" className="text-sm hover:underline" aria-label="Profile">
                Profile
              </Link>
              <Link href="/jobs" className="text-sm hover:underline" aria-label="Jobs">
                Jobs
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground" aria-label={`Logged in as ${user.email}`}>
              {user.email}
            </span>
            <LogoutButton />
          </div>
          <MobileNav email={user.email || ""} />
        </div>
      </nav>
      <main role="main">{children}</main>
    </div>
  );
}
