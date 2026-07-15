"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, Copy, CheckCircle2, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { submitRegistration } from "@/app/(public)/daftar/actions";
import { toPng } from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type Church = {
  id: number;
  name: string;
  city: string | null;
  mupel: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const DEADLINE_BAJU = new Date("2026-07-31T23:59:59+07:00");
const IS_PAST_DEADLINE = new Date() > DEADLINE_BAJU;

const formSchema = z.object({
  registration_mode: z.enum(["Mandiri", "Rombongan"], { message: "Pilih mode pendaftaran" }),
  
  // Kolom Bersama
  category: z.enum(["Umum", "Tuan Rumah"], { message: "Pilih kategori" }),
  mupel: z.string().min(1, "Pilih Mupel"),
  church_name: z.string().min(1, "Pilih Jemaat"),
  whatsapp_number: z.string().min(5, "Nomor WhatsApp tidak valid"),
  proof_of_transfer: z.any().optional(),

  // Khusus Mandiri
  type: z.enum(["Peserta", "Pendamping"]).optional(),
  full_name: z.string().optional(),
  shirt_size: z.string().optional(),
  role: z.enum(["Utusan Mupel", "Pengurus PKLU", "Anggota PKLU"]).optional(),
  companion_for: z.string().optional(),
  assignment_letter: z.any().optional(),

  // Khusus Rombongan
  pic_name: z.string().optional(),
  participant_count: z.coerce.number().min(0).optional(),
  companion_count: z.coerce.number().min(0).optional(),
  shirt_sizes: z.object({
    S: z.coerce.number().min(0),
    M: z.coerce.number().min(0),
    L: z.coerce.number().min(0),
    XL: z.coerce.number().min(0),
    XXL: z.coerce.number().min(0),
    XXXL: z.coerce.number().min(0),
    XXXXL: z.coerce.number().min(0),
  }).optional(),
  participant_list: z.any().optional(),
}).superRefine((data, ctx) => {
  // Validate proof_of_transfer
  if (data.category === "Umum") {
    if (!data.proof_of_transfer || data.proof_of_transfer.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bukti transfer wajib diunggah",
        path: ["proof_of_transfer"]
      });
    } else {
      const file = data.proof_of_transfer[0];
      if (file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maks. 2MB",
          path: ["proof_of_transfer"]
        });
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harus JPG/PNG/PDF",
          path: ["proof_of_transfer"]
        });
      }
    }
  } else {
    // Tuan Rumah - optional, but validate size/type if uploaded
    if (data.proof_of_transfer && data.proof_of_transfer.length === 1) {
      const file = data.proof_of_transfer[0];
      if (file.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maks. 2MB",
          path: ["proof_of_transfer"]
        });
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harus JPG/PNG/PDF",
          path: ["proof_of_transfer"]
        });
      }
    }
  }

  if (data.registration_mode === "Mandiri") {
    if (!data.full_name || data.full_name.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib diisi", path: ["full_name"] });
    }
    if (!data.type) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib dipilih", path: ["type"] });
    } else {
      if (data.type === "Peserta") {
        if (!data.role) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib dipilih", path: ["role"] });
        }
        if (data.category !== "Tuan Rumah" && (!data.assignment_letter || data.assignment_letter.length === 0)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib diunggah", path: ["assignment_letter"] });
        } else if (data.assignment_letter && data.assignment_letter.length === 1) {
          const file = data.assignment_letter[0];
          if (file.size > MAX_FILE_SIZE) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maks. 2MB", path: ["assignment_letter"] });
          }
          if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Harus JPG/PNG/PDF", path: ["assignment_letter"] });
          }
        }
      }
      if (data.type === "Pendamping") {
        if (!data.companion_for || data.companion_for.trim() === "") {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib diisi", path: ["companion_for"] });
        }
      }
    }
    if (!IS_PAST_DEADLINE && (!data.shirt_size || data.shirt_size.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib dipilih", path: ["shirt_size"] });
    }
  }

  if (data.registration_mode === "Rombongan") {
    if (!data.pic_name || data.pic_name.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib diisi", path: ["pic_name"] });
    }
    const pCount = data.participant_count || 0;
    const cCount = data.companion_count || 0;
    const totalOrang = pCount + cCount;

    if (totalOrang <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimal ada 1 pendaftar", path: ["participant_count"] });
    }

    if (!data.participant_list || data.participant_list.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib diunggah", path: ["participant_list"] });
    }

    if (data.category !== "Tuan Rumah" && pCount > 0 && (!data.assignment_letter || data.assignment_letter.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Wajib diunggah jika ada Peserta", path: ["assignment_letter"] });
    } else if (data.assignment_letter && data.assignment_letter.length === 1) {
      const file = data.assignment_letter[0];
      if (file.size > MAX_FILE_SIZE) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maks. 2MB", path: ["assignment_letter"] });
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Harus JPG/PNG/PDF", path: ["assignment_letter"] });
      }
    }

    if (!IS_PAST_DEADLINE && data.shirt_sizes) {
      const totalBaju = Object.values(data.shirt_sizes).reduce((a, b) => a + b, 0);
      if (totalBaju !== totalOrang) {
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          message: `Total baju (${totalBaju}) tidak sama dengan total orang (${totalOrang})`, 
          path: ["shirt_sizes", "S"] 
        });
      }
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

export function RegistrationForm({ churches }: { churches: Church[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      registration_mode: "Mandiri",
      category: undefined,
      mupel: "",
      church_name: "",
      whatsapp_number: "",
      type: undefined,
      full_name: "",
      shirt_size: "",
      role: undefined,
      companion_for: "",
      pic_name: "",
      participant_count: 0,
      companion_count: 0,
      shirt_sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, XXXXL: 0 },
    },
  });

  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = form;

  const mode = useWatch({ control, name: "registration_mode" });
  const category = useWatch({ control, name: "category" });
  const selectedMupel = useWatch({ control, name: "mupel" });
  const type = useWatch({ control, name: "type" });

  const pCount = useWatch({ control, name: "participant_count" }) || 0;
  const cCount = useWatch({ control, name: "companion_count" }) || 0;
  const watchShirtSizes = useWatch({ control, name: "shirt_sizes" });

  const totalOrang = mode === "Rombongan" ? Number(pCount || 0) + Number(cCount || 0) : 1;

  const currentShirtTotal = useMemo(() => {
    if (!watchShirtSizes) return 0;
    return Object.values(watchShirtSizes).reduce((a, b) => Number(a || 0) + Number(b || 0), 0);
  }, [watchShirtSizes]);

  // Efek Samping Kategori (Tuan Rumah = otomatis BEKASI)
  useEffect(() => {
    if (category === "Tuan Rumah") {
      setValue("mupel", "BEKASI", { shouldValidate: true });
      // Reset jemaat jika sebelumnya sudah ada isian lain
      if (form.getValues("church_name")) {
        setValue("church_name", "", { shouldValidate: true });
      }
    } else if (category === "Umum") {
      const currentMupel = form.getValues("mupel");
      if (currentMupel === "BEKASI") {
        setValue("mupel", "", { shouldValidate: true });
        setValue("church_name", "", { shouldValidate: true });
      }
    }
  }, [category, setValue, form]);

  const mupelList = useMemo(() => {
    let list = Array.from(new Set(churches.map((c) => c.mupel)));
    if (category === "Tuan Rumah") {
      list = ["BEKASI"];
    } else if (category === "Umum") {
      list = list.filter(m => m !== "BEKASI");
    }
    return list.sort();
  }, [churches, category]);

  const jemaatList = useMemo(() => {
    if (!selectedMupel) return [];
    return churches.filter((c) => c.mupel === selectedMupel).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedMupel, churches]);

  const totalCost = useMemo(() => {
    if (!category) return 0;
    const price = category === "Umum" ? 475000 : 350000;
    return price * totalOrang;
  }, [category, totalOrang]);

  const [successData, setSuccessData] = useState<{ code: string; mode: string; createdAt?: string } | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async () => {
    if (!cardRef.current || !successData) return;
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#0B0904",
        pixelRatio: 3,
        style: {
          borderRadius: "16px",
        }
      });
      
      const link = document.createElement("a");
      link.download = `PKLU-Registration-${successData.code}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal menyimpan gambar:", err);
      alert("Gagal menyimpan gambar. Silakan coba screenshot layar Anda.");
    } finally {
      setIsDownloading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!pendingData) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("registration_mode", pendingData.registration_mode);
      formData.append("category", pendingData.category);
      formData.append("mupel", pendingData.mupel);
      formData.append("church_name", pendingData.church_name);
      formData.append("whatsapp_number", pendingData.whatsapp_number);

      if (pendingData.proof_of_transfer?.[0]) {
        formData.append("proof_of_transfer", pendingData.proof_of_transfer[0]);
      }
      if (pendingData.assignment_letter?.[0]) {
        formData.append("assignment_letter", pendingData.assignment_letter[0]);
      }
      if (pendingData.participant_list?.[0]) {
        formData.append("participant_list", pendingData.participant_list[0]);
      }

      if (pendingData.registration_mode === "Mandiri") {
        formData.append("full_name", pendingData.full_name || "");
        formData.append("type", pendingData.type || "");
        formData.append("shirt_size", pendingData.shirt_size || "");
        formData.append("role", pendingData.role || "");
        formData.append("companion_for", pendingData.companion_for || "");
      } else {
        formData.append("pic_name", pendingData.pic_name || "");
        formData.append("participant_count", (pendingData.participant_count || 0).toString());
        formData.append("companion_count", (pendingData.companion_count || 0).toString());
        if (pendingData.shirt_sizes) {
          formData.append("shirt_sizes_summary", JSON.stringify(pendingData.shirt_sizes));
        }
      }

      const res = await submitRegistration(formData);
      if (res.success && res.registration_code) {
        setShowConfirmModal(false);
        setSuccessData({ 
          code: res.registration_code, 
          mode: pendingData.registration_mode,
          createdAt: res.data?.created_at
        });
      } else {
        alert(`Gagal mengirim pendaftaran: ${res.error}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Terjadi kesalahan: ${error?.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/cek?code=${successData.code}` : successData.code;

    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95">
        <div 
          ref={cardRef} 
          className="space-y-6 rounded-2xl border border-[#D4AF37]/50 bg-[#0B0904] p-8 text-center text-[#FDFBF7] shadow-[0_0_30px_rgba(212,175,55,0.2)] flex flex-col items-center"
        >
          {/* Header Ticket (Branding) */}
          <div className="w-full border-b border-[#D4AF37]/20 pb-4 flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">TEMU PKLU GPIB 2026</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Bukti Pendaftaran Resmi</span>
          </div>

          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]">
            <CheckCircle2 className="size-10 text-[#D4AF37]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#D4AF37]">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-gray-300">
              Terima kasih telah mendaftar di Temu PKLU GPIB 2026. Data dan berkas Anda telah terekam secara valid.
            </p>
          </div>

          <div className="my-6 rounded-xl border border-[#D4AF37]/30 bg-black/80 p-6 flex flex-col items-center justify-center space-y-4 w-full">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Kode Registrasi Anda</p>
              <p className="font-mono text-4xl font-black text-[#D4AF37] tracking-wider select-all">{successData.code}</p>
            </div>

            <div className="p-3 bg-white rounded-xl shadow-md border border-white/20">
              <QRCodeSVG value={fullUrl} size={150} level="H" />
            </div>

            <p className="text-xs text-amber-300/90 max-w-md leading-relaxed text-center">
              Scan QR Code di atas atau simpan kode registrasi untuk bukti keabsahan pendaftaran dan saat verifikasi di lokasi event.
            </p>
          </div>
          
          <div className="w-full pt-4 border-t border-[#D4AF37]/10 flex flex-col items-center text-[10px] text-gray-400">
            {successData.createdAt && (
              <p className="mb-1 text-gray-300">
                Waktu Registrasi: {new Date(successData.createdAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </p>
            )}
            <p>© Panitia Temu PKLU GPIB 2026</p>
          </div>
        </div>

        {/* Action Buttons (Not saved in the image) */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button 
            type="button" 
            disabled={isDownloading}
            onClick={downloadImage}
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold px-8 py-3 rounded-xl inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Download className="size-5" />
            {isDownloading ? "Menyimpan..." : "Simpan Gambar Tiket"}
          </Button>

          <Button 
            type="button" 
            onClick={() => {
              setSuccessData(null);
              setPendingData(null);
              form.reset();
            }}
            className="w-full sm:w-auto bg-black/40 hover:bg-black/60 text-white font-bold px-8 py-3 rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            Daftar Kembali
          </Button>
        </div>

        <div className="text-center">
          <a 
            href={`/cek?code=${successData.code}`} 
            target="_blank" 
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline"
          >
            Buka Halaman Cek Status Pendaftaran →
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 1. MODE PENDAFTARAN */}
        <div className="space-y-4 rounded-xl border border-[#D4AF37]/30 bg-black/40 p-5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Label className="text-lg font-bold text-[#D4AF37]">Pilih Mode Pendaftaran</Label>
          </div>
          <Controller
          control={control}
          name="registration_mode"
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="relative">
                <RadioGroupItem value="Mandiri" id="mode-mandiri" className="peer sr-only" />
                <Label
                  htmlFor="mode-mandiri"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-black/50 p-4 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/20 cursor-pointer transition-all"
                >
                  <span className="text-base font-semibold text-white">Mandiri (1 Orang)</span>
                  <span className="text-xs text-gray-400 mt-1 text-center">Isi form untuk satu pendaftar</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="Rombongan" id="mode-rombongan" className="peer sr-only" />
                <Label
                  htmlFor="mode-rombongan"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-black/50 p-4 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 peer-data-[state=checked]:border-[#D4AF37] peer-data-[state=checked]:bg-[#D4AF37]/20 cursor-pointer transition-all"
                >
                  <span className="text-base font-semibold text-white">Jalur Cepat Rombongan</span>
                  <span className="text-xs text-gray-400 mt-1 text-center">Upload lampiran untuk multi-peserta</span>
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      {/* 2. DATA ROMBONGAN / JEMAAT */}
      <div className="space-y-5 rounded-xl border border-[#D4AF37]/30 bg-black/20 p-5 md:p-6">
        <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-4">
          Data Asal Jemaat
        </h3>
        
        <div className="space-y-4 mb-6">
          <Label className="text-base font-semibold text-[#FDFBF7]">Kategori Pendaftaran *</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <RadioGroup
                value={field.value || ""}
                onValueChange={field.onChange}
                className="flex flex-col space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="Umum" id="cat-umum" />
                  <Label htmlFor="cat-umum" className="cursor-pointer">Umum</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="Tuan Rumah" id="cat-tuan-rumah" />
                  <Label htmlFor="cat-tuan-rumah" className="cursor-pointer">Tuan Rumah (Mupel Bekasi)</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Asal Mupel *</Label>
            <Controller
              control={control}
              name="mupel"
              render={({ field }) => (
                <Select 
                  value={field.value || ""}
                  disabled={category === "Tuan Rumah"}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue("church_name", "", { shouldValidate: true });
                  }}
                >
                  <SelectTrigger className="bg-black/50">
                    <SelectValue placeholder="Pilih Mupel" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {mupelList.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mupel && <p className="text-sm text-red-500">{errors.mupel.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Nama Jemaat *</Label>
            <Controller
              control={control}
              name="church_name"
              render={({ field }) => (
                <Select 
                  disabled={!selectedMupel} 
                  value={field.value || ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="bg-black/50">
                    <SelectValue placeholder={selectedMupel ? "Pilih Jemaat" : "Pilih Mupel terlebih dahulu"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {jemaatList.map((c) => {
                      const churchDisplay = c.city ? `${c.name} (${c.city})` : c.name;
                      return (
                        <SelectItem key={c.id.toString()} value={churchDisplay}>
                          {churchDisplay}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.church_name && <p className="text-sm text-red-500">{errors.church_name.message}</p>}
          </div>
        </div>
      </div>

      {/* ==============================================
          MODE: MANDIRI
      ===============================================*/}
      {mode === "Mandiri" && (
        <div className="space-y-5 rounded-xl border border-[#D4AF37]/30 bg-black/20 p-5 md:p-6 transition-all animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-4">
            Data Pendaftar (Mandiri)
          </h3>

          <div className="space-y-4 mb-6">
            <Label className="text-base font-semibold">Tipe *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <RadioGroup value={field.value || ""} onValueChange={field.onChange} className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Peserta" id="type-peserta" />
                    <Label htmlFor="type-peserta" className="cursor-pointer">Peserta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Pendamping" id="type-pendamping" />
                    <Label htmlFor="type-pendamping" className="cursor-pointer">Pendamping</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input {...register("full_name")} placeholder="Masukkan nama" className="bg-black/50" />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label>Nomor WhatsApp *</Label>
              <Input type="tel" {...register("whatsapp_number")} placeholder="Contoh: 08123456789" className="bg-black/50" />
              {errors.whatsapp_number && <p className="text-sm text-red-500">{errors.whatsapp_number.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Ukuran Polo Shirt {IS_PAST_DEADLINE ? "" : "*"}</Label>
              {IS_PAST_DEADLINE ? (
                <div className="text-red-400 text-xs mt-2">Batas pilih ukuran terlewati. Anda mendapat ukuran acak.</div>
              ) : (
                <Controller
                  control={control}
                  name="shirt_size"
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-black/50">
                        <SelectValue placeholder="Pilih Ukuran" />
                      </SelectTrigger>
                      <SelectContent>
                        {["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
              {errors.shirt_size && <p className="text-sm text-red-500">{errors.shirt_size.message}</p>}
            </div>
          </div>

          {type === "Peserta" && (
            <div className="pt-4 border-t border-blue-500/20 mt-4 space-y-4">
              <Label className="text-sm font-semibold text-blue-400">Sebagai *</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <RadioGroup value={field.value || ""} onValueChange={field.onChange} className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Utusan Mupel" id="role-utusan" />
                      <Label htmlFor="role-utusan" className="cursor-pointer">Utusan Mupel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Pengurus PKLU" id="role-pengurus" />
                      <Label htmlFor="role-pengurus" className="cursor-pointer">Pengurus PKLU</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Anggota PKLU" id="role-anggota" />
                      <Label htmlFor="role-anggota" className="cursor-pointer">Anggota PKLU</Label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
            </div>
          )}

          {type === "Pendamping" && (
            <div className="pt-4 border-t border-purple-500/20 mt-4 space-y-2">
              <Label className="text-sm font-semibold text-purple-400">Nama Peserta Yang Didampingi *</Label>
              <Input {...register("companion_for")} placeholder="Masukkan nama" className="bg-black/50" />
              {errors.companion_for && <p className="text-sm text-red-500">{errors.companion_for.message}</p>}
            </div>
          )}
        </div>
      )}

      {/* ==============================================
          MODE: ROMBONGAN (JALUR CEPAT)
      ===============================================*/}
      {mode === "Rombongan" && (
        <div className="space-y-5 rounded-xl border border-[#D4AF37]/30 bg-black/20 p-5 md:p-6 transition-all animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-4">
            Data Rombongan
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Penanggung Jawab (PIC) *</Label>
              <Input {...register("pic_name")} placeholder="Nama PIC" className="bg-black/50" />
              {errors.pic_name && <p className="text-sm text-red-500">{errors.pic_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Nomor WhatsApp PIC *</Label>
              <Input type="tel" {...register("whatsapp_number")} placeholder="0812..." className="bg-black/50" />
              {errors.whatsapp_number && <p className="text-sm text-red-500">{errors.whatsapp_number.message}</p>}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <Label>Jumlah Peserta</Label>
              <Input type="number" min="0" {...register("participant_count")} className="bg-black/50" />
              {errors.participant_count && <p className="text-sm text-red-500">{errors.participant_count.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Jumlah Pendamping</Label>
              <Input type="number" min="0" {...register("companion_count")} className="bg-black/50" />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base text-[#D4AF37]">Rekap Ukuran Kaos Rombongan</Label>
              {!IS_PAST_DEADLINE && (
                <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  currentShirtTotal === totalOrang && totalOrang > 0
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {currentShirtTotal === totalOrang && totalOrang > 0
                    ? `✓ Cocok (${currentShirtTotal}/${totalOrang} kaos)`
                    : `⚠ ${currentShirtTotal}/${totalOrang} kaos (${totalOrang - currentShirtTotal > 0 ? `Kurang ${totalOrang - currentShirtTotal}` : `Kelebihan ${currentShirtTotal - totalOrang}`})`}
                </div>
              )}
            </div>
            
            {IS_PAST_DEADLINE ? (
              <p className="text-red-400 text-sm">Batas pilih ukuran telah berlalu. Rombongan akan mendapat ukuran acak.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-4">Masukkan kuantitas masing-masing ukuran. Total angka harus sama dengan jumlah seluruh pendaftar ({totalOrang} orang).</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"].map((s) => (
                    <div key={s} className="space-y-1 text-center">
                      <Label className="text-xs font-semibold">{s}</Label>
                      <Input type="number" min="0" className="text-center bg-black/50 px-1" {...register(`shirt_sizes.${s}` as any)} />
                    </div>
                  ))}
                </div>

                {/* Warning Notification Poka Yoke */}
                {currentShirtTotal !== totalOrang && (
                  <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Total kaos yang Anda masukkan ({currentShirtTotal}) belum sesuai dengan jumlah pendaftar ({totalOrang} orang). Silakan sesuaikan angka kaos.
                    </span>
                  </div>
                )}

                {errors.shirt_sizes?.S && <p className="text-sm text-red-500 mt-2">{errors.shirt_sizes.S.message}</p>}
              </>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <Label>Daftar Nama Peserta & Pendamping (Excel / PDF) *</Label>
            <Input type="file" accept=".xlsx,.xls,.csv,.pdf" className="bg-black/50 cursor-pointer" {...register("participant_list")} />
            <p className="text-xs text-muted-foreground">Pastikan daftar memuat info: Nama, Status (Peserta/Pendamping), dan Ukuran Baju masing-masing.</p>
            {errors.participant_list && <p className="text-sm text-red-500">{errors.participant_list.message as string}</p>}
          </div>
        </div>
      )}

      {/* 3. UPLOAD DOKUMEN & BIAYA */}
      <div className="space-y-5 rounded-xl border border-[#D4AF37]/30 bg-black/20 p-5 md:p-6">
        <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-4">
          Dokumen & Pembayaran
        </h3>
        
        {category && (
          <div className="rounded-lg bg-[#D4AF37]/10 p-4 border border-[#D4AF37]/30 flex gap-3 items-start mb-6">
            <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="text-sm text-[#FDFBF7]">
              <p className="font-semibold mb-1">Total Kontribusi ({totalOrang} Orang)</p>
              <p className="text-xl font-bold text-[#D4AF37] mb-2">Rp {totalCost.toLocaleString('id-ID')}</p>
              <div className="text-muted-foreground text-xs leading-relaxed mt-2">
                Biaya per orang: {category === "Umum" ? "Rp 475.000 (Umum)" : "Rp 350.000 (Tuan Rumah)"}<br/>
                Transfer total biaya ke rekening berikut:
                <div className="flex items-center gap-2 my-2 bg-black/40 p-2 rounded w-fit border border-[#D4AF37]/20">
                  <span className="font-mono text-[#D4AF37] font-semibold text-sm">Bank BTN 00179-01-88-000447-9</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      navigator.clipboard.writeText("0017901880004479");
                      alert("Nomor rekening berhasil disalin!");
                    }}
                    className="p-1 hover:bg-[#D4AF37]/20 rounded text-[#D4AF37] transition-colors"
                    title="Copy Rekening"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                Atas nama: <strong>Panitia MUPEL GPIB BEKASI</strong><br/>
                Berita Transfer : Peserta HUT + (Nama Pendaftar / PIC)
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bukti Transfer */}
          <div className="space-y-2">
            <Label htmlFor="proof_of_transfer">
              Bukti Transfer Total {category === "Tuan Rumah" ? "(Opsional)" : "(Wajib) *"}
            </Label>
            <Input id="proof_of_transfer" type="file" accept=".jpg,.jpeg,.png,.pdf" className="bg-black/50 cursor-pointer" {...register("proof_of_transfer")} />
            <p className="text-xs text-muted-foreground mt-1">Satu bukti transfer. (Max. 2MB)</p>
            {errors.proof_of_transfer && <p className="text-sm text-red-500">{errors.proof_of_transfer.message as string}</p>}
            
            <div className="mt-6 border border-[#D4AF37]/20 rounded-md overflow-hidden bg-black/50 p-2">
              <p className="text-sm text-[#FDFBF7] font-medium mb-2 text-center">Panduan Ukuran (Size Chart)</p>
              <Image
                src="/sizechart.jpeg"
                alt="Size Chart Polo Shirt"
                width={600}
                height={450}
                className="w-full h-auto rounded"
                loading="lazy"
              />
            </div>
          </div>

          {/* Surat Tugas - Muncul kondisional */}
          {((mode === "Mandiri" && type === "Peserta") || (mode === "Rombongan" && pCount > 0)) && (
            <div className="space-y-2">
              <Label htmlFor="assignment_letter">
                Surat Tugas {category === "Tuan Rumah" ? "(Opsional)" : "(Wajib) *"}
              </Label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="assignment_letter" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-black/40 border-blue-500/40 bg-black/20">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className="w-8 h-8 mb-3 text-blue-400" />
                    <p className="mb-2 text-sm text-gray-300"><span className="font-semibold">Klik untuk upload surat tugas</span></p>
                    <p className="text-xs text-gray-500">JPG, PNG, PDF (Max. 2MB)</p>
                  </div>
                  <input id="assignment_letter" type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" {...register("assignment_letter")} />
                </label>
              </div>
              {watch("assignment_letter")?.[0] && (
                <p className="text-sm text-blue-400 mt-2">File terpilih: {watch("assignment_letter")[0].name}</p>
              )}
              {errors.assignment_letter && <p className="text-sm text-red-500">{errors.assignment_letter.message as string}</p>}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold py-6 text-lg rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">
        {isSubmitting ? "Memproses Data..." : "Kirim Formulir Pendaftaran"}
      </Button>

      {/* MODAL KONFIRMASI RINGKASAN PENDAFTARAN */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-xl bg-black/90 border-[#D4AF37]/30 text-[#FDFBF7]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#D4AF37] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />
              Konfirmasi Ringkasan Pendaftaran
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Mohon periksa kembali data pendaftaran Anda sebelum dikirim.
            </DialogDescription>
          </DialogHeader>

          {pendingData && (
            <div className="space-y-4 py-3 text-sm max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2">
                <p className="text-[#D4AF37] font-semibold text-base border-b border-white/10 pb-1">1. Informasi Umum</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Mode:</span> <strong className="text-white">{pendingData.registration_mode}</strong></div>
                  <div><span className="text-gray-400">Kategori:</span> <strong className="text-white">{pendingData.category}</strong></div>
                  <div><span className="text-gray-400">Mupel:</span> <strong className="text-white">{pendingData.mupel}</strong></div>
                  <div><span className="text-gray-400">Jemaat:</span> <strong className="text-white">{pendingData.church_name}</strong></div>
                </div>
              </div>

              {pendingData.registration_mode === "Mandiri" ? (
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2">
                  <p className="text-[#D4AF37] font-semibold text-base border-b border-white/10 pb-1">2. Data Pendaftar</p>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-gray-400">Nama:</span> <strong className="text-white">{pendingData.full_name}</strong></p>
                    <p><span className="text-gray-400">No WhatsApp:</span> <strong className="text-white">{pendingData.whatsapp_number}</strong></p>
                    <p><span className="text-gray-400">Tipe:</span> <strong className="text-white">{pendingData.type}</strong> {pendingData.role ? `(${pendingData.role})` : ""}</p>
                    {pendingData.companion_for && <p><span className="text-gray-400">Mendampingi:</span> <strong className="text-white">{pendingData.companion_for}</strong></p>}
                    <p><span className="text-gray-400">Ukuran Baju:</span> <strong className="text-white">{pendingData.shirt_size || "Acak"}</strong></p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2">
                  <p className="text-[#D4AF37] font-semibold text-base border-b border-white/10 pb-1">2. Data Rombongan</p>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-gray-400">PIC:</span> <strong className="text-white">{pendingData.pic_name}</strong> ({pendingData.whatsapp_number})</p>
                    <p><span className="text-gray-400">Jumlah Peserta:</span> <strong className="text-white">{pendingData.participant_count || 0} orang</strong></p>
                    <p><span className="text-gray-400">Jumlah Pendamping:</span> <strong className="text-white">{pendingData.companion_count || 0} orang</strong></p>
                    <p><span className="text-gray-400">Total Rombongan:</span> <strong className="text-white">{totalOrang} orang</strong></p>
                    {pendingData.shirt_sizes && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-gray-400 mb-1">Rincian Baju:</p>
                        <div className="flex flex-wrap gap-2 text-white font-mono bg-black/40 p-2 rounded">
                          {Object.entries(pendingData.shirt_sizes).map(([sz, qty]) => (
                            qty > 0 ? <span key={sz} className="bg-white/10 px-2 py-0.5 rounded">{sz}: {qty}</span> : null
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-2">
                <p className="text-[#D4AF37] font-semibold text-base border-b border-white/10 pb-1">3. Dokumen & Pembayaran</p>
                <div className="space-y-1 text-xs">
                  {pendingData.proof_of_transfer?.[0] ? (
                    <p><span className="text-gray-400">Bukti Transfer:</span> <span className="text-emerald-400">✓ Terlampir ({pendingData.proof_of_transfer[0].name})</span></p>
                  ) : (
                    <p><span className="text-gray-400">Bukti Transfer:</span> <span className="text-gray-500">Tidak diunggah (Opsional)</span></p>
                  )}
                  {pendingData.assignment_letter?.[0] ? (
                    <p><span className="text-gray-400">Surat Tugas:</span> <span className="text-emerald-400">✓ Terlampir ({pendingData.assignment_letter[0].name})</span></p>
                  ) : (
                    ((pendingData.registration_mode === "Mandiri" && pendingData.type === "Peserta") || (pendingData.registration_mode === "Rombongan" && (pendingData.participant_count || 0) > 0)) && (
                      <p><span className="text-gray-400">Surat Tugas:</span> <span className="text-gray-500">Tidak diunggah (Opsional)</span></p>
                    )
                  )}
                  {pendingData.participant_list?.[0] && (
                    <p><span className="text-gray-400">File Daftar Nama:</span> <span className="text-emerald-400">✓ Attached ({pendingData.participant_list[0].name})</span></p>
                  )}
                  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">Total Tagihan:</span>
                    <strong className="text-[#D4AF37] text-lg font-bold">Rp {totalCost.toLocaleString('id-ID')}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowConfirmModal(false)} className="border-white/20 text-white hover:bg-white/10">
              Periksa Kembali / Edit
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={handleFinalSubmit} className="bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold">
              {isSubmitting ? "Mengirim..." : "Ya, Kirim Pendaftaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
