import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Clients = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const logosRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const clients = [
    { name: 'BlueSea Services Ltd', initials: 'BS' },
    { name: 'QUBEESH Integrated', initials: 'QI' },
    { name: 'NDLEA', initials: 'ND' },
    { name: 'Shettima Imam', initials: 'SI' },
  ];

  const testimonials = [
    {
      quote:
        'Ashco Energy has been our trusted fuel supplier for over 3 years. Their reliability and quality of service is unmatched in the industry.',
      author: 'John Smith',
      position: 'Operations Manager',
      company: 'BlueSea Services Ltd',
      rating: 5,
    },
    {
      quote:
        'The team at Ashco goes above and beyond to ensure timely delivery. Their 24/7 service has been crucial for our construction projects.',
      author: 'Sarah Johnson',
      position: 'Project Director',
      company: 'NDLEA',
      rating: 5,
    },
    {
      quote:
        'Professional, efficient, and always delivering on their promises. Ashco is our go-to partner for all fuel needs.',
      author: 'Michael Adeyemi',
      position: 'Facility Manager',
      company: 'Nana Plaza',
      rating: 5,
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

      // Logos animation
      gsap.fromTo(
        logosRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: logosRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Testimonials animation
      gsap.fromTo(
        testimonialsRef.current?.children || [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
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
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-ashco-yellow" />
            <span className="font-body text-sm font-semibold text-ashco-green uppercase tracking-wider">
              Trusted By
            </span>
            <div className="w-8 h-0.5 bg-ashco-yellow" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ashco-black mb-4 leading-[1.05]">
            OUR <span className="text-ashco-green">CLIENTS</span>
          </h2>
          <p className="font-body text-base text-gray-600 max-w-2xl mx-auto">
            Proudly serving leading organizations across Nigeria with reliable
            fuel solutions.
          </p>
        </div>

        {/* Client Logos */}
        <div
          ref={logosRef}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-20"
        >
          {clients.map((client, index) => (
            <div
              key={index}
              className="group flex flex-col items-center justify-center p-6 rounded-xl bg-ashco-gray hover:bg-ashco-green transition-all duration-300 cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-ashco-green group-hover:bg-ashco-yellow flex items-center justify-center mb-3 transition-colors duration-300">
                <span className="font-display text-2xl font-bold text-white group-hover:text-ashco-black transition-colors duration-300">
                  {client.initials}
                </span>
              </div>
              <span className="font-body text-sm font-medium text-ashco-black group-hover:text-white text-center transition-colors duration-300">
                {client.name}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="font-display text-2xl font-bold text-ashco-black text-center mb-10">
            WHAT OUR <span className="text-ashco-green">CLIENTS SAY</span>
          </h3>
          <div
            ref={testimonialsRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-ashco-yellow flex items-center justify-center">
                  <Quote className="w-4 h-4 text-ashco-black" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-ashco-yellow text-ashco-yellow"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="font-body text-base text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ashco-green/10 flex items-center justify-center">
                    <span className="font-display text-lg font-bold text-ashco-green">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-body font-semibold text-sm text-ashco-black">
                      {testimonial.author}
                    </div>
                    <div className="font-body text-xs text-gray-500">
                      {testimonial.position}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
