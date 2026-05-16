import React from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  Globe, MapPin, Building, ShieldCheck, ChevronRight, CheckCircle2, 
  Menu, X, ChevronUp, MousePointer2, Briefcase, TrendingUp, 
  Users, Award, BarChart3, Layout, Smartphone
} from 'lucide-react';

// --- Core Animation Component ---

const AssembledSection = ({ children, id, className = "" }: { children: (progress: any) => React.ReactNode, id: string, className?: string }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return (
    <section id={id} ref={ref} className={`relative min-h-screen ${className}`}>
      {children(scrollYProgress)}
    </section>
  );
};

const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// --- Sub-components ---

const InteractiveScrollHint = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [hintTextIndex, setHintTextIndex] = React.useState(0);
  const hintTexts = ["Scroll to Explore", "Click to proceed"];
  const inactivityTimer = React.useRef<number | null>(null);

  const startInactivityTimer = React.useCallback(() => {
    if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 2000);
  }, []);

  React.useEffect(() => {
    const handleManualScroll = () => {
      setIsVisible(false);
      startInactivityTimer();
    };

    window.addEventListener('wheel', handleManualScroll, { passive: true });
    window.addEventListener('touchmove', handleManualScroll, { passive: true });
    
    const textTimer = setInterval(() => setHintTextIndex(prev => (prev + 1) % hintTexts.length), 4000);
    
    // Initial delay for the very first appearance
    inactivityTimer.current = window.setTimeout(() => setIsVisible(true), 5000);

    return () => { 
      window.removeEventListener('wheel', handleManualScroll);
      window.removeEventListener('touchmove', handleManualScroll);
      clearInterval(textTimer); 
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    };
  }, [startInactivityTimer]);

  const handleHintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Programmatic scroll - icon should NOT disappear
    const sections = ['about', 'network', 'platform', 'contact'];
    const currentScroll = window.scrollY;
    const nextSection = sections.find(id => {
      const el = document.getElementById(id);
      return el && (el.offsetTop > currentScroll + 50);
    });
    
    if (nextSection) {
      const targetEl = document.getElementById(nextSection);
      if (targetEl) {
        window.scrollTo({
          top: targetEl.offsetTop,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: isVisible ? 1 : 0.5, 
            ease: "easeInOut" 
          }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center gap-3 cursor-pointer group pointer-events-auto"
          onClick={handleHintClick}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-gold/30 flex justify-center p-1.5 group-hover:border-gold transition-colors"
          >
            <motion.div className="w-1 h-2 bg-gold rounded-full" />
          </motion.div>
          <div className="flex items-center justify-center gap-[1px]" style={{ perspective: "1000px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={hintTextIndex} className="flex items-center justify-center">
                {hintTexts[hintTextIndex].split('').map((char, i) => (
                  <motion.span
                    key={`${hintTextIndex}-${i}`}
                    initial={{ opacity: 0, rotateX: -90, y: 10 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: 90, y: -10 }}
                    transition={{ duration: 0.5, delay: i * 0.03, ease: [0.23, 1, 0.32, 1] }}
                    className={`inline-block ${char === ' ' ? 'w-2' : ''} text-[10px] uppercase tracking-[0.1em] text-gold-dark font-bold group-hover:text-gold transition-colors`}
                    style={{ transformOrigin: "center center", backfaceVisibility: "hidden" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const { scrollY } = useScroll();
  const isMobile = windowWidth < 1024;

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    const unsubScroll = scrollY.onChange(latest => setShowScrollTop(latest > 500));
    return () => { window.removeEventListener('resize', handleResize); unsubScroll(); };
  }, [scrollY]);

  return (
    <div className="min-h-screen relative selection:bg-gold/30 bg-cream text-charcoal overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-500 backdrop-blur-xl bg-cream/70 border-b border-gold/20">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
              <div className="w-6 h-6 border border-gold rounded-full" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none">HAIKOU AMIT</div>
              <div className="text-[10px] uppercase tracking-widest text-gold-dark mt-1 font-bold">Import & Export</div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">About</a>
            <a href="#network" className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Network</a>
            <a href="#platform" className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Platform</a>
            <a href="#franchise" className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Franchise</a>
            <a href="#investment" className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Investment</a>
            <a href="#certificate" className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Certificate</a>
            <a href="#contact" className="px-8 py-3 bg-gold text-white rounded-full hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20 text-[11px] uppercase tracking-widest font-bold">Contact Us</a>
          </div>
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      <InteractiveScrollHint />

      {/* Hero Section - Assembly/Explosion */}
      <AssembledSection id="hero" className="bg-cream">
        {(progress) => {
          const titleY = useTransform(progress, [0.5, 1], [0, -800]);
          const titleOpacity = useTransform(progress, [0.5, 0.7], [1, 0]);
          const badgeOpacity = useTransform(progress, [0.5, 0.7], [1, 0]);
          const badgeScale = useTransform(progress, [0.5, 0.7], [1, 0.8]);
          const badgeY = useTransform(progress, [0.5, 1], [0, -800]);
          const btnLeftX = useTransform(progress, [0.5, 0.8], [0, -windowWidth]);
          const btnRightX = useTransform(progress, [0.5, 0.8], [0, windowWidth]);
          const bgScale = useTransform(progress, [0.5, 1], [1, 1.2]);
          const bgOpacity = useTransform(progress, [0, 0.5, 0.8], [0.1, 0.1, 0]);

          return (
            <div className="relative h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
              <motion.div style={{ opacity: bgOpacity, scale: bgScale }} className="absolute inset-0 z-0">
                <img src="hero_bg.png" alt="Map" className="w-full h-full object-cover" />
              </motion.div>
              
              <div className="relative z-10 max-w-5xl">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ opacity: badgeOpacity, scale: badgeScale, y: badgeY }}
                  transition={{ duration: 1 }}
                  className="inline-flex items-center px-6 py-2 rounded-full border border-gold/20 bg-white/50 mb-12"
                >
                  <span className="text-[10px] font-bold tracking-[0.3em] text-[#9A7A2C] uppercase">Hainan Province, China</span>
                </motion.div>
                
                <motion.h1 style={{ y: titleY, opacity: titleOpacity }} className="text-5xl md:text-7xl font-serif mb-12 leading-[1.2] tracking-tight flex flex-col items-center">
                  <div className="flex flex-wrap justify-center mb-2 pb-2">
                    {"Global Logistics".split(" ").map((word, i) => (
                      <span key={i} className="inline-block mr-4">
                        {word.split("").map((char, j) => (
                          <motion.span
                            key={j}
                            initial={{ opacity: 0, letterSpacing: "1em", x: 20 }}
                            animate={{ opacity: 1, letterSpacing: "normal", x: 0 }}
                            transition={{ 
                              duration: 0.8, 
                              delay: 0.2 + (i * 0.2) + (j * 0.05),
                              ease: [0.215, 0.61, 0.355, 1]
                            }}
                            className="inline-block text-[#1A1A1A] py-2"
                          >
                            {char}
                          </motion.span>
                        ))}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-center pb-2">
                    {"Excellence".split("").map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, letterSpacing: "1em", x: 20 }}
                        animate={{ opacity: 1, letterSpacing: "normal", x: 0 }}
                        transition={{ 
                          duration: 1, 
                          delay: 1.2 + (i * 0.08),
                          ease: [0.215, 0.61, 0.355, 1]
                        }}
                        className="text-[#C9A84C] font-serif font-light inline-block py-2 text-gold-gradient"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                </motion.h1>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    style={{ x: btnLeftX }}
                    className="px-12 py-6 bg-[#1A1A1A] text-white rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-gold transition-colors"
                  >
                    Explore Franchise
                  </motion.button>
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    style={{ x: btnRightX }}
                    className="px-12 py-6 bg-white border border-black/5 text-charcoal rounded-[2rem] font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:border-gold transition-colors"
                  >
                    Investment Offering
                  </motion.button>
                </div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* About Section - Assembly */}
      <AssembledSection id="about" className="bg-[#FBFBFB] overflow-hidden">
        {(progress) => {
          const bgY = useTransform(progress, [0, 1], ["-10%", "10%"]);
          const textX = useTransform(progress, [0, 0.45], [windowWidth * 0.8, 0]);
          const imgX = useTransform(progress, [0, 0.45], [-windowWidth * 0.4, 0]);
          const imgRotateY = useTransform(progress, [0, 0.45], [120, 0]);
          const imgBlurRaw = useTransform(progress, [0, 0.35], [10, 0]);
          const imgBlur = useTransform(imgBlurRaw, (v) => `blur(${v}px)`);
          const opacity = useTransform(progress, [0, 0.35], [0, 1]);

          const titleText = "A New Standard in Global Trade";
          const descText = "Haikou Amit Import & Export Trading Co., Ltd. is a licensed, state-registered global trade enterprise.";

          return (
            <div className="relative min-h-screen flex items-center overflow-hidden perspective-1000">
              {/* Parallax Background */}
              <motion.div 
                style={{ y: bgY }}
                className="absolute inset-0 z-0 opacity-10"
              >
                <img src="warehouse.png" alt="" className="w-full h-[120%] object-cover scale-110" />
              </motion.div>

              <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-24 py-32" style={{ perspective: "2000px" }}>
                <motion.div 
                  style={{ 
                    x: imgX, 
                    rotateY: imgRotateY, 
                    opacity,
                    filter: imgBlur,
                    transformStyle: "preserve-3d" 
                  }} 
                  className="lg:w-1/2 relative"
                >
                  <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute -inset-10 bg-gold/5 blur-3xl rounded-full" />
                    <img 
                      src="warehouse.png" 
                      alt="Warehouse" 
                      className="relative z-10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] w-full object-cover aspect-square" 
                      style={{ backfaceVisibility: "hidden" }}
                    />
                  </div>
                </motion.div>
                
                <motion.div style={{ x: textX, opacity }} className="lg:w-1/2 text-left">
                  <span className="text-[#C9A84C] font-bold tracking-[0.3em] uppercase text-[10px] block mb-6">WHO WE ARE</span>
                  <h2 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] mb-8 leading-tight">
                    A New Standard in <br/>
                    <span className="text-[#C9A84C] italic block mt-2">Global Trade</span>
                  </h2>
                  <p className="text-lg text-mid mb-10 leading-relaxed max-w-lg">
                    {descText}
                  </p>
                  
                  <div className="space-y-5">
                    {[
                      "State-licensed & fully certified operation",
                      "Premium branch offices with standardized fit-out",
                      "End-to-end China → Europe supply chain"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm font-medium text-charcoal/80">
                        <div className="w-5 h-5 rounded-full border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={12} className="text-[#C9A84C]" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Network Stats - Counters & Map Flip */}
      <AssembledSection id="network" className="bg-[#FAF9F6]">
        {(progress) => {
          const statsX = useTransform(progress, [0, 0.35], [-windowWidth * 0.4, 0]);
          const imgX = useTransform(progress, [0, 0.35], [windowWidth * 0.6, 0]);
          const imgRotateY = useTransform(progress, [0, 0.35], [-120, 0]);
          const imgBlurRaw = useTransform(progress, [0, 0.35], [10, 0]);
          const imgBlur = useTransform(imgBlurRaw, (v) => `blur(${v}px)`);

          return (
            <div className="container mx-auto px-6 py-40 min-h-screen flex items-center" style={{ perspective: "2000px" }}>
              <div className="flex flex-col lg:flex-row items-start gap-24 w-full" style={{ perspective: "2000px", transformStyle: "preserve-3d" }}>
                <motion.div style={{ x: statsX }} className="lg:w-[48%]">
                  <div>
                    <span className="text-[#C9A84C] font-bold tracking-[0.4em] uppercase text-[9px] block mb-6">GLOBAL SCALE</span>
                    <h2 className="text-5xl md:text-[5rem] font-serif text-charcoal mb-8 leading-[1.1] tracking-tight">
                      A Pan-European <br/>Network
                    </h2>
                  </div>
                  
                  <div className="space-y-4 w-full max-w-md">
                    {[
                      { icon: Globe, title: "Coverage", val: 27, label: "COUNTRIES", bg: "bg-white" },
                      { icon: Building, title: "Presence", val: 7500, label: "FRANCHISE UNITS", bg: "bg-[#F3EDE2]", featured: true, comma: true },
                      { icon: TrendingUp, title: "Density", val: 300, label: "BRANCHES/COUNTRY", bg: "bg-white" }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -100 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ 
                          duration: 0.8, 
                          delay: i * 0.2, 
                          ease: [0.215, 0.61, 0.355, 1] 
                        }}
                        className={`relative overflow-hidden p-6 rounded-[1.8rem] ${item.bg} shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-black/5 flex flex-col items-start`}
                      >
                        {/* Background Icon Watermark */}
                        <item.icon size={100} className="absolute -right-4 -top-4 text-gold/5" />
                        
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                          <item.icon size={16} className="text-[#C9A84C]" />
                        </div>
                        
                        <div className="text-lg font-serif text-charcoal/80 mb-4">{item.title}</div>
                        
                        <div>
                          <div className="text-3xl font-serif font-bold text-[#C9A84C] leading-none mb-1">
                            <Counter value={typeof item.val === 'number' ? item.val : 0} />
                          </div>
                          <div className="text-[8px] uppercase tracking-[0.2em] font-bold text-charcoal/40">{item.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  style={{ 
                    x: imgX, 
                    rotateY: imgRotateY,
                    filter: imgBlur,
                    transformStyle: "preserve-3d"
                  }} 
                  className="lg:w-[52%] relative"
                >
                  <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute -inset-10 bg-[#C9A84C]/5 rounded-[4rem] blur-3xl" />
                    <img 
                      src="office_vert.jpg" 
                      alt="Office" 
                      className="relative z-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] w-full object-cover aspect-[4/5]" 
                      style={{ backfaceVisibility: "hidden" }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Trading Platform Section - NEW */}
      <AssembledSection id="platform" className="bg-white">
        {(progress) => {
          const contentX = useTransform(progress, [0, 0.4], [windowWidth, 0]);
          const browserX = useTransform(progress, [0, 0.4], [-windowWidth, 0]);

          return (
            <div className="container mx-auto px-6 py-40 flex flex-col lg:flex-row items-center gap-24">
              <motion.div style={{ x: browserX }} className="lg:w-1/2 relative">
                {/* Browser Frame Mockup */}
                <div className="bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden">
                  <div className="bg-[#F5F5F5] px-4 py-3 flex items-center gap-4 border-b border-black/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="flex-1 max-w-md bg-white rounded-md py-1 px-3 text-[10px] text-charcoal/40 font-medium">
                      ninhaomaniya.shop
                    </div>
                  </div>
                  <div className="relative overflow-hidden bg-white">
                    <img 
                      src="site.png" 
                      alt="Platform" 
                      className="w-full h-auto block" 
                      style={{ aspectRatio: "1264 / 848" }}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div style={{ x: contentX }} className="lg:w-1/2">
                <span className="text-[#C9A84C] font-bold tracking-[0.3em] uppercase text-[10px] block mb-6">DIGITAL ECO-SYSTEM</span>
                <h2 className="text-5xl md:text-[4.5rem] font-serif text-charcoal mb-8 leading-tight">
                  Our Proprietary <br/>
                  <span className="text-[#C9A84C] italic block mt-2">Trading Platform</span>
                </h2>
                <p className="text-lg text-mid mb-12 leading-relaxed max-w-lg">
                  Connect directly with our global supply chain through our advanced digital marketplace.
                </p>
                <button className="group flex items-center gap-4 px-10 py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-[#C9A84C] transition-all shadow-2xl">
                  Visit ninhaomaniya.shop
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Investment Section - 3D Cards */}
      <AssembledSection id="investment" className="bg-charcoal text-white">
        {(progress) => {
          return (
            <div className="relative h-full flex items-center justify-center py-40">
              <img src="port_constanta.png" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" alt="Port" />
              <div className="container relative z-10 px-6 max-w-5xl text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 bg-gold/10 mb-8 text-gold text-xs font-bold uppercase tracking-widest">Offering Details</span>
                <h2 className="text-5xl md:text-8xl font-serif mb-12 leading-none">11% Equity <span className="text-gold italic">Available</span></h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {[
                    { label: "Share Offering", val: "11%", sub: "Total Equity", d: 0.1 },
                    { label: "Price Per 1%", val: "¥5M", sub: "≈ $805k USD", d: 0.2, highlight: true },
                    { label: "Total Raise", val: "¥55M", sub: "≈ $8.86M USD", d: 0.3 }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 100, rotateX: 60 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: item.d, type: 'spring', duration: 1.2 }}
                      className={`p-10 rounded-3xl border backdrop-blur-md ${item.highlight ? 'bg-gold text-charcoal border-gold shadow-2xl shadow-gold/40' : 'bg-white/5 border-white/10'}`}
                    >
                      <div className="text-[10px] tracking-widest uppercase mb-6 font-bold opacity-70">{item.label}</div>
                      <div className="text-5xl font-serif font-bold mb-2">{item.val}</div>
                      <div className="text-xs opacity-60 font-bold">{item.sub}</div>
                    </motion.div>
                  ))}
                </div>
                <button className="px-12 py-6 bg-gold text-white rounded-full font-bold uppercase tracking-[0.2em] text-sm shadow-2xl shadow-gold/30 hover:scale-105 transition-all">
                  Register Interest
                </button>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Certificate Section - 3D Flip */}
      <AssembledSection id="certificate" className="bg-cream">
        {(progress) => {
          const flipRotateY = useTransform(progress, [isMobile ? 0.33 : 0.35, isMobile ? 0.47 : 0.55], [180, 0]);

          return (
            <div className="container mx-auto px-6 py-40 flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-1/2">
                <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs block mb-4">Verification</span>
                <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-8 leading-tight">Officially Registered Excellence</h2>
                <div className="bg-white/60 p-10 rounded-3xl border border-gold/10 shadow-xl max-w-lg">
                  <div className="flex items-center gap-4 mb-6 text-gold"><Award size={32} /><h3 className="text-xl font-bold text-charcoal">Licensed Entity</h3></div>
                  <p className="text-mid font-medium mb-6 leading-relaxed">Haikou Amit Import and Export Trading Co., Ltd. operates under unified international logistics standards.</p>
                  <div className="font-mono text-xs bg-gold/10 px-4 py-2 rounded text-gold-dark inline-block font-bold tracking-widest">CODE: 91460000MAG09U613J</div>
                </div>
              </div>

              <div className="lg:w-1/2 flex justify-center perspective-1000 h-[600px] items-center w-full">
                <motion.div style={{ rotateY: flipRotateY, transformStyle: "preserve-3d" }} className="relative w-full max-w-[400px] h-[560px]">
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden z-10 rotate-y-0">
                    <img src="cert.JPG" className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white" alt="Cert" />
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 z-0 bg-gradient-to-br from-gold-dark via-gold to-gold-dark rounded-2xl flex items-center justify-center p-12 border-4 border-white/20">
                    <div className="w-full h-full border border-white/30 rounded-xl flex flex-col items-center justify-center text-white/90">
                      <Award size={80} strokeWidth={1} className="mb-6 opacity-50" />
                      <div className="text-2xl font-serif font-bold uppercase tracking-widest">Haikou Amit</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Contact Section - Side Assembly */}
      <AssembledSection id="contact" className="bg-charcoal text-white">
        {(progress) => {
          const leftX = useTransform(progress, [0.1, 0.4], [-windowWidth, 0]);
          const rightX = useTransform(progress, [0.1, 0.4], [windowWidth, 0]);
          const opacity = useTransform(progress, [0.1, 0.3], [0, 1]);

          return (
            <div className="container mx-auto px-6 py-40 flex flex-col lg:flex-row gap-12 items-center">
              <motion.div style={{ x: leftX, opacity }} className="lg:w-1/2">
                <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Connect With Us</h2>
                <div className="space-y-8">
                  <div className="flex gap-6"><MapPin className="text-gold" size={32} /><div><h3 className="text-xl font-bold mb-2">Location</h3><p className="opacity-60">Hainan Province, Haikou City</p></div></div>
                  <div className="flex gap-6"><Briefcase className="text-gold" size={32} /><div><h3 className="text-xl font-bold mb-2">Business</h3><p className="opacity-60">Registration: 91460000MAG09U613J</p></div></div>
                </div>
              </motion.div>
              <motion.div style={{ x: rightX, opacity }} className="lg:w-1/2 bg-white/5 border border-white/10 p-12 rounded-3xl w-full">
                <button className="w-full py-6 bg-gold text-white rounded-full font-bold uppercase tracking-[0.3em] text-sm shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all">Inquire Now</button>
              </motion.div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Footer & Overlays */}
      <footer className="bg-cream py-12 border-t border-gold/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 font-bold text-sm tracking-tight"><div className="w-6 h-6 border border-gold rounded-full" />HAIKOU AMIT</div>
          <div className="text-[9px] uppercase tracking-widest font-bold text-mid opacity-60">© 2026 Haikou Amit Import and Export Trading Co., Ltd.</div>
        </div>
      </footer>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[100] bg-cream flex flex-col p-8">
            <button onClick={() => setIsMobileMenuOpen(false)} className="self-end p-2"><X size={32} /></button>
            <div className="flex-1 flex flex-col items-center justify-center gap-8 text-3xl font-serif">
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="#network" onClick={() => setIsMobileMenuOpen(false)}>Network</a>
              <a href="#franchise" onClick={() => setIsMobileMenuOpen(false)}>Franchise</a>
              <button className="mt-8 px-12 py-4 bg-gold text-white rounded-full font-bold text-xl">Contact Us</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-gold text-white rounded-full flex items-center justify-center shadow-2xl"><ChevronUp size={28} /></motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
