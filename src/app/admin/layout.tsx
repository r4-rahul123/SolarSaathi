import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role === "HOMEOWNER") redirect("/");

  return children;
}
