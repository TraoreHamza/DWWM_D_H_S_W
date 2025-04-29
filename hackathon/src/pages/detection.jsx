import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { drawRect } from "../assets/js/utilities";
import PredictionHistory from "../components/PredictionHistory";
import snapshot from "../assets/img/cam.png";
import noise from "../assets/img/noise.png";
import noise2 from "../assets/img/noise2.png";
import Sound from "../assets/sound_capture.mp3";

function Detection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const [reloadId, setReloadId] = useState(0);

  useEffect(() => {
    const loadModel = async () => {
      modelRef.current = await cocossd.load();
    };
    loadModel();
  }, []);

  useEffect(() => {
    let animationFrameId;

    const runDetection = async () => {
      await detect();
      animationFrameId = requestAnimationFrame(runDetection);
    };

    runDetection();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const detect = async () => {
    const video = webcamRef.current?.video;
    const net = modelRef.current;
    // Si la vidéo n'est pas prête ou si le modèle n'est pas chargé, on sort de la fonction
    if (!video || video.readyState !== 4 || !canvasRef.current || !net) return;

    const videoWidth = video.videoWidth; // Récupérer la largeur de la vidéo
    const videoHeight = video.videoHeight; // Récupérer la hauteur de la vidéo
    webcamRef.current.video.width = videoWidth; // Définir la largeur de la vidéo
    webcamRef.current.video.height = videoHeight; // Définir la hauteur de la vidéo
    canvasRef.current.width = videoWidth; // Définir la largeur du canvas
    canvasRef.current.height = videoHeight; // Définir la hauteur du canvas

    const predictions = await net.detect(video); // Détecter les objets dans la vidéo
    const ctx = canvasRef.current.getContext("2d"); // Récupérer le contexte du canvas
    drawRect(predictions, ctx); // Dessiner les rectangles autour des objets détectés
  };

  // Fonction pour jouer le son
  const playSound = () => {
    const audio = new Audio(Sound); // Créer une nouvelle instance de l'objet Audio
    audio.play(); // Jouer le son
  };
 
  // Fonction pour uploader la photo
  const uploadSnapshot = async (imageSrc, labels, person = "Unknown") => {

    // Vérifier si l'URL de l'image est valide
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();

      formData.append('snapshot', blob, 'snapshot.png');
      formData.append('person', person);
      
      // Si labels est un tableau, on les ajoute un par un
      // Sinon, on ajoute le label "Unknown"
      if (Array.isArray(labels)) {
        labels.forEach(label => formData.append('labels', label));
      } else {
        formData.append('labels', labels || 'Unknown');
      }
      
      // Envoyer la requête POST avec l'image et les labels
      await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload successful'); // Afficher un message de succès
    } catch (error) {
      console.error('Upload failed', error);
    }
  };
 
  // Fonction pour capturer la photo
  // et uploader l'image avec les labels
  const capture = async () => {
    const video = webcamRef.current?.video; // 
    // Si la vidéo n'est pas prête, on sort de la fonction
    if (!video) return;

    const tempCanvas = document.createElement('canvas'); // Créer un canvas temporaire
    tempCanvas.width = video.videoWidth; 
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    const imageSrc = tempCanvas.toDataURL('image/png'); // Convertir le canvas en image

    const net = modelRef.current; 
    let predictions = [];
    // Si le modèle est chargé et la vidéo est prête, détecter les objets
    // dans la vidéo et uploader l'image avec les labels
    if (video && video.readyState === 4 && net) {
      predictions = await net.detect(video);
    }
    // Fonction labels pour récupérer les labels des objets détectés
    const labels = predictions.length > 0
      ? predictions.map(p => p.class) // Récupérer les labels des objets détectés
      : ["No Detection"];

    await uploadSnapshot(imageSrc, labels); // Uploader l'image avec les labels

    setReloadId(prev => prev + 1); // Mettre à jour l'ID de rechargement pour forcer le rechargement de l'historique
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-auto min-h-screen">
      {/* Zone caméra */}
      <div
        className="bg-[#22333B] w-full md:w-1/3 flex flex-col gap-6 p-4"
        style={{ backgroundImage: `url(${noise2})` }}
      >
        <div className="flex flex-col gap-6 p-4 w-full">
          <div className="relative w-full min-w-0 mx-auto aspect-video" id="bottom">
            <Webcam
              ref={webcamRef}
              muted
              screenshotFormat="image/png"
              className="absolute top-0 left-0 w-full h-full object-cover z-8 rounded-lg"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-cover z-9 rounded-lg pointer-events-none"
            />
          </div>

          {/* Bouton Capture */}
          <button
            onClick={() => { capture(); playSound(); }}
            className="w-16 h-16 md:w-20 md:h-20 cursor-pointer mx-5"
          >
            <img src={snapshot} alt="Snap Shot" className="w-full h-full object-contain" />
          </button>

          {/* Instructions */}
          <div className="text-[#c4c4c4] text-base md:text-2xl p-2 md:p-5 gap-4 flex flex-col md:text-left text-center">
            <p>
              Please position the target object directly in front of the camera, ensuring there are no other items obstructing its visibility.
            </p>
            <p>
              After capturing your photo, you will be able to view it on the right along with the following information: Date and Type.
            </p>
          </div>
        </div>
      </div>

      {/* Zone historique */}
      <div
        className="bg-[#C4C4C4] w-full md:w-2/3 min-h-[40vh] md:min-h-screen overflow-y-auto"
        style={{ backgroundImage: `url(${noise})` }}
      >
        <PredictionHistory key={reloadId} />
      </div>
    </div>
  );
}


export default Detection;