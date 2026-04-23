<template>
  <div class="layout">
    <div class="left">
      <div class="brand">
        <img class="brand-logo" :src="iconStarbucks" alt="" />
        <div class="brand-text">星巴克门店POS系统</div>
      </div>
      <div class="left-store">ID：{{ storeId }} 丨 门店名称：{{ storeName }}</div>
      <div class="left-foot">当前系统版本：v1.0.0　© 2026 Starbucks Corporation. 内部系统，数据保密。</div>
    </div>
    <div class="right">
      <div class="sheet card">
        <div class="sheet-inner">
          <div class="welcome">
            <div class="welcome-title">Hi! 伙伴，欢迎回来！</div>
            <div class="welcome-sub">为保障系统安全，请选择以下任一方式登录</div>
          </div>

          <div class="tabs">
            <div ref="segEl" class="seg" role="tablist" aria-label="上机认证方式">
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
              <div class="muted qr-hint">请使用 <span class="apron">绿围裙</span> 扫码登录</div>
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
                <input class="pin-input" :value="maskedPin" placeholder="输入6位数字密码登录" readonly inputmode="numeric" />
                <button class="pin-clear" :disabled="!pin" @click="pin = ''">清空</button>
              </div>
              <NumericKeyboard v-model="pin" :maxLen="6" />
              <div v-if="pinError" class="pin-error">{{ pinError }}</div>
              <div class="pin-actions">
                <button class="btn btn-primary" :style="{ width: `${authActionWidth}px` }" :disabled="pin.length !== 6" @click="onPinLogin">
                  登录上机
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <CashVerifyModal
    v-if="cashVerifyVisible"
    :expectedTotal="expectedTotal"
    :paper="expectedPaper"
    :coin="expectedCoin"
    :initialValue="initialFloat"
    @close="onCashVerifyClose"
    @confirm="onCashVerifyConfirm"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import NumericKeyboard from "../../components/NumericKeyboard.vue";
import { useStaffStore } from "../../stores/staff";
import CashVerifyModal from "./components/CashVerifyModal.vue";
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
const segEl = ref<HTMLElement | null>(null);
const authActionWidth = ref(520);
const cashVerifyVisible = ref(false);
const expectedTotal = computed(() => staffStore.floatExpected);
const expectedPaper = computed(() => staffStore.floatPaper);
const expectedCoin = computed(() => staffStore.floatCoin);
const initialFloat = computed(() => staffStore.floatActual ?? staffStore.floatExpected);
const STAFF_LOGIN_TOAST_KEY = "sbux_pos_staff_login_toast_v1";

function openCashVerify() {
  cashVerifyVisible.value = true;
}

function onCashVerifyClose() {
  cashVerifyVisible.value = false;
  staffStore.logout();
}

function onCashVerifyConfirm(v: number) {
  staffStore.confirmFloat(v);
  cashVerifyVisible.value = false;
  sessionStorage.setItem(STAFF_LOGIN_TOAST_KEY, `上机成功：${staffStore.staffName}　${staffStore.storeName}`);
  router.replace("/pos");
}

function onPhoneLogin() {
  staffStore.loginByPhoneQr({ storeId: "86556", storeName: "深圳福保长平大厦店" });
  openCashVerify();
}

function onBadgeLogin() {
  staffStore.loginByBadge({
    badgeNo: String(Math.floor(Math.random() * 90) + 10),
    storeId: "86556",
    storeName: "深圳福保长平大厦店"
  });
  openCashVerify();
}

function onPinLogin() {
  pinError.value = "";
  const res = staffStore.loginByPin({ pin: pin.value, storeId: "86556", storeName: "深圳福保长平大厦店" });
  if (!res.ok) {
    pinError.value = res.message ?? "登录失败";
    return;
  }
  openCashVerify();
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
  window.removeEventListener("resize", syncAuthActionWidth);
});

onMounted(() => {
  syncAuthActionWidth();
  window.addEventListener("resize", syncAuthActionWidth);
  if (staffStore.isLoggedIn && !staffStore.isFloatVerified) openCashVerify();
});

function syncAuthActionWidth() {
  const w = segEl.value?.getBoundingClientRect().width;
  if (!w) return;
  authActionWidth.value = Math.round(w);
}
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background:
    radial-gradient(1200px 900px at 18% 50%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 62%),
    linear-gradient(135deg, #0b0c0c 0%, #050505 70%, #000000 100%);
}

.left {
  position: relative;
}

.left-store {
  position: absolute;
  top: 18px;
  right: 18px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 12px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);
}

.left-foot {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
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
  width: 32px;
  height: 32px;
  display: block;
  opacity: 0.8;
  filter: brightness(0) invert(1);
}

.brand-text {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.right {
  padding: 0;
  display: grid;
}

.sheet {
  width: 100%;
  height: 100vh;
  border-radius: 28px 0 0 28px;
  border: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sheet-inner {
  padding: 48px;
  flex: 1 1 auto;
  display: grid;
  grid-template-rows: auto auto var(--auth-body-h);
  align-content: center;
  gap: 18px;
}

@media (max-width: 980px) {
  .sheet-inner {
    padding: 48px;
    align-content: center;
  }
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

.tabs {
  display: flex;
  justify-content: center;
  margin-top: 42px;
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
  height: var(--auth-body-h);
  margin-top: 30px;
  align-content: start;
}

.qr-area,
.nfc-area {
  height: 100%;
  display: grid;
  gap: 12px;
  justify-items: center;
  align-content: start;
}

.qr-hint {
  font-size: 12px;
}

.apron {
  font-weight: 900;
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
  height: 100%;
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
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 4px;
}

.pin-input::placeholder {
  color: rgba(17, 17, 17, 0.5);
  letter-spacing: 0;
}

.pin-clear {
  min-width: 72px;
  height: 40px;
  border-radius: var(--radius-btn);
  border: 1px solid var(--line);
  background: #fff;
}

.pin-actions {
  display: grid;
  justify-items: center;
}

</style>
