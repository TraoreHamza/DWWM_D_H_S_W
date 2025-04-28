import React, { useRef, useState, useEffect } from "react";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { drawRect } from "../assets/js/utilities.js";
import Sound from "../assets/sound_capture.mp3";
import PredictionHistory from "../components/PredictionHistory";
import Snapshot from "../assets/img/cam.png";
import noise from "../assets/img/noise.png";
import noise2 from "../assets/img/noise2.png";

function Detection() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [history, setHistory] = useState([]);

  const savePrediction = (prediction) => {
    const stored = localStorage.getItem("predictions");
    const predictions = stored ? JSON.parse(stored) : [];
    predictions.push(prediction);
    localStorage.setItem("predictions", JSON.stringify(predictions));
  };

  const runCoco = async () => {
    const net = await cocossd.load();
    setInterval(() => {
      detect(net);
    }, 10);
  };

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
    const audio = new Audio(Sound);
    audio.play();
  };

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
      name: predictions.length > 0 ? predictions.map((p) => p.class).join(", ") : "Aucune détection",
      date: new Date().toLocaleString(),
      image: imageSrc,
      objects: predictions,
    };

    savePrediction(prediction);

    if (imageSrc) {
      const link = document.createElement("a");
      link.href = imageSrc;
      link.download = "snapshot.png";
      link.click();
    }
  }, [webcamRef]);

  useEffect(() => {
    runCoco();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("predictions");
    if (stored) setHistory(JSON.parse(stored));
  }, [imgSrc]);

  return (
    <div className="flex flex-col md:flex-row w-full h-auto min-h-screen">
      {/* Partie Webcam & capture */}
      <div
        className="bg-[#22333B] w-full md:w-1/2 flex flex-col gap-6 p-4"
        style={{
          backgroundImage: `url(${noise2})`,
        }}
      >
        <div className="flex flex-col gap-6 p-4 w-full">
          <div className="relative w-full  min-w-0 mx-auto aspect-video" id="bottom">
            <Webcam
              ref={webcamRef}
              muted={true}
              className="absolute top-0 left-0 w-full h-full object-cover z-8 rounded-lg"
              screenshotFormat="image/png"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-cover z-9 rounded-lg pointer-events-none"
            />
          </div>
          <button
            onClick={() => {
              capture();
              playSound();
            }}
            className="w-16 h-16 md:w-20 md:h-20 cursor-pointer"
          >
            <img src={Snapshot} alt="Snap Shot" className="w-full h-full object-contain" />
          </button>
          <div className="text-[#c4c4c4] text-base md:text-2xl p-2 md:p-5 gap-4 flex flex-col md:text-left">
            <p>
              Please position the target object directly in front of the camera, ensuring there are no other items obstructing its visibility.
            </p>
            <p>
              After capturing your photo, you will be able to view it on the right along with the following information: Date and Type.
            </p>
          </div>
        </div>
      </div>
      {/* Partie Historique */}
      <div
        className="bg-[#C4C4C4] noise-bg w-full md:w-1/2 min-h-[40vh] md:min-h-screen overflow-y-auto"
        style={{
          backgroundImage: `url(${noise})`,
        }}
      >
        <PredictionHistory history={history} />
      </div>
    </div>
  );
}

export default Detection;
