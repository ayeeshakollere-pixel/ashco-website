import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    service: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      content:
        '02 Otunba Kayode Oke Close, Off Udo Udoma Street, Cadastral Zone AO4, Asokoro District, Abuja, FCT.',
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '0905 5000 086',
      href: 'tel:09055000086',
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'ashcoenergyltd@gmail.com',
      href: 'mailto:ashcoenergyltd@gmail.com',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      content: '24/7 Service Available',
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

      // Form animation
      gsap.fromTo(
        formRef.current,
        { opacity: 0, rotateY: 30 },
        {
          opacity: 1,
          rotateY: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Info cards animation
      gsap.fromTo(
        infoRef.current?.children || [],
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formState.name.trim() || !formState.phone.trim() || !formState.message.trim()) {
        throw new Error('Please fill in your name, phone number and message.');
      }

      const refId = `ASH-MSG-${Date.now().toString().slice(-6)}`;
      const lines = [
        `*New enquiry — Ashco Energy*`,
        `Reference: ${refId}`,
        `Name: ${formState.name}`,
        formState.email ? `Email: ${formState.email}` : '',
        `Phone: ${formState.phone}`,
        formState.service ? `Interested in: ${formState.service}` : '',
        `Message: ${formState.message}`,
      ].filter(Boolean);

      const waUrl = `https://wa.me/2349055000086?text=${encodeURIComponent(lines.join('\n'))}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setReferenceId(refId);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', phone: '', message: '', service: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please call us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
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

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">
        {/* Header */}
        <div ref={headingRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-0.5 bg-ashco-yellow" />
            <span className="font-body text-sm font-semibold text-ashco-green uppercase tracking-wider">
              Get In Touch
            </span>
            <div className="w-8 h-0.5 bg-ashco-yellow" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ashco-black mb-4 leading-[1.05]">
            CONTACT <span className="text-ashco-green">US</span>
          </h2>
          <p className="font-body text-base text-gray-600 max-w-2xl mx-auto">
            Need high-grade diesel? We got you! Reach out to us for all your
            fuel supply needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div ref={infoRef} className="lg:col-span-2 space-y-4">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-xl bg-white hover:bg-ashco-green transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-lg bg-ashco-green/10 group-hover:bg-ashco-yellow/20 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                  <info.icon className="w-5 h-5 text-ashco-green group-hover:text-ashco-yellow transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ashco-black group-hover:text-white mb-1 transition-colors duration-300">
                    {info.title}
                  </h3>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="font-body text-sm text-gray-600 group-hover:text-white/80 hover:underline transition-colors duration-300"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className="font-body text-sm text-gray-600 group-hover:text-white/80 transition-colors duration-300">
                      {info.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div
            ref={formRef}
            className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-6 lg:p-8"
            style={{ perspective: '1000px' }}
          >
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-ashco-green/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-ashco-green" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ashco-black mb-2">
                  Message Sent!
                </h3>
                <p className="font-body text-sm text-gray-600 mb-3">
                  We'll get back to you within 24 hours.
                </p>
                {referenceId && (
                  <div className="inline-flex items-center gap-2 bg-ashco-green/10 text-ashco-green text-xs font-body font-semibold px-4 py-2 rounded-full">
                    Reference: {referenceId}
                  </div>
                )}
                <button
                  onClick={() => { setIsSubmitted(false); setReferenceId(null); }}
                  className="mt-6 font-body text-sm text-ashco-green underline hover:text-ashco-green-dark"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-body text-sm font-medium text-ashco-black">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name" name="name" value={formState.name} onChange={handleChange}
                      placeholder="John Doe" required
                      className="font-body border-gray-200 focus:border-ashco-green focus:ring-ashco-green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body text-sm font-medium text-ashco-black">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email" name="email" type="email" value={formState.email} onChange={handleChange}
                      placeholder="john@example.com" required
                      className="font-body border-gray-200 focus:border-ashco-green focus:ring-ashco-green/20"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-body text-sm font-medium text-ashco-black">
                      Phone Number
                    </Label>
                    <Input
                      id="phone" name="phone" type="tel" value={formState.phone} onChange={handleChange}
                      placeholder="+234 905 5000 086"
                      className="font-body border-gray-200 focus:border-ashco-green focus:ring-ashco-green/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service" className="font-body text-sm font-medium text-ashco-black">
                      Service of Interest
                    </Label>
                    <select
                      id="service" name="service" value={formState.service} onChange={(e) => setFormState(prev => ({ ...prev, service: e.target.value }))}
                      className="font-body w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-ashco-green focus:ring-2 focus:ring-ashco-green/20"
                    >
                      <option value="">Select a service...</option>
                      <option>Bulk Diesel Supply</option>
                      <option>POL Distribution</option>
                      <option>Storage Solutions</option>
                      <option>Logistics Services</option>
                      <option>Fuel Consulting</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-body text-sm font-medium text-ashco-black">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message" name="message" value={formState.message} onChange={handleChange}
                    placeholder="Tell us about your fuel requirements, volume, and location..." required rows={5}
                    className="font-body border-gray-200 focus:border-ashco-green focus:ring-ashco-green/20 resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-body">
                    <span className="mt-0.5">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-ashco-green text-white hover:bg-ashco-green-dark font-body font-semibold text-base py-6 transition-all duration-300 hover:shadow-glow-green group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <p className="font-body text-xs text-gray-400 text-center">
                  Your message is sent straight to our team on WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
