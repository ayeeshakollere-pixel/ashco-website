import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Target, Zap, Globe, Handshake, Lightbulb } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const VisionMission = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<SVGPathElement>(null);
  const line2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Center graphic animation
      gsap.fromTo(
        centerRef.current,
        { scale: 0, rotation: 180 },
        {
          scale: 1,
          rotation: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Continuous rotation
      gsap.to(centerRef.current, {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: 'none',
      });

      // Vision card animation
      gsap.fromTo(
        visionRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Mission card animation
      gsap.fromTo(
        missionRef.current,
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // SVG line animations
      if (line1Ref.current && line2Ref.current) {
        const lineLength1 = line1Ref.current.getTotalLength();
        const lineLength2 = line2Ref.current.getTotalLength();

        gsap.set(line1Ref.current, {
          strokeDasharray: lineLength1,
          strokeDashoffset: lineLength1,
        });

        gsap.set(line2Ref.current, {
          strokeDasharray: lineLength2,
          strokeDashoffset: lineLength2,
        });

        gsap.to(line1Ref.current, {
          strokeDashoffset: 0,
          duration: 1,
          delay: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });

        gsap.to(line2Ref.current, {
          strokeDashoffset: 0,
          duration: 1,
          delay: 0.8,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      // Floating animation for cards
      gsap.to([visionRef.current, missionRef.current], {
        y: -10,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const values = [
    { icon: Zap, title: 'Innovation', description: 'Constantly improving our services' },
    { icon: Globe, title: 'Coverage', description: 'Nationwide reach across Nigeria' },
    { icon: Handshake, title: 'Partnership', description: 'Building lasting relationships' },
    { icon: Lightbulb, title: 'Excellence', description: 'Quality in every delivery' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-ashco-green/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-ashco-green/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-ashco-green/10" />
      </div>
      
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-ashco-yellow" />
            <span className="font-body text-sm font-semibold text-ashco-green uppercase tracking-wider">
              Our Direction
            </span>
            <div className="w-8 h-0.5 bg-ashco-yellow" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ashco-black leading-[1.05]">
            VISION & <span className="text-ashco-green">MISSION</span>
          </h2>
        </div>

        {/* Vision & Mission Cards */}
        <div className="relative max-w-6xl mx-auto">
          {/* SVG Connection Lines */}
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none hidden lg:block"
            viewBox="0 0 1200 400"
            fill="none"
          >
            <path
              ref={line1Ref}
              d="M400 200 Q500 200 550 200"
              stroke="#e7a900"
              strokeWidth="2"
              strokeDasharray="8 8"
              fill="none"
            />
            <path
              ref={line2Ref}
              d="M650 200 Q700 200 800 200"
              stroke="#e7a900"
              strokeWidth="2"
              strokeDasharray="8 8"
              fill="none"
            />
          </svg>

          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Vision Card */}
            <div
              ref={visionRef}
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:border-ashco-green/30 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="w-16 h-16 rounded-xl bg-ashco-green/10 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-ashco-green" />
              </div>
              <h3 className="font-display text-3xl font-bold text-ashco-black mb-4">
                OUR VISION
              </h3>
              <p className="font-body text-base text-gray-600 leading-relaxed">
                To be recognized as a leading African brand in petroleum trading
                in Nigeria. We aim to expand our national footprint with proven
                networks, outlets, and distributors of our products, setting the
                standard for excellence in the energy sector.
              </p>
            </div>

            {/* Center Graphic */}
            <div ref={centerRef} className="flex justify-center py-8 lg:py-0">
              <div className="relative w-48 h-48">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-ashco-green/30 animate-spin" style={{ animationDuration: '20s' }} />
                
                {/* Middle Ring */}
                <div className="absolute inset-4 rounded-full border-2 border-ashco-yellow/50" />
                
                {/* Center Logo */}
                <div className="absolute inset-6 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Ashco Energy Logo"
                    className="w-24 h-24 object-contain"
                  />
                </div>
                
                {/* Orbiting Dots */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-ashco-yellow" />
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration


