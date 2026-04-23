<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-head">
        <div class="sys-title">星巴克门店收银系统</div>
        <div class="sys-sub muted">门店ID：{{ storeId }}　{{ storeName }}</div>
      </div>

      <div class="tabs">
        <div class="seg" role="tablist" aria-label="上机认证方式">
          <button class="seg-btn" role="tab" :aria-selected="tab === 'phone_qr'" @click="tab = 'phone_qr'">
            <img class="seg-icon" :src="iconScan" alt="" />
            <span class="seg-text">手机扫码</span>
          </button>
          <button class="seg-btn" role="tab" :aria-selected="tab === 'badge_scan'" @click="tab = 'badge_scan'">
            <img class="seg-icon" :src="iconUser" alt="" />
            <span class="seg-text">胸卡扫描</span>
          </button>
          <button class="seg-btn" role="tab" :aria-selected="tab === 'pin'" @click="tab = 'pin'">
            <img class="seg-icon" :src="iconKeyboard" alt="" />
            <span class="seg-text">数字密码</span>
          </button>
        </div>
      </div>

      <div class="body">
        <div v-if="tab === 'phone_qr'" class="center">
          <div class="qr card">
            <div class="qr-box"></div>
            <div class="muted">店员使用手机扫码完成上机</div>
          </div>
          <button class="btn btn-primary" @click="onPhoneLogin">模拟扫码上机</button>
        </div>

        <div v-else-if="tab === 'badge_scan'" class="center">
          <div class="qr card">
            <div class="qr-box"></div>
            <div class="muted">请扫描员工胸卡</div>
          </div>
          <button class="btn btn-primary" @click="onBadgeLogin">模拟扫描胸卡</button>
        </div>

        <div v-else class="pin">
          <div class="pin-head">
            <div class="label muted">数字密码登录</div>
            <div class="muted">{{ pinHint }}</div>
          </div>
          <div class="pin-field card">
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

      <div class="foot muted">上机后将进入快速点单页面</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import NumericKeyboard from "../../components/NumericKeyboard.vue";
import { useStaffStore } from "../../stores/staff";
import iconScan from "../../assets/icons/扫码_scan-code.svg";
import iconKeyboard from "../../assets/icons/输入键盘_enter-the-keyboard.svg";
import iconUser from "../../assets/icons/用户_user.svg";

const router = useRouter();
const staffStore = useStaffStore();

const storeId = computed(() => staffStore.storeId);
const storeName = computed(() => staffStore.storeName);

const tab = ref<"phone_qr" | "badge_scan" | "pin">("phone_qr");
const pin = ref("");
const pinError = ref("");

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
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
  width: min(920px, 100%);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
}

.login-head {
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--line);
}

.sys-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #111111;
}

.sys-sub {
  margin-top: 6px;
  font-size: 14px;
}

.tabs {
  padding: 12px 18px;
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
  padding: 18px;
  overflow: auto;
}

.center {
  display: grid;
  gap: 14px;
  justify-items: center;
  align-content: start;
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

.pin {
  display: grid;
  gap: 12px;
}

.pin-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.pin-field {
  min-height: 56px;
  padding: 0 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  background: #fff;
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

.pin-error {
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  padding: 10px 12px;
  background: var(--panel);
  color: var(--fg);
  font-size: 12px;
}

.pin-actions {
  display: flex;
  justify-content: flex-end;
}

.foot {
  padding: 12px 18px;
  border-top: 1px solid var(--line);
  font-size: 12px;
}
</style>

