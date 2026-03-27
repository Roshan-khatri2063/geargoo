import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
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
            About GEARGO
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Your Trusted Partner
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connecting customers with professional mechanics since 2025. Building trust through quality service.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20 shadow-xl">
              <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                GEARGO was founded with a simple vision: to make quality automotive services accessible to everyone. We realized that finding a trustworthy mechanic was a challenge for most vehicle owners, and communication between customers and service providers was often unclear.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                In 2025, we built the first version of our platform to bridge this gap. Since then, we've grown to serve thousands of satisfied customers and partnered with hundreds of certified mechanics across the region.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Every day, our team works tirelessly to improve our platform and ensure that both customers and mechanics have the best experience possible.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <div className="text-4xl font-black text-white mb-2">5000+</div>
                <p className="text-blue-100 font-semibold">Happy Customers</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <div className="text-4xl font-black text-white mb-2">300+</div>
                <p className="text-blue-100 font-semibold">Certified Mechanics</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <div className="text-4xl font-black text-white mb-2">10,000+</div>
                <p className="text-blue-100 font-semibold">Services Completed</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-8 text-center transform hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                <div className="text-4xl font-black text-white mb-2">4.9★</div>
                <p className="text-blue-100 font-semibold">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20">
              <h3 className="text-3xl font-bold text-white mb-4">🎯 Our Mission</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                To revolutionize automotive service by creating a transparent, reliable, and customer-centric platform that connects vehicle owners with skilled, certified mechanics.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We believe quality service shouldn't be a luxury. Through our platform, we make professional mechanical expertise accessible and affordable for everyone.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20">
              <h3 className="text-3xl font-bold text-white mb-4">🌟 Our Vision</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                To become the leading online automotive service platform, trusted by millions of customers and thousands of mechanics globally.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We envision a world where vehicle maintenance is hassle-free, transparent, and conducted with the highest standards of professionalism and ethics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Our Core Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: '✓', 
                title: 'Trust & Transparency', 
                desc: 'We believe in complete transparency in pricing, processes, and communication. Every customer knows exactly what they\'re paying for and why.' 
              },
              { 
                icon: '⚡', 
                title: 'Excellence', 
                desc: 'We are committed to delivering the highest quality service. From technician training to equipment, nothing is compromised.' 
              },
              { 
                icon: '🤝', 
                title: 'Community Focused', 
                desc: 'We support both our customers and mechanics equally, creating a balanced ecosystem where everyone benefits and grows together.' 
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-105"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Why Trust GEARGO</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🛡️', title: 'Verified Mechanics', desc: 'All technicians are background checked and certified' },
              { icon: '💎', title: 'Quality Assurance', desc: 'Every job inspected and quality verified before completion' },
              { icon: '⏰', title: '24/7 Support', desc: 'Always available to answer your questions and concerns' },
              { icon: '📱', title: 'Easy Booking', desc: 'Simple online booking with real-time updates and tracking' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-blue-500/20 text-center hover:border-blue-500 transition-all duration-300"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience Quality Service?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust GEARGO for their automotive needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hire-mechanics"
              className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book a Service
            </Link>
            <Link
              to="/register"
              className="inline-block px-10 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
            >
              Register as Mechanic
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}