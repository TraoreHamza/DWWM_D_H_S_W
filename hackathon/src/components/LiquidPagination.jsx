import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function DotPagination({ currentPage, totalPages, goToPage }) {
  const dotsRef = useRef([]);
  
  // Référence pour stocker les éléments de pagination
  useEffect(() => {
    // Si le tableau de références n'est pas déjà rempli, on le remplit
    if (dotsRef.current[currentPage]) {
      gsap.fromTo(
        dotsRef.current[currentPage], // Animation sur le dot actuel
        { scale: 0.8 },
        {
          scale: 1.3,
          duration: 0.4,
          ease: "elastic.out(1, 0.5)",
        }
      );
    }
  }, [currentPage]); // Chaque fois que la page change, animation sur le nouveau dot

  const pages = Array.from({ length: totalPages }, (_, i) => i); // Créer un tableau de pages à partir du nombre total de pages

  return (
    <div className="flex gap-4 items-center justify-center py-8">
      {pages.map((page) => (
        <button
          key={page}
          ref={(el) => (dotsRef.current[page] = el)}
          onClick={() => goToPage(page)}
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            currentPage === page
              ? "bg-[#22333B] scale-125"
              : "bg-transparent border-2 border-[#22333B] hover:bg-blue-300 hover:scale-110"
          }`}
        ></button>
      ))}
    </div>
  );
}