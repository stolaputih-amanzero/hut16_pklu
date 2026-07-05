import { 
  CheckCircle2, 
  Calendar, 
  Church, 
  MapPin, 
  User, 
  Shirt, 
  Users, 
  QrCode, 
  FileText, 
  Check, 
  Sparkles, 
  Phone 
} from "lucide-react";

export type RegistrationData = {
  id: string;
  registration_code: string;
  registration_mode: string;
  category: string;
  type?: string | null;
  role?: string | null;
  name?: string | null;
  full_name?: string | null;
  contact_person_name?: string | null;
  leader_name?: string | null;
  church_name: string;
  mupel: string;
  whatsapp_number: string;
  shirt_size?: string | null;
  shirt_sizes_summary?: Record<string, number> | null;
  participant_count?: number | null;
  companion_count?: number | null;
  proof_of_transfer_url?: string | null;
  assignment_letter_url?: string | null;
  participant_list_url?: string | null;
  created_at: string;
};

interface CardProps {
  data: RegistrationData;
}

export function RegistrationStatusCard({ data }: CardProps) {
  const isRombongan = data.registration_mode === "Rombongan";
  const nameDisplay = data.name || data.full_name || data.contact_person_name || data.leader_name || "Peserta HUT PKLU";
  const cleanWa = (data.whatsapp_number || "").replace(/^0/, "62").replace(/\D/g, "");

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37]/50 bg-black/60 p-6 md:p-8 backdrop-blur-xl text-[#FDFBF7] shadow-[0_0_30px_rgba(212,175,55,0.15)] space-y-6">
      {/* Background Gold Ambient */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

      {/* Top Header & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Bukti Pendaftaran Resmi
          </span>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Status Pendaftaran</h2>
        </div>

        {/* Verification Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-emerald-300 font-bold text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Terekam &amp; Valid</span>
        </div>
      </div>

      {/* Code Banner */}
      <div className="flex items-center justify-between p-4 bg-black/60 rounded-xl border border-[#D4AF37]/40 shadow-inner">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Kode Registrasi Unik</p>
          <p className="text-2xl md:text-3xl font-mono font-black text-[#D4AF37] tracking-wider">
            {data.registration_code}
          </p>
        </div>
        <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
          <QrCode className="w-8 h-8" />
        </div>
      </div>

      {/* Main Name / Group Header */}
      <div className="space-y-1">
        <p className="text-xs text-gray-400">Nama Pendaftar / Penanggung Jawab:</p>
        <h3 className="text-2xl font-bold text-white tracking-tight">{nameDisplay}</h3>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Mode & Category */}
        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
          <p className="text-gray-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> Mode &amp; Kategori
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isRombongan ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"}`}>
              {data.registration_mode}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${data.category === "Tuan Rumah" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {data.category}
            </span>
          </div>
        </div>

        {/* Church & Mupel */}
        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
          <p className="text-gray-400 flex items-center gap-1.5">
            <Church className="w-3.5 h-3.5 text-[#D4AF37]" /> Asal Jemaat &amp; Mupel
          </p>
          <p className="font-bold text-white text-sm">{data.church_name}</p>
          <p className="text-[11px] text-[#D4AF37] font-semibold">{data.mupel}</p>
        </div>

        {/* Participant Type / Headcount */}
        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
          <p className="text-gray-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Peranan &amp; Jumlah
          </p>
          {!isRombongan ? (
            <p className="font-semibold text-white">
              {data.type || "Peserta"} {data.role ? `(${data.role})` : ""}
            </p>
          ) : (
            <p className="font-semibold text-white">
              Peserta: <strong className="text-[#D4AF37]">{data.participant_count || 0}</strong> orang | Pendamping: <strong className="text-purple-300">{data.companion_count || 0}</strong> orang
            </p>
          )}
        </div>

        {/* Shirt Size */}
        <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-1">
          <p className="text-gray-400 flex items-center gap-1.5">
            <Shirt className="w-3.5 h-3.5 text-[#D4AF37]" /> Ukuran Kaos
          </p>
          {!isRombongan ? (
            <span className="inline-block bg-white/10 px-2.5 py-1 rounded text-white font-mono font-bold text-xs">
              {data.shirt_size || "Acak"}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {data.shirt_sizes_summary && Object.entries(data.shirt_sizes_summary).map(([sz, q]) => (
                Number(q) > 0 ? (
                  <span key={sz} className="bg-white/10 px-2 py-0.5 rounded text-white border border-white/10">
                    {sz}: {String(q)}
                  </span>
                ) : null
              ))}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Link */}
      <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-between text-xs">
        <span className="text-emerald-300 font-medium flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-emerald-400" /> Nomor WhatsApp Terdaftar
        </span>
        {cleanWa ? (
          <a
            href={`https://wa.me/${cleanWa}`}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 font-mono font-bold hover:underline"
          >
            {data.whatsapp_number}
          </a>
        ) : (
          <span className="font-mono text-gray-300">{data.whatsapp_number}</span>
        )}
      </div>

      {/* Documents Status */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <p className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#D4AF37]" /> Lampiran Dokumen Pendaftaran:
        </p>

        <div className="flex flex-wrap gap-2 text-[11px]">
          {data.proof_of_transfer_url && (
            <a
              href={data.proof_of_transfer_url}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/30 transition-all font-medium"
            >
              <Check className="w-3.5 h-3.5" /> Bukti Transfer
            </a>
          )}
          {data.assignment_letter_url && (
            <a
              href={data.assignment_letter_url}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-blue-500/30 transition-all font-medium"
            >
              <Check className="w-3.5 h-3.5" /> Surat Tugas
            </a>
          )}
          {data.participant_list_url && (
            <a
              href={data.participant_list_url}
              target="_blank"
              rel="noreferrer"
              className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-purple-500/30 transition-all font-medium"
            >
              <Check className="w-3.5 h-3.5" /> File Daftar Peserta
            </a>
          )}
        </div>
      </div>

      {/* Footer Date */}
      <div className="pt-3 border-t border-white/10 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <Calendar className="w-3.5 h-3.5 text-gray-500" />
        Waktu Registrasi:{" "}
        <strong className="text-gray-300">
          {new Date(data.created_at).toLocaleString("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </strong>
      </div>
    </div>
  );
}
