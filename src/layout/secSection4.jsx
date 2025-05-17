// src/layout/secSection4.jsx
import React from 'react';

// Array of testimonial card data
const testimonials = [
  {
    bgClass: "bg-primary",
    borderClass: "border-primary",
    iconClass: "text-primary",
    text: "so glad i could buy all my power tools and my minivan, all thanks to quotra, you guys are the best",
    name: "James",
    role: "electrician"
  },
  {
    bgClass: "bg-success",
    borderClass: "border-success",
    iconClass: "text-success",
    text: "finally took my kids to college in the US, thanks to quotra, the devs, and the specialists, thank you all",
    name: "David Smith",
    role: "Susan’s Father"
  },
  {
    bgClass: "bg-danger",
    borderClass: "border-danger",
    iconClass: "text-danger",
    text: "To the friend who brought me to Quotra, thank you and to the managers Allah bless you, i dont even know this",
    name: "Williams",
    role: "Karen’s Father"
  },
  {
    bgClass: "bg-info",
    borderClass: "border-info",
    iconClass: "text-info",
    text: "so happy i could get me $100k loan with ease, thank you quotra, now i can get some shi done, i dont know what i could",
    name: "tony Andrews",
    role: "Engineer"
  },
  {
    bgClass: "bg-purple",
    borderClass: "border-purple",
    iconClass: "text-purple",
    text: "All thanks to Quotra investments i can now sit at home without worrying about bills, thank you Quotra founder",
    name: "Mike Jones",
    role: "Technician"
  },
  {
    bgClass: "bg-pink",
    borderClass: "border-pink",
    iconClass: "text-pink",
    text: "Thanks to you guys my daughter can now recieve her chemotherapy, im so glad, and happy for this",
    name: "Nicholas",
    role: "Donna’s Father"
  }
];

const SecSection4 = () => {
  return (
    <div className="container my-5"> {/* Added my-5 for vertical margin */}
      <div className="row">
        {testimonials.map((item, idx) => (
          <div className="col-md-6 col-lg-4" key={idx}>
            <div className={`card ${item.bgClass} card-hover mb-9 cardro`}>
              <div className="card-body text-center px-md-5 px-lg-6 my-2">
                <div className={`card-icon-border-large ${item.borderClass} mtn-80`}>
                  <i className={`fa fa-quote-left ${item.iconClass}`} aria-hidden="true"></i>
                </div>
                <blockquote className="blockquote blockquote-sm mt-2">
                  <p className="font-normal mb-5">{item.text}</p>
                  <footer className="blockquote-footer text-uppercase text-white">
                    {item.name}
                    <cite className="d-block text-capitalize font-size-14 opacity-80 mt-1" title="Source Title">
                      {item.role}
                    </cite>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        ))}
      </div> {/* End row */}
    </div> // End container
  );
};

export default SecSection4; // Corrected export name
