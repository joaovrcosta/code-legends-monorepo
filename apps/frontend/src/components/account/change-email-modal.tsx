"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createRequest } from "@/actions/request/create-request";
import { verifyPassword } from "@/actions/auth/verify-password";
import { showSuccessToast } from "@/lib/show-account-toast";

interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}

export function ChangeEmailModal({
  open,
  onOpenChange,
  currentEmail,
}: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setNewEmail("");
    setPassword("");
    setReason("");
    setShowPassword(false);
    setError(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!newEmail.trim() || !password || !reason.trim()) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) {
      setError("Informe um e-mail válido");
      return;
    }

    if (newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      setError("O novo e-mail deve ser diferente do e-mail atual");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const passwordVerification = await verifyPassword(password);

      if (!passwordVerification.success) {
        setError(
          passwordVerification.message ||
          "Senha incorreta. Verifique e tente novamente.",
        );
        setSubmitting(false);
        return;
      }

      const requestData = {
        newEmail: newEmail.trim(),
        reason: reason.trim(),
      };

      const result = await createRequest({
        type: "EMAIL_CHANGE",
        title: "Solicitação de alteração de email",
        description: reason.trim(),
        data: JSON.stringify(requestData),
      });

      if (result.success) {
        showSuccessToast({
          message: "Solicitação de alteração de e-mail enviada com sucesso!",
        });
        handleClose();
      } else {
        setError(result.message || "Erro ao enviar solicitação. Tente novamente.");
      }
    } catch {
      setError("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="bg-surface border-[#25252A] text-white max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              Alterar email
            </DialogTitle>
            <button
              type="button"
              onClick={handleClose}
              className="text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DialogDescription className="text-sm text-muted pt-2">
            Por motivos de segurança, nossa equipe validará a alteração.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-400 mb-1">
                    Erro na validação
                  </h4>
                  <p className="text-sm text-red-300">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="p-3 bg-surface-2 rounded-lg border border-[#25252A]">
            <span className="text-sm text-zinc-300">{currentEmail || "—"}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted">Novo email</label>
            <Input
              type="email"
              placeholder="Para qual e-mail você gostaria de alterar?"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-transparent border-[#25252A] text-white placeholder:text-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha para confirmar"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-[#25252A] text-white placeholder:text-muted pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted">
              Motivo da alteração
            </label>
            <div className="relative">
              <Textarea
                placeholder="Descreva por que você precisa fazer essa alteração"
                value={reason}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setReason(e.target.value);
                  }
                }}
                className="bg-transparent border-[#25252A] text-white placeholder:text-muted min-h-[100px] resize-none"
                maxLength={100}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted">
                {reason.length}/100
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-transparent border-[#25252A] text-muted hover:text-white rounded-[12px] h-[52px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting || !newEmail.trim() || !password || !reason.trim()
            }
            className="bg-[#00c8ff] text-white hover:opacity-90 rounded-[12px] h-[52px]"
          >
            {submitting ? "Enviando..." : "Solicitar alteração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
