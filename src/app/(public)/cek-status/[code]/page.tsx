import { notFound } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { RegistrationStatusCard } from "@/components/RegistrationStatusCard";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const cleanCode = (code || "").trim().toUpperCase();

  const { data: registration } = await supabaseAdmin
    .from("registrations")
    .select("name, full_name, contact_person_name, leader_name, church_name, mupel")
    .eq("registration_code", cleanCode)
    .maybeSingle();

  if (!registration) {
    return {
      title: "Status Pendaftaran Tidak Ditemukan | HUT PKLU 16",
      description: "Kode pendaftaran tidak ditemukan atau tidak valid.",
    };
  }

  const nameDisplay =
    registration.name ||
    registration.full_name ||
    registration.contact_person_name ||
    registration.leader_name ||
    "Peserta";

  return {
    title: `Status Pendaftaran - ${nameDisplay} | HUT PKLU 16`,
    description: `Cek status pendaftaran resmi ${nameDisplay} (${registration.church_name} - ${registration.mupel}) untuk TEMU & HUT ke-16 PKLU GPIB 2026.`,
    openGraph: {
      title: `Status Pendaftaran - ${nameDisplay}`,
      description: `Pendaftaran ${nameDisplay} (${registration.church_name}) untuk HUT ke-16 PKLU GPIB 2026 telah terekam dan valid. Kode: ${cleanCode}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Status Pendaftaran - ${nameDisplay}`,
      description: `Pendaftaran ${nameDisplay} untuk HUT ke-16 PKLU GPIB 2026 telah terekam dan valid.`,
    },
  };
}

export default async function CheckStatusPage({ params }: PageProps) {
  const { code } = await params;
  
  // Sanitize input code (allow only uppercase letters, numbers, and dashes)
  const cleanCode = (code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 25);

  if (!cleanCode) {
    notFound();
  }

  // Fetch registration record by registration_code
  const { data: registration, error } = await supabaseAdmin
    .from("registrations")
    .select("*")
    .eq("registration_code", cleanCode)
    .maybeSingle();

  if (error || !registration) {
    console.log(`Registration record not found for code: ${cleanCode}`);
    notFound();
  }

  return (
    <div className="container mx-auto min-h-screen py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <RegistrationStatusCard data={registration} />
      </div>
    </div>
  );
}
