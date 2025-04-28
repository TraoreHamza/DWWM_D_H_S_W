import React, { useState, useEffect } from "react";
import LiquidPagination from "./LiquidPagination"; // Importation du composant LiquidPagination

function PredictionHistory({ history }) {
  const [currentPage, setCurrentPage] = useState(0); // Nouvelle page
  const [historie, setHistory] = useState([]);
  const itemsPerPage = 12; // 12 cartes par page

  useEffect(() => {
    setHistory(history);
  }, [history]);
  // Affiche un message si l'historique est vide
  // Si l'historique est vide, affiche un message indiquant qu'il n'y a pas d'historique
  // Sinon, affiche l'historique des prédictions
  if (!historie.length) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-2xl font-semibold mb-4 px-5 uppercase">
          Historique des prédictions
        </h3>
        <p className="text-gray-500 text-lg italic">
          Aucun historique pour le moment.
        </p>
      </div>
    );
  }
  // Calculer les indices de début et de fin pour la pagination
  // Utiliser slice pour obtenir les éléments de l'historique à afficher sur la page actuelle
  // Calculer le nombre total de pages
  // Créer des fonctions pour aller à la page suivante et précédente
  const startIndex = currentPage * itemsPerPage;
  const selectedHistory = history.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(history.length / itemsPerPage);

   // Fonction pour retirer une image de l'historique
   // Cette fonction prend l'index de l'image à retirer et met à jour l'état de l'historique
  // Elle utilise la fonction setHistory pour mettre à jour l'état
   const removeImgSrc = (idxOnPage) => { 
    const globalIdx = startIndex + idxOnPage;
    const updatedHistory = historie.filter((_, idx) => idx !== globalIdx);
    // Utilisation de la fonction setHistory pour mettre à jour l'état
    setHistory(updatedHistory);
    // Mise à jour du localStorage
    localStorage.setItem("predictions", JSON.stringify(updatedHistory));
  };

  return (
    <div className="mt-5 relative">
      <h3 className="text-2xl font-semibold mb-4 px-5 uppercase">
        Historique des prédictions
      </h3>

      <ul className=" grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        gap-6 
        px-5
        md:px-10
        ">
        {selectedHistory.map((item, idx) => (
          <li key={idx} className="bg-[#c4c4c4]/15 
            backdrop-blur 
            border border-white/30 
            rounded-lg 
            shadow-md 
            flex flex-col 
            p-3 md:p-4 
            gap-2 
            relative
            min-h-[220px] 
            md:min-h-[240px]
            overflow-hidden">
            
            {item.image && (
                <img
                    src={item.image}
                    alt="Snapshot"
                    className="w-full h-32 md:h-40 object-cover rounded mb-2"
                />
                )}
                <div className="text-sm md:text-base mb-2">
                <div className="truncate">{item.date}{item.time ? ` | ${item.time}` : ''}</div>
                <div className="flex flex-wrap w-full font-bold uppercase">{item.name}</div>
                </div>
             <button className="absolute top-0 right-0 text-black hover:text-red-500 " onClick={() => removeImgSrc(idx)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
             </button>
          </li>
        ))}
      </ul>

        {/* Pagination centrée */}
        <div className="flex justify-center mt-8">
        <LiquidPagination
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default PredictionHistory;