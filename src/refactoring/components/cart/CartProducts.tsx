import { CartItemType } from '../../../types';
import { getAppliedDiscount } from '../../utils/cart/cartUtils';
import { Button } from '../common/Button';

interface CartProductProps  {
  cartItem: CartItemType;
  handleUpdateQuantity: (cartItem: CartItemType, quantity: number) => void;
  handleRemoveFromCart: (cartItem: CartItemType) => void;
}

export const CartProducts = (props: CartProductProps ) => {
  const { cartItem, handleUpdateQuantity, handleRemoveFromCart } = props;
  const appliedDiscount = getAppliedDiscount(cartItem);

  return (
    <div className='flex justify-between items-center bg-white p-3 rounded shadow'>
      <div>
        <span className='font-semibold'>{cartItem.product.name}</span>
        <br />
        <span className='text-sm text-gray-600'>
          {cartItem.product.price}원 x {cartItem.quantity}
          {appliedDiscount > 0 && (
            <span className='text-green-600 ml-1'>
              ({(appliedDiscount * 100).toFixed(0)}% 할인 적용)
            </span>
          )}
        </span>
      </div>
      <div>
        <Button
          text='-'
          className='bg-gray-300 text-gray-800 px-2 py-1 rounded mr-1 hover:bg-gray-400'
          onClick={() => handleUpdateQuantity(cartItem, cartItem.quantity - 1)}
        />
        <Button
          text='+'
          className='bg-gray-300 text-gray-800 px-2 py-1 rounded mr-1 hover:bg-gray-400'
          onClick={() => handleUpdateQuantity(cartItem, cartItem.quantity + 1)}
        />
        <Button
          text='삭제'
          className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600'
          onClick={() => handleRemoveFromCart(cartItem)}
        />
      </div>
    </div>
  );
};
