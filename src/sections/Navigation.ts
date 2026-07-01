import { useState, useEffect } from 'react';
import { Menu, X, Phone, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="flex items-center gap-3 group"
            >
              <div
                className={`relative w-14 h-14 rounded-xl p-1.5 transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? 'bg-white shadow-md' : 'bg-white/95 shadow-lg'
                }`}
              >
                <img
                  src="/logo.png"
                  alt="Ashco Energy Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="leading-none">
                <div
                  className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight transition-colors duration-300 ${
                    isScrolled ? 'text-ashco-green' : 'text-white'
                  }`}
                >
                  ASHCO ENERGY
                </div>
                <div
                  className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    isScrolled ? 'text-ashco-yellow-dark' : 'text-ashco-yellow'
                  }`}
                >
                  We keep you going
                </div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className={`font-body text-sm font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-80 relative group ${
                    isScrolled ? 'text-ashco-black' : 'text-white'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                      isScrolled ? 'bg-ashco-green' : 'bg-white'
                    }`}
                  />
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-3">
              <a href={`tel:${'09055000086'}`}>
                <Button
                  variant="ghost"
                  className={`font-body font-semibold text-sm tracking-wide transition-all duration-300 ${
                    isScrolled
                      ? 'text-ashco-green hover:bg-ashco-green/10'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </a>
              <Link to="/order">
                <Button className="bg-ashco-yellow text-ashco-black hover:bg-ashco-yellow-dark font-body font-bold text-sm tracking-wide transition-all duration-300 hover:shadow-glow-yellow">
                  <Truck className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X
                  className={`w-6 h-6 ${
                    isScrolled ? 'text-ashco-black' : 'text-white'
                  }`}
                />
              ) : (
                <Menu
                  className={`w-6 h-6 ${
                    isScrolled ? 'text-ashco-black' : 'text-white'
                  }`}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-ashco-green transition-transform duration-500 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="font-display text-3xl font-semibold text-white tracking-wide uppercase hover:text-ashco-yellow transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
          <Link to="/order" className="mt-8" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="bg-ashco-yellow text-ashco-black hover:bg-ashco-yellow-dark font-body font-bold text-lg px-8 py-6">
              <Truck className="w-5 h-5 mr-2" />
              Order Fuel Now
            </Button>
          </Link>
          <a href="tel:09055000086" className="text-white/80 font-body font-medium">
            or call {`0905 5000 086`}
          </a>
        </div>
      </div>
    </>
  );
};

export default Navigation;
