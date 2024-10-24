export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  discounts: Discount[];
}

export interface Discount {
  quantity: number;
  rate: number;
}

export interface CartItemType {
  product: Product;
  quantity: number;
}

export interface Coupon {
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
}

export enum PageType {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum DiscountType {
  AMOUNT = 'amount',
  PERCENTAGE = 'percentage',
}
