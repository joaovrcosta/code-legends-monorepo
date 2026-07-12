"use client";

import { useCallback, useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  bootstrapPaymentSettings,
  getPaymentSettings,
  type PaymentSettings,
} from "@/actions/settings/payments";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

function StatusItem({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPaymentSettings();
      setSettings(data.settings);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar configurações de pagamento",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBootstrap = async () => {
    try {
      setBootstrapping(true);
      const data = await bootstrapPaymentSettings();
      setSettings(data.settings);

      if (data.settings.checkoutReady) {
        toast.success("Configuração de pagamentos pronta para checkout.");
      } else {
        toast.success(
          "Provedor registrado. Configure ABACATE_PAY_API_KEY no Render para habilitar checkout.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao garantir configuração de pagamentos",
      );
    } finally {
      setBootstrapping(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ch">Pagamentos</h1>
          <p className="mt-2 text-ch-muted">
            Configuração global do gateway de checkout da plataforma.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico</CardTitle>
            <CardDescription>
              Verifique se o provedor está registrado e se as credenciais estão
              configuradas no ambiente da API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted">Carregando...</p>
            ) : settings ? (
              <>
                <div className="space-y-2 rounded-lg border border-[#25252A] p-4">
                  <StatusItem
                    ok={settings.providerRegistered}
                    label="Provedor registrado no banco"
                  />
                  <StatusItem
                    ok={settings.credentials.apiKeyConfigured}
                    label="ABACATE_PAY_API_KEY configurada"
                  />
                  <StatusItem
                    ok={settings.credentials.webhookSecretConfigured}
                    label="ABACATE_PAY_WEBHOOK_SECRET configurada (webhook)"
                  />
                  <StatusItem
                    ok={settings.checkoutReady}
                    label="Checkout pronto"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => void handleBootstrap()}
                  disabled={bootstrapping}
                >
                  {bootstrapping ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Garantindo...
                    </>
                  ) : (
                    "Garantir configuração"
                  )}
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>

        {settings ? (
          <Card>
            <CardHeader>
              <CardTitle>{settings.name}</CardTitle>
              <CardDescription>
                Gateway global usado em todos os checkouts da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{settings.slug}</Badge>
                <Badge variant="secondary">{settings.handlerKey}</Badge>
                {settings.status ? (
                  <Badge
                    variant={
                      settings.status === "ACTIVE" ? "default" : "destructive"
                    }
                  >
                    {settings.status}
                  </Badge>
                ) : (
                  <Badge variant="destructive">Não registrado</Badge>
                )}
              </div>
              <p className="text-sm text-muted">
                Métodos suportados:{" "}
                {settings.supportedMethods.length > 0
                  ? settings.supportedMethods.join(", ")
                  : "—"}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Credenciais no Render</CardTitle>
            <CardDescription>
              As chaves não são editadas aqui por segurança. Configure no painel
              do Render (ou no .env local) e reinicie a API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted">
            <p>
              <code className="rounded bg-muted px-1.5 py-0.5">
                ABACATE_PAY_API_KEY
              </code>{" "}
              — obrigatória para checkout
            </p>
            <p>
              <code className="rounded bg-muted px-1.5 py-0.5">
                ABACATE_PAY_WEBHOOK_SECRET
              </code>{" "}
              — necessária para webhooks de pagamento
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
