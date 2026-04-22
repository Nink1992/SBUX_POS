<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="modal card">
      <div class="head">
        <div class="title">会员识别</div>
        <div class="muted sub">支持会员码识别或手动输入会员账号</div>
      </div>

      <div class="tabs">
        <div class="seg" role="tablist" aria-label="会员识别方式">
          <button class="seg-btn" role="tab" :aria-selected="tab === 'scan'" @click="tab = 'scan'">
            <img class="seg-icon" :src="iconScanCode" alt="" />
            <span class="seg-text">会员码登录</span>
          </button>
          <button class="seg-btn" role="tab" :aria-selected="tab === 'manual'" @click="tab = 'manual'">
            <img class="seg-icon" :src="iconKeyboard" alt="" />
            <span class="seg-text">手动输入</span>
          </button>
        </div>
      </div>

      <div class="body">
        <div v-if="tab === 'scan'" class="scan">
          <div class="qr card">
            <div class="qr-box"></div>
            <div class="muted">顾客出示会员码进行识别</div>
          </div>
        </div>

        <div v-else class="manual">
          <div class="field">
            <div class="field-head">
              <div class="muted label">会员账号登录</div>
              <div class="muted label">输入 11 位会员账号</div>
            </div>
            <input v-model="account" class="input member-input" placeholder="" readonly inputmode="numeric" />
          </div>
          <NumericKeyboard v-model="account" :maxLen="11" />
          <div v-if="error" class="error">{{ error }}</div>
        </div>
      </div>

      <div class="foot">
        <button v-if="tab === 'scan'" class="btn btn-primary" @click="simulateScan">识别</button>
        <button v-else class="btn btn-primary" :disabled="account.length !== 11" @click="submitManual">登录</button>
        <button class="btn" @click="$emit('close')">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMemberStore } from "../../../stores/member";
import NumericKeyboard from "../../../components/NumericKeyboard.vue";
import iconScanCode from "../../../assets/icons/扫码_scan-code.svg";
import iconKeyboard from "../../../assets/icons/输入键盘_enter-the-keyboard.svg";

const emit = defineEmits<{ (e: "close"): void }>();

const memberStore = useMemberStore();

const tab = ref<"scan" | "manual">("scan");
const account = ref("");
const error = ref("");

function simulateScan() {
  error.value = "";
  const code = `CODE-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
  const res = memberStore.loginByMemberCode(code);
  if (!res.ok) {
    error.value = res.message;
    return;
  }
  account.value = "";
  emit("close");
}

function submitManual() {
  error.value = "";
  const res = memberStore.loginByAccount(account.value);
  if (!res.ok) {
    error.value = res.message;
    return;
  }
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
}

.modal {
  width: min(920px, 100%);
  max-height: min(720px, 100%);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
}

.head {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
}

.title {
  font-size: 18px;
  font-weight: 900;
}

.sub {
  font-size: 12px;
  margin-top: 4px;
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
  min-width: 140px;
  padding: 8px 18px;
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
  padding: 14px;
  overflow: auto;
}

.foot {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.foot .btn {
  width: 88px;
}

.scan {
  display: grid;
  gap: 14px;
  justify-items: center;
}

.qr {
  width: min(420px, 100%);
  padding: 14px;
  display: grid;
  gap: 10px;
  justify-items: center;
  background: var(--panel);
}

.qr-box {
  width: 260px;
  height: 260px;
  border: 2px dashed var(--line);
  border-radius: var(--radius-card);
  background: #fff;
}

.manual {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.label {
  font-size: 12px;
}

.member-input {
  border-radius: var(--radius-card);
  background: #fff;
  height: 56px;
}

.error {
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 10px 12px;
  background: var(--panel);
  color: var(--fg);
  font-size: 12px;
}
</style>
