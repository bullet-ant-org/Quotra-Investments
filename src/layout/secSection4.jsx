import React from 'react'
import Nonee2 from '../assets/nonee2.jpg'
import { Link } from 'react-router-dom';

const secSection4 = () => {
  return (
      <section id='intro'>
      <div className="container-fluid balablu pt-5 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-md-5 text-center">
            <img src={Nonee2} alt="" className="image-fluid text-center" height={360}/>
          </div>
          <div className="col-md-5 text-center text-md-start">
            <h1>
              <div className="display-6 text-primary">Let Your Money Work and Talk For You</div>
              <p className='text-dark'>Working all day for weeks to get paid once, most of us will argue that it is not enough,
                that is why we bring this Goodnews to you. <br /> We are now Worldwide, From any country, and state, any region in the world, You are just Decision away from a Good Life.
                <br />You can check out our services today to find out what we are about and what we do
              </p>
              <Link to="/services" className="btn-sm btn-primary">Services</Link>
            </h1>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default secSection4
