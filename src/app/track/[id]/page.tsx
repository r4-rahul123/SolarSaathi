import { notFound, redirect } from "next/navigation";
import { SolarDB } from "@/lib/db";
import { TrackProjectClient } from "@/components/TrackProjectClient";
import { getSessionUser } from "@/lib/auth-server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackProjectPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await SolarDB.getLeadById(id);
  if (!lead) notFound();

  // Only generated, opaque project links can be viewed before an account claims the enquiry.
  const isUnclaimedQuoteLink = !lead.ownerUserId && /^PROJECT-[0-9a-f-]{36}$/i.test(lead.id);
  if (!lead.ownerUserId && !isUnclaimedQuoteLink) notFound();

  const user = await getSessionUser();
  if (lead.ownerUserId && !user) redirect(`/login?next=${encodeURIComponent(`/track/${lead.id}`)}`);
  const isStaff = user !== null && user.role !== "HOMEOWNER";
  const isOwner = user?.id === lead.ownerUserId;

  if (!isStaff && !isOwner && !isUnclaimedQuoteLink) notFound();

  return <TrackProjectClient initialLead={lead} />;
}
