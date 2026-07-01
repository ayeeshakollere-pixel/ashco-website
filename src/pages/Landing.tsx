import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Services from '@/sections/Services';
import VisionMission from '@/sections/VisionMission';
import Projects from '@/sections/Projects';
import Clients from '@/sections/Clients';
import Contact from '@/sections/Contact';
import Footer from '@/sections/Footer';
import FaqBot from '@/components/FaqBot';

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
    }, mainRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="relative min-h-screen bg-white overflow-x-hidden">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <VisionMission />
        <Projects />
        <Clients />
        <Contact />
      </main>
      <Footer />
      <FaqBot />
    </div>
  );
};

export default Landing;
