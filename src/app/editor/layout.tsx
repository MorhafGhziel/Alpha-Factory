import { requireEditor } from "@/src/lib/auth-middleware";
import EditorLayoutClient from "./EditorLayoutClient";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure only editors can access this layout
  await requireEditor();

  return <EditorLayoutClient>{children}</EditorLayoutClient>;
}
