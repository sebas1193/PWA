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
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Category, CategoryNature } from "@/integrations/types";

export const ManageCategoriesDialog = ({
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [nature, setNature] = useState<CategoryNature>("expense");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users", userId, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "users", userId, "categories"), {
        name: name.trim(),
        nature,
        createdAt: serverTimestamp(),
      });
      setCategories((prev) => [
        ...prev,
        { id: ref.id, name: name.trim(), nature },
      ]);
      setName("");
      toast.success("Categoría añadida");
      onChanged?.();
    } catch {
      toast.error("Error al añadir categoría");
    } finally {
      setBusy(false);
    }
  };

  const deleteCategory = async (catId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId, "categories", catId));
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      toast.success("Categoría eliminada");
      onChanged?.();
    } catch {
      toast.error("Error al eliminar categoría");
    }
  };

  const natureOptions: { id: CategoryNature; label: string; icon: typeof TrendingUp }[] = [
    { id: "expense", label: "Egreso", icon: TrendingDown },
    { id: "income", label: "Ingreso", icon: TrendingUp },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">Categorías</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay categorías añadidas
            </p>
          ) : (
            categories.map((cat) => {
              const isIncome = cat.nature === "income";
              const Icon = isIncome ? TrendingUp : TrendingDown;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`size-4 ${isIncome ? "text-emerald-500" : "text-rose-500"}`}
                      strokeWidth={2}
                    />
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p
                        className={`text-xs font-medium ${
                          isIncome ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {isIncome ? "Ingreso" : "Egreso"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={addCategory}
          className="space-y-4 mt-2 border-t border-border pt-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Añadir categoría
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
              placeholder="Alimentación, Salario, Transporte…"
              maxLength={60}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Naturaleza
            </label>
            <div className="grid grid-cols-2 gap-2">
              {natureOptions.map((opt) => {
                const Icon = opt.icon;
                const active = nature === opt.id;
                const isIncome = opt.id === "income";
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNature(opt.id)}
                    className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition ${
                      active
                        ? isIncome
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-float"
                          : "bg-rose-500 text-white border-rose-500 shadow-float"
                        : "bg-surface text-muted-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-float hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
          >
            {busy ? "Añadiendo..." : "Añadir categoría"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
