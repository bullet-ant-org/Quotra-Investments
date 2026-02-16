import React from 'react'
import Whiteman from '../assets/whiteman.jpg'
import { Link } from 'react-router-dom';

const secSection4 = () => {
  return (
      <section id='intro'>
      <div className="container-fluid balablu pt-5 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-md-5 text-center">
            <img src={Whiteman} alt="" className="image-fluid text-center" height={300}/>
          </div>
          <div className="col-md-5 text-center text-md-start mt-5 mt-md-0">

              <div className="display-6 text-dark">At your Service</div>
              <p className='text-dark my-5'>we are here to help you with your financial journey. Whether you're looking to invest, save, or plan for the future, our team is ready to assist you every step of the way.</p>
              
              <Link to="/services" className="btn btn-primary my-2 rounded-pill">Services</Link>

          </div>
          
        </div>
      </div>
    </section>
  )
}

export default secSection4
