"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        onClick={() =>
          signOut({
            callbackUrl: "/login",
          })
        }
        className="font-semibold text-red-500"
        endIcon={
          <LogOut className="h-4 w-4 text-red-500"/>
        }
      >
        Keluar
      </Button>
    </div>
  );
}
