import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      let newCart = [...cart]
      let stock = await api.get(`stock/${productId}`)
      let stockAmount = stock.data.amount
      let isProductExist = newCart.find(product => product.id === productId)
      let currentAmount = isProductExist ? isProductExist.amount : 0
      let amount = currentAmount + 1


      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (isProductExist) {
        isProductExist.amount = amount
      } else {
        const product = await api.get(`products/${productId}`)
        const newProduct = {
          ...product.data,
          amount: 1
        }

        newCart.push(newProduct)
      }

      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      let newCart = [...cart]
      const isProductExist = newCart.find(product => product.id === productId)

      if (!isProductExist) {
        toast.error('Erro na remoção do produto')
        return
      }

      newCart = cart.filter(product => !(product.id == productId))

      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        return
      }

      const stock = await api.get(`stock/${productId}`)
      const stockFound = stock.data.amount

      if (amount > stockFound) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      const newCart = [...cart]
      const isProductExist = newCart.find(product => product.id === productId)

      if (isProductExist) {
        isProductExist.amount = amount
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      } else {
        throw Error()
      }

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
