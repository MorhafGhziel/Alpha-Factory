import { getServerSession } from "@/src/lib/get-session";
import { unauthorized } from "next/navigation";
import AdminPanelLayoutClient from "./AdminPanelLayoutClient";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const user = session?.user;
  
  // Only owner can access admin panel
  if (!user) {
    unauthorized();
  } else if (user.role !== "owner") {
    unauthorized();
  } 

  return <AdminPanelLayoutClient>{children}</AdminPanelLayoutClient>;
}
