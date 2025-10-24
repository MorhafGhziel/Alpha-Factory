import { requireClient } from "@/src/lib/auth-middleware";
import ClientLayoutClient from "./ClientLayoutClient";
import { InvoiceNotificationProvider } from "@/src/contexts/InvoiceNotificationContext";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure only clients can access this layout
  await requireClient();

  return (
    <InvoiceNotificationProvider>
      <ClientLayoutClient>{children}</ClientLayoutClient>
    </InvoiceNotificationProvider>
  );
}
