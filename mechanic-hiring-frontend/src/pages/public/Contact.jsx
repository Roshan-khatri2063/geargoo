import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

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
            Get In Touch
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              We'd Love to Hear From You
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Have questions, feedback, or need assistance? Our support team is here to help 24/7.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Get In Touch With Us</h2>
            
            <div className="space-y-6 mb-8">
              {[
                { 
                  icon: '📍', 
                  label: 'Address', 
                  value: 'Sundarharaincha-12, Morang, Nepal',
                  desc: 'Visit us at our main office for in-person consultations'
                },
                { 
                  icon: '📧', 
                  label: 'Email', 
                  value: 'ujwalguragain436@gmail.com',
                  desc: 'Email us for detailed inquiries and support'
                },
                { 
                  icon: '📱', 
                  label: 'Phone', 
                  value: '+977 9825342394 / +977 9762984807',
                  desc: 'Call us for immediate assistance and emergency support'
                },
                { 
                  icon: '🕐', 
                  label: 'Hours', 
                  value: '24/7 Customer Support',
                  desc: 'Always available when you need us, day or night'
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-blue-500/20 hover:border-blue-500 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <p className="text-gray-400 text-sm font-semibold">{item.label}</p>
                      <p className="text-white font-semibold">{item.value}</p>
                      <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-blue-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/services" className="text-blue-400 hover:text-cyan-300 transition">→ Explore Our Services</Link></li>
                <li><Link to="/hire-mechanics" className="text-blue-400 hover:text-cyan-300 transition">→ Book a Mechanic</Link></li>
                <li><Link to="/about" className="text-blue-400 hover:text-cyan-300 transition">→ Learn More About Us</Link></li>
                <li><Link to="/register" className="text-blue-400 hover:text-cyan-300 transition">→ Join As a Mechanic</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8">Send us a Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg animate-pulse">
                <p className="text-green-300 font-semibold">✓ Message sent successfully! We'll respond within 24 hours.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                  placeholder="Tell us more about your inquiry..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Send Message
              </button>
            </form>

            <p className="text-gray-400 text-sm mt-4 text-center">
              We typically respond within 24 hours during business hours.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { 
                q: 'How quickly can I book a mechanic?', 
                a: 'Most services can be booked within 24 hours. For emergency repairs, we offer same-day appointments.' 
              },
              { 
                q: 'Are all mechanics verified?', 
                a: 'Yes, every mechanic undergoes background checks, certification verification, and quality reviews.' 
              },
              { 
                q: 'What payment methods do you accept?', 
                a: 'We accept all major credit cards, debit cards, mobile payments, and bank transfers.' 
              },
              { 
                q: 'Is there a warranty on repairs?', 
                a: 'All repairs come with a warranty period covering workmanship and parts used.' 
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-blue-500/20"
              >
                <h3 className="text-lg font-bold text-white mb-3">❓ {faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need Immediate Assistance?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our customer support team is ready to help. Call, email, or visit us today!
          </p>
          <Link
            to="/hire-mechanics"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Book Service Now
          </Link>
        </div>
      </section>
    </div>
  );
}