import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type StaffLoginMethod = "phone_qr" | "badge_scan" | "pin";

export type StaffSession = {
  staffId: string;
  staffName: string;
  roleName: string;
  storeId: string;
  storeName: string;
  method: StaffLoginMethod;
  loggedInAt: number;
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

export const useStaffStore = defineStore("staff", () => {
  const store = ref<{ id: string; name: string }>({ id: "177165", name: "上海静安寺店" });
  const session = ref<StaffSession | null>(safeParse<StaffSession>(localStorage.getItem(STAFF_STORAGE_KEY)));
  if (session.value?.storeId && session.value?.storeName) store.value = { id: session.value.storeId, name: session.value.storeName };

  const isLoggedIn = computed(() => session.value !== null);
  const staffName = computed(() => session.value?.staffName ?? "—");
  const roleName = computed(() => session.value?.roleName ?? "—");
  const storeId = computed(() => store.value.id);
  const storeName = computed(() => store.value.name);

  function loginByPhoneQr(payload?: { storeId?: string; storeName?: string }) {
    if (payload?.storeId && payload?.storeName) store.value = { id: payload.storeId, name: payload.storeName };
    session.value = {
      staffId: uid("s"),
      staffName: "伙伴A",
      roleName: "门店收银员",
      storeId: store.value.id,
      storeName: store.value.name,
      method: "phone_qr",
      loggedInAt: Date.now()
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
      loggedInAt: Date.now()
    };
    persist(session.value);
  }

  function loginByPin(payload: { pin: string; storeId?: string; storeName?: string }): { ok: boolean; message?: string } {
    const pin = payload.pin.trim();
    if (pin.length < 4) return { ok: false, message: "请输入 4-6 位数字密码" };
    if (payload.storeId && payload.storeName) store.value = { id: payload.storeId, name: payload.storeName };
    session.value = {
      staffId: uid("s"),
      staffName: "伙伴C",
      roleName: "门店收银员",
      storeId: store.value.id,
      storeName: store.value.name,
      method: "pin",
      loggedInAt: Date.now()
    };
    persist(session.value);
    return { ok: true };
  }

  function logout() {
    session.value = null;
    persist(null);
  }

  return { store, session, isLoggedIn, staffName, roleName, storeId, storeName, loginByPhoneQr, loginByBadge, loginByPin, logout };
});
