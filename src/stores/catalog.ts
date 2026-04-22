import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Product } from "../modules/pos/types";

type PrimaryCategory = { id: string; name: string };
type SubCategory = { id: string; name: string; primaryId: string };

const seedPrimaryCategories: PrimaryCategory[] = [
  { id: "hot", name: "热销推荐" },
  { id: "all", name: "全部" },
  { id: "drink", name: "饮料" },
  { id: "food", name: "食品" },
  { id: "breakfast", name: "早餐" },
  { id: "bean", name: "咖啡豆" },
  { id: "coupon", name: "卡/券" }
];

const seedSubCategories: SubCategory[] = [
  { id: "all_drink", name: "全部", primaryId: "drink" },
  { id: "espresso", name: "浓缩咖啡", primaryId: "drink" },
  { id: "coldbrew", name: "冷萃", primaryId: "drink" },
  { id: "frap", name: "星冰乐", primaryId: "drink" },
  { id: "tea", name: "手工茶/新鲜调制", primaryId: "drink" },
  { id: "flavored", name: "摇摇茶饮", primaryId: "drink" },
  { id: "featured", name: "特调饮品", primaryId: "drink" },
  { id: "other", name: "其它饮品", primaryId: "drink" },
  { id: "all_food", name: "全部", primaryId: "food" }
];

const seedProducts: Product[] = [
  {
    id: "latte",
    name: "拿铁",
    searchKeywords: ["nt", "natie", "latte"],
    basePrice: 32,
    primaryCategoryId: "drink",
    subCategoryId: "espresso",
    specGroups: [
      {
        id: "size",
        name: "杯型",
        required: true,
        options: [
          { id: "tall", name: "中杯", subtext: "355ml" },
          { id: "grande", name: "中杯", subtext: "473ml" },
          { id: "venti", name: "超大杯", subtext: "592ml" }
        ]
      },
      {
        id: "temp",
        name: "温度",
        required: true,
        options: [
          { id: "very_hot", name: "特别热" },
          { id: "hot", name: "热" },
          { id: "warm", name: "微热" },
          { id: "ice", name: "冰" },
          { id: "less_ice", name: "少冰" },
          { id: "no_ice", name: "去冰" }
        ]
      },
      {
        id: "sweet",
        name: "甜度选择",
        required: false,
        options: [
          { id: "classic", name: "经典糖" },
          { id: "zero", name: "0热量代糖" },
          { id: "no_sugar", name: "不另外加糖" },
          { id: "less", name: "少少甜" },
          { id: "lite", name: "少甜" },
          { id: "std", name: "标准甜" }
        ]
      },
      {
        id: "espresso",
        name: "浓缩咖啡",
        required: false,
        options: [
          { id: "classic_dark", name: "经典浓缩（深烘）" },
          { id: "blonde", name: "金烘浓缩（浅烘）" },
          { id: "decaf_dark", name: "低因浓缩（深烘）" },
          { id: "classic", name: "经典浓缩", subtext: "浓郁醇香，焦糖甜感" },
          { id: "ristretto", name: "满萃浓缩", subtext: "深度萃取，焦香饱满" },
          { id: "signature", name: "精萃浓缩", subtext: "精炼萃取，偏酸甜" }
        ]
      },
      {
        id: "milk",
        name: "添加或更换牛奶",
        required: false,
        options: [
          { id: "whole", name: "全脂牛奶" },
          { id: "soy", name: "巴旦木奶" },
          { id: "oat", name: "燕麦奶" },
          { id: "nonfat", name: "脱脂牛奶" }
        ]
      },
      {
        id: "foam",
        name: "奶泡",
        required: false,
        options: [
          { id: "std", name: "标准奶泡" },
          { id: "no", name: "去奶泡" },
          { id: "less", name: "少奶泡" },
          { id: "more", name: "多奶泡" }
        ]
      },
      {
        id: "flavor",
        name: "无糖风味定制/添加",
        required: false,
        options: [
          { id: "vanilla", name: "香草风味" },
          { id: "hazelnut", name: "榛果风味" },
          { id: "sea_salt", name: "海盐焦糖风味" },
          { id: "toffee", name: "太妃地香草风味" },
          { id: "strawberry", name: "草莓风味" },
          { id: "cookie", name: "糯香斑斓风味" }
        ]
      }
    ],
    addons: [
      { id: "shot", name: "浓缩加一份", price: 5 },
      { id: "vanilla", name: "香草糖浆", price: 3, mutexGroupId: "syrup" },
      { id: "caramel", name: "焦糖糖浆", price: 3, mutexGroupId: "syrup" },
      { id: "oat", name: "燕麦奶", price: 6 }
    ]
  },
  {
    id: "americano",
    name: "美式",
    searchKeywords: ["ms", "meishi", "americano"],
    basePrice: 28,
    primaryCategoryId: "drink",
    subCategoryId: "espresso",
    specGroups: [
      {
        id: "size",
        name: "杯型",
        required: true,
        options: [
          { id: "tall", name: "中杯", subtext: "355ml" },
          { id: "grande", name: "中杯", subtext: "473ml" },
          { id: "venti", name: "超大杯", subtext: "592ml" }
        ]
      },
      {
        id: "temp",
        name: "温度",
        required: true,
        options: [
          { id: "very_hot", name: "特别热" },
          { id: "hot", name: "热" },
          { id: "warm", name: "微热" },
          { id: "ice", name: "冰" },
          { id: "less_ice", name: "少冰" },
          { id: "no_ice", name: "去冰" }
        ]
      }
    ],
    addons: [{ id: "shot", name: "浓缩加一份", price: 5 }]
  },
  {
    id: "iced_latte",
    name: "冰拿铁",
    searchKeywords: ["bnt", "bingnatie", "icedlatte"],
    basePrice: 34,
    primaryCategoryId: "drink",
    subCategoryId: "coldbrew",
    specGroups: [
      {
        id: "size",
        name: "杯型",
        required: true,
        options: [
          { id: "tall", name: "中杯", subtext: "355ml" },
          { id: "grande", name: "中杯", subtext: "473ml" },
          { id: "venti", name: "超大杯", subtext: "592ml" }
        ]
      },
      {
        id: "ice",
        name: "冰量",
        required: true,
        options: [
          { id: "regular", name: "正常" },
          { id: "less", name: "少冰" },
          { id: "no", name: "去冰" }
        ]
      }
    ],
    addons: [
      { id: "shot", name: "浓缩加一份", price: 5 },
      { id: "oat", name: "燕麦奶", price: 6 }
    ]
  },
  {
    id: "matcha",
    name: "抹茶拿铁",
    searchKeywords: ["mcnt", "mochanatie", "matcha"],
    basePrice: 36,
    primaryCategoryId: "drink",
    subCategoryId: "tea",
    specGroups: [
      {
        id: "size",
        name: "杯型",
        required: true,
        options: [
          { id: "tall", name: "中杯", subtext: "355ml" },
          { id: "grande", name: "中杯", subtext: "473ml" },
          { id: "venti", name: "超大杯", subtext: "592ml" }
        ]
      }
    ],
    addons: [{ id: "oat", name: "燕麦奶", price: 6 }]
  },
  {
    id: "croissant",
    name: "可颂",
    searchKeywords: ["ks", "kesong", "croissant"],
    basePrice: 18,
    primaryCategoryId: "food",
    subCategoryId: "all_food"
  },
  {
    id: "sandwich",
    name: "三明治",
    searchKeywords: ["smz", "sanmingzhi", "sandwich"],
    basePrice: 26,
    primaryCategoryId: "food",
    subCategoryId: "all_food",
    unavailable: true
  }
];

export const useCatalogStore = defineStore("catalog", () => {
  const primaryCategories = ref<PrimaryCategory[]>(seedPrimaryCategories);
  const subCategories = ref<SubCategory[]>(seedSubCategories);
  const products = ref<Product[]>(seedProducts);

  const selectedPrimaryId = ref<string>(primaryCategories.value[0]?.id ?? "all");
  const selectedSubId = ref<string>("all");

  function getDefaultSubId(primaryId: string): string {
    const candidates = subCategories.value.filter((s) => s.primaryId === primaryId);
    if (!candidates.length) return "all";
    const allItem = candidates.find((s) => s.name === "全部");
    return allItem?.id ?? candidates[0].id;
  }

  const visibleSubCategories = computed(() => {
    if (selectedPrimaryId.value !== "drink" && selectedPrimaryId.value !== "food") return [];
    return subCategories.value.filter((s) => s.primaryId === selectedPrimaryId.value);
  });

  const effectiveSelectedSubId = computed(() => {
    if (visibleSubCategories.value.length === 0) return null;
    const exists = visibleSubCategories.value.some((s) => s.id === selectedSubId.value);
    if (!exists) return visibleSubCategories.value[0]?.id ?? null;
    return selectedSubId.value;
  });

  const productsBySelection = computed(() => {
    const pid = selectedPrimaryId.value;
    const sid = effectiveSelectedSubId.value;
    if (pid === "all") return products.value;
    if (pid === "hot") return products.value;
    const base = products.value.filter((p) => p.primaryCategoryId === pid);
    if (!sid) return base;
    if (sid === "all_drink" || sid === "all_food") return base;
    return base.filter((p) => p.subCategoryId === sid);
  });

  function selectPrimary(id: string) {
    selectedPrimaryId.value = id;
    selectedSubId.value = getDefaultSubId(id);
  }

  function selectSub(id: string) {
    selectedSubId.value = id;
  }

  function getProductById(id: string): Product | undefined {
    return products.value.find((p) => p.id === id);
  }

  return {
    primaryCategories,
    subCategories,
    products,
    selectedPrimaryId,
    selectedSubId,
    visibleSubCategories,
    productsBySelection,
    selectPrimary,
    selectSub,
    getProductById
  };
});
