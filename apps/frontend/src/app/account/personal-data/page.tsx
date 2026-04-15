"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function PersonalDataPage() {
  const [userData, setUserData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
  });

  const [addressInBrazil, setAddressInBrazil] = useState(true);
  const [address, setAddress] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    noNumber: false,
    neighborhood: "",
    city: "",
    state: "",
  });

  const [saving, setSaving] = useState(false);

  const handleSaveUserData = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  const handleAddressChange = (field: string, value: string | boolean) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full mt-8">
      <Card className="bg-surface border-[#25252a] lg:p-8 p-4 text-zinc-100">
        <CardHeader className="px-0 pt-0 pb-8">
          <div className="flex items-center justify-between border-b border-[#25252a] pb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[#00c8ff]">
                  <User className="w-6 h-6" />
                </span>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#00c8ff] to-[#00ff88] bg-clip-text text-transparent">
                  Dados pessoais
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Gerencie suas informações pessoais e endereço.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 space-y-10">
          {/* Seção: Dados do usuário */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-[#25252a] pb-2">
              Dados do usuário
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground ml-1">
                  Nome <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="Seu nome completo"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">
                  CPF <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="000.000.000-00"
                    value={userData.cpf}
                    onChange={(e) =>
                      setUserData((prev) => ({ ...prev, cpf: e.target.value }))
                    }
                    className="h-[52px] flex-1 rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-[52px] rounded-full border-[#25252a] text-muted-foreground hover:text-[#00c8ff] hover:border-[#00c8ff]/30"
                  >
                    Alterar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground ml-1">
                  Data de nascimento <span className="text-red-400">*</span>
                </label>
                <Input
                  type="date"
                  placeholder="DD/MM/AAAA"
                  value={userData.birthDate}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground ml-1">
                  Telefone <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveUserData}
              disabled={saving}
              className="mt-4 h-[52px] rounded-full bg-[#00c8ff] text-white hover:opacity-90 px-8"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </section>

          {/* Seção: Endereço */}
          <section className="space-y-4 pt-6 border-t border-[#25252a]">
            <h2 className="text-base font-semibold text-white border-b border-[#25252a] pb-2">
              Endereço
            </h2>

            {/* Tabs Moro no Brasil / Moro no exterior */}
            <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-[#25252a] w-fit">
              <button
                type="button"
                onClick={() => setAddressInBrazil(true)}
                className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${addressInBrazil
                    ? "bg-[#00c8ff] text-white"
                    : "text-muted-foreground hover:text-white"
                  }`}
              >
                Moro no Brasil
              </button>
              <button
                type="button"
                onClick={() => setAddressInBrazil(false)}
                className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${!addressInBrazil
                    ? "bg-[#00c8ff] text-white"
                    : "text-muted-foreground hover:text-white"
                  }`}
              >
                Moro no exterior
              </button>
            </div>

            {addressInBrazil && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground ml-1">CEP</label>
                  <Input
                    placeholder="00000-000"
                    value={address.cep}
                    onChange={(e) =>
                      handleAddressChange("cep", e.target.value)
                    }
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-muted-foreground ml-1">
                    Rua
                  </label>
                  <Input
                    placeholder="Nome da rua"
                    value={address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground ml-1">
                    Número
                  </label>
                  <Input
                    placeholder="Número"
                    value={address.number}
                    onChange={(e) =>
                      handleAddressChange("number", e.target.value)
                    }
                    disabled={address.noNumber}
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-muted-foreground hover:text-white">
                    <Checkbox
                      checked={address.noNumber}
                      onCheckedChange={(checked) =>
                        handleAddressChange("noNumber", !!checked)
                      }
                      className="border-[#25252a] data-[state=checked]:bg-[#00c8ff] data-[state=checked]:border-[#00c8ff]"
                    />
                    Sem número
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground ml-1">
                    Complemento
                  </label>
                  <Input
                    placeholder="Apto, bloco, etc."
                    value={address.complement}
                    onChange={(e) =>
                      handleAddressChange("complement", e.target.value)
                    }
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground ml-1">
                    Bairro
                  </label>
                  <Input
                    placeholder="Bairro"
                    value={address.neighborhood}
                    onChange={(e) =>
                      handleAddressChange("neighborhood", e.target.value)
                    }
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground ml-1">
                    Cidade
                  </label>
                  <Input
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground ml-1">
                    UF
                  </label>
                  <Input
                    placeholder="UF"
                    value={address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    maxLength={2}
                    className="h-[52px] rounded-full border-[#25252a] bg-transparent text-white placeholder:text-muted-foreground px-5"
                  />
                </div>
              </div>
            )}

            {!addressInBrazil && (
              <p className="text-sm text-muted-foreground py-4">
                Em breve você poderá cadastrar endereço no exterior.
              </p>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
