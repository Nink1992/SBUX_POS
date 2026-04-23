<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="modal card">
      <div class="head">
        <img class="head-icon" :src="iconWallet" alt="" />
        <div class="head-title">员工上机与备用金核对</div>
        <div class="muted head-sub">请核实当前钱箱内的备用金总额</div>
      </div>

      <div class="body">
        <div class="total card">
          <div class="muted total-label">上一班次结余</div>
          <div class="total-amt">¥{{ expectedTotal.toFixed(2) }}</div>
          <div class="chips">
            <div class="chip2">纸币：¥{{ paper.toFixed(0) }}</div>
            <div class="chip2">硬币：¥{{ coin.toFixed(0) }}</div>
          </div>
        </div>

        <div class="field card">
          <div class="muted field-label">实盘金额</div>
          <div class="field-row">
            <input class="field-input" :value="displayValue" placeholder="请输入金额" readonly inputmode="numeric" />
            <button class="btn field-clear" :disabled="!raw" @click="raw = ''">清空</button>
          </div>
          <div class="muted field-diff" v-if="diff !== 0">差异：¥{{ Math.abs(diff).toFixed(2) }}</div>
        </div>

        <NumericKeyboard v-model="raw" :maxLen="7" />

        <div class="note card">
          <div class="note-row">
            <div class="note-icon">i</div>
            <div class="note-text">核对完成后，系统将记录该金额作为本班次的起始余额。如有差异，请立即联系值班经理。</div>
          </div>
        </div>
      </div>

      <div class="foot">
        <button class="btn btn-ghost" @click="onRetry">重新点钞核对</button>
        <button class="btn btn-primary" @click="$emit('confirm', value)">确认并开始上机</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import NumericKeyboard from "../../../components/NumericKeyboard.vue";
import iconWallet from "../../../assets/icons/金融_finance.svg";

const props = defineProps<{
  expectedTotal: number;
  paper: number;
  coin: number;
  initialValue?: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", value: number): void;
}>();

const raw = ref("");

watch(
  () => props.initialValue,
  (v) => {
    if (typeof v === "number" && Number.isFinite(v)) raw.value = String(Math.round(v));
  },
  { immediate: true }
);

const value = computed(() => {
  const n = Number(raw.value || "0");
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
});

const displayValue = computed(() => `¥${value.value.toFixed(2)}`);
const diff = computed(() => Math.round((value.value - props.expectedTotal) * 100) / 100);

function onRetry() {
  emit("close");
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
  z-index: 200;
}

.modal {
  width: min(720px, 100%);
  height: min(720px, 100%);
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

.head {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--line);
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 6px;
}

.head-icon {
  width: 38px;
  height: 38px;
  display: block;
}

.head-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.head-sub {
  font-size: 12px;
}

.body {
  padding: 18px 20px;
  overflow: auto;
  display: grid;
  gap: 14px;
  align-content: start;
}

.total {
  padding: 18px 18px;
  background: #f5f5f7;
  border: none;
  display: grid;
  justify-items: center;
  gap: 10px;
}

.total-label {
  font-size: 12px;
}

.total-amt {
  font-size: 54px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1;
}

.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.chip2 {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 800;
  color: #333333;
}

.field {
  padding: 14px;
  display: grid;
  gap: 10px;
}

.field-label {
  font-size: 12px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.field-input {
  height: 56px;
  border-radius: 14px;
  border: 1px solid var(--line);
  padding: 0 14px;
  background: #fff;
  font-size: 18px;
  font-weight: 900;
}

.field-clear {
  min-width: 72px;
  height: 40px;
}

.field-diff {
  font-size: 12px;
}

.note {
  padding: 14px;
  background: #fff;
}

.note-row {
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: start;
}

.note-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #111111;
  line-height: 1;
}

.note-text {
  font-size: 12px;
  line-height: 1.5;
  color: #333333;
}

.foot {
  padding: 14px 20px;
  border-top: 1px solid var(--line);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.foot .btn {
  width: 100%;
}
</style>
