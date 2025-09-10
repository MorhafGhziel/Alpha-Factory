import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) {
    unauthorized();
  } else if (user.role !== "admin") {
    unauthorized();
  } 

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
