import { supabaseAdmin } from "@/lib/supabase/admin";
import { MessageSquareQuote } from "lucide-react";
import { GuestbookLoadMore } from "@/components/GuestbookLoadMore";

export type GuestbookMessage = {
  id: string;
  name: string;
  church_city: string;
  message: string;
  avatar_url?: string | null;
  is_approved: boolean;
  created_at: string;
};

export async function fetchApprovedMessages(limit = 20, offset = 0) {
  try {
    const { data, error, count } = await supabaseAdmin
      .from("guestbook_messages")
      .select("*", { count: "exact" })
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching approved guestbook messages:", error);
      return { messages: [], totalCount: 0 };
    }

    return { messages: (data as GuestbookMessage[]) || [], totalCount: count || 0 };
  } catch (err) {
    console.error("Exception fetching guestbook messages:", err);
    return { messages: [], totalCount: 0 };
  }
}

export async function GuestbookList() {
  const { messages, totalCount } = await fetchApprovedMessages(20, 0);

  if (messages.length === 0) {
    return (
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/40 p-8 text-center text-[#FDFBF7] shadow-lg backdrop-blur-md space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
          <MessageSquareQuote className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-[#D4AF37]">Belum Ada Ucapan</h3>
        <p className="text-xs text-gray-300 max-w-sm mx-auto">
          Belum ada ucapan yang ditampilkan. Jadilah yang pertama memberikan doa &amp; ucapan selamat untuk HUT ke-16 PKLU GPIB!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
          <MessageSquareQuote className="h-5 w-5 text-[#D4AF37]" />
          Ucapan Selamat ({totalCount})
        </h3>
        <span className="text-xs text-gray-400">Terverifikasi Panitia</span>
      </div>

      <GuestbookLoadMore initialMessages={messages} totalCount={totalCount} />
    </div>
  );
}
