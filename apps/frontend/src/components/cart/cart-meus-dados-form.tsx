"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INPUT_CLASS } from "./constants";
import { getCheckoutDados } from "@/actions/account/get-checkout-dados";
import { saveCheckoutDados } from "@/actions/account/save-checkout-dados";

interface CartMeusDadosFormProps {
  onAdvanceToPayment: () => void;
  /** Quando true, carrega os dados do usuário da API para preencher o form */
  isOpen?: boolean;
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

export function CartMeusDadosForm({
  onAdvanceToPayment,
  isOpen = true,
}: CartMeusDadosFormProps) {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [livingAbroad, setLivingAbroad] = useState(false);
  const [address, setAddress] = useState(defaultAddress);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
          setPhone(result.data.phone);
          setLivingAbroad(result.data.livingAbroad);
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
    setSaving(true);
    const result = await saveCheckoutDados({
      fullname: fullname || undefined,
      document: document || undefined,
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
      onAdvanceToPayment();
    } else {
      // TODO: toast ou mensagem de erro
      console.error(result.message);
    }
  };

  const updateAddress = (key: keyof ReturnType<typeof defaultAddress>, value: string | boolean) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
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
          onChange={(e) => setLivingAbroad(e.target.checked)}
          className="rounded border-[#25252A] bg-[#25252A] text-[#00C8FF]"
        />
        Estou morando fora do Brasil
      </label>

      {loading ? (
        <p className="text-sm text-[#7e7e89] py-4">Carregando seus dados...</p>
      ) : (
        <>
          <p className="text-xs font-medium text-[#7e7e89] mb-2">Dados pessoais</p>
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="E-mail"
              className={INPUT_CLASS}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Nome completo"
              className={INPUT_CLASS}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CPF"
                className={`flex-1 ${INPUT_CLASS}`}
                value={document}
                onChange={(e) => setDocument(e.target.value)}
              />
              <div className="flex items-center h-12 px-3 rounded-lg bg-[#25252A] border border-[#25252A] text-[#7e7e89] text-sm gap-1">
                <span>🇧🇷</span>
                <span>+55</span>
              </div>
            </div>
            <input
              type="tel"
              placeholder="Telefone com DDD"
              className={INPUT_CLASS}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <p className="text-xs font-medium text-[#7e7e89] mb-2">Endereço</p>
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="CEP"
                className={`flex-1 ${INPUT_CLASS}`}
                value={address.cep}
                onChange={(e) => updateAddress("cep", e.target.value)}
              />
              <button type="button" className="text-sm text-[#00C8FF] hover:underline shrink-0">
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
              <input
                type="text"
                placeholder="Complemento"
                className={`flex-1 ${INPUT_CLASS}`}
                value={address.complement}
                onChange={(e) => updateAddress("complement", e.target.value)}
              />
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
              <input
                type="text"
                placeholder="Cidade"
                className={`flex-1 ${INPUT_CLASS}`}
                value={address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
              />
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

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          onClick={handleAdvance}
          disabled={loading || saving}
          className={cn(
            "h-12 px-8 rounded-full text-sm font-semibold",
            "bg-blue-gradient-500 hover:opacity-90 border-0"
          )}
        >
          {saving ? "Salvando..." : "AVANÇAR"}
        </Button>
      </div>
    </>
  );
}
