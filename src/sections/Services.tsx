import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fuel, Droplets, Warehouse, Truck, ClipboardCheck, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const services = [
    {
      icon: Fuel,
      title: 'Bulk Diesel Supply',
      description:
        'Reliable bulk diesel supply for industrial and commercial sectors. We ensure timely delivery with competitive pricing and quality assurance.',
      features: ['24/7 Supply', 'Quality Assured', 'Competitive Rates'],
    },
    {
      icon: Droplets,
      title: 'POL Distribution',
      description:
        'Comprehensive distribution of Petroleum, Oil, and Lubricants across all 36 states in Nigeria with our extensive logistics network.',
      features: ['Nationwide Coverage', 'Safe Handling', 'Bulk Orders'],
    },
    {
      icon: Warehouse,
      title: 'Storage Solutions',
      description:
        'Supply, delivery, installation and commissioning of storage infrastructure including fuel tanks, self-bunded tanks, and Liquitainers.',
      features: ['Tank Installation', 'Maintenance', 'Compliance'],
    },
    {
      icon: Truck,
      title: 'Logistics Services',
      description:
        'End-to-end logistics solutions with our fleet of specialized vehicles ensuring safe and efficient transportation of fuel products.',
      features: ['Fleet Management', 'Route Optimization', 'Real-time Tracking'],
    },
    {
      icon: ClipboardCheck,
      title: 'Fuel Consulting',
      description:
        'Expert consultation on fuel management, storage optimization, and regulatory compliance to help your business operate efficiently.',
      features: ['Energy Audits', 'Compliance Advice', 'Cost Optimization'],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Accordion items animation
      gsap.fromTo(
        accordionRef.current?.children || [],
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: accordionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative py-24 lg:py-32 bg-ashco-gray overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #165f28 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-ashco-yellow" />
            <span className="font-body text-sm font-semibold text-ashco-green uppercase tracking-wider">
              What We Do
            </span>
            <div className="w-8 h-0.5 bg-ashco-yellow" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ashco-black mb-4 leading-[1.05]">
            OUR <span className="text-ashco-green">SERVICES</span>
          </h2>
          <p className="font-body text-base text-gray-600 max-w-2xl mx-auto">
            Comprehensive fuel solutions tailored to meet the unique needs of
            industrial, commercial, and mining sectors across Nigeria.
          </p>
        </div>

        {/* Services Accordion */}
        <div
          ref={accordionRef}
          className="flex flex-col lg:flex-row gap-4 min-h-[500px]"
        >
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                activeIndex === index
                  ? 'lg:flex-[3] flex-auto'
                  : 'lg:flex-1 flex-auto'
              }`}
              onClick={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src="/service-bg.jpg"
                  alt=""
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    activeIndex === index ? 'opacity-100' : 'opacity-20'
                  }`}
                />
                <div
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    activeIndex === index
                      ? 'bg-gradient-to-t from-ashco-green/95 via-ashco-green/70 to-ashco-green/40'
                      : 'bg-ashco-green/90'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full p-6 lg:p-8 flex flex-col justify-between min-h-[200px] lg:min-h-full">
                {/* Icon */}
                <div
                  className={`transition-all duration-500 ${
                    activeIndex === index
                      ? 'scale-100'
                      : 'lg:scale-75 lg:origin-top-left'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-ashco-yellow/20 flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-ashco-yellow" />
                  </div>
                </div>

                {/* Title - Vertical when collapsed on desktop */}
                <div className="flex-1 flex items-center">
                  <h3
                    className={`font-display text-2xl lg:text-3xl font-bold text-white transition-all duration-500 ${
                      activeIndex !== index
                        ? 'lg:[writing-mode:vertical-rl] lg:rotate-180 lg:text-xl'
                        : ''
                    }`}
                  >
                    {service.title}
                  </h3>
                </div>

                {/* Expanded Content */}
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    activeIndex === index
                      ? 'opacity-100 max-h-[300px]'
                      : 'opacity-0 max-h-0'
                  }`}
                >
                  <p className="font-body text-sm text-white/90 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className="flex items-center gap-2 font-body text-sm text-white/80"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-ashco-yellow" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="inline-flex items-center gap-2 font-body text-sm font-semibold text-ashco-yellow hover:text-white transition-colors duration-300 group">
                    Learn More
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
