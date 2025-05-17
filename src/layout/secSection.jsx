import React from 'react'
import Nonee from '../assets/nonee.png'

const SecSection = () => {
  return (
    <section id='intro'>
      <div className="container-fluid balablu pt-5 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-md-5 text-center text-md-start">
            <h1>
              <div className="display-6 text-light">A TRUELY GLOBAL HEDGEFUND</div>
              <p className='text-light'>Empowering and elevating millions of users worldwide, and a 4.8 star rating, Quotra has been a lifestyle choice for People all over the world who have decided to take a stand and build a solid foundation of wealth and how money works, with more than $100 Billion in assets, all strategies and analysis are carried out by the best stock brokers and traders from around the world,</p>
              <p className='text-primary'>Founded on 17th July 2009</p>
            </h1>
          </div>
          <div className="col-md-5 text-center">
            <img src={Nonee} alt="" className="image-fluid text-center" height={270}/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecSection