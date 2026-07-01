import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Droplets, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      image: '/project-1.jpg',
      title: 'Niger State Road Construction',
      client: 'Bluesea Services Ltd',
      volume: '200,000 Litres',
      location: 'Niger State',
      description: 'Bulk diesel supply for major road construction project',
    },
    {
      image: '/project-2.jpg',
      title: 'NDLEA Headquarters',
      client: 'NDLEA',
      volume: '3,000 Litres',
      location: 'FCT Abuja',
      description: 'Fuel supply for government agency operations',
    },
    {
      image: '/project-3.jpg',
      title: 'Nana Plaza Complex',
      client: 'Management',
      volume: '1,500 Litres',
      location: 'Wuse 2, FCT Abuja',
      description: 'Regular fuel supply for commercial complex',
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

      // Grid items animation
      gsap.fromTo(
        gridRef.current?.children || [],
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
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
      id="projects"
      className="relative py-24 lg:py-32 bg-ashco-black overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg, #165f28 25%, transparent 25%), linear-gradient(-45deg, #165f28 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #165f28 75%), linear-gradient(-45deg, transparent 75%, #165f28 75%)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }}
        />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-ashco-yellow" />
            <span className="font-body text-sm font-semibold text-ashco-yellow uppercase tracking-wider">
              Our Portfolio
            </span>
            <div className="w-8 h-0.5 bg-ashco-yellow" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.05]">
            FEATURED <span className="text-ashco-green">PROJECTS</span>
          </h2>
          <p className="font-body text-base text-white/70 max-w-2xl mx-auto">
            Delivering reliable fuel solutions to major construction, government,
            and commercial projects across Nigeria.
          </p>
        </div>

        {/* Projects Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ashco-green/95 via-ashco-green/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

              {/* Content - Always Visible */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {/* Default View */}
                <div className="group-hover:opacity-0 group-hover:translate-y-4 transition-all duration-300">
                  <h3 className="font-display text-2xl font-bold text-white text-shadow">
                    {project.title}
                  </h3>
                  <p className="font-body text-sm text-white/80">{project.client}</p>
                </div>

                {/* Hover View */}
                <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-white mb-1">
                        {project.title}
                      </h3>
                      <p className="font-body text-sm text-white/80">
                        {project.client}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-ashco-yellow flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-ashco-black" />
                    </div>
                  </div>

                  <p className="font-body text-sm text-white/90 mb-4">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Droplets className="w-4 h-4 text-ashco-yellow" />
                      <span className="font-body text-sm">{project.volume}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <MapPin className="w-4 h-4 text-ashco-yellow" />
                      <span className="font-body text-sm">{project.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-ashco-yellow transition-colors duration-300 rounded-xl pointer-events-none" />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-ashco-yellow text-ashco-yellow font-body font-semibold text-sm uppercase tracking-wide rounded-md hover:bg-ashco-yellow hover:text-ashco-black transition-all duration-300 group">
            View All Projects
            <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
