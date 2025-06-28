import React, { useEffect, useState } from 'react';
import axios from 'axios';
import homeImg from '../../assets/Home.png';
import yassir from '../../assets/Yassir.png';
import wonder from '../../assets/WonderFoods.png';
import bubble from '../../assets/WiiiiiiiiiiW.png';
import hicham from '../../assets/HichemCook.png';
import elpadre from '../../assets/Elpadre.png';

const meals = [
  { name: 'Pizza margherita 🍕', image: '/images/pizza.jpg' },
  { name: 'Meet burger 🍔', image: '/images/burger.jpg' },
  { name: 'Salade composée 🥗', image: '/images/salade.jpg' },
];

const reviews = [
  {
    name: 'Sophie',
    date: 'il y a 4 jours',
    text: "Pretty good overall! I liked the vibe and the way everything was handled. There’s still a bit of room for improvement, but still had a mostly positive experience. Thanks!",
  },
  {
    name: 'James Liu',
    date: 'il y a 3 jours',
    text: "Super facile et rapide ! Le service a dépassé mes attentes — tout était intuitif, et la nourriture est incroyablement pratique. J’en ai déjà parlé à mes amis 😍 !"
  },
  {
    name: 'Emily Rose',
    date: 'il y a 2 jours',
    text: "Really happy with the experience! The team was super friendly and responsive. My order arrived a bit slow at one point, but overall great service.",
  },
];

const partners = [yassir, wonder, bubble, hicham, elpadre];

function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/getAll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        if (Array.isArray(response.data.restaurants)) {
          setRestaurants(response.data.restaurants.slice(0, 3));
        } else if (Array.isArray(response.data)) {
          setRestaurants(response.data.slice(0, 3));
        } else {
          setError('Format de réponse inattendu');
        }
      } catch (err) {
        setError('Erreur lors du chargement des restaurants');
      }
    }
    async function fetchItems() {
      try {
        const response = await axios.get('http://localhost:3000/api/restaurants/item/getAll', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
        });
        console.log('ITEMS API response:', response.data);
        if (Array.isArray(response.data.items)) {
          setItems(response.data.items.slice(0, 3));
        } else if (Array.isArray(response.data)) {
          setItems(response.data.slice(0, 3));
        } else {
          console.log('Format de réponse inattendu pour les items');
        }
      } catch (err) {
        console.log('Erreur lors du chargement des items', err);
      }
    }
    fetchRestaurants();
    fetchItems();
  }, []);

  return (
    <div className="font-sans">
      {/* Hero */}
        <div
            className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 bg-gray-100 h-[40rem] flex items-center justify-center text-center"
            style={{
                backgroundImage: `url(${homeImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            >
            <h1 className="text-black text-3xl md:text-5xl font-bold relative z-10">
                Commandez vos <br />
                <span style={{ color: '#FE5336' }}>plats préférés</span> en quelques clics
                <p className="text-lg mt-4 text-black">
                Livraison rapide, restaurants de qualité, expérience fluide
                </p>
            </h1>
        </div>


      {/* Top Meals */}
      <section className="my-12 px-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Nos plat les mieux notés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {meals.map((meal, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden shadow-md">
              <img src={meal.image} alt={meal.name} className="w-full h-48 object-cover" />
              <div className="p-4 font-semibold">{meal.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Items from API */}
      <section className="my-12 px-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Notre sélection de plats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.length === 0 ? (
            <div className="col-span-3 text-center">Aucun item trouvé.</div>
          ) : (
            items.map((item, idx) => (
              <div key={item._id || idx} className="rounded-xl overflow-hidden shadow-md">
                <img src={item.image || '/images/pizza.jpg'} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-4 font-semibold">{item.name}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="my-12 px-6  py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Les avis de nos utilisateurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-md">
              <p className="italic text-gray-600 mb-2">"{rev.text}"</p>
              <div className="text-sm text-gray-700 font-semibold">{rev.name}</div>
              <div className="text-xs text-gray-500">{rev.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="my-12 px-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Nos partenaires</h2>
        <div className="flex justify-center gap-6 flex-nowrap w-full">
          {partners.map((src, idx) => (
            <img key={idx} src={src} alt="partenaire" className="h-40 w-auto object-contain" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;