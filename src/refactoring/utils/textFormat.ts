import { Coupon, Discount, Product } from '../../types';

export const displayCoupons = (coupon: Coupon) => {
  if (coupon.discountType === 'amount') {
    return `${coupon.name} (${coupon.code}):${coupon.discountValue}원 할인`;
  } else {
    return `${coupon.name} (${coupon.code}):${coupon.discountValue}% 할인`;
  }
};

export const displayQuantityDiscount = (discount: Discount) => {
  return `${discount.quantity}개 이상 구매 시 ${discount.rate * 100}% 할인`;
};

export const displayProductStatus = (product: Product) => {
  return `${product.name} - ${product.price}원  (재고: ${product.stock})`;
};
