import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { drawRect } from "../assets/js/utilities.js";
import Sound from "../assets/sound_capture.mp3";

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
    <div className="App">
      <div className="flex flex-col ">
       <Webcam
          ref={webcamRef}
          muted={true} 
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            top:15,
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            top:15,
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition" onClick={() => {capture(); playSound();}}>
        📸 Capture
      </button>
      
      </div>
      {history.length > 0 && (
        <div style={{marginTop: 20}}>
          <h3>Historique des prédictions</h3>
          <ul>
            {history.map((item, idx) => (
              <li key={idx}>
                <strong>{item.date}</strong> - {item.name}
                <br />
                <img src={item.image} alt="Snapshot" style={{ width: 160, margin: 5 }}/>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Detection;
