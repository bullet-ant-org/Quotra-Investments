import React from 'react'
import Phone from '../assets/baggy.png'
import { Link } from 'react-router-dom';

const secSection3 = () => {
  return (
      <section id='intro'>
      <div className="container-fluid balablu pt-5 py-lg-5">
        <div className="row justify-content-center">
          
          <div className="col-md-5 text-center text-md-start mt-5 mt-md-0">

              <div className="display-6 text-dark">Accessibility</div>
              <p className='text-dark mt-5'>Easily accessible, Readily available, and easily usable</p>
              <p>Thats what Quotra is all about, no more stressing yourself to learn about how the market works, Quotra handles that for you</p>
          </div>
          <div className="col-md-5 text-center">
            <img src={Phone} alt="" className="image-fluid text-center" height={600}/>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default secSection3
