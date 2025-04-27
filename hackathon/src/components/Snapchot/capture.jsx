import React from 'react';

const capture = () => {
    const playSound = () => {
        const audio = new Audio('assets/sound/'); // Replace with your sound file path
        audio.play();
    };
    
    return (
        <div>
            <button onClick={playSound}>
            </button>
        </div>
    );
};

export default capture;
