import { CartItemType, Coupon, DiscountType, Product } from '../../../types';

export const calculateItemTotal = (item: CartItemType) => {
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

export const getMaxApplicableDiscount = (item: CartItemType) => {
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

export const calculateCartDiscount = (
  cart: CartItemType[],
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
    if (selectedCoupon.discountType === DiscountType.AMOUNT) {
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
  cart: CartItemType[],
  productId: string,
  newQuantity: number
): CartItemType[] => {
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

export const getMaxDiscount = (
  discounts: { quantity: number; rate: number }[]
) => {
  return discounts.reduce((max, discount) => Math.max(max, discount.rate), 0);
};

export const getRemainingStock = (product: Product, cart: CartItemType[]) => {
  const cartItem = cart.find((item) => item.product.id === product.id);
  return product.stock - (cartItem?.quantity || 0);
};

export const getAppliedDiscount = (item: CartItemType) => {
  const { discounts } = item.product;
  const { quantity } = item;
  let appliedDiscount = 0;
  for (const discount of discounts) {
    if (quantity >= discount.quantity) {
      appliedDiscount = Math.max(appliedDiscount, discount.rate);
    }
  }
  return appliedDiscount;
};
