import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      // Si l'item existe déjà, on incrémente la quantité
      const found = prev.find((i) => i.id === item.id);
      // Si item.quantity === -1, on décrémente
      if (item.quantity === -1 && found) {
        if (found.quantity > 1) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
          );
        } else {
          // Si quantité tombe à 0, on retire l'item
          return prev.filter((i) => i.id !== item.id);
        }
      }
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // Sinon, on l'ajoute avec quantité 1
      return [...prev, { ...item, quantity: 1, restaurant_id: item.restaurant_id }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
