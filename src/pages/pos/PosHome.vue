<template>
  <div class="page">
    <header class="topbar">
      <div class="top-left">
        <button class="menu-btn" :aria-label="drawerOpen ? '关闭菜单' : '主菜单'" @click="toggleDrawer">
          <span class="menu-icon-wrap">
            <img class="menu-icon menu-icon-menu" :src="iconMenu" :data-open="drawerOpen ? 'true' : 'false'" alt="" />
            <img class="menu-icon menu-icon-close" :src="iconClose" :data-open="drawerOpen ? 'true' : 'false'" alt="" />
          </span>
        </button>
        <div class="top-title">快速点单</div>
      </div>
      <div class="top-center">
        <div class="search">
          <div class="search-box" :data-active="searchKeyboardVisible ? 'true' : 'false'">
            <img class="search-icon" :src="iconSearch" alt="" />
            <input
              v-model="searchQuery"
              class="search-input"
              placeholder="菜品首字母搜索"
              readonly
              @click="openSearchKeyboard"
              @focus="openSearchKeyboard"
            />
            <img class="search-enter-icon" :src="iconEnterKeyboard" alt="" />
          </div>
        </div>
      </div>
      <div class="top-right">
        <button class="order-btn" aria-label="订单" disabled>
          <img class="order-icon" :src="iconOrder" alt="" />
          <span class="order-text">订单</span>
          <span v-if="orderMsgCount > 0" class="msg-badge">{{ orderMsgBadge }}</span>
        </button>
        <button class="icon-btn" aria-label="通知" disabled>
          <img class="icon-img" :src="iconRemind" alt="" />
        </button>
        <button class="icon-btn" aria-label="打印" disabled>
          <img class="icon-img" :src="iconPrinter" alt="" />
        </button>
        <button class="icon-btn" aria-label="网络" disabled>
          <img class="icon-img" :src="iconWifi" alt="" />
        </button>
        <div class="muted meta">{{ dateText }} {{ nowText }}</div>
      </div>
    </header>

    <main class="content">
      <section class="left card" ref="leftPaneEl">
        <div v-if="isGuest" class="member card">
          <div class="member-left">
            <div class="avatar">
              <img class="avatar-img" :src="iconStarbucks" alt="" />
            </div>
            <div class="member-text">
              <div class="member-title">访客</div>
              <div class="muted meta">{{ visitorNo }}</div>
            </div>
          </div>
          <button class="btn" @click="openMemberModal">会员登录</button>
        </div>
        <div v-else class="member card member-trigger" @click="toggleMemberPanel">
          <div class="member-left">
            <div class="star">★</div>
            <div class="member-text">
              <div class="member-title">{{ member!.levelName }}</div>
              <div class="muted meta">{{ member!.maskedPhone }}</div>
            </div>
          </div>
          <div class="muted">›</div>
        </div>

        <div class="panel-title">商品信息</div>
        <div class="order-list">
          <button
            v-for="line in order.lines"
            :key="line.id"
            class="line2"
            :data-selected="line.id === selectedLineId"
            @click="orderStore.selectLine(line.id)"
          >
            <div class="trash">
              <img class="item-icon" :src="iconCoffee" alt="" />
            </div>
            <div class="line-main">
              <div class="line-name">
                <span class="name">{{ line.name }}</span>
                <span v-if="line.unavailable" class="badge">停售</span>
              </div>
              <div class="line-sub muted">
                <span v-if="specText(line)">{{ specText(line) }}</span>
                <span v-if="addonText(line)">{{ addonText(line) }}</span>
                <span v-if="line.customization.note">备注：{{ line.customization.note }}</span>
              </div>
            </div>
            <div class="line-right">
              <div class="qty">x{{ line.qty }}</div>
              <div class="line-total">¥{{ (line.unitPrice * line.qty).toFixed(2) }}</div>
            </div>
          </button>
          <div v-if="order.lines.length === 0" class="empty-state">
            <img class="empty-illus" :src="iconEmptyState" alt="" />
            <div class="empty-sub muted">请点击右侧菜单添加至购物车</div>
          </div>
        </div>

        <div class="summary2">
          <div class="row">
            <span class="muted">小计</span>
            <span>¥{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="row">
            <span class="muted">折扣</span>
            <span>¥{{ discountTotal.toFixed(2) }}</span>
          </div>
          <div class="row total">
            <span>应付</span>
            <span>¥{{ totalDue.toFixed(2) }}</span>
          </div>
          <button class="btn btn-primary pay-btn" :disabled="!canPay" @click="onPay">支付 ¥{{ totalDue.toFixed(2) }}</button>
        </div>
      </section>

      <section class="actions card">
        <button class="btn" :disabled="!hasCartItems" @click="orderStore.newOrder()">清空</button>
        <button class="btn icon-only" :disabled="!hasCartItems || !selectedLine" @click="onInc">
          <img class="pm-icon" :src="iconPlus" alt="" />
        </button>
        <div class="qty-box card">
          <div class="muted meta">数量</div>
          <div class="qty-num">{{ selectedLine ? selectedLine.qty : "-" }}</div>
        </div>
        <button class="btn icon-only" :disabled="!hasCartItems || !selectedLine" @click="onDec">
          <img class="pm-icon" :src="iconMinus" alt="" />
        </button>
        <button class="btn" :disabled="!hasCartItems || !selectedLine" @click="onRemove">删除</button>
        <button class="btn" :disabled="!hasCartItems || !selectedLine" @click="onEditLineCustomization">客制化</button>
        <button class="btn" disabled>优惠券</button>
        <button class="btn" disabled>店用餐具</button>
        <button class="btn" disabled>一次性餐具</button>
        <button class="btn" :disabled="!hasCartItems" :aria-pressed="order.type === 'TAKE_OUT'" @click="toggleTakeout">外带</button>
        <button class="btn" disabled>挂单</button>
      </section>

      <section ref="productsEl" class="products card">
        <div class="primary-tabs">
          <button
            v-for="c in catalog.primaryCategories"
            :key="c.id"
            class="chip"
            :aria-selected="c.id === catalog.selectedPrimaryId"
            @click="catalog.selectPrimary(c.id)"
          >
            {{ c.name }}
          </button>
        </div>
        <div v-if="catalog.visibleSubCategories.length" class="sub-tabs">
          <button
            v-for="s in catalog.visibleSubCategories"
            :key="s.id"
            class="chip"
            :aria-selected="s.id === catalog.selectedSubId"
            @click="catalog.selectSub(s.id)"
          >
            {{ s.name }}
          </button>
        </div>

        <div class="grid2">
          <button
            v-for="p in filteredProducts"
            :key="p.id"
            class="product2"
            :data-hit="isSearchHit(p) ? 'true' : 'false'"
            :disabled="!!p.unavailable"
            @click="onPickProduct(p.id)"
          >
            <div class="icon">
              <img class="item-icon" :src="iconCoffee" alt="" />
            </div>
            <div class="p2-name">{{ p.name }}</div>
            <div v-if="p.unavailable" class="corner">停售</div>
          </button>
        </div>
      </section>
    </main>

    <Transition name="member-panel">
      <div v-if="memberPanelVisible && !isGuest" class="member-panel-wrap" :style="{ left: `${memberPanelLeft}px` }" @click.self="closeMemberPanel">
        <aside class="member-panel">
          <div class="member-panel-head">
            <div class="member-panel-title">会员信息-{{ member?.maskedPhone }}</div>
            <button class="member-panel-close" aria-label="关闭会员详情" @click="closeMemberPanel">
              <img class="member-panel-close-icon" :src="iconClose" alt="" />
            </button>
          </div>

          <div class="member-panel-body">
            <section class="member-section">
              <h3 class="member-section-title">基本信息</h3>
              <div class="member-info-card">
                <div class="member-info-row" v-for="it in memberBasicRows" :key="it.label">
                  <span class="member-info-label">{{ it.label }}</span>
                  <span class="member-info-value">{{ it.value }}</span>
                </div>
              </div>
            </section>

            <section class="member-section">
              <h3 class="member-section-title">会员权益</h3>
              <div class="member-list-card">
                <button type="button" class="member-coupon-btn" v-for="it in memberBenefits" :key="it.name" @click="onMemberCouponClick('benefit', it)">
                  <span class="member-list-name">{{ it.name }}</span>
                  <span class="member-list-qty">x{{ it.qty }}</span>
                </button>
              </div>
            </section>

            <section class="member-section">
              <h3 class="member-section-title">会员好礼券</h3>
              <div class="member-list-card">
                <button type="button" class="member-coupon-btn" v-for="it in memberGiftCoupons" :key="it.name" @click="onMemberCouponClick('gift', it)">
                  <span class="member-list-name">{{ it.name }}</span>
                  <span class="member-list-qty">x{{ it.qty }}</span>
                </button>
              </div>
            </section>

            <section class="member-section">
              <h3 class="member-section-title">电子券</h3>
              <div class="member-list-card">
                <button type="button" class="member-coupon-btn" v-for="it in memberECoupons" :key="it.name" @click="onMemberCouponClick('eCoupon', it)">
                  <span class="member-list-name">{{ it.name }}</span>
                  <span class="member-list-qty">x{{ it.qty }}</span>
                </button>
              </div>
            </section>

            <section class="member-section">
              <h3 class="member-section-title">活动信息</h3>
              <div class="member-list-card">
                <button type="button" class="member-coupon-btn" v-for="it in memberActivities" :key="it.name" @click="onMemberCouponClick('activity', it)">
                  <span class="member-list-name">{{ it.name }}</span>
                  <span class="member-list-qty">x{{ it.qty }}</span>
                </button>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </Transition>

    <SpecModal
      v-if="specModal.visible"
      :product="specModal.product"
      :initialSpecs="specModal.initialSpecs"
      :initialAddons="specModal.initialAddons"
      @cancel="closeSpecModal"
      @confirm="confirmSpecModal"
    />

    <TextModal v-if="textModal.visible" :title="textModal.title" :maxLen="textModal.maxLen" :initialValue="textModal.initialValue" @cancel="closeTextModal" @confirm="confirmTextModal" />

    <MemberModal v-if="memberVisible" @close="memberVisible = false" />
    <PayModal v-if="payVisible" :amount="totalDue" @close="payVisible = false" @success="onPaySuccess" />

    <Transition name="toast">
      <div v-if="toast.visible" class="toast">{{ toast.text }}</div>
    </Transition>

    <div v-if="searchKeyboardVisible" class="kbd-mask" @click="closeSearchKeyboard">
      <div class="kbd-wrap" :style="kbdWrapStyle" @click.stop>
        <SearchKeyboard v-model="searchQuery" :maxLen="32" @close="closeSearchKeyboard" />
      </div>
    </div>

    <Transition name="drawer-mask">
      <div v-if="drawerOpen" class="drawer-mask" @click.self="closeDrawer">
        <Transition name="drawer">
          <aside class="drawer" @click.stop>
            <div class="drawer-main">
              <button v-for="it in drawerItems" :key="it.id" class="drawer-item" :data-active="activeDrawerId === it.id ? 'true' : 'false'" @click="selectDrawer(it.id)">
                <img class="drawer-icon" :src="it.icon" alt="" />
                <span class="drawer-label">{{ it.label }}</span>
              </button>
            </div>
            <div class="drawer-foot">
              <div class="drawer-user">
                <div class="drawer-avatar">
                  <img class="drawer-avatar-img" :src="iconAvatar" alt="" />
                </div>
              <div class="drawer-user-text">
                <div class="drawer-name">{{ staffName }}</div>
                <div class="muted drawer-store">{{ storeNameText }}</div>
              </div>
              </div>
            <button class="btn drawer-exit" @click="onStaffLogout">下机</button>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </div>

</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useCatalogStore } from "../../stores/catalog";
import { useMemberStore } from "../../stores/member";
import { useStaffStore } from "../../stores/staff";
import { useOrderStore } from "../../stores/order";
import { calcLineUnitPrice } from "../../modules/pos/pricing";
import type { OrderLine, SelectedAddons, SelectedSpecs } from "../../modules/pos/types";
import SpecModal from "./components/SpecModal.vue";
import TextModal from "./components/TextModal.vue";
import MemberModal from "./components/MemberModal.vue";
import PayModal from "./components/PayModal.vue";
import SearchKeyboard from "../../components/SearchKeyboard.vue";
import iconMenu from "../../assets/icons/菜单_menu.svg";
import iconClose from "../../assets/icons/关闭_close.svg";
import iconPrinter from "../../assets/icons/打印机_printer.svg";
import iconRemind from "../../assets/icons/提醒_remind.svg";
import iconSearch from "../../assets/icons/搜索_search.svg";
import iconEnterKeyboard from "../../assets/icons/输入键盘_enter-the-keyboard.svg";
import iconStarbucks from "../../assets/icons/星巴克.svg";
import iconWifi from "../../assets/icons/无线网络_wifi.svg";
import iconOrder from "../../assets/icons/订单_order.svg";
import iconEmptyState from "../../assets/icons/空状态.svg";
import iconPlus from "../../assets/icons/加_plus.svg";
import iconMinus from "../../assets/icons/减_minus.svg";
import iconCoffee from "../../assets/icons/咖啡.svg";
import iconQuick from "../../assets/icons/快速点单_quick.svg";
import iconOrderManage from "../../assets/icons/订单管理_order-manage.svg";
import iconReport from "../../assets/icons/报表日结_report.svg";
import iconTools from "../../assets/icons/促销工具_tools.svg";
import iconProducts from "../../assets/icons/商品管理_products.svg";
import iconSetting from "../../assets/icons/设置_setting.svg";
import iconUser from "../../assets/icons/用户_user.svg";
import iconAvatar from "../../assets/icons/Avatar (头像).svg";

const staffStore = useStaffStore();
const router = useRouter();
const staffName = computed(() => staffStore.staffName);
const storeNameText = computed(() => staffStore.storeName);
const STAFF_LOGIN_TOAST_KEY = "sbux_pos_staff_login_toast_v1";

const catalog = useCatalogStore();
const memberStore = useMemberStore();
const orderStore = useOrderStore();

const order = computed(() => orderStore.order);
const selectedLineId = computed(() => orderStore.selectedLineId);
const selectedLine = computed(() => order.value.lines.find((l) => l.id === selectedLineId.value) ?? null);
const hasCartItems = computed(() => order.value.lines.length > 0);

const subtotal = computed(() => orderStore.subtotal);
const discountTotal = computed(() => orderStore.discountTotal);
const totalDue = computed(() => orderStore.totalDue);
const canPay = computed(() => orderStore.canPay);

const member = computed(() => memberStore.member);
const isGuest = computed(() => memberStore.isGuest);
const visitorNo = computed(() => memberStore.visitorNo);
const memberPanelVisible = ref(false);
const leftPaneEl = ref<HTMLElement | null>(null);
const memberPanelLeft = ref(360);

const nowText = ref("");
const dateText = ref("");
let timer: number | null = null;

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${week}`;
}

onMounted(() => {
  nowText.value = fmtTime(Date.now());
  dateText.value = fmtDate(Date.now());
  const loginToast = sessionStorage.getItem(STAFF_LOGIN_TOAST_KEY);
  if (loginToast) {
    showToast(loginToast);
    sessionStorage.removeItem(STAFF_LOGIN_TOAST_KEY);
  }
  timer = window.setInterval(() => {
    nowText.value = fmtTime(Date.now());
    dateText.value = fmtDate(Date.now());
  }, 1000);
});

onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

function onResize() {
  if (searchKeyboardVisible.value) updateKeyboardPosition();
  syncMemberPanelLeft();
}

function specText(line: OrderLine): string {
  const product = catalog.getProductById(line.productId);
  const specs = line.customization.specs ?? {};
  const parts: string[] = [];

  if (product?.specGroups?.length) {
    for (const g of product.specGroups) {
      const optId = specs[g.id];
      if (!optId) continue;
      const opt = g.options.find((o) => o.id === optId);
      if (opt?.name) parts.push(opt.name);
    }
  } else {
    parts.push(...Object.values(specs).filter(Boolean));
  }

  return parts.length ? `规格：${parts.join(" / ")}` : "";
}

function addonText(line: OrderLine): string {
  const product = catalog.getProductById(line.productId);
  const addonList = product?.addons ?? [];
  const entries = Object.entries(line.customization.addons).filter(([, qty]) => (qty ?? 0) > 0);
  if (!entries.length) return "";
  const text = entries
    .map(([id, qty]) => {
      const name = addonList.find((a) => a.id === id)?.name ?? id;
      return `${name}×${qty}`;
    })
    .join("，");
  return `加料：${text}`;
}

const searchQuery = ref("");
const orderMsgCount = ref(99);

const orderMsgBadge = computed(() => (orderMsgCount.value > 99 ? "99+" : String(orderMsgCount.value)));

const searchKeyboardVisible = ref(false);
const productsEl = ref<HTMLElement | null>(null);
const kbdWrapStyle = ref<Record<string, string>>({});

const drawerOpen = ref(false);

const drawerItems = [
  { id: "quick", label: "快速点单", icon: iconQuick },
  { id: "orders", label: "订单管理", icon: iconOrderManage },
  { id: "report", label: "报表&日结", icon: iconReport },
  { id: "tools", label: "促销工具", icon: iconTools },
  { id: "print", label: "打印中心", icon: iconPrinter },
  { id: "products", label: "商品管理", icon: iconProducts },
  { id: "setting", label: "设置", icon: iconSetting }
] as const;

type DrawerId = (typeof drawerItems)[number]["id"];
const activeDrawerId = ref<DrawerId>("quick");

function openDrawer() {
  drawerOpen.value = true;
}

function toggleDrawer() {
  drawerOpen.value ? closeDrawer() : openDrawer();
}

function closeDrawer() {
  drawerOpen.value = false;
}

function selectDrawer(id: DrawerId) {
  activeDrawerId.value = id;
  closeDrawer();
}

function onStaffLogout() {
  staffStore.logout();
  closeDrawer();
  router.replace("/login");
}

function openSearchKeyboard() {
  searchKeyboardVisible.value = true;
  nextTick(() => {
    updateKeyboardPosition();
  });
}

watch(drawerOpen, (v) => {
  document.body.style.overflow = v ? "hidden" : "";
});

onUnmounted(() => {
  document.body.style.overflow = "";
});

function closeSearchKeyboard() {
  searchKeyboardVisible.value = false;
}

function resetSearchInput() {
  searchQuery.value = "";
}

function updateKeyboardPosition() {
  const el = productsEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const inset = 14;
  const left = Math.round(r.left + inset);
  const width = Math.max(320, Math.round(r.width - inset * 2));
  kbdWrapStyle.value = {
    left: `${left}px`,
    width: `${width}px`
  };
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function isProductMatched(product: { name: string; searchKeywords?: string[] }, query: string): boolean {
  if (!query) return true;
  const nameMatched = normalizeSearch(product.name).includes(query);
  if (nameMatched) return true;
  return (product.searchKeywords ?? []).some((k) => normalizeSearch(k).includes(query));
}

const normalizedSearchQuery = computed(() => normalizeSearch(searchQuery.value));

const filteredProducts = computed(() => {
  const q = normalizedSearchQuery.value;
  const base = catalog.productsBySelection;
  if (!q) return base;
  return base.filter((p) => isProductMatched(p, q));
});

function isSearchHit(product: { name: string; searchKeywords?: string[] }): boolean {
  const q = normalizedSearchQuery.value;
  if (!q) return false;
  return isProductMatched(product, q);
}


const specModal = ref<{
  visible: boolean;
  productId: string | null;
  product: any | null;
  initialSpecs: SelectedSpecs;
  initialAddons: SelectedAddons;
  mode: "add" | "edit";
  editingLineId: string | null;
}>({
  visible: false,
  productId: null,
  product: null,
  initialSpecs: {},
  initialAddons: {},
  mode: "add",
  editingLineId: null
});

function openSpecModalForAdd(productId: string) {
  const product = catalog.getProductById(productId);
  if (!product) return;
  specModal.value = {
    visible: true,
    productId,
    product,
    initialSpecs: {},
    initialAddons: {},
    mode: "add",
    editingLineId: null
  };
}

function openSpecModalForEdit(lineId: string) {
  const line = order.value.lines.find((l) => l.id === lineId);
  if (!line) return;
  const product = catalog.getProductById(line.productId);
  if (!product) return;
  specModal.value = {
    visible: true,
    productId: line.productId,
    product,
    initialSpecs: { ...line.customization.specs },
    initialAddons: { ...line.customization.addons },
    mode: "edit",
    editingLineId: lineId
  };
}

function closeSpecModal() {
  specModal.value.visible = false;
}

function confirmSpecModal(payload: { specs: SelectedSpecs; addons: SelectedAddons }) {
  const product = specModal.value.product;
  if (!product) return;
  const customization = orderStore.normalizeCustomization(payload.specs, payload.addons, undefined);
  if (specModal.value.mode === "add") {
    orderStore.addProduct(product, customization);
    resetSearchInput();
    closeSpecModal();
    return;
  }

  const lineId = specModal.value.editingLineId;
  if (!lineId) return;
  const line = order.value.lines.find((l) => l.id === lineId);
  if (!line) return;
  line.customization = customization;
  line.unitPrice = calcLineUnitPrice(product, customization);
  closeSpecModal();
}

function onPickProduct(productId: string) {
  const product = catalog.getProductById(productId);
  if (!product || product.unavailable) return;
  const hasSpec = (product.specGroups?.length ?? 0) > 0;
  const hasAddon = (product.addons?.length ?? 0) > 0;
  if (hasSpec || hasAddon) {
    openSpecModalForAdd(productId);
    return;
  }
  orderStore.addProduct(product, orderStore.buildEmptyCustomization(product));
  resetSearchInput();
}

function onInc() {
  if (!selectedLine.value) return;
  orderStore.incLine(selectedLine.value.id);
}

function onDec() {
  if (!selectedLine.value) return;
  orderStore.decLine(selectedLine.value.id);
}

function onRemove() {
  if (!selectedLine.value) return;
  orderStore.removeLine(selectedLine.value.id);
}

function onEditLineNote() {
  if (!selectedLine.value) return;
  textModal.value = {
    visible: true,
    title: "行备注",
    maxLen: 40,
    initialValue: selectedLine.value.customization.note ?? "",
    mode: "line",
    lineId: selectedLine.value.id
  };
}

function onEditOrderNote() {
  textModal.value = {
    visible: true,
    title: "整单备注",
    maxLen: 80,
    initialValue: order.value.orderNote ?? "",
    mode: "order",
    lineId: null
  };
}

function onEditLineCustomization() {
  if (!selectedLine.value) return;
  openSpecModalForEdit(selectedLine.value.id);
}

const textModal = ref<{
  visible: boolean;
  title: string;
  maxLen: number;
  initialValue: string;
  mode: "line" | "order";
  lineId: string | null;
}>({
  visible: false,
  title: "",
  maxLen: 40,
  initialValue: "",
  mode: "order",
  lineId: null
});

function closeTextModal() {
  textModal.value.visible = false;
}

function confirmTextModal(value: string) {
  if (textModal.value.mode === "order") {
    orderStore.setOrderNote(value);
  } else if (textModal.value.lineId) {
    orderStore.setLineNote(textModal.value.lineId, value);
  }
  closeTextModal();
}

const payVisible = ref(false);
const toast = ref<{ visible: boolean; text: string }>({ visible: false, text: "" });
let toastTimer: number | null = null;

function onPay() {
  if (!canPay.value) return;
  payVisible.value = true;
}

function onPaySuccess() {
  const paid = totalDue.value;
  payVisible.value = false;
  showToast(`支付成功 ¥${paid.toFixed(2)}`);
  orderStore.newOrder();
  memberStore.logout();
}

function showToast(text: string) {
  toast.value = { visible: true, text };
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.value.visible = false;
  }, 1600);
}

onUnmounted(() => {
  if (toastTimer) window.clearTimeout(toastTimer);
});

function toggleTakeout() {
  orderStore.setOrderType(order.value.type === "TAKE_OUT" ? "DINE_IN" : "TAKE_OUT");
}

const memberVisible = ref(false);

function openMemberModal() {
  memberVisible.value = true;
}

function toggleMemberPanel() {
  if (isGuest.value) {
    openMemberModal();
    return;
  }
  if (!memberPanelVisible.value) syncMemberPanelLeft();
  memberPanelVisible.value = !memberPanelVisible.value;
}

function closeMemberPanel() {
  memberPanelVisible.value = false;
}

watch(isGuest, (v) => {
  if (v) memberPanelVisible.value = false;
});

function syncMemberPanelLeft() {
  const rect = leftPaneEl.value?.getBoundingClientRect();
  if (!rect) {
    memberPanelLeft.value = 0;
    return;
  }
  const w = window.innerWidth || 0;
  const left = Math.round(rect.right);
  memberPanelLeft.value = left > w - 64 ? 0 : left;
}

type MemberCouponItem = { name: string; qty: number };

function onMemberCouponClick(_section: string, _item: MemberCouponItem) {}

const memberBasicRows = computed(() => [
  { label: "卡号", value: "7310292130031159318" },
  { label: "姓名", value: member.value?.maskedPhone ?? "-" },
  { label: "好礼星星", value: "2276（可使用会员账户支付）" },
  { label: "等级", value: "钻星（成长值：1095）" },
  { label: "周年会员日", value: "04/11" }
]);

const memberBenefits: MemberCouponItem[] = [
  { name: "钻星生日惊喜礼物", qty: 1 }
];

const memberGiftCoupons: MemberCouponItem[] = [
  { name: "中杯饮品升杯券", qty: 1 },
  { name: "手工调制饮品券", qty: 1 },
  { name: "指定早餐组合券", qty: 1 }
];

const memberECoupons: MemberCouponItem[] = [
  { name: "满 39 减 8 电子券", qty: 1 }
];

const memberActivities: MemberCouponItem[] = [
  { name: "春季新品加赠活动", qty: 1 }
];
</script>

<style scoped>
.page {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0;
  padding: 0;
}

.topbar {
  display: grid;
  grid-template-columns: 360px 120px 1fr auto;
  align-items: center;
  padding: 0;
  gap: 10px;
  border: none;
  border-radius: 0;
  background: #fff;
  height: var(--topbar-h);
}

.meta {
  font-size: 12px;
}

.top-left {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  align-self: stretch;
  grid-column: 1;
}

.top-title {
  font-size: 18px;
  font-weight: 900;
  color: #333333;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.top-center {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
  padding: 10px 0;
  grid-column: 3;
}

.top-right {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px 10px 0;
  grid-column: 4;
}

.top-right .meta {
  color: #333333;
}

.icon-img {
  width: 22px;
  height: 22px;
  display: block;
}

.menu-btn {
  width: 84px;
  height: 100%;
  border-radius: var(--radius-card) 0 0 var(--radius-card);
  border: none;
  border-right: 1px solid var(--line);
  background: #fff;
  display: inline-grid;
  place-items: center;
  padding: 0;
}

.menu-icon-wrap {
  position: relative;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}

.menu-icon {
  position: absolute;
  inset: 0;
  width: 28px;
  height: 28px;
  display: block;
  transition: opacity 180ms ease, transform 180ms ease;
}

.menu-icon-menu[data-open="true"] {
  opacity: 0;
  transform: scale(0.86) rotate(-10deg);
}

.menu-icon-menu[data-open="false"] {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.menu-icon-close[data-open="true"] {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.menu-icon-close[data-open="false"] {
  opacity: 0;
  transform: scale(0.86) rotate(10deg);
}

.order-btn {
  position: relative;
  min-height: var(--touch);
  padding: 0 18px;
  border-radius: var(--radius-btn);
  border: 1px solid var(--line);
  background: var(--panel);
  color: var(--fg);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.order-btn:disabled {
  opacity: 1;
}

.order-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.order-text {
  font-size: 16px;
  font-weight: 900;
}

.msg-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 32px;
  height: 20px;
  padding: 0;
  border-radius: 999px;
  background: #333333;
  color: #fff;
  font-weight: 900;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.search {
  width: 360px;
}

.search-box {
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--radius-btn);
  background: #fff;
  padding: 0 14px;
  min-height: var(--touch);
}

.search-box[data-active="true"] {
  border-color: #333333;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.18);
  z-index: 60;
}

.search-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.search-input {
  height: var(--touch);
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

.search-enter-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.kbd-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 50;
}

.kbd-wrap {
  position: fixed;
  bottom: 14px;
  z-index: 51;
}

.drawer-mask {
  position: fixed;
  top: var(--topbar-h);
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 70;
  display: flex;
}

.drawer {
  width: 320px;
  height: calc(100vh - var(--topbar-h));
  background: #fff;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
}

.drawer-main {
  flex: 1 1 auto;
  padding: 18px 0;
  border-top: 1px solid var(--line);
  display: grid;
  align-content: start;
  gap: 6px;
}

.drawer-item {
  width: calc(100% - 48px);
  height: 68px;
  margin: 0 24px;
  padding: 0 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  font-size: 16px;
  font-weight: 900;
  color: #111111;
}

.drawer-item[data-active="true"] {
  background: #F5F5F7;
}

.drawer-item:active {
  background: var(--panel);
}

.drawer-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.drawer-foot {
  border-top: 1px solid var(--line);
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.drawer-user {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.drawer-avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: #fff;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.drawer-avatar-img {
  width: 22px;
  height: 22px;
  display: block;
}

.drawer-user-text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.drawer-name {
  font-size: 14px;
  font-weight: 900;
  white-space: nowrap;
}

.drawer-store {
  font-size: 12px;
  white-space: nowrap;
}

.drawer-exit {
  min-width: 96px;
}

.drawer-mask-enter-active,
.drawer-mask-leave-active {
  transition: opacity 180ms ease;
}

.drawer-mask-enter-from,
.drawer-mask-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 220ms ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}


.content {
  display: grid;
  grid-template-columns: 360px 120px 1fr;
  gap: 0;
  min-height: 0;
  padding: 0;
}

.panel-title {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  font-weight: 700;
}

.left {
  min-height: 0;
  border-radius: 0;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
}

.member {
  margin: 12px;
  padding: 12px;
  background: var(--panel);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.member-trigger {
  cursor: pointer;
}

.member-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border: 1px solid #ffffff;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #fff;
  overflow: hidden;
}

.avatar-img {
  width: 36px;
  height: 36px;
  display: block;
}

.star {
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #fff;
}

.member-title {
  font-weight: 800;
}

.member-panel-wrap {
  position: fixed;
  top: var(--topbar-h);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 65;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: flex-start;
}

.member-panel {
  width: 480px;
  background: #fff;
  border-top: 1px solid var(--line);
  border-left: 0;
  display: grid;
  grid-template-rows: auto 1fr;
}

.member-panel-head {
  padding: 18px 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.member-panel-title {
  font-size: 18px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.member-panel-close {
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.member-panel-close-icon {
  width: 20px;
  height: 20px;
  display: block;
}

.member-panel-body {
  overflow: auto;
  padding: 14px 20px 24px;
  display: grid;
  gap: 20px;
  align-content: start;
}

.member-section {
  display: grid;
  gap: 10px;
}

.member-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
}

.member-info-card,
.member-list-card {
  display: grid;
  gap: 12px;
}

.member-info-row,
.member-list-row {
  min-height: 34px;
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 12px;
}

.member-info-card {
  background: #f7f7f8;
  border-radius: 12px;
  padding: 12px 14px;
  gap: 8px;
}

.member-coupon-btn {
  width: 100%;
  min-height: 72px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #f7f7f8;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.member-coupon-btn:active {
  background: var(--panel);
}

.member-coupon-btn:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.18);
}

.member-info-label {
  color: #5f6671;
  font-size: 14px;
}

.member-info-value {
  font-size: 15px;
  font-weight: 700;
  color: #111111;
}

.member-list-name {
  font-size: 15px;
  font-weight: 800;
  color: #111111;
}

.member-list-qty {
  justify-self: end;
  color: #5f6671;
  font-size: 15px;
}

.member-panel-enter-active,
.member-panel-leave-active {
  transition: opacity 200ms ease;
}

.member-panel-enter-active .member-panel,
.member-panel-leave-active .member-panel {
  transition: transform 240ms ease;
}

.member-panel-enter-from {
  opacity: 0;
}

.member-panel-enter-from .member-panel {
  transform: translateX(-36px);
}

.member-panel-leave-to {
  opacity: 0;
}

.member-panel-leave-to .member-panel {
  transform: translateX(-36px);
}

@media (max-width: 980px) {
  .member-panel-wrap {
    left: 0;
    justify-content: flex-end;
  }

  .member-panel {
    width: min(480px, 100vw);
  }

  .member-panel-enter-from .member-panel {
    transform: translateX(36px);
  }

  .member-panel-leave-to .member-panel {
    transform: translateX(36px);
  }
}

.toast {
  position: fixed;
  top: calc(var(--topbar-h) + 14px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 120;
  background: rgba(17, 17, 17, 0.92);
  color: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.2px;
  user-select: none;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

.order-list {
  overflow: auto;
  padding: 12px;
  background: #F5F5F7;
  display: grid;
  gap: 12px;
  align-content: start;
  position: relative;
}

.line2 {
  width: 100%;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: #fff;
  padding: 12px;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  min-height: var(--touch);
  align-items: center;
}

.line2[data-selected="true"] {
  border-color: var(--fg);
}

.trash {
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  display: grid;
  place-items: center;
  color: var(--muted);
}

.item-icon {
  width: 18px;
  height: 18px;
  display: block;
}

.line-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 700;
}

.badge {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}

.line-sub {
  font-size: 12px;
  display: grid;
  gap: 2px;
}

.line-right {
  text-align: right;
  display: grid;
  gap: 2px;
  align-content: start;
  font-size: 12px;
}

.line-total {
  font-weight: 700;
}

.empty-state {
  position: absolute;
  inset: 0;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 12px;
  padding: 12px;
  text-align: center;
}

.empty-illus {
  width: 120px;
  height: auto;
  display: block;
}

.empty-sub {
  font-size: 12px;
  max-width: 260px;
  line-height: 1.4;
}

.summary2 {
  padding: 12px;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 12px;
  background: #fff;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.row.total {
  font-size: 16px;
  font-weight: 800;
}

.pay-btn {
  width: 100%;
}

.actions {
  padding: 12px;
  border-left: 0;
  border-radius: 0;
  display: grid;
  gap: 12px;
  align-content: start;
  grid-auto-rows: min-content;
}

.qty-box {
  padding: 12px;
  background: var(--panel);
  display: grid;
  gap: 6px;
  justify-items: center;
}

.icon-only {
  padding: 0;
  display: inline-grid;
  place-items: center;
}

.pm-icon {
  width: 22px;
  height: 22px;
  display: block;
}

.qty-num {
  font-size: 20px;
  font-weight: 900;
}

.products {
  min-height: 0;
  margin-left: 0;
  border-left: 0;
  display: grid;
  grid-template-rows: auto auto 1fr;
  overflow: hidden;
  background: #F5F5F7;
  border-radius: 0;
}

.primary-tabs {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid var(--line);
  background: #fff;
}

.primary-tabs .chip,
.sub-tabs .chip {
  min-width: 88px;
  justify-content: center;
  white-space: nowrap;
}

.sub-tabs {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border-bottom: 1px solid var(--line);
  background: #fff;
}

.grid2 {
  overflow: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-content: start;
  gap: 12px;
  background: #F5F5F7;
}

.product2 {
  position: relative;
  border: 1px solid var(--line);
  border-radius: var(--radius-card);
  background: #fff;
  height: 100px;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  align-items: center;
  text-align: left;
}

.product2[data-hit="true"] {
  border-color: #333333;
  box-shadow: inset 0 0 0 1px #333333;
}

.product2:disabled {
  opacity: 0.5;
}

.icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  background: var(--panel);
}

.p2-name {
  font-weight: 800;
  font-size: 16px;
}

.corner {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
  background: #fff;
}
</style>
