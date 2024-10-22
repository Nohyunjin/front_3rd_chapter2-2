import { CartItem, Coupon } from '../../types';

export const calculateItemTotal = (item: CartItem) => {
  const { price } = item.product;
  const { quantity } = item;
  const totalBeforeDiscount = price * quantity;

  const discount = item.product.discounts.reduce((maxDiscount, d) => {
    return quantity >= d.quantity && d.rate > maxDiscount
      ? d.rate
      : maxDiscount;
  }, 0);

  const totalAfterDiscount = price * quantity * (1 - discount);

  return {
    totalBeforeDiscount: totalBeforeDiscount,
    totalAfterDiscount: totalAfterDiscount,
    totalDiscount: totalBeforeDiscount - totalAfterDiscount,
  };
};

export const getMaxApplicableDiscount = (item: CartItem) => {
  const { discounts } = item.product;
  const { quantity } = item;

  let appliedDiscount = 0;

  appliedDiscount = discounts.reduce((maxDiscount, d) => {
    return quantity >= d.quantity && d.rate > maxDiscount
      ? d.rate
      : maxDiscount;
  }, 0);

  return appliedDiscount;
};

export const calculateCartTotal = (
  cart: CartItem[],
  selectedCoupon: Coupon | null
) => {
  const itemDiscountStatus = cart.map(calculateItemTotal);

  const totalBeforeDiscount = itemDiscountStatus.reduce(
    (total, item) => total + item.totalBeforeDiscount,
    0
  );

  let totalAfterDiscount = itemDiscountStatus.reduce(
    (total, item) => total + item.totalAfterDiscount,
    0
  );

  // 쿠폰 적용
  if (selectedCoupon) {
    if (selectedCoupon.discountType === 'amount') {
      totalAfterDiscount = Math.max(
        0,
        totalAfterDiscount - selectedCoupon.discountValue
      );
    } else {
      totalAfterDiscount *= 1 - selectedCoupon.discountValue / 100;
    }
  }

  const totalDiscount = totalBeforeDiscount - totalAfterDiscount;

  return {
    totalBeforeDiscount: totalBeforeDiscount,
    totalAfterDiscount: totalAfterDiscount,
    totalDiscount: totalDiscount,
  };
};

export const updateCartItemQuantity = (
  cart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] => {
  if (newQuantity <= 0) {
    return cart.filter((item) => item.product.id !== productId);
  }

  const updatedCart = cart.map((item) =>
    item.product.id === productId
      ? { ...item, quantity: Math.min(newQuantity, item.product.stock) }
      : item
  );
  return updatedCart;
};