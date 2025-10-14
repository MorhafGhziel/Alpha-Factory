import { requireReviewer } from "@/src/lib/auth-middleware";
import ReviewerLayoutClient from "./ReviewerLayoutClient";

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure only reviewers can access this layout
  await requireReviewer();

  return <ReviewerLayoutClient>{children}</ReviewerLayoutClient>;
}
