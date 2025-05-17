import NavbarComponent from './Navbar';
import Marquee from './Marquee';
import HeroSection from './HeroSection';
import Schemes from './schemes';
import SecSection from './secSection';
import PlanSection from './PlanSection';
import TvFrame from './tvframe';
import Footer from './Footer';
import SecSection3 from './secSection3';
import SecSection2 from './secSection2';
import SecSection4 from './secSection4';
import Testimony from './Testimony';
import PartnerSlider from './partners';
import CustomSpinner from '../components/CustomSpinner';


const Home = () => {
  const isLoading = false; // Replace with your actual loading state

  return (
    <div>
        <NavbarComponent />
      <Marquee />
      <HeroSection />
      <SecSection2 />
      <Schemes />
      <SecSection />
      <PlanSection />
      <SecSection3 />
      <PartnerSlider />
      <SecSection4 />
      <Testimony />
      <TvFrame />
      <Footer />
      {isLoading && <CustomSpinner text="Loading Quotra..." />}
    </div>
  )
}

export default Home