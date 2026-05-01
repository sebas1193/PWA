import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/client";
import { toast } from "sonner";
import { Banknote, CreditCard, PiggyBank } from "lucide-react";

const schema = z.object({
  amount: z.number().positive("Monto debe ser mayor a 0").max(1_000_000_000),
  payment_method: z.enum(["cash", "credit", "savings"]),
  description: z.string().trim().max(200).optional(),
  transaction_date: z.string().min(1),
});

type Method = "cash" | "credit" | "savings";

const methods: { id: Method; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Efectivo", icon: Banknote },
  { id: "credit", label: "Crédito", icon: CreditCard },
  { id: "savings", label: "Ahorros", icon: PiggyBank },
];

export const AddTransactionDialog = ({
  open,
  onOpenChange,
  userId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onCreated: () => void;
}) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("cash");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setAmount("");
    setMethod("cash");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = schema.parse({
        amount: parseFloat(amount),
        payment_method: method,
        description: description || undefined,
        transaction_date: date,
      });
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        amount: parsed.amount,
        payment_method: parsed.payment_method,
        description: parsed.description ?? null,
        transaction_date: parsed.transaction_date,
      });
      if (error) throw error;
      toast.success("Transacción añadida");
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? err.errors[0].message
          : (err as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">
            Nueva transacción
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 mt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 rounded-2xl border border-border bg-surface pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Método de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`h-20 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-float"
                        : "bg-surface text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={2} />
                    <span className="text-[11px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Café, gasolina, etc."
              maxLength={200}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
          >
            {busy ? "Guardando..." : "Guardar transacción"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
