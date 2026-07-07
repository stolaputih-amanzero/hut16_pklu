"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitGuestbookMessage } from "@/app/(public)/ucapan/actions";
import { Send, CheckCircle2, AlertCircle, Clock, Church as ChurchIcon, Globe, Camera, X, User } from "lucide-react";

type Church = {
  id: string;
  name: string;
  mupel: string;
};

interface GuestbookFormProps {
  churches: Church[];
}

const guestbookSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  church_city: z.string().min(2, "Asal Gereja / Jemaat wajib diisi").max(100, "Maksimal 100 karakter"),
  message: z.string().min(5, "Ucapan minimal 5 karakter").max(300, "Ucapan maksimal 300 karakter"),
  hp_website: z.string().optional(),
});

type GuestbookFormValues = z.infer<typeof guestbookSchema>;

export function GuestbookForm({ churches }: GuestbookFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Avatar file upload & preview state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Origin category: "gpib" | "umum"
  const [category, setCategory] = useState<"gpib" | "umum">("gpib");
  const [selectedMupel, setSelectedMupel] = useState<string>("");
  const [selectedChurchName, setSelectedChurchName] = useState<string>("");
  const [customChurchText, setCustomChurchText] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GuestbookFormValues>({
    resolver: zodResolver(guestbookSchema),
    defaultValues: {
      name: "",
      church_city: "",
      message: "",
    },
  });

  const messageValue = watch("message") || "";

  // List of unique Mupels
  const mupelList = useMemo(() => {
    const set = new Set<string>();
    churches.forEach((c) => {
      if (c.mupel) set.add(c.mupel);
    });
    return Array.from(set).sort();
  }, [churches]);

  // List of churches for selected Mupel
  const filteredChurches = useMemo(() => {
    if (!selectedMupel) return [];
    return churches.filter((c) => c.mupel === selectedMupel);
  }, [churches, selectedMupel]);

  // Sync church_city value
  useEffect(() => {
    if (category === "gpib") {
      if (selectedChurchName && selectedMupel) {
        setValue("church_city", `GPIB ${selectedChurchName} (${selectedMupel})`);
      } else {
        setValue("church_city", "");
      }
    } else {
      setValue("church_city", customChurchText);
    }
  }, [category, selectedMupel, selectedChurchName, customChurchText, setValue]);

  // Rate limit countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Avatar Selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: GuestbookFormValues) => {
    if (cooldown > 0) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("church_city", data.church_city);
    fd.append("message", data.message);
    if (data.hp_website) fd.append("hp_website", data.hp_website);
    if (avatarFile) {
      fd.append("avatar", avatarFile, avatarFile.name);
    }

    const res = await submitGuestbookMessage(fd);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("Ucapan Anda telah dikirim dan akan muncul setelah ditinjau panitia.");
      reset();
      handleRemoveAvatar();
      setSelectedMupel("");
      setSelectedChurchName("");
      setCustomChurchText("");
      setCooldown(60);
    } else {
      setErrorMsg(res.error || "Gagal mengirim ucapan.");
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-[#D4AF37]/30 bg-black/40 p-4 sm:p-6 backdrop-blur-md text-[#FDFBF7] shadow-xl">
      <div className="border-b border-white/10 pb-3">
        <h2 className="text-xl font-bold text-[#D4AF37]">Tulis Ucapan &amp; Doa Selamat</h2>
        <p className="text-xs text-gray-300">Bagikan ucapan sukacita Anda untuk HUT ke-16 PKLU GPIB 2026.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-sm flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/20 border border-red-500/40 p-4 rounded-xl text-red-300 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Honeypot hidden input */}
        <input 
          type="text" 
          tabIndex={-1} 
          autoComplete="off" 
          aria-hidden="true"
          className="hidden opacity-0 pointer-events-none absolute w-0 h-0" 
          {...register("hp_website")} 
        />

        {/* Optional Avatar Upload Area */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-200">
            Foto Profil / Diri <span className="text-gray-400 font-normal">(Opsional)</span>
          </Label>
          
          <div className="flex items-center gap-4 p-3 bg-black/50 rounded-xl border border-white/10">
            <div className="relative">
              {avatarPreview ? (
                <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md">
                  <img src={avatarPreview} alt="Preview Foto" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow"
                    title="Hapus foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <User className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="gb-avatar-input"
              />
              <label
                htmlFor="gb-avatar-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold rounded-lg cursor-pointer transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                {avatarPreview ? "Ganti" : "Unggah Foto"}
              </label>
              <p className="text-[10px] text-gray-400">Format: JPG, PNG, WEBP (Maks 5MB)</p>
            </div>
          </div>
        </div>

        {/* Field: Nama */}
        <div className="space-y-1.5">
          <Label htmlFor="gb-name" className="text-xs font-semibold text-gray-200">
            Nama Lengkap *
          </Label>
          <Input
            id="gb-name"
            placeholder="Contoh: Oma Elizabeth"
            className="bg-black/50 border-white/20 text-white"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        {/* Category Switcher */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-200">
            Kategori Asal Jemaat *
          </Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                setCategory("gpib");
                setCustomChurchText("");
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                category === "gpib"
                  ? "bg-[#D4AF37] text-black shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <ChurchIcon className="w-4 h-4" /> GPIB
            </button>
            <button
              type="button"
              onClick={() => {
                setCategory("umum");
                setSelectedMupel("");
                setSelectedChurchName("");
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                category === "umum"
                  ? "bg-[#D4AF37] text-black shadow"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4" /> Umum
            </button>
          </div>
        </div>

        {/* Form Selection based on Category */}
        {category === "gpib" ? (
          <div className="space-y-3 p-3 bg-black/50 rounded-xl border border-white/10">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-300">Pilih Mupel GPIB *</Label>
              <select
                value={selectedMupel}
                onChange={(e) => {
                  setSelectedMupel(e.target.value);
                  setSelectedChurchName("");
                }}
                className="w-full rounded-md border border-white/20 bg-black/80 p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="">-- Pilih MUPEL --</option>
                {mupelList.map((mupel) => (
                  <option key={mupel} value={mupel}>
                    {mupel}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-300">Pilih Jemaat GPIB *</Label>
              <select
                disabled={!selectedMupel}
                value={selectedChurchName}
                onChange={(e) => setSelectedChurchName(e.target.value)}
                className="w-full rounded-md border border-white/20 bg-black/80 p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none disabled:opacity-40"
              >
                <option value="">-- Pilih Jemaat GPIB --</option>
                {filteredChurches.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="gb-church-custom" className="text-xs font-semibold text-gray-200">
              Nama Gereja &amp; Kota / Instansi *
            </Label>
            <Input
              id="gb-church-custom"
              value={customChurchText}
              onChange={(e) => setCustomChurchText(e.target.value)}
              placeholder="Contoh: GKI Kayu Putih Jakarta / Simpatisan Umum"
              className="bg-black/50 border-white/20 text-white"
            />
          </div>
        )}

        {errors.church_city && <p className="text-xs text-red-400">{errors.church_city.message}</p>}

        {/* Field: Message Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="gb-message" className="text-xs font-semibold text-gray-200">
              Isi Ucapan &amp; Harapan *
            </Label>
            <span className={`text-[11px] font-mono ${messageValue.length > 280 ? "text-amber-400 font-bold" : "text-gray-400"}`}>
              {messageValue.length}/300
            </span>
          </div>
          <textarea
            id="gb-message"
            rows={4}
            maxLength={300}
            placeholder="Tuliskan ucapan selamat dan doa untuk HUT ke-16 PKLU GPIB..."
            className="w-full rounded-md border border-white/20 bg-black/50 p-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none"
            {...register("message")}
          />
          {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || cooldown > 0}
          className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold py-5 text-sm rounded-xl transition-all disabled:opacity-50"
        >
          {cooldown > 0 ? (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              Tunggu ({cooldown}s)
            </span>
          ) : isSubmitting ? (
            "Mengirim..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Kirim
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
