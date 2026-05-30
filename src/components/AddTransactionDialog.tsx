import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "@/integrations/firebase";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  PiggyBank,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Bank, Category } from "@/integrations/types";

const schema = z.object({
  amount: z.number().positive("Monto debe ser mayor a 0").max(1_000_000_000),
  paymentMethod: z.enum(["cash", "credit", "savings"]),
  description: z.string().trim().max(200).optional(),
  transactionDate: z.string().min(1),
  bankId: z.string().nullable(),
  categoryId: z.string().nullable(),
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
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bankId, setBankId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      getDocs(collection(db, "users", userId, "banks")),
      getDocs(collection(db, "users", userId, "categories")),
    ])
      .then(([banksSnap, catsSnap]) => {
        setBanks(banksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Bank)));
        setCategories(catsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
      })
      .catch(() => {});
  }, [open, userId]);

  useEffect(() => {
    if (method === "cash") setBankId(null);
  }, [method]);

  const reset = () => {
    setAmount("");
    setMethod("cash");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
    setLocationEnabled(false);
    setLocation(null);
    setBankId(null);
    setCategoryId(null);
  };

  const handleToggleLocation = (enabled: boolean) => {
    setLocationEnabled(enabled);
    if (!enabled) {
      setLocation(null);
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      setLocationEnabled(false);
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado por el navegador"
            : "No se pudo obtener la ubicación";
        toast.error(msg);
        setLocationEnabled(false);
        setLocation(null);
        setLocLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const parsed = schema.parse({
        amount: parseFloat(amount),
        paymentMethod: method,
        description: description || undefined,
        transactionDate: date,
        bankId: method !== "cash" ? bankId : null,
        categoryId: categoryId || null,
      });

      await addDoc(collection(db, "users", userId, "transactions"), {
        amount: parsed.amount,
        paymentMethod: parsed.paymentMethod,
        bankId: parsed.bankId,
        categoryId: parsed.categoryId,
        description: parsed.description ?? null,
        transactionDate: parsed.transactionDate,
        location: locationEnabled && location ? location : null,
        createdAt: serverTimestamp(),
      });

      if (parsed.bankId) {
        const selectedCategory = categories.find((c) => c.id === parsed.categoryId);
        const delta =
          selectedCategory?.nature === "income" ? parsed.amount : -parsed.amount;
        await updateDoc(doc(db, "users", userId, "banks", parsed.bankId), {
          balance: increment(delta),
        });
      }

      toast.success("Transacción añadida");
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      const msg =
        err instanceof z.ZodError ? err.errors[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const filteredBanks = banks.filter((b) => b.type === method);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">
            Nueva transacción
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5 mt-2">
          {/* Monto */}
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

          {/* Método de pago */}
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

          {/* Selector de banco (solo crédito/ahorros) */}
          {method !== "cash" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Banco
              </label>
              {filteredBanks.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">
                  No hay bancos de tipo{" "}
                  {method === "credit" ? "crédito" : "ahorros"}. Añade uno
                  desde "Mis Bancos" en el inicio.
                </p>
              ) : (
                <div className="grid gap-2">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() =>
                        setBankId(bankId === bank.id ? null : bank.id)
                      }
                      className={`h-14 rounded-2xl border px-4 flex items-center justify-between transition ${
                        bankId === bank.id
                          ? "bg-primary text-primary-foreground border-primary shadow-float"
                          : "bg-surface text-muted-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-sm font-medium">{bank.name}</span>
                      <span className="text-xs opacity-70">
                        $
                        {bank.balance.toLocaleString("es", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categoría */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Categoría
            </label>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1">
                No hay categorías. Añade una desde "Categorías" en el inicio.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={categoryId ?? ""}
                  onChange={(e) => setCategoryId(e.target.value || null)}
                  className="w-full h-12 rounded-2xl border border-border bg-surface px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.nature === "income" ? "Ingreso" : "Egreso"})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>

          {/* Descripción */}
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

          {/* Fecha */}
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

          {/* Ubicación */}
          <div>
            <div className="flex items-center justify-between h-12 rounded-2xl border border-border bg-surface px-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                <span>Guardar ubicación actual</span>
              </div>
              <Switch
                checked={locationEnabled}
                onCheckedChange={handleToggleLocation}
                disabled={locLoading}
              />
            </div>
            {locationEnabled && (
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                {locLoading
                  ? "Obteniendo ubicación..."
                  : location
                  ? `Ubicación capturada (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})`
                  : "No se pudo obtener la ubicación"}
              </p>
            )}
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
