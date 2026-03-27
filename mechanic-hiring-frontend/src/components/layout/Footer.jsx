import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-900 to-black border-t border-blue-500/20">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Footer Grid */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Section */}
            <div>
              <Link 
                to="/" 
                className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 inline-block mb-4"
              >
                ⚙️ GEARGO
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your trusted partner for professional automotive services. Connecting customers with certified mechanics since 2020.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: 'fab fa-facebook-f', label: 'Facebook', href: '#' },
                  { icon: 'fab fa-twitter', label: 'Twitter', href: '#' },
                  { icon: 'fab fa-instagram', label: 'Instagram', href: '#' },
                  { icon: 'fab fa-linkedin-in', label: 'LinkedIn', href: '#' },                  
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-lg flex items-center justify-center text-cyan-400 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-110 hover:text-white"
                    title={social.label}
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Services', to: '/services' },
                  { label: 'Hire Mechanic', to: '/hire-mechanics' },
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact', to: '/contact' },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm relative inline-block group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Our Services</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Engine Repair', icon: 'fas fa-cog' },
                  { label: 'Tire Service', icon: 'fas fa-circle' },
                  // { label: 'Oil Change', icon: 'fas fa-droplet' },
                  { label: 'Brake Service', icon: 'fas fa-hand' },
                  { label: 'Battery Service', icon: 'fas fa-battery-full' },
                  { label: 'Electrical Service', icon: 'fas fa-bolt' },
                ].map((service, index) => (
                  <li key={index} className="text-gray-400 text-sm hover:text-cyan-400 transition-colors duration-300 cursor-pointer flex items-center gap-2 group">
                    <i className={`${service.icon} text-blue-400 group-hover:text-cyan-400 transition-colors`}></i>
                    {service.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-white mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-gray-400 text-sm group">
                  <i className="fas fa-map-marker-alt text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"></i>
                  <span>Sundarharaincha-12, Morang, Nepal</span>
                </div>
                <div className="flex gap-3 text-gray-400 text-sm group">
                  <i className="fas fa-envelope text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"></i>
                  <a href="mailto:ujwalguragain436@gmail.com" className="hover:text-cyan-400 transition-colors">
                    ujwalguragain436@gmail.com
                  </a>
                </div>
                <div className="flex gap-3 text-gray-400 text-sm group">
                  <i className="fas fa-phone text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"></i>
                  <a href="tel:+9779825342394" className="hover:text-cyan-400 transition-colors">
                    +977 9825342394 <br/>
                    +977 9762984807
                  </a>
                </div>
                <div className="flex gap-3 text-gray-400 text-sm group">
                  <i className="fas fa-clock text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"></i>
                  <span>24/7 Support Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-blue-500/20 my-8"></div>

          {/* Bottom Footer */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>© {currentYear} GEARGO. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-1">Quality automotive services at your fingertips</p>
            </div>

            {/* Legal Links */}
            <div className="flex justify-center gap-6 text-sm">
              {[
                { label: 'Privacy Policy', to: '#' },
                { label: 'Terms & Conditions', to: '#' },
                { label: 'Cookie Policy', to: '#' },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.to}
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center md:justify-end gap-3 text-xs">
              <div className="bg-white/5 backdrop-blur-lg px-3 py-2 rounded border border-blue-500/20 text-gray-400 flex items-center gap-1 hover:border-blue-500 transition-all">
                <i className="fas fa-shield-alt text-cyan-400"></i>
                Secure & Safe
              </div>
              <div className="bg-white/5 backdrop-blur-lg px-3 py-2 rounded border border-blue-500/20 text-gray-400 flex items-center gap-1 hover:border-blue-500 transition-all">
                <i className="fas fa-check-circle text-cyan-400"></i>
                Verified Pros
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Gradient Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
    </footer>
  );
}