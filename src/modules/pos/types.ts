export type OrderType = "DINE_IN" | "TAKE_OUT";

export type SpecGroup = {
  id: string;
  name: string;
  required: boolean;
  options: { id: string; name: string; subtext?: string }[];
};

export type AddonItem = {
  id: string;
  name: string;
  price: number;
  mutexGroupId?: string;
};

export type Product = {
  id: string;
  name: string;
  searchKeywords?: string[];
  basePrice: number;
  primaryCategoryId: string;
  subCategoryId?: string;
  specGroups?: SpecGroup[];
  addons?: AddonItem[];
  unavailable?: boolean;
};

export type SelectedSpecs = Record<string, string>;

export type SelectedAddons = Record<string, number>;

export type Customization = {
  specs: SelectedSpecs;
  addons: SelectedAddons;
  note?: string;
};

export type OrderLine = {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  customization: Customization;
  unavailable?: boolean;
};

export type Order = {
  id: string;
  type: OrderType;
  lines: OrderLine[];
  orderNote?: string;
  createdAt: number;
};
