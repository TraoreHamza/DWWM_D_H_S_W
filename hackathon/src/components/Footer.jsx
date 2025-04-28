import React from 'react';

const Footer = () => {
    return (
        <div>
            <footer className='bg-violet-950  bottom-0 w-full'>
            <div className='p-7 text-white flex justify-between items-center'>
                <div>
                    <h2 className='font-bold text-2xl'>TEAM</h2>
                    <p className='flex gap-4 f text-2xl'>
                        <span>HAMZA</span>
                        <span>WEDAD</span>
                    </p>
                    <p className='flex gap-5 text-2xl'>
                        <span>DAVID</span>
                        <span>SOUMIA</span>
                    </p>
                </div>
                <figure>
                    <img src="/img/obshot.png" alt="" className="w-full" />
                </figure>
                <div>
                    <h2 className='text-2xl'>MY CODE</h2>
                    <img src="/img/qrc.png" alt="" className="w-80" />
                </div>
            </div>
            <p className="text-center text-white py-5 text-2xl"> &copy; HACKATHON DWWM</p>
            </footer>
        </div>
    );
};

export default Footer;