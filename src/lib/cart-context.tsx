"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addUitblinker as addUitblinkerPure,
  addWorkbook as addWorkbookPure,
  itemCount as itemCountPure,
  remove as removePure,
  setQty as setQtyPure,
  subtotalCents as subtotalCentsPure,
  type CartItem,
  type Subject,
  type ShippingAddress,
} from "./cart";
import { CartToast } from "@/components/shop/cart-toast";

const CART_KEY = "lexi_cart_v1";
const DRAWER_AUTO_CLOSE_MS = 6000;

type ToastState = { id: number; message: string };

type CartContextValue = {
  /** Cart contents. Empty before client hydration completes. */
  items: CartItem[];
  /** True once the provider has read localStorage on the client. */
  hydrated: boolean;
  itemCount: number;
  subtotalCents: number;
  /** Cart drawer (right slide-in) open state — auto-opens when an item is added. */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addWorkbook: (sku: { slug: string; title: string; priceCents: number }, qty?: number) => void;
  addUitblinker: (item: {
    kidName: string;
    subject: Subject;
    priceCents: number;
    shipping: ShippingAddress;
  }) => void;
  setQty: (idx: number, qty: number) => void;
  remove: (idx: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTimerRef = useRef<number | null>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      // ignore — corrupt storage shouldn't crash the app
    }
    setHydrated(true);
  }, []);

  // Persist on change (skip first run until hydrated to avoid overwriting).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // ignore (private mode, quota, etc.)
    }
  }, [items, hydrated]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((cur) => (cur && cur.id === id ? null : cur));
    }, 2000);
  }, []);

  const clearDrawerTimer = useCallback(() => {
    if (drawerTimerRef.current !== null) {
      window.clearTimeout(drawerTimerRef.current);
      drawerTimerRef.current = null;
    }
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    clearDrawerTimer();
    drawerTimerRef.current = window.setTimeout(() => {
      setDrawerOpen(false);
      drawerTimerRef.current = null;
    }, DRAWER_AUTO_CLOSE_MS);
  }, [clearDrawerTimer]);

  const closeDrawer = useCallback(() => {
    clearDrawerTimer();
    setDrawerOpen(false);
  }, [clearDrawerTimer]);

  // Cleanup any pending timer on unmount.
  useEffect(() => {
    return () => {
      if (drawerTimerRef.current !== null) {
        window.clearTimeout(drawerTimerRef.current);
      }
    };
  }, []);

  const addWorkbook = useCallback<CartContextValue["addWorkbook"]>(
    (sku, qty = 1) => {
      setItems((prev) => addWorkbookPure(prev, sku, qty));
      // Drawer replaces the toast for add events; toast bus remains for
      // future non-add notifications.
      openDrawer();
    },
    [openDrawer],
  );

  const addUitblinker = useCallback<CartContextValue["addUitblinker"]>(
    (item) => {
      setItems((prev) => addUitblinkerPure(prev, item));
      openDrawer();
    },
    [openDrawer],
  );

  const setQty = useCallback<CartContextValue["setQty"]>((idx, qty) => {
    setItems((prev) => setQtyPure(prev, idx, qty));
  }, []);

  const remove = useCallback<CartContextValue["remove"]>((idx) => {
    setItems((prev) => removePure(prev, idx));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      itemCount: itemCountPure(items),
      subtotalCents: subtotalCentsPure(items),
      drawerOpen,
      openDrawer,
      closeDrawer,
      addWorkbook,
      addUitblinker,
      setQty,
      remove,
      clear,
    }),
    [
      items,
      hydrated,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addWorkbook,
      addUitblinker,
      setQty,
      remove,
      clear,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? <CartToast key={toast.id} message={toast.message} /> : null}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// Re-export for callers that want to dispatch a non-add notification toast.
// Currently unused externally but kept for future use.
export { CartContext };
