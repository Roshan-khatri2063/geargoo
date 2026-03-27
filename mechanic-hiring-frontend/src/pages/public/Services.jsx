import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    { 
      icon: '🔧', 
      name: 'Engine Repair', 
      desc: 'Complete engine diagnostics and repair',
      details: 'Our certified technicians provide comprehensive engine diagnostics, repair, and maintenance. From minor tune-ups to major overhauls, we handle all engine-related issues with precision and expertise.'
    },
    { 
      icon: '🛞', 
      name: 'Tire Service', 
      desc: 'Tire replacement, rotation, and balancing',
      details: 'Professional tire care including replacement, rotation, balancing, and alignment. We use premium quality tires and state-of-the-art equipment to ensure optimal performance and safety.'
    },
    { 
      icon: '🔋', 
      name: 'Battery Service', 
      desc: 'Battery testing, replacement, and maintenance',
      details: 'Expert battery diagnostics and replacement services. We test battery health, provide replacements with warranty, and ensure your vehicle starts reliably in all conditions.'
    },
    { 
      icon: '🛢️', 
      name: 'Oil Change', 
      desc: 'Quick and professional oil change service',
      details: 'Quick and efficient oil change services using premium lubricants. Regular oil changes keep your engine running smoothly and extend vehicle lifespan significantly.'
    },
    { 
      icon: '🚗', 
      name: 'Brake Service', 
      desc: 'Brake inspection and replacement',
      details: 'Complete brake system inspection, pad replacement, rotor resurfacing, and fluid check. Safety is our priority - we ensure your brakes work perfectly every time.'
    },
    { 
      icon: '⚙️', 
      name: 'Transmission', 
      desc: 'Transmission repair and maintenance',
      details: 'Expert transmission diagnostics, fluid changes, and repairs. We handle both automatic and manual transmissions with precision engineering and quality parts.'
    },
    { 
      icon: '🔌', 
      name: 'Electrical', 
      desc: 'Electrical system diagnostics and repair',
      details: 'Advanced electrical system diagnostics for batteries, alternators, starters, and wiring. Modern vehicles need expert electrical care - we provide comprehensive solutions.'
    },
    { 
      icon: '🪟', 
      name: 'Glass Repair', 
      desc: 'Windshield and window repair/replacement',
      details: 'Professional windshield and auto glass services. Quality repairs that restore visibility and maintain structural integrity of your vehicle.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Our Services
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Comprehensive Solutions
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Professional automotive services for all your vehicle maintenance and repair needs. From routine maintenance to complex repairs, our certified technicians are ready to help.
          </p>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Why Choose GEARGO Services</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '✓', title: 'Certified Technicians', desc: 'All mechanics are professionally certified and experienced' },
              { icon: '⏱️', title: 'Quick Service', desc: 'Fast turnaround without compromising on quality' },
              { icon: '💰', title: 'Competitive Pricing', desc: 'Transparent pricing with no hidden charges' },
              { icon: '🛡️', title: 'Quality Guarantee', desc: 'All work backed by comprehensive warranty' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-blue-500/20 text-center"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Available Services</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-105"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{service.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{service.desc}</p>
                <p className="text-gray-500 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {service.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Our Service Process</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Inspection', desc: 'Thorough inspection and diagnostics of your vehicle' },
              { num: '2', title: 'Assessment', desc: 'Detailed report of issues and recommended solutions' },
              { num: '3', title: 'Service', desc: 'Professional repair using quality parts and tools' },
              { num: '4', title: 'Follow-up', desc: 'Testing and customer satisfaction verification' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg shadow-blue-500/30">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need a Service?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Book a professional mechanic today and get your vehicle serviced by experts. Same-day appointments available!
          </p>
          <Link
            to="/hire-mechanics"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}