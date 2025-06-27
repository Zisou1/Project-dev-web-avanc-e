import React, { useState } from "react";

const mockCart = [
	{
		id: 1,
		name: "Chicken burger",
		image:
			"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80",
		details: [
			"Sauce au choix mayonnaise",
			"Crudité au choix salade tomate oignons",
		],
		quantity: 1,
		price: 1200,
	},
	{
		id: 2,
		name: "Pizza marguerite",
		image:
			"https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
		details: [
			"Sauce au choix mayonnaise",
			"Crudité au choix salade tomate oignons",
		],
		quantity: 3,
		price: 1200,
	},
];

const PanierClient = () => {
	const [cart, setCart] = useState(mockCart);

	const handleRemove = (id) => {
		setCart(cart.filter((item) => item.id !== id));
	};

	const total = cart.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	return (
		<div className="min-h-screen flex flex-col items-center bg-white">
			<h1 className="text-2xl font-bold mt-10 mb-6 w-full text-center">
				Votre panier
			</h1>
			<div className="w-full max-w-4xl px-2 bg-white">
				<div className="space-y-10">
					{cart.map((item) => (
						<div
							key={item.id}
							className="flex items-center bg-gray-50 rounded-2xl shadow-md p-4 md:p-6 mb-2 min-h-[100px] md:min-h-[120px] w-full"
						>
							<img
								src={item.image}
								alt={item.name}
								className="w-20 h-20 md:w-28 md:h-28 rounded-xl object-cover mr-6"
							/>
							<div className="flex-1">
								<div className="text-xl md:text-2xl font-bold mb-1">
									{item.name}
								</div>
								<div className="flex flex-row gap-10 text-xs md:text-sm text-gray-700 mb-1">
									<div>
										<span className="font-bold">Sauce au choix:</span>
										<span className="ml-1 font-normal">
											{item.details
												.filter((d) =>
													d.toLowerCase().includes("sauce")
												)
												.map((d) => d.replace("Sauce au choix ", ""))
												.join(", ") || "---"}
										</span>
									</div>
									<div>
										<span className="font-bold">
											Crudités
											{
												item.details.filter((d) =>
													d.toLowerCase().includes("crudité")
												).length > 1
													? "s"
													: ""
											}
											:
										</span>
										<span className="ml-1 font-normal">
											{item.details
												.filter((d) =>
													d.toLowerCase().includes("crudité")
												)
												.map((d) => d.replace("Crudité au choix ", ""))
												.join(", ") || "---"}
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-end justify-between h-full ml-4">
								<div className="font-bold text-base md:text-lg mb-2">
									Qté: {item.quantity}
								</div>
								<div className="flex items-center font-bold text-base md:text-lg mb-2">
									<span className="mr-1 text-gray-700">Prix unitaire:</span>{" "}
									{item.price} DA
								</div>
								<button
									className="bg-[#FF4D4F] hover:bg-[#ff6a6a] text-white text-sm font-semibold rounded-md px-6 py-1 md:py-2 transition-all"
									onClick={() => handleRemove(item.id)}
								>
									annuler
								</button>
							</div>
						</div>
					))}
				</div>
				<div className="flex justify-end mt-8 mb-4">
					<span className="text-2xl font-bold">Prix total : {total} DA</span>
				</div>
				<div className="flex justify-center">
					<button className="bg-[#FF4D4F] hover:bg-[#ff6a6a] text-white font-semibold rounded-md px-8 py-2 text-base md:text-lg transition-all">
						passer la commande
					</button>
				</div>
			</div>
		</div>
	);
};

export default PanierClient;
