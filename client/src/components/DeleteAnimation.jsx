const DeleteAnimation = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="animate-bounce mb-6">
          <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">
          Votre compte va être définitivement supprimé
        </h2>
        <p className="text-lg text-gray-700 text-center">
          Toutes vos données seront effacées de notre plateforme.<br />
          Merci d'avoir utilisé notre service.
        </p>
      </div>
    </div>
  );
  
  export default DeleteAnimation;