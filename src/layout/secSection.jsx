import React from 'react'
import Nonee from '../assets/nonee.jpg'
import { Link } from 'react-router-dom';

const SecSection = () => {
  return (
    <section id='intro'>
      <div className="container-fluid balablu pt-5 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-md-5 text-center text-md-start">
            <h1>
              <div className="display-6 text-primary">A TRUELY GLOBAL HEDGEFUND</div>
              <p className='text-dark'>What started as a little business of using people's money to buy properties and giving business owners to sell in the streets of london, in the year 1945, a month after the victory in europe, after the world war. <br /> Continued growing, little by little. <br /> And we are pleased to tell you, our beloved Visitor that on day 9th, September 2003, we became truely worldwide <br />And Also are we pleased to let you know that on 4th October 2012, we migrated to the stock market, which is where we now make our stand </p>
              <Link to="/about" className="btn-sm btn-primary">Learn More</Link>
            </h1>
          </div>
          <div className="col-md-5 text-center">
            <img src={Nonee} alt="" className="image-fluid text-center" height={450}/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecSection