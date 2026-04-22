import { createRouter, createWebHistory } from "vue-router";
import PosHome from "../pages/pos/PosHome.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/pos" },
    { path: "/pos", component: PosHome }
  ]
});
