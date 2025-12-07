import { notFound } from "next/navigation";

// This route should always trigger 404
export const dynamic = "force-dynamic";

export default async function CatchAllPage() {
  // Use notFound() to trigger the locale-specific 404 page
  notFound();
}

