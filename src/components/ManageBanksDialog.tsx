import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase";
import { toast } from "sonner";
import { CreditCard, PiggyBank, Trash2 } from "lucide-react";
import { Bank, BankType } from "@/integrations/types";

export const ManageBanksDialog = ({
  open,
  onOpenChange,
  userId,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onChanged?: () => void;
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<BankType>("savings");
  const [balance, setBalance] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users", userId, "banks"));
      setBanks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bank)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const addBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !balance) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "users", userId, "banks"), {
        name: name.trim(),
        type,
        balance: parseFloat(balance),
        createdAt: serverTimestamp(),
      });
      setBanks((prev) => [
        ...prev,
        { id: ref.id, name: name.trim(), type, balance: parseFloat(balance) },
      ]);
      setName("");
      setBalance("");
      toast.success("Banco añadido");
      onChanged?.();
    } catch {
      toast.error("Error al añadir banco");
    } finally {
      setBusy(false);
    }
  };

  const deleteBank = async (bankId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId, "banks", bankId));
      setBanks((prev) => prev.filter((b) => b.id !== bankId));
      toast.success("Banco eliminado");
      onChanged?.();
    } catch {
      toast.error("Error al eliminar banco");
    }
  };

  const bankTypes: { id: BankType; label: string; icon: typeof CreditCard }[] = [
    { id: "savings", label: "Ahorros", icon: PiggyBank },
    { id: "credit", label: "Crédito", icon: CreditCard },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">Mis Bancos</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
          ) : banks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay bancos añadidos
            </p>
          ) : (
            banks.map((bank) => {
              const Icon = bank.type === "credit" ? CreditCard : PiggyBank;
              return (
                <div
                  key={bank.id}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-muted-foreground" strokeWidth={2} />
                    <div>
                      <p className="text-sm font-medium">{bank.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bank.type === "credit" ? "Crédito" : "Ahorros"} ·{" "}
                        $
                        {bank.balance.toLocaleString("es", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBank(bank.id)}
                    className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                    aria-label="Eliminar banco"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={addBank}
          className="space-y-4 mt-2 border-t border-border pt-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Añadir banco
          </p>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Bancolombia, Nequi, Davivienda…"
              maxLength={60}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Tipo de tarjeta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {bankTypes.map((t) => {
                const Icon = t.icon;
                const active = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-float"
                        : "bg-surface text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Saldo inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full h-12 rounded-2xl border border-border bg-surface pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
          >
            {busy ? "Añadiendo..." : "Añadir banco"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
