import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "./components/LogoutButton";
import MobileNav from "./components/MobileNav";
import { User, Briefcase } from "lucide-react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const supabase = await createClient();

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 backdrop-blur-nav border-b border-accent/20 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-8 items-center">
              <Link
                href="/profile"
                className="group font-display font-bold text-xl sm:text-2xl text-foreground hover:text-accent transition-colors relative"
                aria-label="CV AI Enhancer - Home"
              >
                <span className="relative">
                  CV AI Enhancer
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>
              <div className="hidden md:flex gap-1" role="menubar">
                <Link
                  href="/profile"
                  className="group px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors relative"
                  aria-label="Profile"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
                <Link
                  href="/jobs"
                  className="group px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent/10 transition-colors relative"
                  aria-label="Jobs"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Jobs</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg" aria-label={`Logged in as ${user.email}`}>
                {user.email}
              </div>
              <LogoutButton />
            </div>
            <MobileNav email={user.email || ""} />
          </div>
        </div>
      </nav>
      <main role="main">{children}</main>
    </div>
  );
}
