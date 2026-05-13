"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createRequest } from "@/actions/request/create-request";
import { generateCareerCertificate } from "@/actions/career/generate-career-certificate";
import { Lock } from "@phosphor-icons/react";
import { FinalExamSchedulePicker } from "./final-exam-schedule-picker";

const REQUEST_TYPE = "CAREER_FINAL_EXAM";

export type CareerCertificatePanelProps = {
  careerId: string;
  careerSlug: string;
  careerTitle: string;
  enrollment: {
    isEnrolled: boolean;
    certificateIssued: boolean;
    canScheduleFinalExam: boolean;
    finalExamRequestPending: boolean;
    finalExamClearedAt: string | null;
  };
};

export function CareerCertificatePanel({
  careerId,
  careerSlug,
  careerTitle,
  enrollment,
}: CareerCertificatePanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  /** Após enviar o agendamento: esconde o botão até o refresh trazer `finalExamRequestPending` da API. */
  const [finalExamJustScheduled, setFinalExamJustScheduled] = useState(false);

  useEffect(() => {
    if (enrollment.finalExamRequestPending) {
      setFinalExamJustScheduled(false);
    }
  }, [enrollment.finalExamRequestPending]);

  const handleSlotChange = useCallback((iso: string | null) => {
    setSelectedSlotIso(iso);
  }, []);

  const handleSchedule = async () => {
    if (!selectedSlotIso) {
      alert("Selecione um dia e um horário disponíveis.");
      return;
    }
    setLoading(true);
    try {
      const slotLabel = format(parseISO(selectedSlotIso), "PPP 'às' HH:mm", {
        locale: ptBR,
      });
      const descriptionParts = [
        `Horário preferido: ${slotLabel}.`,
        notes.trim() ? `Observações: ${notes.trim()}` : null,
      ].filter(Boolean);

      const res = await createRequest({
        type: REQUEST_TYPE,
        title: `Exame final — ${careerTitle}`,
        description: descriptionParts.join("\n\n"),
        data: JSON.stringify({
          careerId,
          careerSlug,
          preferredSlotStart: selectedSlotIso,
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.success) {
        alert(res.message);
        return;
      }
      setFinalExamJustScheduled(true);
      setOpen(false);
      setNotes("");
      setSelectedSlotIso(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async () => {
    setIssueLoading(true);
    try {
      await generateCareerCertificate(careerId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao emitir certificado");
    } finally {
      setIssueLoading(false);
    }
  };

  if (!enrollment.isEnrolled) {
    return (
      <div className="mt-3 relative overflow-hidden rounded-[20px] border border-[#25252A]">
        <div className="h-[120px] w-full bg-black/40 flex items-center justify-center gap-2">
          <Lock size={20} className="text-white" />
          <span className="text-white text-sm font-semibold">Inscreva-se na carreira</span>
        </div>
      </div>
    );
  }

  const canShowScheduleButton =
    enrollment.canScheduleFinalExam && !finalExamJustScheduled;
  const showFinalExamChamadoMessage =
    enrollment.finalExamRequestPending || finalExamJustScheduled;

  return (
    <>
      {canShowScheduleButton ? (
        <Button
          type="button"
          variant="outline"
          className="mb-3 rounded-full bg-blue-gradient-500 w-full border-none h-[52px]  text-white hover:bg-[#00C8FF]/10"
          onClick={() => setOpen(true)}
        >
          Agendar exame final
        </Button>
      ) : null}

      {showFinalExamChamadoMessage ? (
        <p className="mb-3 text-xs text-amber-200/90">
          Agendamento realizado com sucesso. Aguarde a análise da equipe.
        </p>
      ) : null}

      <div className="relative overflow-hidden rounded-[20px] border border-[#25252A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/certificate-image.png"
          alt="Certificado"
          width={500}
          height={120}
          className="h-[120px] w-full object-cover opacity-80"
        />

        {enrollment.certificateIssued ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              asChild
              className="h-10 rounded-full bg-[#00C8FF] hover:bg-[#00a8d4] text-black font-semibold"
            >
              <Link href="/account/certificates">Ver certificado</Link>
            </Button>
          </div>
        ) : enrollment.finalExamClearedAt ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 px-4">
            <p className="text-center text-xs text-white/80">
              Exame final liberado. Emita seu certificado.
            </p>
            <Button
              type="button"
              disabled={issueLoading}
              onClick={handleIssueCertificate}
              className="h-10 rounded-full bg-[#00C8FF] hover:bg-[#00a8d4] text-black font-semibold"
            >
              {issueLoading ? "Emitindo…" : "Emitir certificado"}
            </Button>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center gap-2">
            <Lock size={20} className="text-white" />
            <span className="text-white text-sm font-semibold">Bloqueado</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-white/55">
        Conclua 100% dos cursos e todos os exames (nota mínima 70% e aprovação em cada prova),
        agende e realize o exame final para liberar o certificado.
      </p>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setPickerKey((k) => k + 1);
          } else {
            setNotes("");
            setSelectedSlotIso(null);
          }
        }}
      >
        <DialogContent className="border-[#25252A] bg-[#0c0c0d] text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar exame final</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FinalExamSchedulePicker
              key={pickerKey}
              onSlotChange={handleSlotChange}
            />
            <div className="space-y-2">
              <label htmlFor="final-exam-notes" className="text-sm text-white/80 block">
                Observações adicionais (opcional)
              </label>
              <Textarea
                id="final-exam-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-[#333] bg-[#141418] text-white"
                placeholder="Ex.: necessidade de acessibilidade, fuso horário, etc."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={loading || !selectedSlotIso}
              onClick={handleSchedule}
            >
              {loading ? "Enviando…" : "Enviar solicitação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
