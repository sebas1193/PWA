import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  LogOut,
  Banknote,
  CreditCard,
  PiggyBank,
  Building2,
  Tag,
  Pencil,
  Trash2,
  Check,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/integrations/firebase";
import { useAuth } from "@/hooks/useAuth";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { ManageBanksDialog } from "@/components/ManageBanksDialog";
import { ManageCategoriesDialog } from "@/components/ManageCategoriesDialog";
import { Bank, Category, Transaction } from "@/integrations/types";
import { toast } from "sonner";

type Method = "cash" | "credit" | "savings";

const methodMeta: Record<Method, { label: string; icon: typeof Banknote }> = {
  cash: { label: "Efectivo", icon: Banknote },
  credit: { label: "Crédito", icon: CreditCard },
  savings: { label: "Ahorros", icon: PiggyBank },
};

const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const getWeekBuckets = (txs: Transaction[]) => {
  const buckets = Array(7).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = new Date(today);
  const dayIdx = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - dayIdx);

  txs.forEach((t) => {
    const d = new Date(t.transactionDate + "T00:00:00");
    const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) buckets[diff] += Number(t.amount);
  });
  return buckets;
};

const formatDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<Method>("cash");
  const [open, setOpen] = useState(false);
  const [banksDialogOpen, setBanksDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    try {
      const [userSnap, txSnap, banksSnap, catsSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDocs(
          query(
            collection(db, "users", user.uid, "transactions"),
            orderBy("transactionDate", "desc")
          )
        ),
        getDocs(collection(db, "users", user.uid, "banks")),
        getDocs(collection(db, "users", user.uid, "categories")),
      ]);
      setProfileName(
        userSnap.data()?.displayName ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "Tú"
      );
      setTransactions(
        txSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
      );
      setBanks(banksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Bank)));
      setCategories(
        catsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Category))
      );
    } catch {
      setProfileName(user.displayName || user.email?.split("@")[0] || "Tú");
      setTransactions([]);
      setBanks([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const filtered = useMemo(
    () => transactions.filter((t) => t.paymentMethod === filter),
    [transactions, filter]
  );
  const weekBuckets = useMemo(() => getWeekBuckets(filtered), [filtered]);
  const maxBucket = Math.max(...weekBuckets, 1);
  const totalWeek = weekBuckets.reduce((a, b) => a + b, 0);
  const todayIdx = (new Date().getDay() + 6) % 7;

  const topPlace = useMemo(() => {
    const counts = new Map<string, { count: number; total: number }>();
    filtered.forEach((t) => {
      const key = (t.description || "").trim().toLowerCase();
      if (!key) return;
      const cur = counts.get(key) || { count: 0, total: 0 };
      counts.set(key, {
        count: cur.count + 1,
        total: cur.total + Number(t.amount),
      });
    });
    let best: {
      name: string;
      count: number;
      total: number;
      hasLocation: boolean;
    } | null = null;
    counts.forEach((v, k) => {
      const hasLoc = filtered.some(
        (t) =>
          (t.description || "").trim().toLowerCase() === k &&
          t.location != null
      );
      if (!best || v.count > best.count)
        best = {
          name: k,
          count: v.count,
          total: v.total,
          hasLocation: hasLoc,
        };
    });
    return best;
  }, [filtered]);

  const handleDelete = async (tx: Transaction) => {
    try {
      // Reverse bank balance before deleting
      if (tx.bankId) {
        const cat = categories.find((c) => c.id === tx.categoryId);
        const reversal =
          cat?.nature === "income" ? -tx.amount : tx.amount;
        await updateDoc(doc(db, "users", user!.uid, "banks", tx.bankId), {
          balance: increment(reversal),
        });
      }
      await deleteDoc(doc(db, "users", user!.uid, "transactions", tx.id));
      setDeletingId(null);
      toast.success("Transacción eliminada");
      await load();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground text-sm">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-6 md:px-10 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Resumen
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {profileName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoriesDialogOpen(true)}
              className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
              aria-label="Gestionar categorías"
              title="Categorías"
            >
              <Tag className="size-4" />
            </button>
            <button
              onClick={() => setBanksDialogOpen(true)}
              className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
              aria-label="Gestionar bancos"
              title="Bancos"
            >
              <Building2 className="size-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* Bank balances */}
        {banks.length > 0 && (
          <section className="mb-6 grid gap-2.5 grid-cols-2 sm:grid-cols-3">
            {banks.map((bank) => {
              const Icon = bank.type === "credit" ? CreditCard : PiggyBank;
              const isPositive = bank.balance >= 0;
              return (
                <div
                  key={bank.id}
                  className="bg-surface rounded-3xl p-4 border border-border/40 shadow-card flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="size-3.5" strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">
                      {bank.name}
                    </span>
                  </div>
                  <p
                    className={`text-base font-semibold tabular-nums ${
                      isPositive ? "text-foreground" : "text-rose-500"
                    }`}
                  >
                    $
                    {Math.abs(bank.balance).toLocaleString("es", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {bank.type === "credit" ? "Crédito" : "Ahorros"}
                    {!isPositive && " · en rojo"}
                  </p>
                </div>
              );
            })}
          </section>
        )}

        {/* Add transaction button */}
        <button
          onClick={() => setOpen(true)}
          className="w-full mb-8 h-20 rounded-3xl bg-primary text-primary-foreground shadow-float flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.99] transition group"
        >
          <div className="size-10 rounded-2xl bg-white/15 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
            <Plus className="size-5" strokeWidth={2.5} />
          </div>
          <span className="font-medium tracking-tight">Añadir transacción</span>
        </button>

        {/* Payment method filter */}
        <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1">
          {(Object.keys(methodMeta) as Method[]).map((m) => {
            const Icon = methodMeta[m].icon;
            const active = filter === m;
            return (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap transition border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-float"
                    : "bg-surface text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                <Icon className="size-4" strokeWidth={2} />
                {methodMeta[m].label}
              </button>
            );
          })}
        </div>

        {/* Weekly chart */}
        <section className="bg-surface rounded-3xl p-7 shadow-card border border-border/40 mb-6">
          <div className="flex items-baseline justify-between mb-7">
            <h3 className="text-sm font-medium text-muted-foreground">
              Esta semana
            </h3>
            <span className="text-2xl font-semibold tabular-nums text-primary">
              $
              {totalWeek.toLocaleString("es", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3 h-44 px-1">
            {weekBuckets.map((value, i) => {
              const heightPct =
                value === 0 ? 4 : Math.max(8, (value / maxBucket) * 100);
              const isToday = i === todayIdx;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-3 group"
                >
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday
                          ? "bg-primary"
                          : "bg-secondary group-hover:bg-primary/20"
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`$${value.toFixed(2)}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase ${
                      isToday ? "text-primary" : "text-muted-foreground/60"
                    }`}
                  >
                    {dayLabels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top location */}
        <section className="bg-surface rounded-3xl p-6 shadow-card border border-border/40 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-5 min-w-0">
            <div className="size-14 rounded-2xl bg-primary-soft flex items-center justify-center shrink-0 relative overflow-hidden">
              <MapPin className="size-6 text-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                Lugar más concurrido
              </p>
              {topPlace ? (
                <>
                  <h4 className="text-base font-semibold capitalize truncate flex items-center gap-1.5">
                    {topPlace.name}
                    {topPlace.hasLocation && (
                      <MapPin
                        className="size-3 text-primary shrink-0"
                        strokeWidth={2}
                      />
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {topPlace.count} transacciones
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-base font-semibold text-muted-foreground">
                    Sin datos aún
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Añade una transacción con descripción
                  </p>
                </>
              )}
            </div>
          </div>
          {topPlace && (
            <p className="text-base font-semibold tabular-nums shrink-0">
              ${topPlace.total.toFixed(2)}
            </p>
          )}
        </section>

        {/* Transaction list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Transacciones · {methodMeta[filter].label}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "registro" : "registros"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-surface rounded-3xl p-8 border border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                No hay transacciones de tipo{" "}
                {methodMeta[filter].label.toLowerCase()}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const bank = banks.find((b) => b.id === tx.bankId);
                const isIncome = cat?.nature === "income";
                const isDeleting = deletingId === tx.id;

                return (
                  <div
                    key={tx.id}
                    className="bg-surface rounded-2xl border border-border/40 px-4 py-3.5 flex items-center gap-3"
                  >
                    {/* Nature indicator */}
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? "bg-emerald-500/10"
                          : "bg-rose-500/10"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp
                          className="size-4 text-emerald-500"
                          strokeWidth={2}
                        />
                      ) : (
                        <TrendingDown
                          className="size-4 text-rose-500"
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description || (
                          <span className="text-muted-foreground italic">
                            Sin descripción
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {cat && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            {cat.name}
                          </span>
                        )}
                        {bank && (
                          <span className="text-[10px] text-muted-foreground">
                            {bank.name}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(tx.transactionDate)}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <p
                      className={`text-sm font-semibold tabular-nums shrink-0 ${
                        isIncome ? "text-emerald-500" : "text-foreground"
                      }`}
                    >
                      {isIncome ? "+" : "-"}$
                      {Number(tx.amount).toLocaleString("es", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    {/* Actions */}
                    {isDeleting ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDelete(tx)}
                          className="size-8 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition"
                          aria-label="Confirmar eliminación"
                        >
                          <Check className="size-3.5" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:border-primary/30 transition"
                          aria-label="Cancelar"
                        >
                          <X className="size-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setEditOpen(true);
                          }}
                          className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:text-foreground hover:border-primary/30 transition"
                          aria-label="Editar"
                        >
                          <Pencil className="size-3.5" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx.id)}
                          className="size-8 rounded-xl border border-border bg-surface text-muted-foreground flex items-center justify-center hover:text-rose-500 hover:border-rose-300 transition"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {user && (
        <>
          <AddTransactionDialog
            open={open}
            onOpenChange={setOpen}
            userId={user.uid}
            onCreated={load}
          />
          <EditTransactionDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            userId={user.uid}
            transaction={editingTx}
            onSaved={load}
          />
          <ManageBanksDialog
            open={banksDialogOpen}
            onOpenChange={setBanksDialogOpen}
            userId={user.uid}
            onChanged={load}
          />
          <ManageCategoriesDialog
            open={categoriesDialogOpen}
            onOpenChange={setCategoriesDialogOpen}
            userId={user.uid}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
