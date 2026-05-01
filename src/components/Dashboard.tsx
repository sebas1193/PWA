import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  LogOut,
  Banknote,
  CreditCard,
  PiggyBank,
} from "lucide-react";
import { supabase } from "@/integrations/client";
import { useAuth } from "@/hooks/useAuth";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";

type Method = "cash" | "credit" | "savings";

type Transaction = {
  id: string;
  amount: number;
  payment_method: Method;
  description: string | null;
  transaction_date: string;
};

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
  const dayIdx = (today.getDay() + 6) % 7; // Mon=0
  monday.setDate(today.getDate() - dayIdx);

  txs.forEach((t) => {
    const d = new Date(t.transaction_date + "T00:00:00");
    const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) buckets[diff] += Number(t.amount);
  });
  return buckets;
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Method>("cash");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [{ data: profile }, { data: txs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false }),
    ]);
    setProfileName(profile?.full_name || user.email?.split("@")[0] || "Tú");
    setTransactions((txs as Transaction[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user]);

  const filtered = useMemo(
    () => transactions.filter((t) => t.payment_method === filter),
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
    let best: { name: string; count: number; total: number } | null = null;
    counts.forEach((v, k) => {
      if (!best || v.count > best.count)
        best = { name: k, count: v.count, total: v.total };
    });
    return best;
  }, [filtered]);

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
          <button
            onClick={handleSignOut}
            className="size-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-4" />
          </button>
        </header>

        {/* Add transaction button (top, prominent) */}
        <button
          onClick={() => setOpen(true)}
          className="w-full mb-8 h-20 rounded-3xl bg-primary text-primary-foreground shadow-float flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.99] transition group"
        >
          <div className="size-10 rounded-2xl bg-white/15 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
            <Plus className="size-5" strokeWidth={2.5} />
          </div>
          <span className="font-medium tracking-tight">Añadir transacción</span>
        </button>

        {/* Filter pills */}
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

        {/* Bar chart */}
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

        {/* Most frequent place */}
        <section className="bg-surface rounded-3xl p-6 shadow-card border border-border/40 flex items-center justify-between gap-4">
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
                  <h4 className="text-base font-semibold capitalize truncate">
                    {topPlace.name}
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
      </div>

      {user && (
        <AddTransactionDialog
          open={open}
          onOpenChange={setOpen}
          userId={user.id}
          onCreated={load}
        />
      )}
    </div>
  );
};

export default Dashboard;
