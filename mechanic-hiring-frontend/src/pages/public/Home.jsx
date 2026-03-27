import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
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
            Find Expert Mechanics
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Near You
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with trusted, verified mechanics for all your vehicle needs. Fast, affordable, and reliable service at your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              to="/services"
              className="group relative px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold text-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                🔧 Explore Services
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/hire-mechanics"
              className="group relative px-10 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              <span className="flex items-center justify-center gap-2">
                👨‍🔧 Hire a Mechanic
              </span>
            </Link>
          </div>

          <div className="flex justify-center gap-8 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span> 500+ Verified Mechanics
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span> 4.8★ Average Rating
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span> 24/7 Support
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Why Choose MechanicHire?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'Get connected with a mechanic in minutes, not hours.',
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                desc: 'No hidden fees. Know the cost before you commit.',
              },
              {
                icon: '🛡️',
                title: 'Verified & Insured',
                desc: 'All mechanics are verified and fully insured.',
              },
              {
                icon: '⭐',
                title: 'Top Rated',
                desc: 'Work with the best mechanics in your area.',
              },
              {
                icon: '📱',
                title: 'Easy Booking',
                desc: 'Simple and intuitive booking process.',
              },
              {
                icon: '🎯',
                title: 'Quality Assured',
                desc: 'Money-back guarantee if not satisfied.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 border border-blue-500/20 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 transform hover:scale-105"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50K+', label: 'Happy Customers' },
              { number: '500+', label: 'Expert Mechanics' },
              { number: '100K+', label: 'Jobs Completed' },
              { number: '4.8★', label: 'Average Rating' },
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-400 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Your Vehicle Fixed?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust MechanicHire for their vehicle maintenance.
          </p>
          <Link
            to="/hire-mechanics"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Hiring Now
          </Link>
        </div>
      </section>
    </div>
  );
}