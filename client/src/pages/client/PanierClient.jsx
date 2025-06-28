import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PanierClient = () => {
	const { cart, removeFromCart, clearCart, addToCart } = useCart();
	const { user } = useAuth();
	const { id: restaurantId } = useParams();
    // Vérification de l'ID du restaurant


	const total = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	// Nouvelle fonction pour diminuer la quantité
	const decreaseQuantity = (id) => {
		const item = cart.find((i) => i.id === id);
		if (item && item.quantity > 1) {
			addToCart({ ...item, quantity: -1 }); // On va gérer ce cas dans le contexte
		} else {
			removeFromCart(id);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center">
			<h1 className="text-2xl font-bold mt-10 mb-6 w-full text-center">
				Votre panier
			</h1>
			<div className="w-full max-w-4xl px-2 ">
				<div className="space-y-10">
					{cart.length === 0 ? (
						<div className="text-center text-gray-500">
							Votre panier est vide.
						</div>
					) : (
						cart.map((item) => (
							<div
								key={item.id}
								className="flex items-center bg-gray-50 rounded-2xl shadow-md p-4 md:p-6 mb-2 min-h-[100px] md:min-h-[120px] w-full"
							>
								<img
									src={
										item.image_url ||
										item.image ||
										"/images/placeholder-item.jpg"
									}
									alt={item.name}
									className="w-20 h-20 md:w-28 md:h-28 rounded-xl object-cover mr-6"
								/>
								<div className="flex-1">
									<div className="text-xl md:text-2xl font-bold mb-1">
										{item.name}
									</div>
									<div className="flex flex-row gap-10 text-xs md:text-sm text-gray-700 mb-1">
										{/* Ajoute ici d'autres détails si besoin */}
									</div>
								</div>
								<div className="flex flex-col items-end justify-between h-full ml-4">
									<div className="font-bold text-base md:text-lg mb-2 flex items-center gap-2">
										<button
											className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-2 py-1 text-lg font-bold"
											onClick={() => decreaseQuantity(item.id)}
										>
											-
										</button>
										Qté: {item.quantity}
										<button
											className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded px-2 py-1 text-lg font-bold"
											onClick={() => addToCart(item)}
										>
											+
										</button>
									</div>
									<div className="flex items-center font-bold text-base md:text-lg mb-2">
										<span className="mr-1 text-gray-700">
											Prix unitaire:
										</span>{" "}
										{item.price} DA
									</div>
									<button
										className="bg-[#FF4D4F] hover:bg-[#ff6a6a] text-white text-sm font-semibold rounded-md px-6 py-1 md:py-2 transition-all"
										onClick={() => removeFromCart(item.id)}
									>
										annuler
									</button>
								</div>
							</div>
						))
					)}
				</div>
				<div className="flex justify-end mt-8 mb-4">
					<span className="text-2xl font-bold">Prix total : {total} DA</span>
				</div>
				<div className="flex justify-center">
					<button className="bg-[#FF4D4F] hover:bg-[#ff6a6a] text-white font-semibold rounded-md px-8 py-2 text-base md:text-lg transition-all mr-4" onClick={clearCart}>
            Vider le panier
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md px-8 py-2 text-base md:text-lg transition-all"
            onClick={async () => {
              try {
                const user_id = user?.id;
                // Récupère tous les restaurant_id distincts du panier
                const restaurantIds = Array.from(new Set(cart.map(item => item.restaurant_id)));
                const total_price = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const items = cart.flatMap(item => Array(item.quantity).fill(item.id));
                const orderPayload = {
                  user_id,
                  restaurant_id: restaurantIds.length === 1 ? restaurantIds[0] : restaurantIds, // un id ou un array
                  total_price,
                  address: "Adresse de livraison", // à adapter
                  items
                };
                console.log('Payload envoyé à l’API :', orderPayload);
                await axios.post('http://localhost:3000/api/orders/create', orderPayload, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
                });
                alert('Commande passée avec succès !');
                clearCart();
              } catch (err) {
                alert("Erreur lors de la commande : " + (err.response?.data?.message || err.message));
              }
            }}
            disabled={cart.length === 0}
          >
            Passer la commande
          </button>
				</div>
			</div>
		</div>
	);
};

export default PanierClient;