import { useEffect, useState } from 'react';
import { Coupon, Discount, PageType, Product } from '../../types.ts';
import { Button } from '../components/common/Button.tsx';
import { TextInput } from '../components/common/TextInput.tsx';
import {
  displayCoupons,
  displayProductStatus,
  displayQuantityDiscount,
} from '../utils/textFormat.ts';

interface Props {
  products: Product[];
  coupons: Coupon[];
  onProductUpdate: (updatedProduct: Product) => void;
  onProductAdd: (newProduct: Product) => void;
  onCouponAdd: (newCoupon: Coupon) => void;
}

export const AdminPage = ({
  products,
  coupons,
  onProductUpdate,
  onProductAdd,
  onCouponAdd,
}: Props) => {
  const [openProductIds, setOpenProductIds] = useState<Set<string>>(new Set());
  const toggleProductAccordion = (productId: string) => {
    setOpenProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // handleEditProduct 함수 수정
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  // 새로운 핸들러 함수 추가
  const handleProductNameUpdate = (productId: string, newName: string) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, name: newName };
      setEditingProduct(updatedProduct);
    }
  };

  // 새로운 핸들러 함수 추가
  const handlePriceUpdate = (productId: string, newPrice: number) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, price: newPrice };
      setEditingProduct(updatedProduct);
    }
  };

  // 수정 완료 핸들러 함수 추가
  const handleEditComplete = () => {
    if (editingProduct) {
      onProductUpdate(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, stock: newStock };
      setEditingProduct(updatedProduct);
    }
  };

  const handleRemoveDiscount = (productId: string, index: number) => {
    const updatedProduct = products.find((p) => p.id === productId);
    if (updatedProduct) {
      const newProduct = {
        ...updatedProduct,
        discounts: updatedProduct.discounts.filter((_, i) => i !== index),
      };
      onProductUpdate(newProduct);
      setEditingProduct(newProduct);
    }
  };

  const [newDiscount, setNewDiscount] = useState<Discount>({
    quantity: 0,
    rate: 0,
  });
  const handleAddDiscount = (productId: string) => {
    const updatedProduct = products.find((p) => p.id === productId);
    if (updatedProduct && editingProduct) {
      const newProduct = {
        ...updatedProduct,
        discounts: [...updatedProduct.discounts, newDiscount],
      };
      onProductUpdate(newProduct);
      setEditingProduct(newProduct);
      setNewDiscount({ quantity: 0, rate: 0 });
    }
  };

  // edit product 상태일때, product의 상품명, 가격, 재고가 비어있는지 체크
  const [hasErrorOnProductEdit, setHasErrorOnProductEdit] = useState(false);
  useEffect(() => {
    if (editingProduct) {
      if (
        editingProduct.name.length === 0 ||
        editingProduct.price === 0 ||
        isNaN(editingProduct.price) ||
        editingProduct.stock === undefined ||
        isNaN(editingProduct.stock) ||
        editingProduct.stock === 0
      ) {
        setHasErrorOnProductEdit(true);
      } else {
        setHasErrorOnProductEdit(false);
      }
    }
  }, [editingProduct]);

  const [newCoupon, setNewCoupon] = useState<Coupon>({
    name: '',
    code: '',
    discountType: 'percentage',
    discountValue: 0,
  });
  const handleAddCoupon = () => {
    onCouponAdd(newCoupon);
    setNewCoupon({
      name: '',
      code: '',
      discountType: 'percentage',
      discountValue: 0,
    });
  };

  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    stock: 0,
    discounts: [],
  });
  const handleAddNewProduct = () => {
    const productWithId = { ...newProduct, id: Date.now().toString() };
    onProductAdd(productWithId);
    setNewProduct({
      name: '',
      price: 0,
      stock: 0,
      discounts: [],
    });
    setShowNewProductForm(false);
  };

  // 버튼 컴포넌트 만들기
  // input 컴포넌트 만들기
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6'>관리자 페이지</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <h2 className='text-2xl font-semibold mb-4'>상품 관리</h2>
          <Button
            text={showNewProductForm ? '취소' : '새 상품 추가'}
            className='bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600'
            onClick={() => setShowNewProductForm(!showNewProductForm)}
          />
          {showNewProductForm && (
            <div className='bg-white p-4 rounded shadow mb-4'>
              <h3 className='text-xl font-semibold mb-2'>새 상품 추가</h3>
              <div className='mb-2'>
                <label
                  htmlFor='productName'
                  className='block text-sm font-medium text-gray-700'
                >
                  상품명
                </label>
                <input
                  id='productName'
                  type='text'
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='productPrice'
                  className='block text-sm font-medium text-gray-700'
                >
                  가격
                </label>
                <input
                  id='productPrice'
                  type='number'
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseInt(e.target.value),
                    })
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <div className='mb-2'>
                <label
                  htmlFor='productStock'
                  className='block text-sm font-medium text-gray-700'
                >
                  재고
                </label>
                <input
                  id='productStock'
                  type='number'
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      stock: parseInt(e.target.value),
                    })
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <Button
                text='추가'
                className='w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600'
                onClick={handleAddNewProduct}
              />
            </div>
          )}
          <div className='space-y-2'>
            {products.map((product, index) => (
              <div
                key={product.id}
                data-testid={`product-${index + 1}`}
                className='bg-white p-4 rounded shadow'
              >
                <Button
                  dataTestid='toggle-button'
                  text={displayProductStatus(product)}
                  className='w-full text-left font-semibold'
                  onClick={() => toggleProductAccordion(product.id)}
                />
                {openProductIds.has(product.id) && (
                  <div className='mt-2'>
                    {editingProduct && editingProduct.id === product.id ? (
                      <div>
                        <div className='mb-4'>
                          <TextInput
                            label='상품명'
                            type='text'
                            value={editingProduct.name}
                            className='w-full p-2 border rounded'
                            onChange={(e) =>
                              handleProductNameUpdate(
                                product.id,
                                e.target.value
                              )
                            }
                            errorMessage={
                              editingProduct.name.length === 0
                                ? '상품명은 필수입니다'
                                : undefined
                            }
                          />
                        </div>
                        <div className='mb-4'>
                          <TextInput
                            label='가격'
                            type='number'
                            value={editingProduct.price}
                            className='w-full p-2 border rounded'
                            onChange={(e) =>
                              handlePriceUpdate(
                                product.id,
                                parseInt(e.target.value)
                              )
                            }
                            errorMessage={
                              editingProduct.price === undefined ||
                              editingProduct.price === 0 ||
                              isNaN(editingProduct.price)
                                ? '상품 가격은 필수입니다'
                                : undefined
                            }
                          />
                        </div>
                        <div className='mb-4'>
                          <TextInput
                            label='재고'
                            type='number'
                            value={editingProduct.stock}
                            className='w-full p-2 border rounded'
                            onChange={(e) =>
                              handleStockUpdate(
                                product.id,
                                parseInt(e.target.value)
                              )
                            }
                            errorMessage={
                              editingProduct.stock === undefined ||
                              isNaN(editingProduct.stock)
                                ? '상품 재고는 필수입니다'
                                : undefined
                            }
                          />
                        </div>
                        {/* 할인 정보 수정 부분 */}
                        <div>
                          <h4 className='text-lg font-semibold mb-2'>
                            할인 정보
                          </h4>
                          {editingProduct.discounts.map((discount, index) => (
                            <div
                              key={index}
                              className='flex justify-between items-center mb-2'
                            >
                              <span>
                                {displayQuantityDiscount(
                                  discount,
                                  PageType.ADMIN
                                )}
                              </span>
                              <Button
                                text='삭제'
                                className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600'
                                onClick={() =>
                                  handleRemoveDiscount(product.id, index)
                                }
                              />
                            </div>
                          ))}
                          <div className='flex space-x-2'>
                            <TextInput
                              label='수량'
                              placeholder='수량'
                              type='number'
                              value={newDiscount.quantity}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  quantity: parseInt(e.target.value),
                                })
                              }
                            />
                            <TextInput
                              label='할인율'
                              placeholder='할인율 (%)'
                              type='number'
                              value={newDiscount.rate * 100}
                              onChange={(e) =>
                                setNewDiscount({
                                  ...newDiscount,
                                  rate: parseInt(e.target.value) / 100,
                                })
                              }
                            />
                            <Button
                              text='할인 추가'
                              className='w-1/3 bg-blue-500 text-white p-2 rounded hover:bg-blue-600'
                              onClick={() => handleAddDiscount(product.id)}
                            />
                          </div>
                        </div>
                        <Button
                          text='수정 완료'
                          className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mt-2'
                          onClick={handleEditComplete}
                          disabled={hasErrorOnProductEdit}
                        />
                      </div>
                    ) : (
                      <div>
                        {product.discounts.map((discount, index) => (
                          <div key={index} className='mb-2'>
                            <span>
                              {displayQuantityDiscount(
                                discount,
                                PageType.ADMIN
                              )}
                            </span>
                          </div>
                        ))}
                        <Button
                          dataTestid='modify-button'
                          text='수정'
                          className='bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mt-2'
                          onClick={() => handleEditProduct(product)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className='text-2xl font-semibold mb-4'>쿠폰 관리</h2>
          <div className='bg-white p-4 rounded shadow'>
            <div className='space-y-2 mb-4'>
              <TextInput
                type='text'
                label='쿠폰 이름'
                placeholder='쿠폰 이름'
                value={newCoupon.name}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, name: e.target.value })
                }
                hideLabelOnPlaceholder={true}
              />
              <TextInput
                type='text'
                label='쿠폰 코드'
                placeholder='쿠폰 코드'
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value })
                }
                hideLabelOnPlaceholder={true}
              />

              <div className='flex gap-2'>
                <select
                  value={newCoupon.discountType}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      discountType: e.target.value as 'amount' | 'percentage',
                    })
                  }
                  className='w-full p-2 border rounded'
                >
                  <option value='amount'>금액(원)</option>
                  <option value='percentage'>할인율(%)</option>
                </select>
                <TextInput
                  type='number'
                  label='할인 값'
                  placeholder='할인 값'
                  value={newCoupon.discountValue}
                  onChange={(e) =>
                    setNewCoupon({
                      ...newCoupon,
                      discountValue: parseInt(e.target.value),
                    })
                  }
                  className='w-full p-2 border rounded'
                />
              </div>
              <Button
                text='쿠폰 추가'
                className='w-full bg-green-500 text-white p-2 rounded hover:bg-green-600'
                onClick={handleAddCoupon}
              />
            </div>
            <div>
              <h3 className='text-lg font-semibold mb-2'>현재 쿠폰 목록</h3>
              <div className='space-y-2'>
                {coupons.map((coupon, index) => (
                  <div
                    key={index}
                    data-testid={`coupon-${index + 1}`}
                    className='bg-gray-100 p-2 rounded'
                  >
                    {displayCoupons(coupon)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
