import { Coupon, Discount, DiscountType, PageType, Product } from '../../types';

export const displayCoupons = (coupon: Coupon) => {
  if (coupon.discountType === DiscountType.AMOUNT) {
    return `${coupon.name} (${coupon.code}):${coupon.discountValue}원 할인`;
  } else {
    return `${coupon.name} (${coupon.code}):${coupon.discountValue}% 할인`;
  }
};

export const displayQuantityDiscount = (
  discount: Discount,
  pageType: PageType
) => {
  if (pageType === PageType.ADMIN) {
    return `${discount.quantity}개 이상 구매 시 ${discount.rate * 100}% 할인`;
  } else if (pageType === PageType.USER) {
    return `${discount.quantity}개 이상: ${(discount.rate * 100).toFixed(
      0
    )}% 할인`;
  }
};

export const displayProductStatus = (product: Product) => {
  return `${product.name} - ${product.price}원  (재고: ${product.stock})`;
};
