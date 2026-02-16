// src/layout/Testimony.jsx
import React from 'react';

// Sample data for reviews (replace with your actual data or fetch it)
const reviewsData = [
  {
    id: 1,
    name: 'Alice Johnson',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShtBGk-f9MpPnSA0IZtJnTuQcaqLavCQ4arwwzD7rQR3_x1fAvNn0T_5snL8WqhprTdxs&usqp=CAU', // Placeholder image
    rating: 5, // Example: 5 stars
    review: 'Dans lensemble, cest un bon site Web, je le recommanderai certainement, je ne mattendais pas à obtenir 100 000 £, mais le voici',
  },
  {
    id: 2,
    name: 'Bob Williams',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMGJenQszG4kEz7gOR8Qiv_HrJEY-kODpAoA&s', // Placeholder image
    rating: 4, // Example: 4 stars
    review: 'Very satisfied with the outcome. The process was smooth, and communication was clear throughout. Would use again.',
  },
  {
    id: 3,
    name: 'Alfred Edvin',
    image: 'https://hips.hearstapps.com/hmg-prod/images/gettyimages-515984042.jpg?resize=1200:*', // Placeholder image
    rating: 5, // Example: 5 stars
    review: 'Jag älskar den här webbplatsen så mycket, gjorde mig till den första mångmiljonären i min familj',
  },
  {
    id: 4,
    name: 'Ahmed Dakar',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bob_Mortimer_in_2017.jpg/250px-Bob_Mortimer_in_2017.jpg', // Placeholder image
    rating: 5, // Example: 5 stars
    review: 'در کل وب‌سایت خوبی است، من عاشقش هستم، از شما به خاطر کمک به من و خانواده‌ام برای دریافت چنین وام بزرگی متشکرم.',
  },
  {
    id: 5,
    name: 'Ibrahim Idrak',
    image: 'https://mymodernmet.com/wp/wp-content/uploads/2017/01/mr-erbil-fashion-group-6.jpg', // Placeholder image
    rating: 5, // Example: 5 stars
    review: 'وب سایت و پلتفرم سرمایه گذاری بسیار خوب بود، من قطعا آنها را توصیه می کنم، آنها من و خانواده ام را تبدیل به چیزی کردند که امروز هستیم.',
  },
  {
    id: 6,
    name: 'Jakob Noah',
    image: 'https://ecm-server.de/artists/1495_Pressphoto2.webp', // Placeholder image
    rating: 5, // Example: 5 stars
    review: 'så kort av ord, min største løft var denne nettsiden, definitivt en bruk igjen',
  },
  // Add more reviews as needed
];

// Helper component to render rating stars (using Font Awesome)
// Make sure Font Awesome is included in your project!
const RatingStars = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <i
        key={i}
        className={`fa fa-star ${i <= rating ? 'text-warning' : 'text-muted'}`} // Filled or empty star
        aria-hidden="true"
      ></i>
    );
  }
  return <div className="rating-stars">{stars}</div>;
};

const Testimony = () => {
  return (
    <section className="testimony-section py-5 bg-white"> {/* Section wrapper */}
      <div className="container">
        <h2 className="text-center mb-5">What Our Clients Say</h2> {/* Section title */}
        <div className="row g-4"> {/* Use g-4 for gutters */}
          {reviewsData.map((review) => (
            <div key={review.id} className="col-md-6 col-lg-4"> {/* Responsive columns */}
              <div className="review-card card h-100 shadow-sm"> {/* Use Bootstrap card and ensure equal height */}
                <div className="card-body">
                  <div className="review-header d-flex align-items-center mb-3">
                    <img
                      src={review.image}
                      alt={`${review.name}'s profile`}
                      className="profile-image me-3" // Class for circular image
                    />
                    <h5 className="reviewer-name mb-0">{review.name}</h5>
                  </div>
                  <p className="review-content card-text text-dark ">
                    "{review.review}"
                  </p>
                  <div className="review-rating mt-auto pt-2"> {/* Push rating to bottom */}
                    <RatingStars rating={review.rating} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimony;
