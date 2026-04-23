<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="modal card">
      <div class="head">
        <div class="title">支付</div>
        <div class="amount">¥{{ amount.toFixed(2) }}</div>
      </div>

      <div class="tabs">
        <div class="seg" role="tablist" aria-label="支付方式">
          <button class="seg-btn" role="tab" :aria-selected="method === 'cash'" @click="method = 'cash'">
            <img class="seg-icon" :src="iconCash" alt="" />
            <span class="seg-text">现金</span>
          </button>
          <button class="seg-btn" role="tab" :aria-selected="method === 'scan'" @click="method = 'scan'">
            <img class="seg-icon" :src="iconScan" alt="" />
            <span class="seg-text">扫码</span>
          </button>
          <button class="seg-btn" role="tab" :aria-selected="method === 'card'" @click="method = 'card'">
            <img class="seg-icon" :src="iconCard" alt="" />
            <span class="seg-text">银行卡</span>
          </button>
          <button class="seg-btn" role="tab" :aria-selected="method === 'other'" @click="method = 'other'">
            <img class="seg-icon" :src="iconOther" alt="" />
            <span class="seg-text">其他支付</span>
          </button>
        </div>
      </div>

      <div class="body">
        <div v-if="method === 'cash'" class="cash">
          <div class="cash-row">
            <div class="label muted">实收</div>
            <div class="value">¥{{ cashInput || "0" }}</div>
          </div>
          <div class="cash-row">
            <div class="label muted">找零</div>
            <div class="value">¥{{ change.toFixed(2) }}</div>
          </div>
          <div class="kbd">
            <div class="pad">
              <button v-for="k in keys" :key="k" class="btn key" @click="onKey(k)">
                {{ k }}
              </button>
              <button class="btn key" data-variant="fn" @click="onBack">退格</button>
              <button class="btn key" data-variant="fn" @click="onClear">清空</button>
            </div>
          </div>
        </div>

        <div v-else-if="method === 'scan'" class="center">
          <div class="qr card">
            <div class="qr-box"></div>
            <div class="muted">展示二维码 / 等待扫码支付</div>
          </div>
          <div class="muted">该演示版本点击“完成支付”模拟成功</div>
        </div>

        <div v-else-if="method === 'card'" class="center">
          <div class="cardpay card">
            <div class="muted">请刷卡 / 插卡 / 挥卡</div>
          </div>
          <div class="muted">该演示版本点击“完成支付”模拟成功</div>
        </div>

        <div v-else class="center">
          <div class="cardpay card">
            <div class="muted">其他支付方式</div>
          </div>
          <div class="muted">该演示版本点击“完成支付”模拟成功</div>
        </div>
      </div>

      <div class="foot">
        <button class="btn" @click="$emit('close')">关闭</button>
        <button class="btn btn-primary" :disabled="!canConfirm" @click="$emit('success')">完成支付</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import iconCash from "../../../assets/icons/金融_finance.svg";
import iconScan from "../../../assets/icons/支付码_pay-code-two.svg";
import iconCard from "../../../assets/icons/银行卡_bank-card.svg";
import iconOther from "../../../assets/icons/应用_application-two.svg";

const props = defineProps<{ amount: number }>();

defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const method = ref<"cash" | "scan" | "card" | "other">("cash");
const cashInput = ref<string>("");

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "00"];

function toNumber(s: string): number {
  if (!s) return 0;
  const n = Number(s);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100) / 100;
}

const cashValue = computed(() => toNumber(cashInput.value));
const change = computed(() => Math.max(0, Math.round((cashValue.value - props.amount) * 100) / 100));
const canConfirm = computed(() => (method.value === "cash" ? cashValue.value >= props.amount : true));

function onKey(k: string) {
  if (k === "." && cashInput.value.includes(".")) return;
  const next = `${cashInput.value}${k}`;
  if (next.length > 10) return;
  const parts = next.split(".");
  if (parts.length === 2 && parts[1].length > 2) return;
  cashInput.value = next.replace(/^0+(?=\d)/, "0");
}

function onBack() {
  cashInput.value = cashInput.value.slice(0, -1);
}

function onClear() {
  cashInput.value = "";
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
  height: min(720px, 100%);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
}

.head {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 800;
}

.amount {
  font-size: 18px;
  font-weight: 900;
}

.tabs {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: center;
}

.seg {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  background: #f5f5f7;
  border-radius: 999px;
}

.seg-btn {
  min-height: 56px;
  min-width: 128px;
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #333333;
  font-size: 16px;
  font-weight: 900;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.seg-btn[aria-selected="true"] {
  background: #111111;
  color: #ffffff;
}

.seg-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.seg-btn[aria-selected="true"] .seg-icon {
  filter: brightness(0) invert(1);
}

.seg-text {
  line-height: 1;
  white-space: nowrap;
}

.body {
  padding: 12px 14px;
  overflow: auto;
}

.cash {
  display: grid;
  gap: 12px;
}

.kbd {
  width: 100%;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 12px;
}

.cash-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 12px;
}

.value {
  font-size: 18px;
  font-weight: 900;
}

.pad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.key {
  min-height: 68px;
  padding: 0;
  border: none;
  border-radius: var(--radius-card);
  background: #f3f4f6;
  color: var(--fg);
  font-size: 20px;
  font-weight: 900;
}

.key[data-variant="fn"] {
  font-size: 16px;
  font-weight: 800;
}

.center {
  display: grid;
  gap: 12px;
  justify-items: center;
  align-content: start;
}

.qr {
  width: min(360px, 100%);
  padding: 14px;
  display: grid;
  gap: 10px;
  justify-items: center;
}

.qr-box {
  width: 240px;
  height: 240px;
  border: 2px dashed var(--line);
  border-radius: var(--radius-card);
}

.cardpay {
  width: min(360px, 100%);
  padding: 18px;
  display: grid;
  justify-items: center;
}

.foot {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.foot .btn {
  width: 88px;
}
</style>
