import React, { useState } from "react";
import DeliveryTable from "../../components/DeliveryTable";
import SearchBar from "../../components/SearchBar";
import FilterButton from "../../components/FilterButton";
import ConfirmationModal from "../../components/ConfirmationModal";

const mockDeliveries = [];

const filterFields = [
	{
		key: "restaurant",
		label: "Restaurant",
		type: "text",
		placeholder: "Nom du restaurant",
	},
	{
		key: "status",
		label: "Statut",
		type: "select",
		options: [
			{ value: "", label: "Tous" },
			{ value: "livré", label: "Livré" },
			{ value: "pas livré", label: "Pas livré" },
		],
	},
];

const LivreurHistorique = () => {
	const [deliveries, setDeliveries] = useState(mockDeliveries);
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({});
	const [actionRow, setActionRow] = useState(null);
	const [showModal, setShowModal] = useState(false);

	// Filtering logic
	const filteredDeliveries = deliveries.filter((d) => {
		const matchesSearch =
			!search ||
			d.restaurant.toLowerCase().includes(search.toLowerCase()) ||
			d.address.toLowerCase().includes(search.toLowerCase());
		const matchesRestaurant =
			!filters.restaurant ||
			d.restaurant.toLowerCase().includes(filters.restaurant.toLowerCase());
		const matchesStatus = !filters.status || d.status === filters.status;
		return matchesSearch && matchesRestaurant && matchesStatus;
	});

	// Handle action button click
	const handleAction = (row) => {
		setActionRow(row);
		setShowModal(true);
	};

	// Handle delete confirm
	const handleDelete = () => {
		setDeliveries((prev) => prev.filter((d) => d.id !== actionRow.id));
		setShowModal(false);
		setActionRow(null);
	};

	return (
		<div className="sm:p-8 p-1">
			<h1 className="text-2xl font-bold mb-6">Historique des livraisons</h1>
			<div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
				<FilterButton
					fields={filterFields}
					onApply={setFilters}
					initial={filters}
				/>
				<div className="flex-1 w-full">
					<SearchBar
						value={search}
						onChange={setSearch}
						placeholder="Rechercher par restaurant ou adresse..."
					/>
				</div>
			</div>
			<DeliveryTable
				deliveries={filteredDeliveries}
				onAction={handleAction}
			/>
			<ConfirmationModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				onConfirm={handleDelete}
				title="Supprimer la livraison"
				message={`Voulez-vous vraiment supprimer la livraison #${actionRow?.id} ?`}
				confirmText="Supprimer"
				cancelText="Annuler"
				confirmButtonClass="bg-red-500 hover:bg-red-600"
			/>
		</div>
	);
};

export default LivreurHistorique;