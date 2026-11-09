import { notFound, redirect } from "next/navigation";
import { SolarDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { hideLeadScoring } from "@/lib/lead-privacy";
import { QuoteViewerClient } from "./QuoteViewerClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotePage({ params }: PageProps) {
  const { id } = await params;
  const lead = await SolarDB.getLeadById(id);
  if (!lead) notFound();

  const isPublicDemoLink = /^LD-|^PR-/i.test(lead.id);
  const isUnclaimedQuoteLink = !lead.ownerUserId && (/^PROJECT-[0-9a-f-]{36}$/i.test(lead.id) || isPublicDemoLink);

  if (!lead.ownerUserId && !isUnclaimedQuoteLink) notFound();

  const user = await getSessionUser();
  if (lead.ownerUserId && !user) {
    redirect(`/login?next=${encodeURIComponent(`/quote/${lead.id}`)}`);
  }

  const isStaff = user !== null && user.role !== "HOMEOWNER";
  const isOwner = user?.id === lead.ownerUserId;

  if (!isStaff && !isOwner && !isUnclaimedQuoteLink) {
    notFound();
  }

  const sanitizedLead = isStaff ? lead : hideLeadScoring(lead);
  const backHref = `/track/${lead.id}`;

  return <QuoteViewerClient lead={sanitizedLead} backHref={backHref} />;
}
