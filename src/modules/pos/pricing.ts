import type { AddonItem, Customization, OrderLine, Product } from "./types";

export function calcLineUnitPrice(product: Product, customization: Customization): number {
  const addonPrice = calcAddonPrice(product.addons ?? [], customization.addons);
  return round2(product.basePrice + addonPrice);
}

export function calcLineTotal(line: OrderLine): number {
  return round2(line.unitPrice * line.qty);
}

export function calcOrderSubtotal(lines: OrderLine[]): number {
  return round2(lines.reduce((sum, l) => sum + calcLineTotal(l), 0));
}

export function calcAddonPrice(addons: AddonItem[], selected: Record<string, number>): number {
  let sum = 0;
  for (const a of addons) {
    const qty = selected[a.id] ?? 0;
    sum += a.price * qty;
  }
  return round2(sum);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

