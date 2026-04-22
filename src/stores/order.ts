import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { z } from "zod";
import { calcLineUnitPrice, calcOrderSubtotal, round2 } from "../modules/pos/pricing";
import type { Customization, Order, OrderLine, Product, SelectedAddons, SelectedSpecs } from "../modules/pos/types";

const QtySchema = z.number().int().min(1).max(999);

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export const useOrderStore = defineStore("order", () => {
  const order = ref<Order>({
    id: uid("order"),
    type: "DINE_IN",
    lines: [],
    createdAt: Date.now()
  });

  const selectedLineId = ref<string | null>(null);

  const subtotal = computed(() => calcOrderSubtotal(order.value.lines));
  const discountTotal = computed(() => 0);
  const totalDue = computed(() => round2(subtotal.value - discountTotal.value));
  const paidTotal = computed(() => 0);
  const changeDue = computed(() => 0);

  const canPay = computed(() => order.value.lines.length > 0);

  function newOrder() {
    order.value = { id: uid("order"), type: order.value.type, lines: [], createdAt: Date.now() };
    selectedLineId.value = null;
  }

  function setOrderType(type: Order["type"]) {
    order.value.type = type;
  }

  function selectLine(id: string) {
    selectedLineId.value = id;
  }

  function unselectLine() {
    selectedLineId.value = null;
  }

  function normalizeCustomization(specs: SelectedSpecs, addons: SelectedAddons, note?: string): Customization {
    return { specs, addons, note: note?.trim() || undefined };
  }

  function isSameCustomization(a: Customization, b: Customization): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function addProduct(product: Product, customization: Customization) {
    const unitPrice = calcLineUnitPrice(product, customization);
    const existing = order.value.lines.find(
      (l) => l.productId === product.id && isSameCustomization(l.customization, customization)
    );
    if (existing) {
      setLineQty(existing.id, existing.qty + 1);
      return;
    }

    const line: OrderLine = {
      id: uid("line"),
      productId: product.id,
      name: product.name,
      unitPrice,
      qty: 1,
      customization,
      unavailable: product.unavailable
    };
    order.value.lines.unshift(line);
    selectedLineId.value = line.id;
  }

  function setLineQty(lineId: string, qty: number) {
    const parsed = QtySchema.safeParse(qty);
    if (!parsed.success) return;
    const line = order.value.lines.find((l) => l.id === lineId);
    if (!line) return;
    line.qty = parsed.data;
  }

  function incLine(lineId: string) {
    const line = order.value.lines.find((l) => l.id === lineId);
    if (!line) return;
    setLineQty(lineId, line.qty + 1);
  }

  function decLine(lineId: string) {
    const line = order.value.lines.find((l) => l.id === lineId);
    if (!line) return;
    setLineQty(lineId, line.qty - 1);
  }

  function removeLine(lineId: string) {
    order.value.lines = order.value.lines.filter((l) => l.id !== lineId);
    if (selectedLineId.value === lineId) selectedLineId.value = null;
  }

  function setLineNote(lineId: string, note: string) {
    const line = order.value.lines.find((l) => l.id === lineId);
    if (!line) return;
    line.customization.note = note.trim() || undefined;
  }

  function setOrderNote(note: string) {
    order.value.orderNote = note.trim() || undefined;
  }

  function buildEmptyCustomization(product: Product): Customization {
    return normalizeCustomization({}, {}, undefined);
  }

  return {
    order,
    selectedLineId,
    subtotal,
    discountTotal,
    totalDue,
    paidTotal,
    changeDue,
    canPay,
    newOrder,
    setOrderType,
    selectLine,
    unselectLine,
    addProduct,
    setLineQty,
    incLine,
    decLine,
    removeLine,
    setLineNote,
    setOrderNote,
    buildEmptyCustomization,
    normalizeCustomization
  };
});

