import { requireDesigner } from "@/src/lib/auth-middleware";
import DesignerLayoutClient from "./DesignerLayoutClient";

export default async function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure only designers can access this layout
  await requireDesigner();

  return <DesignerLayoutClient>{children}</DesignerLayoutClient>;
}
