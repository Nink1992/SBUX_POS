<template>
  <div class="backdrop" @click.self="$emit('cancel')">
    <div class="modal card">
      <div class="head">
        <div class="title">{{ product.name }}</div>
        <div class="muted sub">请选择规格与加料</div>
      </div>

      <div class="body">
        <div v-for="g in basicGroups" :key="g.id" class="section">
          <div class="section-title">
            <span class="stitle">
              <span v-if="g.required" class="req">*</span>
              <span>{{ g.name }}</span>
            </span>
          </div>
          <div class="grid3">
            <button
              v-for="o in g.options"
              :key="o.id"
              class="opt"
              :data-selected="selectedSpecs[g.id] === o.id"
              @click="selectedSpecs[g.id] = o.id"
            >
              <div class="opt-main">{{ o.name }}</div>
              <div v-if="o.subtext" class="opt-sub muted">{{ o.subtext }}</div>
            </button>
          </div>
        </div>

        <div v-if="hasAdvanced" class="accordion" :data-open="advancedOpen ? 'true' : 'false'">
          <div class="acc-head-row">
            <button class="acc-head" @click="advancedOpen = !advancedOpen">
              <span class="acc-title">进阶选择</span>
              <img class="acc-icon" :data-open="advancedOpen ? 'true' : 'false'" :src="iconDown" alt="" />
            </button>
          </div>
          <div v-if="advancedOpen" class="acc-body">
            <div v-for="g in advancedGroups" :key="g.id" class="section">
              <div class="section-title">
                <span class="stitle">
                  <span v-if="g.required" class="req">*</span>
                  <span>{{ g.name }}</span>
                </span>
              </div>
              <div class="grid3">
                <button
                  v-for="o in g.options"
                  :key="o.id"
                  class="opt"
                  :data-selected="selectedSpecs[g.id] === o.id"
                  @click="selectedSpecs[g.id] = o.id"
                >
                  <div class="opt-main">{{ o.name }}</div>
                  <div v-if="o.subtext" class="opt-sub muted">{{ o.subtext }}</div>
                </button>
              </div>
            </div>

            <div v-if="hasShotAddon" class="section">
              <div class="section-title">
                <span class="stitle">
                  <span>浓缩份数</span>
                </span>
              </div>
              <div class="stepper card">
                <div class="stepper-left">
                  <div class="stepper-name">浓缩份数</div>
                  <div class="muted stepper-sub">加购浓缩，调整份数</div>
                </div>
                <div class="stepper-right">
                  <button class="circle" @click="decAddon('shot')">
                    <img class="pm-icon" :src="iconMinus" alt="" />
                  </button>
                  <div class="stepper-val">{{ selectedAddons['shot'] ?? 0 }}</div>
                  <button class="circle" @click="incAddon('shot')">
                    <img class="pm-icon" :src="iconPlus" alt="" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="otherAddons.length" class="section">
              <div class="section-title">
                <span class="stitle">
                  <span>加料</span>
                </span>
              </div>
              <div class="addon-list">
                <div v-for="a in otherAddons" :key="a.id" class="addon">
                  <div class="a-left">
                    <div class="a-name">{{ a.name }}</div>
                    <div class="muted a-price">¥{{ a.price.toFixed(2) }}</div>
                  </div>
                  <div class="a-right">
                    <button class="circle" @click="decAddon(a.id)">
                      <img class="pm-icon" :src="iconMinus" alt="" />
                    </button>
                    <div class="qty">{{ selectedAddons[a.id] ?? 0 }}</div>
                    <button class="circle" @click="incAddon(a.id, a.mutexGroupId)">
                      <img class="pm-icon" :src="iconPlus" alt="" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="foot">
        <button class="btn btn-primary foot-btn" :disabled="!canConfirm" @click="onConfirm">确认</button>
        <button class="btn foot-btn" @click="$emit('cancel')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { Product, SelectedAddons, SelectedSpecs } from "../../../modules/pos/types";
import iconDown from "../../../assets/icons/下_down.svg";
import iconPlus from "../../../assets/icons/加_plus.svg";
import iconMinus from "../../../assets/icons/减_minus.svg";

const props = defineProps<{
  product: Product;
  initialSpecs: SelectedSpecs;
  initialAddons: SelectedAddons;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "confirm", payload: { specs: SelectedSpecs; addons: SelectedAddons }): void;
}>();

const specGroups = computed(() => props.product.specGroups ?? []);
const addons = computed(() => props.product.addons ?? []);

const selectedSpecs = reactive<SelectedSpecs>({ ...props.initialSpecs });
const selectedAddons = reactive<SelectedAddons>({ ...props.initialAddons });

const advancedOpen = ref(false);

const basicIds = new Set(["size", "temp", "sweet", "espresso"]);
const basicGroups = computed(() => specGroups.value.filter((g) => basicIds.has(g.id)));
const advancedGroups = computed(() => specGroups.value.filter((g) => !basicIds.has(g.id)));

const defaultByGroupId: Record<string, string> = {
  size: "grande",
  temp: "hot",
  sweet: "std",
  espresso: "classic_dark"
};

function applyDefaultSelections() {
  for (const g of specGroups.value) {
    if (selectedSpecs[g.id]) continue;
    const preferred = defaultByGroupId[g.id];
    if (preferred && g.options.some((o) => o.id === preferred)) {
      selectedSpecs[g.id] = preferred;
      continue;
    }
    const first = g.options[0];
    if (g.required && first) selectedSpecs[g.id] = first.id;
  }
}

applyDefaultSelections();

const canConfirm = computed(() => {
  for (const g of specGroups.value) {
    if (!g.required) continue;
    if (!selectedSpecs[g.id]) return false;
  }
  return true;
});

const hasShotAddon = computed(() => addons.value.some((a) => a.id === "shot"));
const otherAddons = computed(() => addons.value.filter((a) => a.id !== "shot"));
const hasAdvanced = computed(
  () => advancedGroups.value.length > 0 || hasShotAddon.value || otherAddons.value.length > 0
);

function incAddon(addonId: string, mutexGroupId?: string) {
  if (mutexGroupId) {
    for (const a of addons.value) {
      if (a.mutexGroupId === mutexGroupId && a.id !== addonId) {
        selectedAddons[a.id] = 0;
      }
    }
  }
  const current = selectedAddons[addonId] ?? 0;
  if (current >= 9) return;
  selectedAddons[addonId] = current + 1;
}

function decAddon(addonId: string) {
  const current = selectedAddons[addonId] ?? 0;
  if (current <= 0) return;
  selectedAddons[addonId] = current - 1;
}

function onConfirm() {
  if (!canConfirm.value) return;
  emit("confirm", { specs: { ...selectedSpecs }, addons: { ...selectedAddons } });
}

</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  padding: 14px;
}

.modal {
  width: min(920px, 100%);
  max-height: min(720px, 100%);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.head {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
}

.title {
  font-size: 18px;
  font-weight: 800;
}

.sub {
  font-size: 12px;
  margin-top: 4px;
}

.body {
  padding: 12px 14px;
  overflow: auto;
  display: grid;
  gap: 18px;
}

.section {
  display: grid;
  gap: 10px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.stitle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.req {
  color: #111111;
  font-weight: 900;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.accordion {
  position: sticky;
  bottom: 0;
  padding: 10px 0 0;
  z-index: 5;
  background: #fff;
}

.accordion[data-open="true"] {
  position: static;
  padding: 0;
}

.acc-head-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.acc-head-row::before,
.acc-head-row::after {
  content: "";
  height: 1px;
  background: var(--line);
  flex: 1 1 auto;
}

.acc-head {
  width: auto;
  min-height: var(--touch);
  padding: 0 18px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius-btn);
  background: var(--panel);
  font-size: 14px;
  font-weight: 900;
  color: var(--fg);
}

.accordion[data-open="true"] .acc-head {
  border-bottom: none;
}

.acc-title {
  font-weight: 900;
}

.acc-icon {
  width: 18px;
  height: 18px;
  display: block;
  transition: transform 160ms ease;
}

.acc-icon[data-open="true"] {
  transform: rotate(180deg);
}

.acc-body {
  padding: 12px 0;
  display: grid;
  gap: 18px;
}

.opt {
  min-height: 56px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: #fff;
  color: var(--fg);
  text-align: center;
  display: grid;
  align-content: center;
  gap: 4px;
  padding: 8px 10px;
}

.opt[data-selected="true"] {
  background: #e0e0e3;
  border-color: transparent;
}

.opt-main {
  font-weight: 900;
}

.opt-sub {
  font-size: 12px;
  color: var(--muted);
}

.addon-list {
  display: grid;
  gap: 10px;
}

.addon {
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.a-name {
  font-weight: 700;
}

.a-price {
  font-size: 12px;
  margin-top: 2px;
}

.a-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.qty {
  text-align: center;
  font-weight: 800;
  width: 28px;
}

.circle {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  font-size: 20px;
  font-weight: 900;
  display: inline-grid;
  place-items: center;
}

.pm-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.stepper {
  padding: 12px 14px;
  background: var(--panel);
  border-radius: var(--radius-card);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.stepper-name {
  font-weight: 900;
}

.stepper-sub {
  font-size: 12px;
  margin-top: 2px;
}

.stepper-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.stepper-val {
  width: 28px;
  text-align: center;
  font-weight: 900;
}

.foot {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.foot-btn {
  width: 88px;
}
</style>
