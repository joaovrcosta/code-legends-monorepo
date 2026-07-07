"use client";

import {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INPUT_CLASS } from "./constants";
import { getCheckoutDados } from "@/actions/account/get-checkout-dados";
import { saveCheckoutDados } from "@/actions/account/save-checkout-dados";
import { fetchAddressByCep } from "@/actions/address/fetch-address-by-cep";
import {
  ReadonlyDataField,
  formatBirthDateDisplay,
} from "@/components/account/readonly-data-field";
import { ChangeNameModal } from "@/components/account/change-name-modal";
import { ChangeEmailModal } from "@/components/account/change-email-modal";

export interface CartMeusDadosFormHandle {
  advanceToPayment: () => Promise<void>;
  canAdvance: () => boolean;
}

interface CartMeusDadosFormProps {
  onAdvanceToPayment: () => void;
  /** Quando true, carrega os dados do usuário da API para preencher o form */
  isOpen?: boolean;
  /** Quando false, esconde o botão interno de avançar (pra usar um botão externo) */
  showInternalAdvanceButton?: boolean;
  onValidityChange?: (isValid: boolean) => void;
}

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

export const CartMeusDadosForm = forwardRef<CartMeusDadosFormHandle, CartMeusDadosFormProps>(
  (
    {
      onAdvanceToPayment,
      isOpen = true,
      showInternalAdvanceButton = true,
      onValidityChange,
    },
    ref,
  ) => {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [livingAbroad, setLivingAbroad] = useState(false);
  const [address, setAddress] = useState(defaultAddress);
  const [identityLocked, setIdentityLocked] = useState({
    fullname: false,
    document: false,
    birthDate: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const isFormValid = useMemo(() => {
    const emailValue = email.trim();
    const fullNameValue = fullname.trim();
    const cpfDigits = document.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");

    if (!emailValue || !/^\S+@\S+\.\S+$/.test(emailValue)) return false;
    if (!fullNameValue) return false;
    if (cpfDigits.length !== 11) return false;
    if (!birthDate) return false;
    if (phoneDigits.length < 10) return false;

    if (livingAbroad) return true;

    const cepDigits = address.cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) return false;
    if (!address.street.trim()) return false;
    if (!address.neighborhood.trim()) return false;
    if (!address.state.trim()) return false;
    if (!address.city.trim()) return false;
    if (!address.noNumber && !address.number.trim()) return false;

    return true;
  }, [email, fullname, document, birthDate, phone, livingAbroad, address]);

  useEffect(() => {
    onValidityChange?.(isFormValid);
  }, [isFormValid, onValidityChange]);

  const getFirstInvalidMessage = () => {
    const emailValue = email.trim();
    const fullNameValue = fullname.trim();
    const cpfDigits = document.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");

    if (!emailValue) return "Informe seu e-mail.";
    if (!/^\S+@\S+\.\S+$/.test(emailValue)) return "Informe um e-mail válido.";
    if (!fullNameValue) return "Informe seu nome completo.";
    if (cpfDigits.length !== 11) return "Informe um CPF válido.";
    if (!birthDate) return "Informe sua data de nascimento.";
    if (phoneDigits.length < 10) return "Informe um telefone com DDD.";

    if (livingAbroad) return null;

    const cepDigits = address.cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) return "Informe um CEP válido.";
    if (!address.street.trim()) return "Informe a rua.";
    if (!address.neighborhood.trim()) return "Informe o bairro.";
    if (!address.city.trim()) return "Preencha o CEP para buscar a cidade.";
    if (!address.state.trim()) return "Informe o estado.";
    if (!address.noNumber && !address.number.trim())
      return "Informe o número (ou marque “Sem número”).";

    return null;
  };

  useEffect(() => {
    if (!isOpen || loaded) return;
    let cancelled = false;
    setLoading(true);
    getCheckoutDados()
      .then((result) => {
        if (cancelled) return;
        setLoading(false);
        setLoaded(true);
        if (result.success && result.data) {
          setEmail(result.data.email);
          setFullname(result.data.fullname);
          setDocument(result.data.document);
          setBirthDate(result.data.birthDate);
          setPhone(result.data.phone);
          setLivingAbroad(result.data.livingAbroad);
          setIdentityLocked({
            fullname: Boolean(result.data.fullname?.trim()),
            document: result.data.document.replace(/\D/g, "").length === 11,
            birthDate: Boolean(result.data.birthDate),
          });
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
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, loaded]);

  const handleAdvance = async () => {
    if (saving) return;

    const msg = getFirstInvalidMessage();
    if (msg) {
      setFormError(msg);
      return;
    }

    setSaving(true);
    const result = await saveCheckoutDados({
      fullname: identityLocked.fullname ? undefined : fullname || undefined,
      document: identityLocked.document ? undefined : document || undefined,
      birthDate: identityLocked.birthDate ? undefined : birthDate || undefined,
      phone: phone || undefined,
      livingAbroad,
      address: {
        cep: address.cep || undefined,
        street: address.street || undefined,
        number: address.noNumber ? "" : (address.number || undefined),
        complement: address.complement || undefined,
        noNumber: address.noNumber,
        neighborhood: address.neighborhood || undefined,
        city: address.city || undefined,
        state: address.state || undefined,
      },
    });
    setSaving(false);
    if (result.success) {
      setFormError(null);
      onAdvanceToPayment();
    } else {
      // TODO: toast ou mensagem de erro
      console.error(result.message);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      advanceToPayment: handleAdvance,
      canAdvance: () => isFormValid && !loading && !saving,
    }),
    [isFormValid, loading, saving],
  );

  const updateAddress = (key: keyof ReturnType<typeof defaultAddress>, value: string | boolean) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
    if (key === "cep") setCepError(null);
    setFormError(null);
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

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits.replace(/(\d{5})/, "$1-");
    return digits.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  return (
    <>
      <p className="text-sm text-[#7e7e89] mb-4">
        Confirme seus dados. Eles aparecerão em sua nota fiscal.
      </p>
      <label className="flex items-center gap-2 text-sm text-[#c4c4cc] mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={livingAbroad}
          onChange={(e) => {
            setLivingAbroad(e.target.checked);
            setFormError(null);
          }}
          className="rounded border-[#25252A] bg-[#25252A] text-[#00C8FF]"
        />
        Estou morando fora do Brasil
      </label>

      {formError ? (
        <p className="text-sm text-red-400 mb-4">{formError}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[#7e7e89] py-4">Carregando seus dados...</p>
      ) : (
        <>
          <p className="text-xs font-medium text-[#7e7e89] mb-2">Dados pessoais</p>
          <div className="space-y-4 mb-6">
            <ReadonlyDataField
              label="E-mail"
              value={email}
              actionLabel="Alterar"
              onAction={() => setShowEmailModal(true)}
            />
            {identityLocked.fullname ? (
              <ReadonlyDataField
                label="Nome completo"
                value={fullname}
                actionLabel="Alterar"
                onAction={() => setShowNameModal(true)}
              />
            ) : (
              <input
                type="text"
                placeholder="Nome completo"
                className={INPUT_CLASS}
                value={fullname}
                onChange={(e) => {
                  setFullname(e.target.value);
                  setFormError(null);
                }}
              />
            )}
            {identityLocked.document ? (
              <ReadonlyDataField label="CPF" value={document} />
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CPF"
                  maxLength={14}
                  className={`flex-1 ${INPUT_CLASS}`}
                  value={document}
                  onChange={(e) => {
                    setDocument(formatCpf(e.target.value));
                    setFormError(null);
                  }}
                />
              </div>
            )}
            {identityLocked.birthDate ? (
              <ReadonlyDataField
                label="Data de nascimento"
                value={formatBirthDateDisplay(birthDate)}
              />
            ) : (
              <input
                type="date"
                placeholder="Data de nascimento"
                className={INPUT_CLASS}
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setFormError(null);
                }}
              />
            )}
            <div className="flex gap-2">
              <div className="flex items-center h-12 px-3 rounded-lg bg-[#25252A] border border-[#25252A] text-[#7e7e89] text-sm gap-1">
                <span>🇧🇷</span>
                <span>+55</span>
              </div>
              <input
                type="tel"
                placeholder="Telefone com DDD"
                className={INPUT_CLASS}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFormError(null);
                }}
              />
            </div>
          </div>

          <p className="text-xs font-medium text-[#7e7e89] mb-2">CEP</p>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  maxLength={9}
                  className={cn("flex-1", INPUT_CLASS, cepLoading && "opacity-70")}
                  value={address.cep}
                  onChange={(e) => updateAddress("cep", formatCep(e.target.value))}
                  onBlur={handleCepBlur}
                  disabled={cepLoading}
                />
                {cepLoading && (
                  <span className="text-xs text-[#7e7e89] shrink-0">Buscando...</span>
                )}
              </div>
              {cepError && (
                <p className="text-xs text-red-400">{cepError}</p>
              )}
              <button
                type="button"
                className="text-sm text-[#00C8FF] hover:underline shrink-0 w-fit"
                onClick={() => window.open("https://buscacepinter.correios.com.br/app/endereco/index.php", "_blank")}
              >
                Não sei o CEP
              </button>
            </div>
            <input
              type="text"
              placeholder="Rua"
              className={INPUT_CLASS}
              value={address.street}
              onChange={(e) => updateAddress("street", e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Número"
                className={`w-24 ${INPUT_CLASS}`}
                value={address.number}
                onChange={(e) => updateAddress("number", e.target.value)}
                disabled={address.noNumber}
              />
              {/* <input
                type="text"
                placeholder="Complemento"
                className={`flex-1 ${INPUT_CLASS}`}
                value={address.complement}
                onChange={(e) => updateAddress("complement", e.target.value)}
              /> */}
            </div>
            <label className="flex items-center gap-2 text-sm text-[#c4c4cc] cursor-pointer">
              <input
                type="checkbox"
                checked={address.noNumber}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateAddress("noNumber", checked);
                  if (checked) updateAddress("number", "");
                }}
                className="rounded border-[#25252A] bg-[#25252A] text-[#00C8FF]"
              />
              Sem número
            </label>
            <input
              type="text"
              placeholder="Bairro"
              className={INPUT_CLASS}
              value={address.neighborhood}
              onChange={(e) => updateAddress("neighborhood", e.target.value)}
            />
            <div className="flex gap-2">
              {/* <input
                type="text"
                placeholder="Cidade"
                className={`flex-1 ${INPUT_CLASS}`}
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
              /> */}
              <input
                type="text"
                placeholder="Estado"
                className={`w-20 ${INPUT_CLASS}`}
                value={address.state}
                onChange={(e) => updateAddress("state", e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {showInternalAdvanceButton ? (
        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={handleAdvance}
            disabled={loading || saving || !isFormValid}
            className={cn(
              "h-12 px-8 rounded-full text-sm font-semibold",
              "bg-blue-gradient-500 hover:opacity-90 border-0"
            )}
          >
            {saving ? "Salvando..." : "AVANÇAR"}
          </Button>
        </div>
      ) : null}

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
    </>
  );
  },
);

CartMeusDadosForm.displayName = "CartMeusDadosForm";
