"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Image from "next/image";
import IconApp from "../../../app/assets/icon2.png";
import { usePathname } from "next/navigation";

const HeaderSection = ({ user }: { user: { name: string; role: string } }) => {
  if (!user) {
    redirect("/login");
  }

  const pathname = usePathname();

  const getRolesColor = (role: string) => {
    switch (role) {
      case "user":
        return "bg-green-100 text-green-700";
      case "officer":
        return "bg-blue-100 text-blue-700";
      case "admin":
        return "bg-red-100 text-red-700";

      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Logo */}
          <div className="flex items-center">
            <div className="mr-4 flex">
              <Link
                className="mr-6 flex items-center space-x-2"
                href={user ? "/dashboard" : "/"}
              >
                <Image src={IconApp} alt={""} className="h-10 w-auto" />
              </Link>
            </div>
          </div>

          {/* Center: Navigation */}
          <nav className="flex flex-1 items-center justify-center space-x-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md ${
                pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              Dashboard
            </Link>
            {user.role === "admin" && (
              <Link
                href="/users"
                className={`px-3 py-2 rounded-md ${
                  pathname === "/users"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Users
              </Link>
            )}
            {user.role === "admin" && (
              <Link
                href="/reports"
                className={`px-3 py-2 rounded-md ${
                  pathname === "/reports"
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                Laporan
              </Link>
            )}
          </nav>

          {/* Right: Search & User */}
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="relative user-menu-container">
              <div
                className={`flex items-center space-x-1 rounded-full pl-1 pr-2 py-1 "hover:bg-gray-50"
                  `}
              >
                <span className="hidden md:inline-block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-sm ${getRolesColor(
                    user.role
                  )}`}
                >
                  {(user.role)}
                </span>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;
