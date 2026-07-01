import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Award, Users, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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

      // Text animation
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Image 1 parallax
      gsap.fromTo(
        image1Ref.current,
        { opacity: 0, rotateX: 20 },
        {
          opacity: 1,
          rotateX: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: image1Ref.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.to(image1Ref.current, {
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Image 2 parallax
      gsap.fromTo(
        image2Ref.current,
        { opacity: 0, rotateX: -20 },
        {
          opacity: 1,
          rotateX: 0,
          duration: 1,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: image2Ref.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.to(image2Ref.current, {
        y: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Stats animation
      gsap.fromTo(
        statsRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'HSE Compliant',
      description: 'Fully certified in Health, Safety & Environment standards',
    },
    {
      icon: Award,
      title: 'Licensed Provider',
      description: 'Department of Energy wholesale fuel license holder',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Well-trained professionals dedicated to excellence',
    },
    {
      icon: TrendingUp,
      title: 'Growing Network',
      description: 'Expanding footprint across all 36 states',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background Counter */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[30vh] font-bold text-ashco-green/[0.03] pointer-events-none select-none whitespace-nowrap">
        25+
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Images Column */}
          <div className="relative h-[500px] lg:h-[600px] order-2 lg:order-1">
            {/* Image 1 */}
            <div
              ref={image1Ref}
              className="absolute top-0 right-0 w-[70%] h-[60%] rounded-2xl overflow-hidden shadow-2xl z-10"
              style={{ willChange: 'transform, opacity' }}
            >
              <img
                src="/about-1.jpg"
                alt="Mining truck refueling operation"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 2 */}
            <div
              ref={image2Ref}
              className="absolute bottom-0 left-0 w-[65%] h-[55%] rounded-2xl overflow-hidden shadow-2xl z-20"
              style={{ willChange: 'transform, opacity' }}
            >
              <img
                src="/about-2.jpg"
                alt="Industrial fueling station"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Experience Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-ashco-yellow rounded-xl p-6 shadow-xl">
              <div className="font-display text-5xl font-bold text-ashco-black">25+</div>
              <div className="font-body text-sm text-ashco-black/80 uppercase tracking-wide font-medium">
                Years of
                <br />
                Excellence
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="order-1 lg:order-2">
            {/* Section Label */}
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 bg-ashco-yellow" />
              <span className="font-body text-sm font-semibold text-ashco-green uppercase tracking-wider">
                Who We Are
              </span>
            </div>

            {/* Heading */}
            <h2
              ref={headingRef}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ashco-black mb-6 leading-[1.05]"
            >
              POWERING NIGERIA'S
              <span className="text-ashco-green"> INDUSTRIES</span>
            </h2>

            {/* Description */}
            <div ref={textRef} className="space-y-4 mb-8">
              <p className="font-body text-base text-gray-600 leading-relaxed">
                Ashco Energy Ltd. is a reliable and highly dependable organization
                that supplies petroleum, oil, lubricants (POL) and allied products
                to clients across all provinces of Nigeria including neighboring
                countries.
              </p>
              <p className="font-body text-base text-gray-600 leading-relaxed">
                We are a fully established organization with CAC accredited
                certification and a Department of Energy wholesale fuel license
                issued by the Standard Organization of Nigeria (SON). From order
                to delivery, we handle everything ourselves so you get fuel that's
                clean, correctly measured and on time.
              </p>
            </div>

            {/* Features Grid */}
            <div ref={statsRef} className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl bg-ashco-gray hover:bg-ashco-green transition-all duration-300 cursor-default"
                >
                  <feature.icon className="w-8 h-8 text-ashco-green group-hover:text-ashco-yellow mb-3 transition-colors duration-300" />
                  <h3 className="font-display text-xl font-semibold text-ashco-black group-hover:text-white mb-1 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="font-body text-sm text-gray-600 group-hover:text-white/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
