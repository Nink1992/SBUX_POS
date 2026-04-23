import { createRouter, createWebHistory } from "vue-router";
import PosHome from "../pages/pos/PosHome.vue";
import StaffLogin from "../pages/login/StaffLogin.vue";
import { STAFF_STORAGE_KEY } from "../stores/staff";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/pos" },
    { path: "/login", component: StaffLogin, meta: { requiresStaff: false } },
    { path: "/pos", component: PosHome, meta: { requiresStaff: true } }
  ]
});

router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem(STAFF_STORAGE_KEY);
  if (to.path === "/login" && isLoggedIn) return { path: "/pos", replace: true };
  if (to.meta?.requiresStaff && !isLoggedIn) return { path: "/login", replace: true };
  return true;
});
