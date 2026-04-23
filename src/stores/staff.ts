import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type StaffLoginMethod = "phone_qr" | "badge_scan" | "pin";

export const DEFAULT_FLOAT_EXPECTED = 500;
export const DEFAULT_FLOAT_PAPER = 450;
export const DEFAULT_FLOAT_COIN = 50;

export type StaffSession = {
  staffId: string;
  staffName: string;
  roleName: string;
  storeId: string;
  storeName: string;
  method: StaffLoginMethod;
  loggedInAt: number;
  floatVerified: boolean;
  floatExpected: number;
  floatPaper: number;
  floatCoin: number;
  floatActual: number | null;
};

export const STAFF_STORAGE_KEY = "sbux_pos_staff_session_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function persist(session: StaffSession | null) {
  if (!session) {
    localStorage.removeItem(STAFF_STORAGE_KEY);
    return;
  }
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(session));
}

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeSession(s: StaffSession | null): StaffSession | null {
  if (!s) return null;
  const floatExpected = Number.isFinite((s as any).floatExpected) ? Number((s as any).floatExpected) : DEFAULT_FLOAT_EXPECTED;
  const floatPaper = Number.isFinite((s as any).floatPaper) ? Number((s as any).floatPaper) : DEFAULT_FLOAT_PAPER;
  const floatCoin = Number.isFinite((s as any).floatCoin) ? Number((s as any).floatCoin) : DEFAULT_FLOAT_COIN;
  const floatVerified = typeof (s as any).floatVerified === "boolean" ? Boolean((s as any).floatVerified) : false;
  const floatActual = Number.isFinite((s as any).floatActual) ? Number((s as any).floatActual) : null;
  return { ...s, floatVerified, floatExpected, floatPaper, floatCoin, floatActual };
}

export const useStaffStore = defineStore("staff", () => {
  const store = ref<{ id: string; name: string }>({ id: "86556", name: "深圳福保长平大厦店" });
  const session = ref<StaffSession | null>(normalizeSession(safeParse<StaffSession>(localStorage.getItem(STAFF_STORAGE_KEY))));
  if (session.value?.storeId && session.value?.storeName) store.value = { id: session.value.storeId, name: session.value.storeName };
  if (session.value) persist(session.value);

  const isLoggedIn = computed(() => session.value !== null);
  const isFloatVerified = computed(() => session.value?.floatVerified ?? false);
  const staffName = computed(() => session.value?.staffName ?? "—");
  const roleName = computed(() => session.value?.roleName ?? "—");
  const storeId = computed(() => store.value.id);
  const storeName = computed(() => store.value.name);
  const floatExpected = computed(() => session.value?.floatExpected ?? DEFAULT_FLOAT_EXPECTED);
  const floatPaper = computed(() => session.value?.floatPaper ?? DEFAULT_FLOAT_PAPER);
  const floatCoin = computed(() => session.value?.floatCoin ?? DEFAULT_FLOAT_COIN);
  const floatActual = computed(() => session.value?.floatActual ?? null);

  function loginByPhoneQr(payload?: { storeId?: string; storeName?: string }) {
    if (payload?.storeId && payload?.storeName) store.value = { id: payload.storeId, name: payload.storeName };
    session.value = {
      staffId: uid("s"),
      staffName: "伙伴A",
      roleName: "门店收银员",
      storeId: store.value.id,
      storeName: store.value.name,
      method: "phone_qr",
      loggedInAt: Date.now(),
      floatVerified: false,
      floatExpected: DEFAULT_FLOAT_EXPECTED,
      floatPaper: DEFAULT_FLOAT_PAPER,
      floatCoin: DEFAULT_FLOAT_COIN,
      floatActual: null
    };
    persist(session.value);
  }

  function loginByBadge(payload: { badgeNo: string; storeId?: string; storeName?: string }) {
    if (payload.storeId && payload.storeName) store.value = { id: payload.storeId, name: payload.storeName };
    session.value = {
      staffId: uid("s"),
      staffName: `伙伴${payload.badgeNo.slice(-2) || "B"}`,
      roleName: "门店收银员",
      storeId: store.value.id,
      storeName: store.value.name,
      method: "badge_scan",
      loggedInAt: Date.now(),
      floatVerified: false,
      floatExpected: DEFAULT_FLOAT_EXPECTED,
      floatPaper: DEFAULT_FLOAT_PAPER,
      floatCoin: DEFAULT_FLOAT_COIN,
      floatActual: null
    };
    persist(session.value);
  }

  function loginByPin(payload: { pin: string; storeId?: string; storeName?: string }): { ok: boolean; message?: string } {
    const pin = payload.pin.trim();
    if (pin.length !== 6) return { ok: false, message: "请输入 6 位数字密码" };
    if (payload.storeId && payload.storeName) store.value = { id: payload.storeId, name: payload.storeName };
    session.value = {
      staffId: uid("s"),
      staffName: "伙伴C",
      roleName: "门店收银员",
      storeId: store.value.id,
      storeName: store.value.name,
      method: "pin",
      loggedInAt: Date.now(),
      floatVerified: false,
      floatExpected: DEFAULT_FLOAT_EXPECTED,
      floatPaper: DEFAULT_FLOAT_PAPER,
      floatCoin: DEFAULT_FLOAT_COIN,
      floatActual: null
    };
    persist(session.value);
    return { ok: true };
  }

  function confirmFloat(actual: number) {
    if (!session.value) return;
    session.value = normalizeSession({
      ...session.value,
      floatVerified: true,
      floatActual: Math.max(0, Math.round(actual * 100) / 100)
    });
    persist(session.value);
  }

  function logout() {
    session.value = null;
    persist(null);
  }

  return {
    store,
    session,
    isLoggedIn,
    isFloatVerified,
    staffName,
    roleName,
    storeId,
    storeName,
    floatExpected,
    floatPaper,
    floatCoin,
    floatActual,
    loginByPhoneQr,
    loginByBadge,
    loginByPin,
    confirmFloat,
    logout
  };
});
