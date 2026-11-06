import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role === "HOMEOWNER") redirect("/login");

  return children;
}
