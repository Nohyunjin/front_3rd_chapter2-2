import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, test } from 'vitest';
import { useCart, useCoupons, useProducts } from '../../refactoring/hooks';
import {
  calculateCartDiscount,
  calculateItemTotal,
  getAppliedDiscount,
  getMaxApplicableDiscount,
  getMaxDiscount,
  getRemainingStock,
  updateCartItemQuantity,
} from '../../refactoring/utils/cart/cartUtils';
import {
  displayCoupons,
  displayProductStatus,
  displayQuantityDiscount,
} from '../../refactoring/utils/textFormat';
import { AdminPage } from '../../refactoring/views/AdminPage';
import { CartPage } from '../../refactoring/views/CartPage';
import { Coupon, DiscountType, PageType, Product } from '../../types';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: '상품1',
    price: 10000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.1 }],
  },
  {
    id: 'p2',
    name: '상품2',
    price: 20000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.15 }],
  },
  {
    id: 'p3',
    name: '상품3',
    price: 30000,
    stock: 20,
    discounts: [{ quantity: 10, rate: 0.2 }],
  },
];
const mockCoupons: Coupon[] = [
  {
    name: '5000원 할인 쿠폰',
    code: 'AMOUNT5000',
    discountType: DiscountType.AMOUNT,
    discountValue: 5000,
  },
  {
    name: '10% 할인 쿠폰',
    code: 'PERCENT10',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
  },
];

const TestAdminPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleProductAdd = (newProduct: Product) => {
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  const handleCouponAdd = (newCoupon: Coupon) => {
    setCoupons((prevCoupons) => [...prevCoupons, newCoupon]);
  };

  return (
    <AdminPage
      products={products}
      coupons={coupons}
      onProductUpdate={handleProductUpdate}
      onProductAdd={handleProductAdd}
      onCouponAdd={handleCouponAdd}
    />
  );
};

describe('advanced > ', () => {
  describe('시나리오 테스트 > ', () => {
    test('장바구니 페이지 테스트 > ', async () => {
      render(<CartPage products={mockProducts} coupons={mockCoupons} />);
      const product1 = screen.getByTestId('product-p1');
      const product2 = screen.getByTestId('product-p2');
      const product3 = screen.getByTestId('product-p3');
      const addToCartButtonsAtProduct1 =
        within(product1).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct2 =
        within(product2).getByText('장바구니에 추가');
      const addToCartButtonsAtProduct3 =
        within(product3).getByText('장바구니에 추가');

      // 1. 상품 정보 표시
      expect(product1).toHaveTextContent('상품1');
      expect(product1).toHaveTextContent('10,000원');
      expect(product1).toHaveTextContent('재고: 20개');
      expect(product2).toHaveTextContent('상품2');
      expect(product2).toHaveTextContent('20,000원');
      expect(product2).toHaveTextContent('재고: 20개');
      expect(product3).toHaveTextContent('상품3');
      expect(product3).toHaveTextContent('30,000원');
      expect(product3).toHaveTextContent('재고: 20개');

      // 2. 할인 정보 표시
      expect(screen.getByText('10개 이상: 10% 할인')).toBeInTheDocument();

      // 3. 상품1 장바구니에 상품 추가
      fireEvent.click(addToCartButtonsAtProduct1); // 상품1 추가

      // 4. 할인율 계산
      expect(screen.getByText('상품 금액: 10,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 0원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 10,000원')).toBeInTheDocument();

      // 5. 상품 품절 상태로 만들기
      for (let i = 0; i < 19; i++) {
        fireEvent.click(addToCartButtonsAtProduct1);
      }

      // 6. 품절일 때 상품 추가 안 되는지 확인하기
      expect(product1).toHaveTextContent('재고: 0개');
      fireEvent.click(addToCartButtonsAtProduct1);
      expect(product1).toHaveTextContent('재고: 0개');

      // 7. 할인율 계산
      expect(screen.getByText('상품 금액: 200,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 20,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 180,000원')).toBeInTheDocument();

      // 8. 상품을 각각 10개씩 추가하기
      fireEvent.click(addToCartButtonsAtProduct2); // 상품2 추가
      fireEvent.click(addToCartButtonsAtProduct3); // 상품3 추가

      const increaseButtons = screen.getAllByText('+');
      for (let i = 0; i < 9; i++) {
        fireEvent.click(increaseButtons[1]); // 상품2
        fireEvent.click(increaseButtons[2]); // 상품3
      }

      // 9. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 110,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 590,000원')).toBeInTheDocument();

      // 10. 쿠폰 적용하기
      const couponSelect = screen.getByRole('combobox');
      fireEvent.change(couponSelect, { target: { value: '1' } }); // 10% 할인 쿠폰 선택

      // 11. 할인율 계산
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 169,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 531,000원')).toBeInTheDocument();

      // 12. 다른 할인 쿠폰 적용하기
      fireEvent.change(couponSelect, { target: { value: '0' } }); // 5000원 할인 쿠폰
      expect(screen.getByText('상품 금액: 700,000원')).toBeInTheDocument();
      expect(screen.getByText('할인 금액: 115,000원')).toBeInTheDocument();
      expect(screen.getByText('최종 결제 금액: 585,000원')).toBeInTheDocument();
    });

    test('관리자 페이지 테스트 > ', async () => {
      render(<TestAdminPage />);

      const $product1 = screen.getByTestId('product-1');

      // 1. 새로운 상품 추가
      fireEvent.click(screen.getByText('새 상품 추가'));

      fireEvent.change(screen.getByLabelText('상품명'), {
        target: { value: '상품4' },
      });
      fireEvent.change(screen.getByLabelText('가격'), {
        target: { value: '15000' },
      });
      fireEvent.change(screen.getByLabelText('재고'), {
        target: { value: '30' },
      });

      fireEvent.click(screen.getByText('추가'));

      const $product4 = screen.getByTestId('product-4');

      expect($product4).toHaveTextContent('상품4');
      expect($product4).toHaveTextContent('15000원');
      expect($product4).toHaveTextContent('재고: 30');

      // 2. 상품 선택 및 수정
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('toggle-button'));
      fireEvent.click(within($product1).getByTestId('modify-button'));

      act(() => {
        fireEvent.change(within($product1).getByDisplayValue('20'), {
          target: { value: '25' },
        });
        fireEvent.change(within($product1).getByDisplayValue('10000'), {
          target: { value: '12000' },
        });
        fireEvent.change(within($product1).getByDisplayValue('상품1'), {
          target: { value: '수정된 상품1' },
        });
      });

      fireEvent.click(within($product1).getByText('수정 완료'));

      expect($product1).toHaveTextContent('수정된 상품1');
      expect($product1).toHaveTextContent('12000원');
      expect($product1).toHaveTextContent('재고: 25');

      // 3. 상품 할인율 추가 및 삭제
      fireEvent.click($product1);
      fireEvent.click(within($product1).getByTestId('modify-button'));

      // 할인 추가
      act(() => {
        fireEvent.change(screen.getByPlaceholderText('수량'), {
          target: { value: '5' },
        });
        fireEvent.change(screen.getByPlaceholderText('할인율 (%)'), {
          target: { value: '5' },
        });
      });
      fireEvent.click(screen.getByText('할인 추가'));

      expect(
        screen.queryByText('5개 이상 구매 시 5% 할인')
      ).toBeInTheDocument();

      // 할인 삭제
      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(
        screen.queryByText('10개 이상 구매 시 10% 할인')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('5개 이상 구매 시 5% 할인')
      ).toBeInTheDocument();

      fireEvent.click(screen.getAllByText('삭제')[0]);
      expect(
        screen.queryByText('10개 이상 구매 시 10% 할인')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('5개 이상 구매 시 5% 할인')
      ).not.toBeInTheDocument();

      // 4. 쿠폰 추가
      fireEvent.change(screen.getByPlaceholderText('쿠폰 이름'), {
        target: { value: '새 쿠폰' },
      });
      fireEvent.change(screen.getByPlaceholderText('쿠폰 코드'), {
        target: { value: 'NEW10' },
      });
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: 'percentage' },
      });
      fireEvent.change(screen.getByPlaceholderText('할인 값'), {
        target: { value: '10' },
      });

      fireEvent.click(screen.getByText('쿠폰 추가'));

      const $newCoupon = screen.getByTestId('coupon-3');

      expect($newCoupon).toHaveTextContent('새 쿠폰 (NEW10):10% 할인');
    });
  });

  describe('함수', () => {
    describe('텍스트 display', () => {
      test('displayCoupons(금액) 테스트', () => {
        const amountCoupon = mockCoupons[0];

        if (amountCoupon) {
          const result = displayCoupons(amountCoupon);
          expect(result).toBe(
            `${amountCoupon.name} (${amountCoupon.code}):${amountCoupon.discountValue}원 할인`
          );
        }
      });
      test('displayCoupons(퍼센트) 테스트', () => {
        const percentageCoupon = mockCoupons[1];

        if (percentageCoupon) {
          const result = displayCoupons(percentageCoupon);
          expect(result).toBe(
            `${percentageCoupon.name} (${percentageCoupon.code}):${percentageCoupon.discountValue}% 할인`
          );
        }
      });
      test('displayQuantityDiscount(ADMIN) 테스트', () => {
        const discount = mockProducts[0].discounts[0];
        const result = displayQuantityDiscount(discount, PageType.ADMIN);
        expect(result).toBe(
          `${discount.quantity}개 이상 구매 시 ${discount.rate * 100}% 할인`
        );
      });
      test('displayQuantityDiscount(USER) 테스트', () => {
        const discount = mockProducts[0].discounts[0];
        const result = displayQuantityDiscount(discount, PageType.USER);
        expect(result).toBe(
          `${discount.quantity}개 이상: ${(discount.rate * 100).toFixed(
            0
          )}% 할인`
        );
      });
      test('displayProductStatus 테스트', () => {
        const product = mockProducts[0];
        const result = displayProductStatus(product);
        expect(result).toBe(
          `${product.name} - ${product.price}원  (재고: ${product.stock})`
        );
      });
    });
    describe('cart utils', () => {
      test('calculateItemTotal 기본', () => {
        const item = {
          product: mockProducts[0],
          quantity: 5,
        };
        const result = calculateItemTotal(item);
        expect(result).toEqual({
          totalBeforeDiscount: 50000,
          totalAfterDiscount: 50000,
          totalDiscount: 0,
        });
      });
      test('calculateItemTotal 할인율 추가', () => {
        const item = {
          product: mockProducts[2],
          quantity: 10,
        };
        const result = calculateItemTotal(item);
        expect(result).toEqual({
          totalBeforeDiscount: 300000,
          totalAfterDiscount: 240000,
          totalDiscount: 60000,
        });
      });
      test('getMaxApplicableDiscount 기본', () => {
        const item = {
          product: mockProducts[0],
          quantity: 5,
        };
        const result = getMaxApplicableDiscount(item);
        expect(result).toBe(0);
      });
      test('getMaxApplicableDiscount 할인율 추가', () => {
        const item = {
          product: mockProducts[2],
          quantity: 10,
        };
        const result = getMaxApplicableDiscount(item);
        expect(result).toBe(0.2);
      });
      describe('calculateCartDiscount', () => {
        test('수량 할인 X, 쿠폰 X', () => {
          const cart = [
            { product: mockProducts[0], quantity: 5 }, // 10000 * 5
            { product: mockProducts[1], quantity: 5 }, // 20000 * 5
          ];
          const result = calculateCartDiscount(cart, null);
          expect(result).toEqual({
            totalBeforeDiscount: 150000,
            totalAfterDiscount: 150000,
            totalDiscount: 0,
          });
        });
        test('수량 할인 O, 쿠폰 X', () => {
          const cart = [
            { product: mockProducts[0], quantity: 10 }, // 10% 할인
            { product: mockProducts[1], quantity: 10 }, // 15% 할인
          ];
          const result = calculateCartDiscount(cart, null);
          expect(result).toEqual({
            totalBeforeDiscount: 300000,
            totalAfterDiscount: 260000,
            totalDiscount: 40000,
          });
        });
        test('수량 할인 X, 쿠폰(금액) O', () => {
          const cart = [
            { product: mockProducts[0], quantity: 5 },
            { product: mockProducts[1], quantity: 5 },
          ];
          const result = calculateCartDiscount(cart, mockCoupons[0]); // 5000원 할인 쿠폰
          expect(result).toEqual({
            totalBeforeDiscount: 150000,
            totalAfterDiscount: 145000,
            totalDiscount: 5000,
          });
        });
        test('수량 할인 X, 쿠폰(퍼센트) O', () => {
          const cart = [
            { product: mockProducts[0], quantity: 5 },
            { product: mockProducts[1], quantity: 5 },
          ];
          const result = calculateCartDiscount(cart, mockCoupons[1]); // 10% 할인 쿠폰
          expect(result).toEqual({
            totalBeforeDiscount: 150000,
            totalAfterDiscount: 135000,
            totalDiscount: 15000,
          });
        });
        test('수량 할인 O, 쿠폰(금액) O', () => {
          const cart = [
            { product: mockProducts[0], quantity: 10 }, // 10% 할인
            { product: mockProducts[1], quantity: 10 }, // 15% 할인
          ];
          const result = calculateCartDiscount(cart, mockCoupons[0]); // 5000원 할인 쿠폰
          expect(result).toEqual({
            totalBeforeDiscount: 300000,
            totalAfterDiscount: 255000,
            totalDiscount: 45000,
          });
        });
        test('수량 할인 O, 쿠폰(퍼센트) O', () => {
          const cart = [
            { product: mockProducts[0], quantity: 10 },
            { product: mockProducts[1], quantity: 10 },
          ];
          const result = calculateCartDiscount(cart, mockCoupons[1]); // 10% 할인 쿠폰
          expect(result).toEqual({
            totalBeforeDiscount: 300000,
            totalAfterDiscount: 234000,
            totalDiscount: 66000,
          });
        });
      });
      test('updateCartItemQuantity 기본 테스트', () => {
        const cart = [
          { product: mockProducts[0], quantity: 5 },
          { product: mockProducts[1], quantity: 5 },
        ];
        const updatedCart = updateCartItemQuantity(cart, 'p1', 10);
        expect(updatedCart).toEqual([
          { product: mockProducts[0], quantity: 10 },
          { product: mockProducts[1], quantity: 5 },
        ]);
      });
      test('updateCartItemQuantity 재고 초과 테스트', () => {
        const cart = [
          { product: mockProducts[0], quantity: 5 },
          { product: mockProducts[1], quantity: 5 },
        ];
        const updatedCart = updateCartItemQuantity(cart, 'p1', 30);
        expect(updatedCart).toEqual([
          { product: mockProducts[0], quantity: 20 },
          { product: mockProducts[1], quantity: 5 },
        ]);
      });
      test('getMaxDiscount 테스트', () => {
        const item = mockProducts[0];
        const result = getMaxDiscount(item.discounts);
        expect(result).toBe(0.1);
      });
      test('getRemainingStock 테스트', () => {
        const product = mockProducts[0];
        const cartItem = [{ product: mockProducts[0], quantity: 5 }];
        const result = getRemainingStock(product, cartItem);
        expect(result).toBe(15);
      });
      test('getAppliedDiscount 테스트', () => {
        const item = { product: mockProducts[0], quantity: 20 };
        const result = getAppliedDiscount(item);
        expect(result).toBe(0.1);
      });
    });
  });

  describe('hook 테스트', () => {
    describe('useCart 테스트', () => {
      test('addToCart 테스트', () => {
        const { result } = renderHook(() => useCart());
        act(() => {
          result.current.addToCart(mockProducts[0]);
        });
        expect(result.current.cart).toEqual([
          { product: mockProducts[0], quantity: 1 },
        ]);
      });
      test('removeFromCart 테스트', () => {
        const { result } = renderHook(() => useCart());
        act(() => {
          result.current.addToCart(mockProducts[0]);
          result.current.addToCart(mockProducts[1]);
          result.current.removeFromCart('p1');
        });
        expect(result.current.cart).toEqual([
          { product: mockProducts[1], quantity: 1 },
        ]);
      });
      test('updateQuantity 테스트', () => {
        const { result } = renderHook(() => useCart());
        act(() => {
          result.current.addToCart(mockProducts[0]);
          result.current.updateQuantity('p1', 5);
        });
        expect(result.current.cart).toEqual([
          { product: mockProducts[0], quantity: 5 },
        ]);
      });
      test('applyCoupon 테스트', () => {
        const { result } = renderHook(() => useCart());
        act(() => {
          result.current.applyCoupon(mockCoupons[1]);
        });
        expect(result.current.selectedCoupon).toEqual(mockCoupons[1]);
      });
      test('calculateTotal 테스트', () => {
        const { result } = renderHook(() => useCart());
        act(() => {
          result.current.addToCart(mockProducts[0]);
          result.current.addToCart(mockProducts[1]);
          result.current.applyCoupon(mockCoupons[1]);
        });
        const { totalBeforeDiscount, totalAfterDiscount, totalDiscount } =
          result.current.calculateTotal();
        expect(totalBeforeDiscount).toBe(30000);
        expect(totalAfterDiscount).toBe(27000);
        expect(totalDiscount).toBe(3000);
      });
    });
    describe('useCoupon 테스트', () => {
      test('addCoupon 테스트', () => {
        const initialCoupons = mockCoupons;
        const newCoupon: Coupon = {
          name: '20% 할인 쿠폰',
          code: 'PERCENT20',
          discountType: DiscountType.PERCENTAGE,
          discountValue: 20,
        };
        const { result } = renderHook(() => useCoupons(initialCoupons));
        act(() => {
          result.current.addCoupon(newCoupon);
        });
        expect(result.current.coupons).toEqual([...initialCoupons, newCoupon]);
      });
    });
    describe('useProduct 테스트', () => {
      test('updateProduct 테스트', () => {
        const initialProducts = mockProducts;
        const updatedProduct = {
          id: 'p1',
          name: '수정된 상품1',
          price: 12000,
          stock: 25,
          discounts: [{ quantity: 5, rate: 0.05 }],
        };
        const { result } = renderHook(() => useProducts(initialProducts));
        act(() => {
          result.current.updateProduct(updatedProduct);
        });
        expect(result.current.products).toEqual([
          updatedProduct,
          initialProducts[1],
          initialProducts[2],
        ]);
      });
      test('addProduct 테스트', () => {
        const initialProducts = mockProducts;
        const newProduct = {
          id: 'p4',
          name: '상품4',
          price: 15000,
          stock: 30,
          discounts: [],
        };
        const { result } = renderHook(() => useProducts(initialProducts));
        act(() => {
          result.current.addProduct(newProduct);
        });
        expect(result.current.products).toEqual([
          ...initialProducts,
          newProduct,
        ]);
      });
    });
  });
});
