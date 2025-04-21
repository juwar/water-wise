import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Image from "next/image";
import IconApp from "../assets/icon2.png"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link className="mr-6 flex items-center space-x-2" href={user ? '/dashboard' : '/'}>
              {/* <span className="font-bold">Berair</span> */}
              <Image src={IconApp} alt={""} className="h-10 w-auto"/>
            </Link>
          </div>
          <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
              Dashboard
            </Link>
            {user.role === "admin" && (
              <Link href="/users" className="transition-colors hover:text-foreground/80">
                Users
              </Link>
            )}
            {user.role === "admin" && (
              <Link href="/reports" className="transition-colors hover:text-foreground/80">
                Laporan
              </Link>
            )}
          </nav>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
