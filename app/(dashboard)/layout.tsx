import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import HeaderSection from "@/components/header/header";

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
      <HeaderSection user={{name: user?.name as string, role: user?.role}} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
