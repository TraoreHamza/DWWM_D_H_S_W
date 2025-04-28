import React, { useRef, useState, useEffect } from "react";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { drawRect } from "../assets/js/utilities.js";
import Sound from "../assets/sound_capture.mp3";
import PredictionHistory from "../components/PredictionHistory";
import Snapshot from "../assets/img/cam.png"

function Detection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [history, setHistory] = useState([]);

  // Sauvegarde dans le localStorage
  // Utilisation de la fonction setItem pour sauvegarder l'objet prediction dans le localStorage
  // Utilisation de la fonction getItem pour récupérer l'objet prediction du localStorage
  // Utilisation de la fonction JSON.stringify pour convertir l'objet prediction en chaîne de caractères
  // Utilisation de la fonction JSON.parse pour convertir la chaîne de caractères en objet prediction
  const savePrediction = (prediction) => {
    const stored = localStorage.getItem("predictions"); 
    const predictions = stored ? JSON.parse(stored) : [];
    predictions.push(prediction);
    localStorage.setItem("predictions", JSON.stringify(predictions));
  };


  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 10);
  };

  // Fonction de detection pour le modèle COCO-SSD
  // Utilisation de la webcam pour la détection d'objets
  // et affichage des résultats sur le canvas
  // Utilisation de la fonction drawRect pour dessiner les rectangles autour des objets détectés
  // Utilisation de la fonction detect pour détecter les objets dans le flux vidéo
  // Utilisation de la fonction setInterval pour mettre à jour la détection toutes les 10ms
  // Utilisation de la fonction getScreenshot pour capturer une image de la webcam
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video; // Récupération de la vidéo
      const videoWidth = webcamRef.current.video.videoWidth; // Récupération de la largeur de la vidéo
      const videoHeight = webcamRef.current.video.videoHeight; // Récupération de la hauteur de la vidéo
      webcamRef.current.video.width = videoWidth; // Définition de la largeur de la vidéo
      webcamRef.current.video.height = videoHeight; // Définition de la hauteur de la vidéo
      canvasRef.current.width = videoWidth; // Définition de la largeur du canvas
      canvasRef.current.height = videoHeight; // Définition de la hauteur du canvas
      const obj = await net.detect(video); // Détection des objets dans la vidéo
      const ctx = canvasRef.current.getContext("2d"); // Récupération du contexte du canvas
      drawRect(obj, ctx); // Dessin des rectangles autour des objets détectés
    }
  };
  // Fonction pour jouer le son de capture
  // Utilisation de la fonction Audio pour jouer le son de captureA
  const playSound = () => {
    const audio = new Audio(Sound); 
    audio.play();
  }

  // Fonction de capture et sauvegarde
  // Utilisation de la fonction getScreenshot pour capturer une image de la webcam
  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);

    let predictions = [];
    // Si la webcam est prête, détecter les objets dans l'image capturée
    // Alors on charge le modèle COCO-SSD et on détecte les objets
    if (
      typeof webcamRef.current !== "undefined" && 
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4 
    ) {
      const net = await cocossd.load(); // Chargement du modèle COCO-SSD
      const video = webcamRef.current.video; // Récupération de la vidéo
      predictions = await net.detect(video); // Détection des objets dans la vidéo
    }
    // On crée un objet prediction avec le nom, la date, l'image et les objets détectés
    // On sauvegarde l'objet prediction dans le localStorage
    const prediction = {
      name: predictions.length > 0 ? predictions.map(p => p.class).join(", ") : "Aucune détection", 
      // On utilise la fonction toLocaleString pour formater la date et l'heure
      date: new Date().toLocaleString(), // Date et heure de la capture
      image: imageSrc,
      objects: predictions
    };

     savePrediction(prediction);
    // Si l'image est capturée, on crée un lien pour télécharger l'image
    // On utilise la fonction createElement pour créer un lien de téléchargement
    // On utilise la fonction click pour simuler un clic sur le lien
    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'snapshot.png';
      link.click();
    }
  }, [webcamRef]);

  // Utilisation de la fonction useEffect pour mettre à jour l'état de l'historique des prédictions
  useEffect(() => { runCoco(); }, []); // Chargement du modèle COCO-SSD au démarrage du composant

  useEffect(() => {
  // Vérification si l'image est capturée
    const stored = localStorage.getItem("predictions");
  // Si Stored est défini, on parse l'objet JSON et on met à jour l'état de l'historique
  // Sinon, on met à jour l'état de l'historique
    if (stored) setHistory(JSON.parse(stored));
  }, [imgSrc]);

  return (
    <div className="flex w-full h-screen">
    <div className="bg-[#22333B]">
          <div className="flex flex-col items-center gap-6 p-4">
    <div className="relative w-100 min-w-[700px]" id="bottom">
       <Webcam
          ref={webcamRef}
          muted={true} 
          className="top-0 left-0 w-full h-auto z-8 rounded-lg "
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-auto z-9 rounded-lg"
        />
       <button
        onClick={() => {capture(); playSound();}}
        className=" w-20 h-20 m-5"
      >
         <img src={Snapshot} alt="Snap Shot" />
      </button>
      <div className="text-[#c4c4c4] text-2xl p-5 gap-4 flex flex-col">
           <p>Please position the target object directly in front of the camera, ensuring there are no other items obstructing its visibility.</p>
          <p>After capturing your photo, you will be able to view it on the right along with the following information: Date and Type.</p>
        </div>
         </div>
      </div>
      </div>
      <PredictionHistory history={history} />
    </div>
  );
}

export default Detection;
