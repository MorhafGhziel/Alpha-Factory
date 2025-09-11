import { requireClient } from "@/src/lib/auth-middleware";
import ClientLayoutClient from "./ClientLayoutClient";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure only clients can access this layout
  await requireClient();

  return <ClientLayoutClient>{children}</ClientLayoutClient>;
}
