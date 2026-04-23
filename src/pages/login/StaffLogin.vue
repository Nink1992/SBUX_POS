<template>
  <div class="layout">
    <div class="left">
      <div class="brand">
        <img class="brand-logo" :src="iconStarbucks" alt="" />
        <div class="brand-text">星巴克门店POS系统</div>
      </div>
    </div>
    <div class="right">
      <div class="sheet card">
        <div class="sheet-inner">
          <div class="welcome">
            <div class="welcome-title">Hi! 伙伴，欢迎回来！</div>
            <div class="welcome-sub">为保障系统安全，请选择以下任一方式登录</div>
            <div class="welcome-store muted">门店ID：{{ storeId }}　{{ storeName }}</div>
          </div>

          <div class="tabs">
            <div class="seg" role="tablist" aria-label="上机认证方式">
              <button class="seg-btn" role="tab" :aria-selected="tab === 'phone_qr'" @click="tab = 'phone_qr'">
                <img class="seg-icon" :src="iconScan" alt="" />
                <span class="seg-text">扫码登录</span>
              </button>
              <button class="seg-btn" role="tab" :aria-selected="tab === 'badge_scan'" @click="tab = 'badge_scan'">
                <img class="seg-icon" :src="iconUser" alt="" />
                <span class="seg-text">员工卡（NFC）</span>
              </button>
              <button class="seg-btn" role="tab" :aria-selected="tab === 'pin'" @click="tab = 'pin'">
                <img class="seg-icon" :src="iconKeyboard" alt="" />
                <span class="seg-text">数字密码</span>
              </button>
            </div>
          </div>

          <div class="content">
            <div v-if="tab === 'phone_qr'" class="qr-area">
              <div class="muted qr-hint">请使用 绿圈圈 扫码登录</div>
              <div class="qr-img" aria-label="二维码"></div>
              <div class="qr-expire" :data-expired="qrSecondsLeft <= 0 ? 'true' : 'false'">
                <span class="qr-sec">{{ Math.max(0, qrSecondsLeft) }}</span><span>秒后二维码失效</span>
              </div>
              <button class="btn btn-primary qr-action" :disabled="qrSecondsLeft <= 0" @click="onPhoneLogin">模拟扫码上机</button>
            </div>

            <div v-else-if="tab === 'badge_scan'" class="nfc-area">
              <div class="muted qr-hint">请刷员工卡（NFC）或扫描胸卡条码</div>
              <div class="nfc-card">
                <img class="nfc-icon" :src="iconUser" alt="" />
                <div class="nfc-text">等待识别…</div>
              </div>
              <button class="btn btn-primary qr-action" @click="onBadgeLogin">模拟扫描胸卡</button>
            </div>

            <div v-else class="pin-area">
              <div class="pin-field">
                <input class="pin-input" :value="maskedPin" readonly inputmode="numeric" />
                <button class="pin-clear" :disabled="!pin" @click="pin = ''">清空</button>
              </div>
              <NumericKeyboard v-model="pin" :maxLen="6" />
              <div v-if="pinError" class="pin-error">{{ pinError }}</div>
              <div class="pin-actions">
                <button class="btn btn-primary" :disabled="pin.length < 4" @click="onPinLogin">登录上机</button>
              </div>
            </div>
          </div>
        </div>

        <div class="sheet-foot">
          <div class="muted foot-text">当前系统版本：v1.0.0　© 2026 Starbucks Corporation. 内部系统，数据保密。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import NumericKeyboard from "../../components/NumericKeyboard.vue";
import { useStaffStore } from "../../stores/staff";
import iconScan from "../../assets/icons/扫码_scan-code.svg";
import iconKeyboard from "../../assets/icons/输入键盘_enter-the-keyboard.svg";
import iconUser from "../../assets/icons/用户_user.svg";
import iconStarbucks from "../../assets/icons/星巴克.svg";

const router = useRouter();
const staffStore = useStaffStore();

const storeId = computed(() => staffStore.storeId);
const storeName = computed(() => staffStore.storeName);

const tab = ref<"phone_qr" | "badge_scan" | "pin">("phone_qr");
const pin = ref("");
const pinError = ref("");
const qrSecondsLeft = ref(120);
let qrTimer: number | null = null;

const maskedPin = computed(() => (pin.value ? "•".repeat(pin.value.length) : ""));
const pinHint = computed(() => "请输入 4-6 位数字密码");

function onPhoneLogin() {
  staffStore.loginByPhoneQr({ storeId: "177165", storeName: "上海静安寺店" });
  router.replace("/pos");
}

function onBadgeLogin() {
  staffStore.loginByBadge({ badgeNo: String(Math.floor(Math.random() * 90) + 10), storeId: "177165", storeName: "上海静安寺店" });
  router.replace("/pos");
}

function onPinLogin() {
  pinError.value = "";
  const res = staffStore.loginByPin({ pin: pin.value, storeId: "177165", storeName: "上海静安寺店" });
  if (!res.ok) {
    pinError.value = res.message ?? "登录失败";
    return;
  }
  router.replace("/pos");
}

function startQrTimer() {
  if (qrTimer) window.clearInterval(qrTimer);
  qrSecondsLeft.value = 120;
  qrTimer = window.setInterval(() => {
    qrSecondsLeft.value = Math.max(0, qrSecondsLeft.value - 1);
    if (qrSecondsLeft.value <= 0 && qrTimer) window.clearInterval(qrTimer);
  }, 1000);
}

watch(
  tab,
  (v) => {
    pinError.value = "";
    if (v === "phone_qr") startQrTimer();
    if (v !== "phone_qr" && qrTimer) window.clearInterval(qrTimer);
    if (v !== "pin") pin.value = "";
  },
  { immediate: true }
);

onUnmounted(() => {
  if (qrTimer) window.clearInterval(qrTimer);
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr auto;
  background: #6b6b6b;
}

.left {
  position: relative;
}

.brand {
  position: absolute;
  top: 18px;
  left: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
}

.brand-logo {
  width: 28px;
  height: 28px;
  display: block;
}

.brand-text {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.right {
  padding: 24px;
  display: grid;
  align-items: stretch;
}

.sheet {
  width: 520px;
  height: calc(100vh - 48px);
  border-radius: 28px;
  border: none;
  display: grid;
  grid-template-rows: 1fr auto;
  overflow: hidden;
}

.sheet-inner {
  padding: 28px 26px 18px;
  display: grid;
  grid-template-rows: auto auto 1fr;
  align-content: start;
  gap: 18px;
}

.welcome {
  text-align: center;
  display: grid;
  gap: 8px;
}

.welcome-title {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: #111111;
}

.welcome-sub {
  font-size: 12px;
  color: #333333;
}

.welcome-store {
  font-size: 12px;
}

.tabs {
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
  min-height: 54px;
  min-width: 140px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #333333;
  font-size: 14px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.seg-btn[aria-selected="true"] {
  background: #111111;
  color: #ffffff;
}

.seg-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.seg-btn[aria-selected="true"] .seg-icon {
  filter: brightness(0) invert(1);
}

.seg-text {
  line-height: 1;
  white-space: nowrap;
}

.content {
  display: grid;
  align-content: start;
}

.qr-area,
.nfc-area {
  display: grid;
  gap: 12px;
  justify-items: center;
  align-content: start;
}

.qr-hint {
  font-size: 12px;
}

.qr-img {
  width: 280px;
  height: 280px;
  background: #fff;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(17, 17, 17, 0.1);
}

.qr-img::before {
  content: "";
  position: absolute;
  inset: 22px;
  background:
    linear-gradient(#111 0 0) left top/22px 4px no-repeat,
    linear-gradient(#111 0 0) left top/4px 22px no-repeat,
    linear-gradient(#111 0 0) right top/22px 4px no-repeat,
    linear-gradient(#111 0 0) right top/4px 22px no-repeat,
    linear-gradient(#111 0 0) left bottom/22px 4px no-repeat,
    linear-gradient(#111 0 0) left bottom/4px 22px no-repeat,
    linear-gradient(#111 0 0) right bottom/22px 4px no-repeat,
    linear-gradient(#111 0 0) right bottom/4px 22px no-repeat,
    repeating-linear-gradient(90deg, rgba(17, 17, 17, 0.16) 0 2px, transparent 2px 8px),
    repeating-linear-gradient(0deg, rgba(17, 17, 17, 0.16) 0 2px, transparent 2px 8px);
  border-radius: 10px;
}

.qr-expire {
  font-size: 12px;
  color: #e11d48;
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}

.qr-expire[data-expired="true"] {
  color: #6b7280;
}

.qr-sec {
  font-weight: 900;
}

.qr-action {
  margin-top: 2px;
}

.nfc-card {
  width: 280px;
  height: 280px;
  border-radius: 16px;
  background: #f5f5f7;
  border: 1px dashed rgba(17, 17, 17, 0.18);
  display: grid;
  place-items: center;
  gap: 10px;
  align-content: center;
}

.nfc-icon {
  width: 54px;
  height: 54px;
  display: block;
  opacity: 0.9;
}

.nfc-text {
  font-size: 14px;
  font-weight: 800;
  color: #111111;
}

.pin-area {
  display: grid;
  gap: 12px;
}

.pin-field {
  min-height: 56px;
  padding: 0 12px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #fff;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
}

.pin-error {
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 10px 12px;
  background: var(--panel);
  color: var(--fg);
  font-size: 12px;
}

.pin-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 4px;
}

.pin-clear {
  min-width: 72px;
  height: 40px;
  border-radius: var(--radius-btn);
  border: 1px solid var(--line);
  background: #fff;
}

.pin-actions {
  display: flex;
  justify-content: flex-end;
}

.sheet-foot {
  padding: 14px 18px;
  border-top: 1px solid var(--line);
  background: #fff;
}

.foot-text {
  font-size: 12px;
  text-align: center;
}
</style>
