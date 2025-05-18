import React from 'react';

const Marquee = () => {
  return (
      <div className="marquee">
        <div className='item item1 text-light'><p>Bitcoin <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item2 text-light'><p>Etherium <i className='bx bxs-down-arrow' ></i></p></div>
        <div className='item item3 text-light'><p>Usdt <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item4 text-light'><p>Litecoin <i className='bx bxs-down-arrow'></i></p></div>
        <div className='item item5 text-light'><p>Ripple <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item6 text-light'><p>Dogecoin <i className='bx bxs-down-arrow'></i></p></div>
        <div className='item item7 text-light'><p>Shiba Inu <i className='bx bxs-up-arrow'></i></p></div>
        <div className='item item8 text-light'><p>Solana <i className='bx bxs-down-arrow'></i></p></div>
      </div>
  );
};

export default Marquee;