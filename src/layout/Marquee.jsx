import React from 'react';

const Marquee = () => {
  return (
      <div className="marquee">
        <div className='item item1'><p>Bitcoin <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item2'><p>Etherium <i className='bx bxs-down-arrow' ></i></p></div>
        <div className='item item3'><p>Usdt <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item4'><p>Litecoin <i className='bx bxs-down-arrow'></i></p></div>
        <div className='item item5'><p>Ripple <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item6'><p>Dogecoin <i className='bx bxs-down-arrow'></i></p></div>
        <div className='item item7'><p>Shiba Inu <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item8'><p>Solana <i className='bx bxs-down-arrow'></i></p></div>
      </div>
  );
};

export default Marquee;