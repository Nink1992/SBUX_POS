import { createRouter, createWebHistory } from "vue-router";
import PosHome from "../pages/pos/PosHome.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/pos" },
    { path: "/pos", component: PosHome }
  ]
});

