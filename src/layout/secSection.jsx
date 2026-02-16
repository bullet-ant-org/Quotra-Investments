import React from 'react'
import Bag from '../assets/bag.svg'
import Hand from '../assets/hand.svg'
import { Link } from 'react-router-dom';
import Chart from '../assets/chart.svg'


const SecSection = () => {



  return (
    <section id='pricing'>
      <div className="container-fluid">
     

        <div className="row hello-icons">
          <div className="col-12 col-md-3 mt-5 mt-lg-0">
            <div className="text-center">
            <img src={Bag} alt="Bag Icon" className='img-fluid' height={200} width={200}/>
            </div>
            <div className="mt-5">
            <h6 className='display-6'>Mutual funds</h6>
            </div>
            <p>Put your money to work with our Mutual Funds and start earning competitive returns.</p>
            <div className="mt-5">
            <Link>Learn More </Link>
            </div>
          </div>
          <div className="col-12 col-md-3 mt-5 mt-lg-0">
            <div className="text-center">
            <img src={Hand} alt="hand Icon" className='img-fluid' height={200} width={200}/>
            </div>
            <div className="mt-5">
            <h6 className='display-6'>Trusts</h6>
            </div>
            <p>Put your money to work with our Mutual Funds and start earning competitive returns.</p>
            <div className="mt-5">
            <Link>Learn More </Link>
            </div>
          </div>
          <div className="col-12 col-md-3 mt-5 mt-lg-0">
            <div className="text-center">
            <img src={Chart} alt="Chart Icon" className='img-fluid' height={200} width={200}/>
            </div>
            <div className="mt-5">
            <h6 className='display-6'>Securities</h6>
            </div>
            <p>Put your money to work with our Mutual Funds and start earning competitive returns.</p>
            <div className="mt-5">
            <Link>Learn More </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecSection
