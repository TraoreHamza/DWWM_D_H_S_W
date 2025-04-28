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
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      const obj = await net.detect(video);
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  const playSound = () => {
    const audio = new Audio(Sound); // Remplacez par le chemin de votre fichier audio
    audio.play();
  }

  // Fonction de capture et sauvegarde
  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);

    let predictions = [];
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const net = await cocossd.load();
      const video = webcamRef.current.video;
      predictions = await net.detect(video);
    }

    const prediction = {
      name: predictions.length > 0 ? predictions.map(p => p.class).join(", ") : "Aucune détection",
      date: new Date().toLocaleString(),
      image: imageSrc,
      objects: predictions
    };

    savePrediction(prediction);

    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'snapshot.png';
      link.click();
    }
  }, [webcamRef]);

  useEffect(() => { runCoco(); }, []);
  useEffect(() => {
    const stored = localStorage.getItem("predictions");
    if (stored) setHistory(JSON.parse(stored));
  }, [imgSrc]);

  return (
    <div className="flex w-full h-screen">
    <div className="bg-[#22333B]">
          <div className="flex flex-col items-center gap-6 p-4">
    <div className="relative w-100 min-w-[700px]">
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
