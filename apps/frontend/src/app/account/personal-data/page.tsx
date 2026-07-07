"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getCheckoutDados } from "@/actions/account/get-checkout-dados";
import { saveCheckoutDados } from "@/actions/account/save-checkout-dados";
import { fetchAddressByCep } from "@/actions/address/fetch-address-by-cep";
import {
  ReadonlyDataField,
  formatBirthDateDisplay,
} from "@/components/account/readonly-data-field";
import { ChangeNameModal } from "@/components/account/change-name-modal";
import { ChangeEmailModal } from "@/components/account/change-email-modal";
import { ChangeCpfModal } from "@/components/account/change-cpf-modal";
import { showErrorToast, showSuccessToast } from "@/lib/show-account-toast";

const defaultAddress = () => ({
  cep: "",
  street: "",
  number: "",
  complement: "",
  noNumber: false,
  neighborhood: "",
  city: "",
  state: "",
});

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits.replace(/(\d{5})/, "$1-");
  return digits.replace(/(\d{5})(\d{0,3})/, "$1-$2");
}


export default function PersonalDataPage() {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [document, setDocument] = useState("");
  const [documentLocked, setDocumentLocked] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthDateLocked, setBirthDateLocked] = useState(false);
  const [phone, setPhone] = useState("");
  const [addressInBrazil, setAddressInBrazil] = useState(true);
  const [address, setAddress] = useState(defaultAddress);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCheckoutDados()
      .then((result) => {
        if (cancelled) return;
        setLoading(false);
        if (result.success && result.data) {
          setEmail(result.data.email);
          setFullname(result.data.fullname);
          setDocument(formatCpf(result.data.document));
          setDocumentLocked(
            result.data.document.replace(/\D/g, "").length === 11,
          );
          setBirthDate(result.data.birthDate);
          setBirthDateLocked(Boolean(result.data.birthDate));
          setPhone(result.data.phone);
          setAddressInBrazil(!result.data.livingAbroad);
          setAddress({
            cep: result.data.address.cep,
            street: result.data.address.street,
            number: result.data.address.number,
            complement: result.data.address.complement,
            noNumber: result.data.address.noNumber,
            neighborhood: result.data.address.neighborhood,
            city: result.data.address.city,
            state: result.data.address.state,
          });
        } else if (!result.success) {
          setLoadError(result.message);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadError("Não foi possível carregar seus dados.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddressChange = (field: string, value: string | boolean) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (field === "cep") setCepError(null);
  };

  const handleCepBlur = useCallback(async () => {
    const digits = address.cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepError(null);
    setCepLoading(true);
    try {
      const result = await fetchAddressByCep(address.cep);
      if (result.success) {
        setAddress((prev) => ({
          ...prev,
          street: result.street,
          neighborhood: result.neighborhood,
          city: result.city,
          state: result.state,
        }));
      } else {
        setCepError(result.message);
      }
    } finally {
      setCepLoading(false);
    }
  }, [address.cep]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const result = await saveCheckoutDados({
      document: documentLocked ? undefined : document.replace(/\D/g, "") || undefined,
      birthDate: birthDateLocked ? undefined : birthDate || undefined,
      phone: phone || undefined,
      livingAbroad: !addressInBrazil,
      address: addressInBrazil
        ? {
          cep: address.cep || undefined,
          street: address.street || undefined,
          number: address.noNumber ? "" : address.number || undefined,
          complement: address.complement || undefined,
          noNumber: address.noNumber,
          neighborhood: address.neighborhood || undefined,
          city: address.city || undefined,
          state: address.state || undefined,
        }
        : undefined,
    });

    setSaving(false);
    if (result.success) {
      if (document.replace(/\D/g, "").length === 11) {
        setDocumentLocked(true);
      }
      if (birthDate) {
        setBirthDateLocked(true);
      }
      showSuccessToast({
        message: "Dados pessoais salvos com sucesso!",
      });
    } else {
      showErrorToast({ message: result.message });
    }
  };

  return (
    <div className="w-full">
      <Card className="bg-primary border-[#25252a] lg:p-8 p-4 text-zinc-100 rounded-[20px]">
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center justify-between border-b border-[#25252a] pb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-white">
                  Dados pessoais
                </h1>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 space-y-10">
          {loadError ? (
            <p className="text-sm text-red-400">{loadError}</p>
          ) : null}

          {loading ? (
            <p className="text-sm text-muted">Carregando seus dados...</p>
          ) : (
            <>
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-white border-b border-[#25252a] pb-2">
                  Dados do usuário
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReadonlyDataField
                    className="md:col-span-2"
                    label="E-mail"
                    value={email}
                    actionLabel="Alterar"
                    onAction={() => setShowEmailModal(true)}
                  />

                  <ReadonlyDataField
                    className="md:col-span-2"
                    label="Nome"
                    value={fullname}
                    actionLabel="Alterar"
                    onAction={() => setShowNameModal(true)}
                  />

                  {documentLocked ? (
                    <ReadonlyDataField
                      label="CPF"
                      value={document}
                      actionLabel="Alterar"
                      onAction={() => setShowCpfModal(true)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">CPF</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        value={document}
                        onChange={(e) => {
                          setDocument(formatCpf(e.target.value));
                        }}
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                    </div>
                  )}

                  {birthDateLocked ? (
                    <ReadonlyDataField
                      label="Data de nascimento"
                      value={formatBirthDateDisplay(birthDate)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        Data de nascimento
                      </label>
                      <Input
                        type="date"
                        value={birthDate}
                        onChange={(e) => {
                          setBirthDate(e.target.value);
                        }}
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white px-5 [color-scheme:dark]"
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-muted ml-1">
                      Telefone <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                      }}
                      className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-6 border-t border-[#25252a]">
                <h2 className="text-base font-semibold text-white border-b border-[#25252a] pb-2">
                  Endereço
                </h2>

                <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-[#25252a] w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setAddressInBrazil(true);
                    }}
                    className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${addressInBrazil
                      ? "bg-[#00c8ff] text-white"
                      : "text-muted hover:text-white"
                      }`}
                  >
                    Moro no Brasil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressInBrazil(false);
                    }}
                    className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${!addressInBrazil
                      ? "bg-[#00c8ff] text-white"
                      : "text-muted hover:text-white"
                      }`}
                  >
                    Moro no exterior
                  </button>
                </div>

                {addressInBrazil && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        CEP
                      </label>
                      <Input
                        placeholder="00000-000"
                        value={address.cep}
                        onChange={(e) =>
                          handleAddressChange("cep", formatCep(e.target.value))
                        }
                        onBlur={handleCepBlur}
                        disabled={cepLoading}
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                      {cepLoading ? (
                        <p className="text-xs text-muted">Buscando...</p>
                      ) : null}
                      {cepError ? (
                        <p className="text-xs text-red-400">{cepError}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-muted ml-1">
                        Rua
                      </label>
                      <Input
                        placeholder="Nome da rua"
                        value={address.street}
                        onChange={(e) =>
                          handleAddressChange("street", e.target.value)
                        }
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        Número
                      </label>
                      <Input
                        placeholder="Número"
                        value={address.number}
                        onChange={(e) =>
                          handleAddressChange("number", e.target.value)
                        }
                        disabled={address.noNumber}
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-muted hover:text-white">
                        <Checkbox
                          checked={address.noNumber}
                          onCheckedChange={(checked) => {
                            handleAddressChange("noNumber", !!checked);
                            if (checked) handleAddressChange("number", "");
                          }}
                          className="border-[#25252a] data-[state=checked]:bg-[#00c8ff] data-[state=checked]:border-[#00c8ff]"
                        />
                        Sem número
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        Complemento
                      </label>
                      <Input
                        placeholder="Apto, bloco, etc."
                        value={address.complement}
                        onChange={(e) =>
                          handleAddressChange("complement", e.target.value)
                        }
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        Bairro
                      </label>
                      <Input
                        placeholder="Bairro"
                        value={address.neighborhood}
                        onChange={(e) =>
                          handleAddressChange("neighborhood", e.target.value)
                        }
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        Cidade
                      </label>
                      <Input
                        placeholder="Cidade"
                        value={address.city}
                        onChange={(e) =>
                          handleAddressChange("city", e.target.value)
                        }
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted ml-1">
                        UF
                      </label>
                      <Input
                        placeholder="UF"
                        value={address.state}
                        onChange={(e) =>
                          handleAddressChange(
                            "state",
                            e.target.value.toUpperCase().slice(0, 2),
                          )
                        }
                        maxLength={2}
                        className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted px-5"
                      />
                    </div>
                  </div>
                )}

                {!addressInBrazil && (
                  <p className="text-sm text-muted py-4">
                    Em breve você poderá cadastrar endereço no exterior.
                  </p>
                )}
              </section>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-[52px] rounded-full bg-[#00c8ff] text-white hover:opacity-90 px-8"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <ChangeEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        currentEmail={email}
      />

      <ChangeNameModal
        open={showNameModal}
        onOpenChange={setShowNameModal}
        currentFullname={fullname}
      />

      <ChangeCpfModal
        open={showCpfModal}
        onOpenChange={setShowCpfModal}
        currentDocument={document}
      />
    </div>
  );
}
