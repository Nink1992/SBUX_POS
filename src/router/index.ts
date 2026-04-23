import { createRouter, createWebHistory } from "vue-router";
import PosHome from "../pages/pos/PosHome.vue";
import StaffLogin from "../pages/login/StaffLogin.vue";
import { STAFF_STORAGE_KEY } from "../stores/staff";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: StaffLogin, meta: { requiresStaff: false } },
    { path: "/pos", component: PosHome, meta: { requiresStaff: true } }
  ]
});

router.beforeEach((to) => {
  const raw = localStorage.getItem(STAFF_STORAGE_KEY);
  let session: any = null;
  if (raw) {
    try {
      session = JSON.parse(raw) as any;
    } catch {
      session = null;
    }
  }
  const isLoggedIn = !!session;
  const isVerified = !!session?.floatVerified;
  if (to.path === "/login" && isLoggedIn && isVerified) return { path: "/pos", replace: true };
  if (to.meta?.requiresStaff && !(isLoggedIn && isVerified)) return { path: "/login", replace: true };
  return true;
});
