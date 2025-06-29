import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PanierClient = () => {
	const { cart, removeFromCart, clearCart, addToCart } = useCart();
	const { user } = useAuth();
	const { id: restaurantId } = useParams();
	const navigate = useNavigate();
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
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			{/* Header Section */}
			<div className="bg-white shadow-lg border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-4 py-8">
					<div className="flex items-center justify-center space-x-3">
						<div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3M7 13l1.5 3m10-3v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
							</svg>
						</div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
							Votre Panier
						</h1>
					</div>
					{cart.length > 0 && (
						<div className="text-center mt-4">
							<span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
								{cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 py-8">
				{cart.length === 0 ? (
					<div className="text-center py-16">
						<div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
							<div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
								<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 3M7 13l1.5 3m10-3v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"></path>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-gray-800 mb-4">Votre panier est vide</h3>
							<p className="text-gray-500 mb-6">Découvrez nos délicieux plats et ajoutez-les à votre panier</p>
							<button 
								className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
								onClick={() => navigate('/client')}
							>
								Explorer les restaurants
							</button>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Cart Items Section */}
						<div className="lg:col-span-2">
							<div className="space-y-4">
								{cart.map((item, index) => (
									<div
										key={item.id}
										className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<div className="flex items-center space-x-6">
											<div className="relative">
												<img
													src={
														item.image_url ||
														item.image ||
														"/images/placeholder-item.jpg"
													}
													alt={item.name}
													className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
												/>
												<div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
													{item.quantity}
												</div>
											</div>
											
											<div className="flex-1 min-w-0">
												<h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
													{item.name}
												</h3>
												<div className="flex items-center space-x-4 mb-4">
													<span className="text-lg font-bold text-green-600">
														{item.price} DA
													</span>
													<span className="text-sm text-gray-500">par unité</span>
												</div>
												
												{/* Quantity Controls */}
												<div className="flex items-center space-x-3">
													<button
														className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 font-bold text-lg"
														onClick={() => decreaseQuantity(item.id)}
													>
														−
													</button>
													<span className="font-semibold text-lg min-w-[60px] text-center bg-gray-50 px-4 py-2 rounded-lg">
														{item.quantity}
													</span>
													<button
														className="bg-gray-100 hover:bg-green-100 hover:text-green-600 text-gray-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 font-bold text-lg"
														onClick={() => addToCart(item)}
													>
														+
													</button>
												</div>
											</div>
											
											<div className="flex flex-col items-end space-y-4">
												<div className="text-right">
													<div className="text-2xl font-bold text-gray-800">
														{(item.price * item.quantity).toFixed(2)} DA
													</div>
													<div className="text-sm text-gray-500">sous-total</div>
												</div>
												<button
													className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-3 rounded-full transition-all duration-200 hover:scale-110 group"
													onClick={() => removeFromCart(item.id)}
													title="Supprimer l'article"
												>
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
													</svg>
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Order Summary Section */}
						<div className="lg:col-span-1">
							<div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-100">
								<h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
									<svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
									</svg>
									Résumé
								</h3>
								
								<div className="space-y-4 mb-6">
									<div className="flex justify-between text-lg">
										<span className="text-gray-600">Sous-total:</span>
										<span className="font-semibold">{total.toFixed(2)} DA</span>
									</div>
									<div className="flex justify-between text-lg">
										<span className="text-gray-600">Frais de livraison:</span>
										<span className="font-semibold text-green-600">Gratuit</span>
									</div>
									<div className="border-t border-gray-200 pt-4">
										<div className="flex justify-between text-2xl font-bold">
											<span className="text-gray-800">Total:</span>
											<span className="text-orange-600">{total.toFixed(2)} DA</span>
										</div>
									</div>
								</div>

								<div className="space-y-3">
									<button 
										className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
										onClick={async () => {
											try {
												const user_id = user?.id;
												const restaurantIds = Array.from(new Set(cart.map(item => item.restaurant_id)));
												const total_price = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
												const items = cart.flatMap(item => Array(item.quantity).fill(item.id));
												const orderPayload = {
													user_id,
													restaurant_id: restaurantIds.length === 1 ? restaurantIds[0] : restaurantIds,
													total_price,
													address: "Adresse de livraison",
													items
												};
												console.log('Payload envoyé à l\'API :', orderPayload);
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
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
										</svg>
										<span>Passer la commande</span>
									</button>
									
									<button 
										className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 border-2 border-red-200 hover:border-red-300 flex items-center justify-center space-x-2"
										onClick={clearCart}
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
										</svg>
										<span>Vider le panier</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PanierClient;