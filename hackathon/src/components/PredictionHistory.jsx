import React, { useState, useEffect } from "react";

function PredictionHistory({ history }) {
  const [currentPage, setCurrentPage] = useState(0); // Nouvelle page
  const [historie, setHistory] = useState([]);
  const itemsPerPage = 12; // 12 cartes par page

  useEffect(() => {
    setHistory(history);
  }, [history]);
  // Affiche un message si l'historique est vide
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


  const startIndex = currentPage * itemsPerPage;
  const selectedHistory = history.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

   // Fonction pour retirer une image de l'historique
  
   const removeImgSrc = (idxOnPage) => { 
    const globalIdx = startIndex + idxOnPage;
    const updatedHistory = historie.filter((_, idx) => idx !== globalIdx);
    // Utilisation de la fonction setHistory pour mettre à jour l'état
    setHistory(updatedHistory);
    // Mise à jour du localStorage
    localStorage.setItem("predictions", JSON.stringify(updatedHistory));
  };

  return (
    <div className="mt-5">
      <h3 className="text-2xl font-semibold mb-4 px-5 uppercase">
        Historique des prédictions
      </h3>

      <ul className="space-y-6 grid grid-cols-4 relative">
        {selectedHistory.map((item, idx) => (
          <li key={idx} className="bg-[#c4c4c4]/15 backdrop-blur border border-white/30 rounded-lg shadow-md flex flex-col p-4 gap-2 mx-5 w-50 h-60">
            
            {item.image && (
              <img
                src={item.image}
                alt="Snapshot"
                className="w-50 rounded"
              />
            )}
            <div className="text-m mb-2">
              <div>{item.date} | {item.time}</div>
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

      {/* Pagination Controls */}
      <div className="flex justify-center items-center  gap-4">
        <button
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Précédent
        </button>
        <span className="text-xl font-semibold">{currentPage + 1} / {totalPages}</span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default PredictionHistory;