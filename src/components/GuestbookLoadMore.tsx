"use client";

import { useState } from "react";
import { getApprovedMessagesAction } from "@/app/(public)/ucapan/actions";
import { GuestbookMessage } from "@/components/GuestbookList";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, UserCheck, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";

interface GuestbookLoadMoreProps {
  initialMessages: GuestbookMessage[];
  totalCount: number;
}

export function GuestbookLoadMore({ initialMessages, totalCount }: GuestbookLoadMoreProps) {
  const [messages, setMessages] = useState<GuestbookMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMessages.length < totalCount);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const nextOffset = messages.length;
    const res = await getApprovedMessagesAction(nextOffset, 20);
    setLoading(false);

    if (res.success && res.messages.length > 0) {
      setMessages((prev) => [...prev, ...res.messages]);
      setHasMore(Boolean(res.hasMore));
    } else {
      setHasMore(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {messages.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/10 bg-black/50 p-5 backdrop-blur-md text-[#FDFBF7] space-y-3 shadow-md hover:border-[#D4AF37]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                {item.avatar_url ? (
                  <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-[#D4AF37]/50 shadow">
                    <Image
                      src={item.avatar_url}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40 text-sm">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    {item.name}
                    <span title="Pesan Terverifikasi">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    </span>
                  </h4>
                  <p className="text-xs text-[#D4AF37] flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.church_city}
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0">
                <Calendar className="h-3 w-3 text-gray-500" />
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed italic whitespace-pre-line">
              "{item.message}"
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="pt-2 text-center">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleLoadMore}
            className="w-full sm:w-auto border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 px-8 py-3 text-xs font-semibold rounded-xl transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                Memuat Ucapan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                Muat Lebih Banyak ({totalCount - messages.length} Ucapan Lagi)
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
