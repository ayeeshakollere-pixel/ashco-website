import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Fuel, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRefs = useRef<HTMLDivElement[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal animation
      gsap.fromTo(
        imageRef.current,
        { scale: 1.2, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
        {
          scale: 1,
          clipPath: 'polygon(0% 0, 100% 0, 100% 100%, 0% 100%)',
          duration: 1.4,
          ease: 'power3.out',
        }
      );

      // Heading lines animation
      headingRefs.current.forEach((heading, index) => {
        gsap.fromTo(
          heading,
          { y: '100%', skewY: 10, opacity: 0 },
          {
            y: '0%',
            skewY: 0,
            opacity: 1,
            duration: 1,
            delay: 0.2 + index * 0.1,
            ease: 'power3.out',
          }
        );
      });

      // CTA button animation
      gsap.fromTo(
        ctaRef.current,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          delay: 0.8,
          ease: 'back.out(1.7)',
        }
      );

      // Parallax effect on scroll
      gsap.to(imageRef.current, {
        y: 200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Content fade on scroll
      gsap.to(contentRef.current, {
        opacity: 0,
        filter: 'blur(10px)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '50% top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToServices = () => {
    const element = document.querySelector('#services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const headingLines = [
    'DOORSTEP DIESEL.',
    'WE KEEP',
    'YOU GOING.',
  ];

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background Image */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-full"
        style={{ willChange: 'transform, clip-path' }}
      >
        <img
          src="/hero-truck.jpg"
          alt="Industrial mining truck at fueling station"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-ashco-green/95 via-ashco-green/70 to-transparent" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 min-h-screen flex items-center"
        style={{ willChange: 'opacity, filter' }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-ashco-yellow/20 backdrop-blur-sm border border-ashco-yellow/40 rounded-full px-4 py-2 mb-8">
              <Fuel className="w-4 h-4 text-ashco-yellow" />
              <span className="font-body text-sm font-medium text-white tracking-wide">
                Fuel delivered to your doorstep
              </span>
            </div>

            {/* Heading */}
            <div className="overflow-hidden mb-6">
              {headingLines.map((line, index) => (
                <div key={index} className="overflow-hidden">
                  <div
                    ref={(el) => {
                      if (el) headingRefs.current[index] = el;
                    }}
                    className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {line}
                  </div>
                </div>
              ))}
            </div>

            {/* Subheading */}
            <p className="font-body text-lg sm:text-xl text-white/90 max-w-xl mb-10 leading-relaxed font-light">
              Order diesel, petrol and kerosene by the litre and we deliver
              straight to your site — fast, flat-rate, and with loyalty
              discounts for returning customers.
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-wrap gap-4">
              <Link to="/order">
                <Button
                  className="bg-ashco-yellow text-ashco-black hover:bg-ashco-yellow-dark font-body font-semibold text-base px-8 py-6 rounded-md transition-all duration-300 hover:shadow-glow-yellow group"
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Order Fuel Now
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                onClick={scrollToServices}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-ashco-green font-body font-semibold text-base px-8 py-6 rounded-md transition-all duration-300"
              >
                See What We Do
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 sm:gap-12 mt-16 pt-8 border-t border-white/20">
              <div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-ashco-yellow">
                  25+
                </div>
                <div className="font-body text-sm text-white/80 uppercase tracking-wide font-medium">
                  Years Experience
                </div>
              </div>
              <div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-ashco-yellow">
                  50K+
                </div>
                <div className="font-body text-sm text-white/80 uppercase tracking-wide font-medium">
                  Litres Daily
                </div>
              </div>
              <div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-ashco-yellow">
                  36
                </div>
                <div className="font-body text-sm text-white/80 uppercase tracking-wide font-medium">
                  States Covered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal Decoration */}
      <div className="absolute bottom-0 right-0 w-1/3 h-32 bg-ashco-yellow clip-diagonal-reverse z-20 hidden lg:block" />
    </section>
  );
};

export default Hero;
