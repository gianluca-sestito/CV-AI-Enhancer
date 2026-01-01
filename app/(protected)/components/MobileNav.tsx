"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function MobileNav({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-background border-b shadow-lg md:hidden z-50"
          role="menu"
          aria-label="Mobile navigation menu"
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-3" role="menubar">
              <Link
                href="/profile"
                className="text-sm hover:underline py-2"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                aria-label="Profile"
              >
                Profile
              </Link>
              <Link
                href="/jobs"
                className="text-sm hover:underline py-2"
                onClick={() => setIsOpen(false)}
                role="menuitem"
                aria-label="Jobs"
              >
                Jobs
              </Link>
            </nav>
            <div className="pt-4 border-t space-y-3">
              <span className="text-sm text-muted-foreground block" aria-label={`Logged in as ${email}`}>
                {email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

