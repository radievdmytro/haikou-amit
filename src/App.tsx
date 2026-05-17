import React from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValueEvent, useSpring, useMotionValue, animate } from 'framer-motion';
import {
  Globe, MapPin, Building, ShieldCheck, ChevronRight, CheckCircle2,
  Menu, X, ChevronUp, MousePointer2, Briefcase, TrendingUp,
  Users, Award, BarChart3, Layout, Smartphone, ArrowRight, Mail, Hand
} from 'lucide-react';

// --- Core Animation Component ---

const ScrollTypedUrl = ({ progress, url }: { progress: any, url: string }) => {
  const [text, setText] = React.useState("");

  useMotionValueEvent(progress, "change", (latest: number) => {
    const isMobile = window.innerWidth < 1024;
    const start = isMobile ? 0.215 : 0.335;
    const end = isMobile ? 0.395 : 0.5;
    if (latest < start) {
      setText("");
    } else if (latest > end) {
      setText(url);
    } else {
      const p = (latest - start) / (end - start);
      const count = Math.floor(p * url.length);
      setText(url.slice(0, count));
    }
  });

  return <span className="text-charcoal/80">{text}</span>;
};

const BrowserAddressBar = ({ text, isVisible }: { text: string, isVisible: boolean }) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && !isTyping && displayedText === "") {
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isVisible, text, isTyping, displayedText]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-charcoal/80">{displayedText}</span>
      <motion.div
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="w-[1.5px] h-3 bg-gold"
      />
    </div>
  );
};

const AssembledSection = ({ children, id, className = "", stiffness = 120, damping = 30 }: { children: (progress: any, rawProgress: any) => React.ReactNode, id: string, className?: string, stiffness?: number, damping?: number }) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Smooth the scroll progress to cap animation speed during fast scrolls
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness,
    damping,
    restDelta: 0.001
  });

  return (
    <section id={id} ref={ref} className={`relative min-h-screen ${className}`}>
      {children(smoothProgress, scrollYProgress)}
    </section>
  );
};

const AttentionButton = ({ children, onClick, className, style, wrapperClassName = "lg:inline-block lg:w-auto" }: { children: React.ReactNode, onClick: (e: any) => void, className?: string, style?: any, wrapperClassName?: string }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const [phase, setPhase] = React.useState<'idle' | 'shimmer'>('idle');

  React.useEffect(() => {
    if (!isInView) {
      setPhase('idle');
      return;
    }

    let isMounted = true;

    const sequence = async () => {
      // 1s initial wait after becoming visible
      await new Promise(r => setTimeout(r, 1000));
      if (!isInView || !isMounted) return;

      while (isInView && isMounted) {
        // Phase 1: Slow Shimmer (3x slower than before)
        setPhase('shimmer');
        await new Promise(r => setTimeout(r, 2400));
        if (!isInView || !isMounted) break;
        setPhase('idle');

        // Combined wait between cycles
        await new Promise(r => setTimeout(r, 7000));
      }
    };

    sequence();
    return () => { isMounted = false; };
  }, [isInView]);

  return (
    <div ref={ref} className={`relative flex justify-center w-full ${wrapperClassName}`}>
      <button
        onClick={onClick}
        className={`${className} relative overflow-hidden transition-all duration-500 ease-out active:scale-95`}
        style={style}
      >
        {children}

        {/* Slow Shimmer effect */}
        <AnimatePresence>
          {phase === 'shimmer' && (
            <motion.div
              initial={{ x: '-150%', skewX: -20 }}
              animate={{ x: '250%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </button>
    </div>
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

const ScrambleText = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = React.useState(text);

  React.useEffect(() => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const targetArr = text.split('');
    let currentArr = targetArr.map(c => c === ' ' ? ' ' : letters[Math.floor(Math.random() * 26)]);

    const indices = targetArr.map((_, i) => i).filter(i => targetArr[i] !== ' ');
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let resolvedCount = 0;
    setDisplayText(currentArr.join(''));

    const interval = setInterval(() => {
      for (let i = 0; i < currentArr.length; i++) {
        if (currentArr[i] !== targetArr[i] && currentArr[i] !== ' ') {
          currentArr[i] = letters[Math.floor(Math.random() * 26)];
        }
      }

      if (resolvedCount < indices.length) {
        currentArr[indices[resolvedCount]] = targetArr[indices[resolvedCount]];
        resolvedCount++;
      }

      setDisplayText(currentArr.join(''));

      if (resolvedCount >= indices.length) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className={`flex flex-wrap justify-center ${className}`}>
      {displayText.split(' ').map((word, wi) => (
        <div key={wi} className="flex mr-1 last:mr-0">
          {word.split('').map((char, i) => (
            <span
              key={`${wi}-${i}`}
              className="inline-block text-center text-[10px] uppercase tracking-[0.1em] text-gold-dark font-bold group-hover:text-gold transition-colors"
              style={{ minWidth: "0.8em" }}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const InteractiveScrollHint = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [hintTextIndex, setHintTextIndex] = React.useState(0);
  const hintTexts = ["Scroll to Explore", "Click to proceed"];
  const inactivityTimer = React.useRef<number | null>(null);

  const startInactivityTimer = React.useCallback(() => {
    if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(() => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      const contactEl = document.getElementById('contact');
      // Hide only if contact section has scrolled up past 40% of viewport height
      const isContactInView = contactEl ? (contactEl.getBoundingClientRect().top < window.innerHeight * 0.6) : false;
      if (!isAtBottom && !isContactInView) setIsVisible(true);
    }, 2000);
  }, []);

  React.useEffect(() => {
    const handleManualScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
      const contactEl = document.getElementById('contact');
      // Hide only if contact section has scrolled up past 40% of viewport height (0.6 from top)
      const isContactInView = contactEl ? (contactEl.getBoundingClientRect().top < window.innerHeight * 0.6) : false;

      if (isAtBottom || isContactInView) {
        setIsVisible(false);
        return;
      }
      setIsVisible(false);
      startInactivityTimer();
    };

    window.addEventListener('wheel', handleManualScroll, { passive: true });
    window.addEventListener('touchmove', handleManualScroll, { passive: true });
    window.addEventListener('scroll', handleManualScroll, { passive: true });

    const textTimer = setInterval(() => setHintTextIndex(prev => (prev + 1) % hintTexts.length), 4000);

    // Initial check on mount
    handleManualScroll();

    // Initial delay for the very first appearance
    inactivityTimer.current = window.setTimeout(() => {
      const contactEl = document.getElementById('contact');
      const isContactInView = contactEl ? (contactEl.getBoundingClientRect().top < window.innerHeight && contactEl.getBoundingClientRect().bottom > 0) : false;
      if (!isContactInView) setIsVisible(true);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleManualScroll);
      window.removeEventListener('wheel', handleManualScroll);
      window.removeEventListener('touchmove', handleManualScroll);
      clearInterval(textTimer);
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    };
  }, [startInactivityTimer]);

  const handleHintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Programmatic scroll - icon should NOT disappear
    const sections = ['hero', 'about', 'network', 'platform', 'franchise', 'investment', 'certificate', 'contact'];
    const currentScroll = window.scrollY;
    const nextSection = sections.find(id => {
      const el = document.getElementById(id);
      return el && (el.offsetTop > currentScroll + 100);
    });

    let targetPosition = 0;
    let distance = 0;
    const startPosition = window.pageYOffset;

    if (nextSection) {
      const targetEl = document.getElementById(nextSection);
      if (targetEl) {
        targetPosition = targetEl.offsetTop;
        distance = targetPosition - startPosition;
      }
    } else {
      // No more sections? Scroll to footer (bottom of document)
      targetPosition = document.documentElement.scrollHeight;
      distance = targetPosition - window.innerHeight - startPosition;
      // Fade out immediately on final scroll
      setIsVisible(false);
    }

    if (distance !== 0) {
      const duration = 2000;
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          // After final scroll (to footer), make sure hint is gone
          const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
          if (isAtBottom) setIsVisible(false);
        }
      };

      function easeInOutQuad(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
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
          className="fixed right-4 top-1/2 -translate-y-1/2 z-[90] flex flex-col items-center gap-3 cursor-pointer group pointer-events-auto px-4 py-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl w-[80px] lg:w-auto lg:bottom-12 lg:left-1/2 lg:-translate-x-1/2 lg:top-auto lg:right-auto lg:translate-y-0 lg:px-0 lg:py-0 lg:rounded-none lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:shadow-none"
          onClick={handleHintClick}
        >
          {/* Touch-friendly Hand Icon for Mobile, Mouse for Desktop */}
          <div className="lg:block hidden">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-gold/30 flex justify-center p-1.5 group-hover:border-gold transition-colors"
            >
              <motion.div className="w-1 h-2 bg-gold rounded-full" />
            </motion.div>
          </div>
          <div className="lg:hidden block">
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-gold"
            >
              <Hand size={24} />
            </motion.div>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-1" style={{ perspective: "1000px" }}>
            {/* Desktop Scramble Effect */}
            <div className="hidden lg:block">
              <ScrambleText text={hintTexts[hintTextIndex]} />
            </div>

            {/* Mobile Sequence Effect */}
            <div className="block lg:hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hintTextIndex}
                  className="flex flex-wrap items-center justify-center max-w-[80px] gap-x-1"
                >
                  {hintTexts[hintTextIndex].split(' ').map((word, wi) => (
                    <div key={wi} className="flex">
                      {word.split('').map((char, i) => (
                        <motion.span
                          key={`${hintTextIndex}-${wi}-${i}`}
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
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Section Timeline ---

const TIMELINE_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'network', label: 'Network' },
  { id: 'platform', label: 'Platform' },
  { id: 'franchise', label: 'Franchise' },
  { id: 'investment', label: 'Investment' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'contact', label: 'Contact' },
];

const SectionTimeline = () => {
  const [activeIndex, setActiveIndex] = React.useState(() => {
    if (typeof window === 'undefined') return 0;
    const hash = window.location.hash.replace('#', '');
    const idx = TIMELINE_SECTIONS.findIndex(s => s.id === hash);
    return idx !== -1 ? idx : 0;
  });
  const [isReady, setIsReady] = React.useState(false);
  const [fillProgress, setFillProgress] = React.useState<number[]>(
    new Array(TIMELINE_SECTIONS.length - 1).fill(0)
  );
  const [isVisible, setIsVisible] = React.useState(true);
  const inactivityTimer = React.useRef<number | null>(null);
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  // rippleKeys[i] increments on each click to remount the ripple animation
  const [rippleKeys, setRippleKeys] = React.useState<number[]>(
    new Array(TIMELINE_SECTIONS.length).fill(0)
  );
  const [rippleActive, setRippleActive] = React.useState<boolean[]>(
    new Array(TIMELINE_SECTIONS.length).fill(false)
  );

  const show = React.useCallback(() => setIsVisible(true), []);

  const resetInactivityTimer = React.useCallback(() => {
    if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  React.useEffect(() => {
    const getOffsets = () =>
      TIMELINE_SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? el.offsetTop : 0;
      });

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const winH = window.innerHeight;
      const offsets = getOffsets();

      let active = 0;
      for (let i = 0; i < offsets.length; i++) {
        if (scrollY + winH * 0.45 >= offsets[i]) active = i;
      }
      setActiveIndex(active);

      const fills = offsets.slice(0, -1).map((topCurrent, i) => {
        const topNext = offsets[i + 1];
        // Line i fills as the top of section i moves to the top of section i+1
        const raw = (scrollY - topCurrent) / (topNext - topCurrent);
        return Math.min(1, Math.max(0, raw));
      });
      setFillProgress(fills);
      show();
      resetInactivityTimer();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 100) {
        show();
        resetInactivityTimer();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleScroll();

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    resetInactivityTimer();

    // Enable transitions after initial position is set
    requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    };
  }, [show, resetInactivityTimer]);

  // Recurring ripple effect for active dot
  React.useEffect(() => {
    const triggerRipple = () => {
      setRippleKeys(prev => {
        const next = [...prev];
        next[activeIndex] = prev[activeIndex] + 1;
        return next;
      });
      setRippleActive(prev => {
        const next = [...prev];
        next[activeIndex] = true;
        return next;
      });
      setTimeout(() => {
        setRippleActive(prev => {
          const next = [...prev];
          next[activeIndex] = false;
          return next;
        });
      }, 1200);
    };

    const interval = setInterval(triggerRipple, 2100);
    // Trigger immediately when activeIndex changes
    triggerRipple();
    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleItemClick = (i: number, id: string) => {
    // Scroll to section
    const el = document.getElementById(id);
    if (!el) return;
    let targetPosition = el.offsetTop;

    // Apply the same offsets as in main App.scrollToSection
    const isMobileLocal = window.innerWidth < 1024;
    if (isMobileLocal) {
      if (id === 'network') targetPosition += (window.innerHeight * 0.14);
      if (id === 'platform') targetPosition += (window.innerHeight * 0.15);
      if (id === 'investment') targetPosition -= (window.innerHeight * 0.05);
      if (id === 'certificate') targetPosition -= (window.innerHeight * 0.04);
      if (id === 'contact') targetPosition -= (window.innerHeight * 0.06);
    } else {
      // Desktop offsets
      if (id === 'certificate') targetPosition -= (window.innerHeight * 0.08);
      if (id === 'contact') targetPosition -= (window.innerHeight * 0.08);
    }

    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const velocity = 1.2;
    const duration = Math.max(1000, Math.min(2500, Math.abs(distance) / velocity));
    let start: number | null = null;
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const t = currentTime - start;
      const t2 = t / (duration / 2);
      let run: number;
      if (t2 < 1) {
        run = (distance / 2) * t2 * t2 + startPosition;
      } else {
        const t3 = t2 - 1;
        run = (-distance / 2) * (t3 * (t3 - 2) - 1) + startPosition;
      }
      window.scrollTo(0, run);
      if (t < duration) {
        requestAnimationFrame(animation);
      } else {
        window.history.pushState(null, '', `#${id}`);
      }
    };
    window.history.replaceState(null, '', `#${id}`);
    requestAnimationFrame(animation);
  };

  const ITEM_H = 42;
  const TOTAL_H = (TIMELINE_SECTIONS.length - 1) * ITEM_H + 10;
  const GLOW_PAD = 20;
  const WINDOW_H = Math.min(TOTAL_H + GLOW_PAD * 2, window.innerHeight * 0.9);
  const slideY = Math.round(WINDOW_H / 2 - 5 - activeIndex * ITEM_H);

  const getItemOpacity = (i: number) =>
    Math.max(0.06, Math.pow(0.65, Math.abs(i - activeIndex)));

  if (windowWidth < 1028) return null;
  const showLabels = windowWidth >= 1270;

  return (
    <div
      className="fixed z-[80] pointer-events-none"
      style={{
        left: 6,
        top: '50%',
        transform: `translateX(${isVisible ? '0px' : 'calc(-100% - 32px)'}) translateY(-50%)`,
        transition: `transform ${isVisible ? '0.65s cubic-bezier(0.23, 1, 0.32, 1)' : '1.95s cubic-bezier(0.45, 0, 0.55, 1)'}`,
        height: WINDOW_H,
        overflow: 'hidden',
        paddingLeft: 26,
        paddingRight: 16,
        paddingTop: GLOW_PAD,
        paddingBottom: GLOW_PAD,
      }}
    >
      <div
        style={{
          transform: `translateY(${slideY}px)`,
          transition: isReady ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {TIMELINE_SECTIONS.map((section, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          const isHovered = hoveredIndex === i;

          // Line fill: use scroll progress
          const lineFill = fillProgress[i] ?? 0;

          // Label color
          const labelColor = isHovered
            ? '#C9A84C'
            : isActive
              ? '#C9A84C'
              : isPast
                ? 'rgba(201,168,76,0.5)'
                : 'rgba(26,26,26,0.3)';

          return (
            <div
              key={section.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                opacity: isHovered ? Math.max(getItemOpacity(i), 0.85) : getItemOpacity(i),
                transition: 'opacity 0.3s ease',
              }}
            >
              {/* Dot + label */}
              <div
                className="pointer-events-auto cursor-pointer"
                style={{ display: 'flex', alignItems: 'center', gap: 12, height: 10, position: 'relative' }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleItemClick(i, section.id)}
              >
                {/* Dot with ripple container */}
                <div style={{ width: 10, height: 10, flexShrink: 0, position: 'relative' }}>
                  {/* Ripple rings — 3 staggered */}
                  <AnimatePresence>
                    {rippleActive[i] && [0, 1].map((ring) => (
                      <motion.div
                        key={`${rippleKeys[i]}-${ring}`}
                        initial={{ scale: 1, opacity: 0.7 }}
                        animate={{ scale: 5, opacity: 0 }}
                        transition={{
                          duration: 1.0,
                          delay: ring * 0.2,
                          ease: 'easeOut',
                        }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          x: '-50%',
                          y: '-50%',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          border: '1.5px solid #C9A84C',
                          pointerEvents: 'none',
                        }}
                      />
                    ))}
                  </AnimatePresence>

                  {/* The dot itself */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      transition: 'all 0.35s ease',
                      background: isActive || isPast || isHovered ? '#C9A84C' : 'transparent',
                      border: isActive || isPast || isHovered
                        ? '2px solid #C9A84C'
                        : '2px solid rgba(201,168,76,0.35)',
                      transform: isActive ? 'scale(1.5)' : isHovered ? 'scale(1.3)' : 'scale(1)',
                      boxShadow: isActive
                        ? '0 0 10px 3px rgba(201,168,76,0.5)'
                        : isHovered
                          ? '0 0 8px 2px rgba(201,168,76,0.35)'
                          : 'none',
                    }}
                  />
                </div>

                {/* Label */}
                {showLabels && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                      letterSpacing: isActive || isHovered ? '0.28em' : '0.15em',
                      color: labelColor,
                    }}
                  >
                    {section.label}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {i < TIMELINE_SECTIONS.length - 1 && (
                <div
                  style={{
                    marginLeft: 4,
                    width: 2,
                    height: 32,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.12)', borderRadius: 2 }} />
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0,
                      height: '100%',
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, #C9A84C 0%, #F5D68A 100%)',
                      scaleY: lineFill,
                      transformOrigin: 'top',
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- BentBillCanvas: renders a curved paper-arc banknote via 2D canvas strips ---
function BentBillCanvas({ src, phaseOffset }: { src: string; phaseOffset: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animRef   = React.useRef<number>(0);
  const imgRef    = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => { imgRef.current = img; };
    return () => { img.onload = null; };
  }, [src]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W      = 160;
    const H      = Math.round(W / 2.35); // ~68px
    const PAD    = 22;
    const STRIPS = 24;
    const t0     = Date.now();

    canvas.width  = W;
    canvas.height = H + PAD * 2;

    const bendAt = (px: number, t: number) => {
      const p = px / W;  // 0..1
      // Primary arc: U-curve like banana curl — the main visible bend
      const arc     = Math.sin(p * Math.PI) * 14;
      // Secondary: gentle flutter riding on top of the arc
      const flutter = Math.sin(p * Math.PI * 2 + t * 1.5 + phaseOffset) * 3.5;
      // Slow tilt: whole bill rocks slowly
      const tilt    = (p - 0.5) * Math.sin(t * 0.9 + phaseOffset * 0.6) * 5;
      return arc + flutter + tilt;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = imgRef.current;
      if (img) {
        const t      = (Date.now() - t0) / 1000;
        const sw     = img.naturalWidth  / STRIPS;
        const dw     = W / STRIPS;

        for (let s = 0; s < STRIPS; s++) {
          const xL = s * dw;
          const xR = xL + dw;
          const bL = bendAt(xL, t);
          const bR = bendAt(xR, t);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(xL, PAD + bL);
          ctx.lineTo(xR, PAD + bR);
          ctx.lineTo(xR, PAD + bR + H);
          ctx.lineTo(xL, PAD + bL + H);
          ctx.closePath();
          ctx.clip();
          ctx.setTransform(1, (bR - bL) / dw, 0, 1, xL, PAD + bL);
          ctx.drawImage(img, s * sw, 0, sw, img.naturalHeight, 0, 0, dw, H);
          ctx.restore();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [src, phaseOffset]);

  return <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '2px' }} />;
}

// --- Main App ---

export default function App() {
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isPartnershipExpanded, setIsPartnershipExpanded] = React.useState(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [isInContact, setIsInContact] = React.useState(false);
  const [warehouseState, setWarehouseState] = React.useState({ clicks: 0, threshold: 7, showMust: false });
  const [heroState, setHeroState] = React.useState({ clicks: 0, threshold: 2 });
  const [containerDropData, setContainerDropData] = React.useState({ show: false, index: 0, startX: '50%', initRot: -20, endRot: 45 });

  const [franchiseClicks, setFranchiseClicks] = React.useState(0);
  const [fallingBills, setFallingBills] = React.useState<Array<{
    id: number;
    type: 'dollar' | 'dollar_50' | 'dollar_20' | 'euro' | 'euro_50' | 'euro_200' | 'euro_500' | 'yuan' | 'yuan_50' | 'yuan_20';
    startX: string;
    initRot: number;
    swayAmp: number;
    fallDuration: number;
    xFlips: number;   // 0 = flutter only, 1 = one full long-axis flip, 2 = two flips
  }>>([]);
  const billIdCounter = React.useRef(0);

  const handleFranchiseClick = (e: React.MouseEvent) => {
    setFranchiseClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        const types: Array<'dollar' | 'dollar_50' | 'dollar_20' | 'euro' | 'euro_50' | 'euro_200' | 'euro_500' | 'yuan' | 'yuan_50' | 'yuan_20'> = [
          'dollar', 'dollar_50', 'dollar_20',
          'euro', 'euro_50', 'euro_200', 'euro_500',
          'yuan', 'yuan_50', 'yuan_20'
        ];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const startX = `${10 + Math.random() * 80}%`;
        const initRot = Math.floor(Math.random() * 360);
        const swayAmp = 40 + Math.random() * 60;
        const fallDuration = 4 + Math.random() * 3;
        // 40% no flip, 40% one full flip, 20% two flips
        const rng = Math.random();
        const xFlips = rng < 0.4 ? 0 : rng < 0.8 ? 1 : 2;

        const newBill = {
          id: billIdCounter.current++,
          type: randomType,
          startX,
          initRot,
          swayAmp,
          fallDuration,
          xFlips
        };

        setFallingBills(prevBills => [...prevBills, newBill]);
        setTimeout(() => {
          setFallingBills(prevBills => prevBills.filter(b => b.id !== newBill.id));
        }, 8000);
      }
      return next;
    });
  };

  // Contact Form State
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactStatus, setContactStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      return;
    }
    setContactStatus('sending');
    try {
      const response = await fetch("https://formsubmit.co/ajax/ceo@ninhao.shop", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage
        })
      });
      const data = await response.json();
      if (data.success === "true" || response.ok) {
        setContactStatus('success');
        setContactName('');
        setContactEmail('');
        setContactMessage('');
      } else {
        setContactStatus('error');
      }
    } catch (err) {
      setContactStatus('error');
    }
  };

  const triggerContainerDrop = React.useCallback(() => {
    setContainerDropData(prevData => {
      let newIndex = Math.floor(Math.random() * 3) + 1;
      if (newIndex === prevData.index) newIndex = (newIndex % 3) + 1;
      const startX = Math.floor(Math.random() * 70 + 15) + '%';
      const initRot = Math.floor(Math.random() * 180) - 90;
      const endRot = initRot + (Math.floor(Math.random() * 540) + 180) * (Math.random() > 0.5 ? 1 : -1);
      return { show: true, index: newIndex, startX, initRot, endRot };
    });
    setTimeout(() => setContainerDropData(d => ({ ...d, show: false })), 4000);
  }, []);

  const handleHeroBgClick = () => {
    setHeroState(prev => {
      const nextClicks = prev.clicks + 1;
      if (nextClicks >= prev.threshold) {
        triggerContainerDrop();
        return { clicks: 0, threshold: prev.threshold * 2 };
      }
      return { ...prev, clicks: nextClicks };
    });
  };

  React.useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      if (window.scrollY < 50) {
        idleTimer = setTimeout(() => {
          triggerContainerDrop();
          resetTimer();
        }, 60000);
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [triggerContainerDrop]);

  React.useEffect(() => {
    if (warehouseState.showMust) {
      const timer = setTimeout(() => {
        setWarehouseState(prev => ({ ...prev, showMust: false, clicks: 0 }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [warehouseState.showMust]);

  const handleWarehouseClick = () => {
    setWarehouseState(prev => {
      if (prev.showMust) {
        return { ...prev, showMust: false, clicks: 0 };
      }
      const newClicks = prev.clicks + 1;
      if (newClicks >= prev.threshold) {
        return { clicks: 0, threshold: prev.threshold * 2, showMust: true };
      }
      return { ...prev, clicks: newClicks };
    });
  };
  const { scrollY } = useScroll();
  const isMobile = windowWidth < 1024;

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    const unsubScroll = scrollY.onChange(latest => {
      setShowScrollTop(latest > 500);

      // Hide scroll-to-top button in contact section
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        const rect = contactEl.getBoundingClientRect();
        setIsInContact(rect.top < window.innerHeight * 0.6);
      }

      // Only auto-collapse if we've scrolled far away from the platform section
      // to avoid collapsing while the user is looking at it
      const platformEl = document.getElementById('platform');
      if (platformEl) {
        const rect = platformEl.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setIsPartnershipExpanded(false);
        }
      }
    });

    // Handle initial hash scroll
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      // Small delay to ensure everything is mounted and measured
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          let targetPosition = element.offsetTop;

          // Apply same offset logic as in scrollToSection
          const isMobileLocal = window.innerWidth < 1024;
          if (isMobileLocal) {
            if (hash === 'about') targetPosition += (window.innerHeight * 0.05);
            if (hash === 'network') targetPosition += (window.innerHeight * 0.14);
            if (hash === 'platform') targetPosition += (window.innerHeight * 0.15);
            if (hash === 'investment') targetPosition -= (window.innerHeight * 0.05);
            if (hash === 'certificate') targetPosition -= (window.innerHeight * 0.04);
            if (hash === 'contact') targetPosition -= (window.innerHeight * 0.06);
          } else {
            // Desktop offsets
            if (hash === 'about') targetPosition += (window.innerHeight * 0.05);
            if (hash === 'certificate') targetPosition -= (window.innerHeight * 0.08);
            if (hash === 'contact') targetPosition -= (window.innerHeight * 0.08);
          }

          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;

          // Standard velocity logic
          const velocity = 1.2;
          const duration = Math.max(1000, Math.min(2500, Math.abs(distance) / velocity));

          let start: number | null = null;
          const animation = (currentTime: number) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;

            // Re-using the same easing logic locally
            const t = timeElapsed / (duration / 2);
            let run;
            if (t < 1) {
              run = (distance / 2) * t * t + startPosition;
            } else {
              const t2 = t - 1;
              run = (-distance / 2) * (t2 * (t2 - 2) - 1) + startPosition;
            }

            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
          };
          requestAnimationFrame(animation);
        }
      }, 800);
    }

    return () => { window.removeEventListener('resize', handleResize); unsubScroll(); };
  }, [scrollY]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      let targetPosition = element.offsetTop;

      // Mobile offsets for better positioning
      if (isMobile) {
        if (id === 'about') targetPosition += (window.innerHeight * 0.05);
        if (id === 'network') targetPosition += (window.innerHeight * 0.14);
        if (id === 'platform') targetPosition += (window.innerHeight * 0.15);
        if (id === 'investment') targetPosition -= (window.innerHeight * 0.05);
        if (id === 'certificate') targetPosition -= (window.innerHeight * 0.04);
        if (id === 'contact') targetPosition -= (window.innerHeight * 0.06);
      }

      // Desktop offsets
      if (!isMobile) {
        if (id === 'about') targetPosition += (window.innerHeight * 0.05);
        if (id === 'certificate') targetPosition -= (window.innerHeight * 0.08);
        if (id === 'contact') targetPosition -= (window.innerHeight * 0.08);
      }

      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;

      // Constant velocity logic: 
      // Instead of fixed duration, we use duration proportional to distance
      // 1000px distance will take ~1000ms. 
      const velocity = 1.2; // Pixels per millisecond
      const duration = Math.max(1000, Math.min(2500, Math.abs(distance) / velocity));

      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          // Update URL hash without jumping after animation completes
          window.history.pushState(null, '', `#${id}`);
        }
      };

      // Also update hash immediately for better UX
      window.history.replaceState(null, '', `#${id}`);

      function easeInOutQuad(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }
  };

  return (
    <div className="min-h-screen relative selection:bg-gold/30 bg-cream text-charcoal overflow-x-hidden">

      {/* ===== Global Fixed 3D Bills Overlay =====
          position:fixed bypasses ALL overflow:hidden parents,
          so CSS perspective + preserve-3d work correctly. */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9500,
          perspective: '900px',
          perspectiveOrigin: '50% 30%',
        }}
      >
        <AnimatePresence>
          {fallingBills.map(bill => (
            <motion.div
              key={bill.id}
              /* Outer: position + fall + sway */
              initial={{ opacity: 0 }}
              animate={{
                y: [
                  -220,
                  typeof window !== 'undefined' ? window.innerHeight + 220 : 1100
                ],
                x: [
                  0,
                  bill.swayAmp * 0.7,
                  -bill.swayAmp * 0.5,
                  bill.swayAmp * 0.9,
                  -bill.swayAmp * 0.3,
                  bill.swayAmp * 0.4,
                  0
                ],
                opacity: [0, 1, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                y:       { duration: bill.fallDuration, ease: 'linear' },
                x:       { duration: bill.fallDuration, ease: 'easeInOut' },
                opacity: { duration: bill.fallDuration, ease: 'linear', times: [0, 0.06, 0.84, 0.94, 1] }
              }}
              style={{
                position: 'absolute',
                left: bill.startX,
                translateX: '-50%',
              }}
            >
              {/* Inner: 3-axis rotation — CSS 3D perspective on the bent canvas */}
              <motion.div
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                  /* rotateY: main perspective lean — oscillates between ±50° */
                  rotateY: [
                    (bill.initRot % 100) - 30,
                    (bill.initRot % 100) + 40,
                    (bill.initRot % 100) - 50,
                    (bill.initRot % 100) + 20,
                    (bill.initRot % 100) - 10,
                    (bill.initRot % 100) - 30
                  ],
                  /* rotateX: flutter only OR full long-axis flip(s) depending on xFlips */
                  rotateX: bill.xFlips === 0
                    // No flip: natural oscillation (forward/back flutter)
                    ? [0, -18, 12, -25, 8, -14, 0]
                    // With flip(s): oscillate a bit, then spin full 360° per flip, settle
                    : [
                        0,
                        -15,
                        360 * bill.xFlips * 0.35,
                        360 * bill.xFlips * 0.65,
                        360 * bill.xFlips - 10,
                        360 * bill.xFlips
                      ],
                  /* rotateZ: slow orientation drift */
                  rotateZ: [
                    (bill.initRot % 30) - 15,
                    (bill.initRot % 30) - 15 + 8,
                    (bill.initRot % 30) - 15 - 6,
                    (bill.initRot % 30) - 15 + 4,
                    (bill.initRot % 30) - 15
                  ]
                }}
                transition={{
                  rotateY: { duration: bill.fallDuration, ease: 'easeInOut' },
                  rotateX: { duration: bill.fallDuration, ease: 'easeInOut' },
                  rotateZ: { duration: bill.fallDuration, ease: 'easeInOut' }
                }}
              >
                <BentBillCanvas
                  src={`${bill.type}.webp`}
                  phaseOffset={bill.id * 1.7}
                />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-500 backdrop-blur-xl bg-cream/70 border-b border-gold/20">
        <div className="container mx-auto px-6 lg:px-16 xl:px-40 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group/logo"
            onClick={(e) => scrollToSection(e as any, 'hero')}
          >
            <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center transition-transform group-hover/logo:scale-110">
              <div className="w-6 h-6 border border-gold rounded-full" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight leading-none transition-colors group-hover/logo:text-gold">HAIKOU AMIT</div>
              <div className="text-[10px] uppercase tracking-widest text-gold-dark mt-1 font-bold">Import & Export</div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Home</a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">About</a>
            <a href="#network" onClick={(e) => scrollToSection(e, 'network')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Network</a>
            <a href="#platform" onClick={(e) => scrollToSection(e, 'platform')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Platform</a>
            <a href="#franchise" onClick={(e) => scrollToSection(e, 'franchise')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Franchise</a>
            <a href="#investment" onClick={(e) => scrollToSection(e, 'investment')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Investment</a>
            <a href="#certificate" onClick={(e) => scrollToSection(e, 'certificate')} className="hover:text-gold transition-colors uppercase tracking-widest text-[11px] font-bold">Certificate</a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="px-8 py-3 bg-gold text-white rounded-full hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20 text-[11px] uppercase tracking-widest font-bold">Contact Us</a>
          </div>
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      <InteractiveScrollHint />
      <SectionTimeline />

      {/* Hero Section - Assembly/Explosion */}
      <AssembledSection id="hero" className="bg-cream">
        {(progress, raw) => {
          const titleY = useTransform(progress, [0.5, 1], [0, -800], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const titleOpacity = useTransform(progress, [0.5, 0.7], [1, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const badgeOpacity = useTransform(progress, [0.5, 0.7], [1, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const badgeScale = useTransform(progress, [0.5, 0.7], [1, 0.8], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const badgeY = useTransform(progress, [0.5, 1], [0, -800], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const btnLeftX = useTransform(raw, [0.55, 0.95], [0, -windowWidth]);
          const btnRightX = useTransform(raw, [0.55, 0.95], [0, windowWidth]);
          const primaryBtnScale = useTransform(raw, [0.55, 0.95], [1, 0.5]);
          const primaryBtnOpacity = useTransform(raw, [0.55, 0.85], [1, 0]);
          const primaryBtnY = useTransform(raw, [0.55, 0.95], [0, 200]);

          // Background parallax uses RAW progress for perfect sync
          const bgScale = useTransform(raw, [0.1, 1], [1, 1.2]);
          const bgOpacity = useTransform(raw, [0, 0.5, 0.8], [0.2, 0.2, 0]);

          return (
            <div className="relative h-screen flex flex-col items-center justify-start lg:justify-center text-center px-6 pt-32 lg:pt-20 overflow-hidden">
              <motion.div
                style={{ opacity: bgOpacity, scale: bgScale }}
                className="absolute inset-0 z-0 pointer-events-auto"
                onClick={handleHeroBgClick}
              >
                <img src="hero_bg.webp" alt="Map" className="w-full h-full object-cover" />
              </motion.div>

              <AnimatePresence>
                {containerDropData.show && (
                  <motion.img
                    initial={{ y: -800, rotate: containerDropData.initRot }}
                    animate={{
                      y: typeof window !== 'undefined' ? [
                        -800,
                        window.innerHeight - 300,
                        window.innerHeight - 500,
                        window.innerHeight + 800
                      ] : [-800, 700, 500, 1800],
                      rotate: [
                        containerDropData.initRot,
                        containerDropData.initRot + (containerDropData.endRot - containerDropData.initRot) * 0.5,
                        containerDropData.initRot + (containerDropData.endRot - containerDropData.initRot) * 0.7,
                        containerDropData.endRot
                      ]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 4,
                      times: [0, 0.45, 0.65, 1],
                      ease: ["easeIn", "easeOut", "easeIn"]
                    }}
                    src={containerDropData.index === 1 ? "container_3d.webp" : `container_3d_${containerDropData.index}.webp`}
                    className="absolute top-0 z-[100] w-64 lg:w-96 object-contain pointer-events-none"
                    style={{ left: containerDropData.startX, x: '-50%' }}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 max-w-5xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ opacity: badgeOpacity, scale: badgeScale, y: badgeY }}
                  transition={{ duration: 1 }}
                  className="inline-flex items-center px-4 py-1.5 rounded-full border border-gold/20 bg-white/50 mb-3 lg:mb-12"
                >
                  <span className="text-[10px] font-bold tracking-[0.3em] text-[#9A7A2C] uppercase">Hainan Province, China</span>
                </motion.div>

                <motion.h1 style={{ y: titleY, opacity: titleOpacity }} className="text-4xl md:text-7xl font-serif mb-4 lg:mb-12 leading-[1.1] tracking-tight flex flex-col items-center">
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
                          delay: 0.2 + (i * 0.08),
                          ease: [0.215, 0.61, 0.355, 1]
                        }}
                        className="text-[#C9A84C] font-serif font-light inline-block py-2 text-gold-gradient"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                </motion.h1>

                <div className="flex flex-col items-center justify-center gap-4 lg:gap-12 mt-4 lg:mt-16">
                  {/* Primary Call to Action */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ opacity: primaryBtnOpacity, scale: primaryBtnScale, y: primaryBtnY }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="flex flex-col items-center gap-1 lg:gap-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-charcoal/40 font-bold">New to Haikou Amit?</p>
                    <AttentionButton
                      onClick={(e) => scrollToSection(e as any, 'about')}
                      wrapperClassName="lg:w-full lg:max-w-md"
                      className="w-full max-w-md px-16 py-7 bg-gold text-white rounded-full font-bold text-[14px] uppercase tracking-[0.25em] shadow-2xl shadow-gold/20 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 group"
                    >
                      Learn More About Us
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </AttentionButton>
                  </motion.div>

                  {/* Secondary Options */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col items-center gap-4 lg:gap-8 pt-4 lg:pt-8 border-t border-black/5 w-full max-w-md"
                  >
                    <p className="text-[10px] text-charcoal/60 font-medium">Already familiar with us? Explore our opportunities:</p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                      <AttentionButton
                        style={{ x: btnLeftX }}
                        onClick={(e) => scrollToSection(e as any, 'franchise')}
                        className="w-full px-10 py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#C9A84C] transition-all cursor-pointer flex-1 flex items-center justify-center gap-3 group"
                      >
                        Explore Franchise
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </AttentionButton>
                      <AttentionButton
                        style={{ x: btnRightX }}
                        onClick={(e) => scrollToSection(e as any, 'investment')}
                        className="w-full px-8 py-5 bg-white border border-black/10 text-charcoal rounded-full font-bold text-[12px] uppercase tracking-[0.2em] shadow-md hover:border-[#C9A84C] hover:shadow-[0_20px_40px_rgba(201,168,76,0.25)] transition-colors transition-shadow border-transition duration-500 cursor-pointer flex-1 flex items-center justify-center gap-3 group"
                      >
                        Investment Offering
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-500" />
                      </AttentionButton>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* About Section - Assembly */}
      <AssembledSection id="about" className="bg-[#FBFBFB] py-32 overflow-hidden" stiffness={60} damping={40}>
        {(progress, raw) => {
          // Parallax Background uses RAW progress for perfect sync
          const bgY = useTransform(raw, [0, 1], ["-10%", "10%"]);

          const textX = useTransform(progress, [0, isMobile ? 0.3 : 0.45], [windowWidth * 0.8, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgX = useTransform(progress, [0, isMobile ? 0.3 : 0.45], [-windowWidth * 0.4, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgRotateY = useTransform(progress, [0, isMobile ? 0.3 : 0.45], [120, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgBlurRaw = useTransform(progress, [0, isMobile ? 0.2 : 0.35], [10, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgBlur = useTransform(imgBlurRaw, (v) => `blur(${v}px)`);
          const opacity = useTransform(progress, [0, isMobile ? 0.2 : 0.35], [0, 1], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });

          const titleText = "A New Standard in Global Trade";
          const descText = "Haikou Amit Import & Export Trading Co., Ltd. is a licensed, state-registered global trade enterprise.";

          return (
            <div className="relative min-h-screen flex items-center overflow-hidden perspective-1000">
              {/* Parallax Background */}
              <motion.div
                style={{ y: bgY }}
                className="absolute inset-0 z-0 opacity-10"
              >
                <img src="warehouse.webp" loading="lazy" alt="" className="absolute top-0 left-0 w-full h-[120%] object-cover scale-110" />
                <img src="warehouse_must.webp" loading="lazy" alt="" className={`absolute top-0 left-0 w-full h-[120%] object-cover scale-110 transition-opacity duration-1000 ${warehouseState.showMust ? 'opacity-100' : 'opacity-0'}`} />
              </motion.div>

              <div className="container mx-auto px-6 lg:px-16 xl:px-40 relative z-10 flex flex-col lg:flex-row items-center justify-center gap-24 py-32" style={{ perspective: "2000px" }}>
                <TiltCard
                  className="lg:w-1/3 relative"
                  baseRotateY={imgRotateY}
                  baseOpacity={opacity}
                  baseFilter={imgBlur}
                  baseX={imgX}
                >
                  <div
                    className="relative aspect-square w-full"
                    style={{ transformStyle: "preserve-3d" }}
                    onClick={handleWarehouseClick}
                  >
                    <div className="absolute -inset-10 bg-gold/5 blur-3xl rounded-full" />
                    <img
                      src="warehouse.webp"
                      loading="lazy"
                      alt="Warehouse"
                      className="relative z-10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] w-full object-cover aspect-square"
                      style={{ backfaceVisibility: "hidden", aspectRatio: "1 / 1" }}
                    />
                    <img
                      src="warehouse_must.webp"
                      loading="lazy"
                      alt="Warehouse Secret"
                      className={`absolute top-0 left-0 z-20 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] w-full h-full object-cover aspect-square transition-opacity duration-1000 ${warehouseState.showMust ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      style={{ backfaceVisibility: "hidden", aspectRatio: "1 / 1" }}
                    />
                  </div>
                </TiltCard>

                <motion.div style={{ x: textX, opacity }} className="lg:w-1/2 text-left">
                  <span className="text-[#C9A84C] font-bold tracking-[0.3em] uppercase text-[10px] block mb-6">WHO WE ARE</span>
                  <h2 className="text-5xl md:text-6xl font-serif text-[#1A1A1A] mb-8 leading-tight">
                    A New Standard in <br />
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

                  <AttentionButton
                    onClick={(e) => scrollToSection(e as any, 'network')}
                    className="mt-12 px-10 py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#C9A84C] transition-all cursor-pointer flex items-center justify-center gap-3 group mx-auto lg:mx-0"
                  >
                    Explore Network
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </AttentionButton>
                </motion.div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Network Stats - Counters & Map Flip */}
      <AssembledSection id="network" className="bg-[#FAF9F6]">
        {(progress) => {
          const statsX = useTransform(progress, [0.15, isMobile ? 0.3 : 0.45], [-windowWidth * 0.4, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgX = useTransform(progress, [0.15, isMobile ? 0.3 : 0.45], [windowWidth * 0.6, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgRotateY = useTransform(progress, [0.15, isMobile ? 0.3 : 0.45], [-120, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgBlurRaw = useTransform(progress, [0.15, isMobile ? 0.25 : 0.4], [10, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const imgBlur = useTransform(imgBlurRaw, (v) => `blur(${v}px)`);
          const sectionOpacity = useTransform(progress, [0.15, isMobile ? 0.25 : 0.3], [0, 1], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });

          return (
            <motion.div
              style={{ opacity: sectionOpacity, perspective: "2000px" }}
              className="container mx-auto px-6 lg:px-16 xl:px-40 py-40 min-h-screen flex flex-col items-center justify-center"
            >
              {/* Full Width Centered Headline */}
              <div className="text-center mb-12 w-full">
                <span className="text-[#C9A84C] font-bold tracking-[0.4em] uppercase text-[9px] block mb-6">GLOBAL SCALE</span>
                <h2 className="text-4xl md:text-[4rem] font-serif text-charcoal leading-[1.1] tracking-tight">
                  A Pan-European Network
                </h2>
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full" style={{ perspective: "2000px", transformStyle: "preserve-3d" }}>
                <motion.div style={{ x: statsX }} className="lg:w-[40%]">
                  <div className="space-y-4 w-full max-w-md mx-auto lg:mx-0">
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
                          delay: 0.2 + (i * 0.2), // Added delay to sync with section start
                          ease: [0.215, 0.61, 0.355, 1]
                        }}
                        className={`relative overflow-hidden p-5 lg:p-6 rounded-[1.8rem] ${item.bg} shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-black/5 flex flex-col items-start`}
                      >
                        {/* Background Icon Watermark */}
                        <item.icon size={100} className="absolute -right-4 -top-4 text-gold/5" />

                        <div className="flex items-center justify-between w-full mb-3 lg:mb-4">
                          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                            <item.icon size={16} className="text-[#C9A84C]" />
                          </div>
                          <div className="text-sm lg:text-lg font-serif text-charcoal/80 uppercase tracking-widest">{item.title}</div>
                        </div>

                        <div className="flex items-baseline justify-between w-full">
                          <div className="text-3xl font-serif font-bold text-[#C9A84C] leading-none">
                            <Counter value={typeof item.val === 'number' ? item.val : 0} />
                          </div>
                          <div className="text-[7px] lg:text-[8px] uppercase tracking-[0.2em] font-bold text-charcoal/40 ml-4">{item.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <AttentionButton
                    onClick={(e) => scrollToSection(e as any, 'platform')}
                    className="mt-12 px-10 py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#C9A84C] transition-all cursor-pointer flex items-center justify-center gap-3 group mx-auto lg:mx-0"
                  >
                    Explore Platform
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </AttentionButton>
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
                  <div className="relative aspect-[3/2] w-full" style={{ transformStyle: "preserve-3d" }}>
                    <div className="absolute -inset-10 bg-[#C9A84C]/5 rounded-[4rem] blur-3xl" />
                    <img
                      src="office.webp"
                      loading="lazy"
                      alt="Office"
                      className="relative z-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.2)] w-full object-cover aspect-[3/2]"
                      style={{ backfaceVisibility: "hidden", aspectRatio: "3 / 2" }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          );
        }}
      </AssembledSection>

      {/* Trading Platform Section - NEW */}
      <AssembledSection id="platform" className="bg-white" stiffness={60} damping={40}>
        {(progress, raw) => {
          const contentX = useTransform(progress, [0, 0.4], [isMobile ? 0 : windowWidth, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const browserX = useTransform(progress, [0, 0.4], [isMobile ? 0 : -windowWidth, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const placeholderOpacity = useTransform(progress, [0, isMobile ? 0.2 : 0.35, isMobile ? 0.37 : 0.4], [1, 1, 0]);
          const imgOpacity = useTransform(progress, [isMobile ? 0.35 : 0.35, isMobile ? 0.45 : 0.45], [0, 1], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });

          return (
            <div className="container mx-auto px-6 lg:px-16 xl:px-40 py-40 flex flex-col lg:flex-row items-center justify-center gap-24">
              <motion.div style={{ x: contentX }} className="lg:w-1/2 order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="text-[#C9A84C] font-bold tracking-[0.3em] uppercase text-[10px] block mb-6">DIGITAL ECO-SYSTEM</span>
                <h2 className="text-5xl md:text-[4.5rem] font-serif text-charcoal mb-4 lg:mb-8 leading-tight">
                  Our Proprietary <br />
                  <span className="text-[#C9A84C] italic block mt-2">Trading Platform</span>
                </h2>

                {/* Mobile-only Image position (between Title and Description) */}
                <div className="w-full mb-6 lg:hidden">
                  <motion.div
                    style={{ x: browserX }}
                    className="relative cursor-pointer group/browser"
                    onClick={() => window.open('https://ninhao.shop', '_blank')}
                  >
                    <div className="bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden transition-transform duration-500">
                      <div className="bg-[#F5F5F5] px-4 py-3 flex items-center gap-4 border-b border-black/5">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                        </div>
                        <div className="flex-1 bg-white rounded-lg py-1.5 px-3 text-[10px] text-charcoal/80 font-medium overflow-hidden">
                          <div className="flex items-center gap-1">
                            <ScrollTypedUrl progress={raw} url="ninhao.shop" />
                            <motion.div
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-[1.5px] h-3 bg-gold"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="relative overflow-hidden bg-white aspect-[1264/848] w-full">
                        <motion.div style={{ opacity: imgOpacity }}>
                          <img src="site.webp" loading="lazy" alt="Platform" className="w-full h-auto block" style={{ aspectRatio: "1264 / 848" }} />
                        </motion.div>
                        <motion.div
                          style={{ opacity: placeholderOpacity }}
                          className="absolute inset-0 bg-[#FBFBFB] flex items-center justify-center"
                        >
                          <div className="w-8 h-8 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <p className="text-lg text-mid mb-6 lg:mb-12 leading-relaxed max-w-lg">
                  Connect directly with our global supply chain through our advanced digital marketplace.
                </p>

                <div className="flex flex-col items-center lg:items-start gap-6 lg:gap-10 mt-4 lg:mt-0">
                  <div className="h-[80px] flex items-center justify-center lg:justify-start w-full lg:w-auto relative">
                    {/* State 1: Start Partnership */}
                    <div
                      className={`transition-all duration-500 absolute inset-0 flex items-center justify-center lg:justify-start ${!isPartnershipExpanded ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                    >
                      <button
                        onClick={() => setIsPartnershipExpanded(true)}
                        className="px-16 py-7 bg-gold text-white rounded-full font-bold text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-gold/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-3 group min-w-[320px] justify-center"
                      >
                        Start Partnership
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* State 2: Choice */}
                    <div
                      className={`transition-all duration-500 delay-100 absolute inset-0 flex items-center justify-center lg:justify-start ${isPartnershipExpanded ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center w-full sm:w-auto justify-center lg:justify-start">
                        <AttentionButton
                          onClick={(e) => scrollToSection(e as any, 'franchise')}
                          className="px-16 py-2 sm:py-7 bg-gold text-white rounded-full font-bold text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-gold/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-3 group min-w-[320px] justify-center whitespace-nowrap"
                        >
                          Explore Franchise
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </AttentionButton>
                        <AttentionButton
                          onClick={(e) => scrollToSection(e as any, 'investment')}
                          className="px-16 py-2 sm:py-7 bg-gold text-white rounded-full font-bold text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-gold/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-3 group min-w-[320px] justify-center whitespace-nowrap"
                        >
                          Investment Offering
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </AttentionButton>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.open('https://ninhao.shop', '_blank')}
                    className="group flex items-center gap-4 px-8 py-4 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A] text-charcoal hover:text-white border border-black/5 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all duration-500 lg:ml-4"
                  >
                    Visit ninhao.shop
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
                  </button>
                </div>
              </motion.div>

              {/* Desktop-only Image position (on the side) */}
              <motion.div
                style={{ x: browserX }}
                className="hidden lg:block lg:w-1/2 relative order-2 lg:order-1"
              >
                <div
                  className="cursor-pointer group/browser"
                  onClick={() => window.open('https://ninhao.shop', '_blank')}
                >
                  <div className="bg-white rounded-2xl shadow-[0_50px_100px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden transition-all duration-500 group-hover/browser:scale-[1.02] group-hover/browser:shadow-[0_60px_120px_rgba(0,0,0,0.15)]">
                    <div className="bg-[#F5F5F5] px-6 py-4 flex items-center gap-6 border-b border-black/5">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                      </div>
                      <div className="flex-1 max-w-xl bg-white rounded-lg py-2 px-4 text-xs md:text-sm text-charcoal/80 font-medium flex items-center gap-2 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <ScrollTypedUrl progress={raw} url="ninhao.shop" />
                          <motion.div
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-[2px] h-4 bg-gold"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden bg-white aspect-[1264/848] w-full">
                      <motion.div style={{ opacity: imgOpacity }}>
                        <img
                          src="site.webp"
                          loading="lazy"
                          alt="Platform"
                          className="w-full h-auto block"
                          style={{ aspectRatio: "1264 / 848" }}
                        />
                      </motion.div>
                      <motion.div
                        style={{ opacity: placeholderOpacity }}
                        className="absolute inset-0 bg-[#FBFBFB] flex items-center justify-center"
                      >
                        <div className="w-12 h-12 border-2 border-gold/10 border-t-gold rounded-full animate-spin" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        }}
      </AssembledSection>

      <AssembledSection id="franchise" className="bg-[#FAF9F6] relative overflow-hidden" stiffness={60} damping={40}>
        {(progress, raw) => {
          const titleY = useTransform(progress, [0, 0.2], [50, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const titleOpacity = useTransform(progress, [0, 0.2], [0, 1], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });

          return (
            <div className="relative w-full h-full min-h-screen">
              {/* Clickable Background Layer (Easter Egg Trigger) */}
              <div 
                className="absolute inset-0 z-0 cursor-default pointer-events-auto" 
                onClick={handleFranchiseClick}
              />

              <div className="container mx-auto px-6 lg:px-16 xl:px-40 py-20 lg:py-40 flex flex-col items-center relative z-10 pointer-events-none">
                <div className="w-full flex flex-col items-center pointer-events-auto">
                  <motion.div style={{ y: titleY, opacity: titleOpacity }} className="text-center mb-4 lg:mb-24">
                    <span className="text-[#C9A84C] font-bold tracking-[0.4em] uppercase text-[10px] block mb-3 lg:mb-6">FRANCHISE NETWORK</span>
                    <h2 className="text-5xl md:text-7xl font-serif text-charcoal mb-4">Own a Piece of the Future</h2>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl pointer-events-auto">
                  {[
                    {
                      type: "National Master",
                      price: "€100,000",
                      sub: "Full country package",
                      features: ["300 branch offices included", "Exclusive territorial rights", "Full brand license"],
                      premium: true,
                      delay: 0
                    },
                    {
                      type: "City Package",
                      price: "€57,000",
                      sub: "Per city · 150 sets",
                      features: ["150 complete branch sets", "City-exclusive territory", "Operational framework"],
                      delay: 0.1
                    },
                    {
                      type: "District Package",
                      price: "€30,000",
                      sub: "75 branches",
                      features: ["75 branch offices", "District-level exclusivity", "Flexible partner support"],
                      delay: 0.2
                    }
                  ].map((pkg, i) => {
                    const cardY = useTransform(progress, [0.1 + (i * 0.05), 0.4 + (i * 0.05)], [100, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
                    const cardRotate = useTransform(progress, [0.1 + (i * 0.05), 0.4 + (i * 0.05)], [10, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
                    const cardOpacity = useTransform(progress, [0.1 + (i * 0.05), 0.3 + (i * 0.05)], [0, 1], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });

                    return (
                      <motion.div
                        key={i}
                        style={{ y: cardY, opacity: cardOpacity, rotateX: cardRotate }}
                        className={`relative p-10 rounded-[2.5rem] flex flex-col shadow-2xl ${pkg.premium
                          ? "bg-[#1A1A1A] text-white scale-105 z-10 shadow-black/20"
                          : "bg-white text-charcoal border border-black/5"
                          }`}
                      >
                        {pkg.premium && (
                          <div className="absolute top-6 right-6 px-4 py-1.5 bg-[#C9A84C] text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                            PREMIUM
                          </div>
                        )}

                        <div className="mb-8">
                          <h3 className={`text-xl font-serif mb-6 ${pkg.premium ? "text-white" : "text-charcoal"}`}>{pkg.type}</h3>
                          <div className={`text-5xl font-serif font-bold mb-2 ${pkg.premium ? "text-[#C9A84C]" : "text-[#C9A84C]"}`}>{pkg.price}</div>
                          <div className={`text-sm opacity-60 font-medium`}>{pkg.sub}</div>
                        </div>

                        <div className="space-y-5 mb-12 flex-1">
                          {pkg.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-sm font-medium">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${pkg.premium ? "border-[#C9A84C]/30" : "border-[#C9A84C]/20"
                                }`}>
                                <CheckCircle2 size={12} className="text-[#C9A84C]" />
                              </div>
                              <span className={pkg.premium ? "text-white/80" : "text-charcoal/70"}>{feat}</span>
                            </div>
                          ))}
                        </div>

                        <AttentionButton
                          onClick={(e) => scrollToSection(e as any, 'contact')}
                          className={`w-full py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center ${pkg.premium
                            ? "bg-[#C9A84C] text-white hover:bg-[#B3933C] shadow-lg shadow-gold/20"
                            : "bg-[#F5F5F5] text-charcoal hover:bg-[#EAEAEA]"
                            }`}>
                          INQUIRE NOW
                        </AttentionButton>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Investment Section - 3D Cards */}
      <AssembledSection id="investment" className="bg-charcoal text-white" stiffness={60} damping={40}>
        {(progress, raw) => {
          const cardY = useTransform(progress, [0.05, isMobile ? 0.22 : 0.4], [100, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const cardOpacity = useTransform(progress, [0.05, isMobile ? 0.4 : 0.4], [0, 1], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          const textX = useTransform(progress, [0.05, isMobile ? 0.42 : 0.4], [-50, 0], { ease: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 });
          return (
            <div className="relative min-h-screen flex items-center bg-[#1A1A1A] overflow-hidden">
              <img src="port_constanta.webp" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-5 mix-blend-luminosity" alt="Port" />

              <div className="container mx-auto px-6 lg:px-16 xl:px-40 relative z-10 flex flex-col lg:flex-row items-center justify-center gap-20 max-w-6xl">
                {/* Left Side: Text */}
                <motion.div style={{ x: textX, opacity: cardOpacity }} className="lg:w-1/2 text-left">
                  <span className="text-[#C9A84C] font-bold tracking-[0.4em] uppercase text-[9px] block mb-8">EQUITY INVESTMENT</span>
                  <h2 className="text-6xl md:text-[5.5rem] font-serif text-white mb-8 leading-[1.1]">
                    Strategic <br />
                    <span className="text-[#C9A84C] italic">Post-Launch</span> <br />
                    Opportunity
                  </h2>
                  <p className="text-lg text-white/50 leading-relaxed max-w-md font-medium">
                    Follow our expansion at Port Constanța and become a strategic partner in the pan-European corridor.
                  </p>
                </motion.div>

                {/* Right Side: Offering Details Card */}
                <motion.div
                  style={{ y: cardY, opacity: cardOpacity }}
                  className="lg:w-[440px] w-full"
                >
                  <div className="bg-[#242424] p-10 rounded-[3.5rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
                    <h3 className="text-2xl font-serif text-white text-center mb-10 opacity-90">Offering Details</h3>

                    <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5">
                      <div>
                        <div className="text-[9px] tracking-[0.2em] font-bold text-[#C9A84C] uppercase mb-4">Total Share Sale</div>
                        <div className="text-5xl font-serif text-white font-bold tracking-tight">11%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] tracking-[0.2em] font-bold text-white/20 uppercase mb-4">Availability</div>
                        <div className="text-xs font-bold text-white/80 uppercase tracking-widest">Post-Launch</div>
                      </div>
                    </div>

                    <div className="bg-[#D4B55F] p-7 rounded-[2rem] mb-10">
                      <div className="text-[9px] tracking-[0.2em] font-bold text-black/30 uppercase mb-2">Price per 1%</div>
                      <div className="text-4xl font-serif text-charcoal font-bold flex items-baseline">
                        <span className="text-2xl mr-1">¥</span>
                        <Counter value={8000000} />
                      </div>
                    </div>

                    <AttentionButton
                      onClick={(e) => scrollToSection(e as any, 'contact')}
                      className="w-auto px-12 py-5 bg-white text-charcoal rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-[#C9A84C] hover:text-white transition-all shadow-xl block mx-auto flex items-center justify-center"
                    >
                      REGISTER INTEREST
                    </AttentionButton>
                  </div>
                </motion.div>
              </div>
            </div>
          );
        }}
      </AssembledSection>

      <AssembledSection id="certificate" className="bg-white" stiffness={60} damping={40}>
        {(progress) => <CertificateSectionContent progress={progress} />}
      </AssembledSection>



      {/* Contact Section - Side Assembly */}
      <AssembledSection id="contact" className="bg-[#1A1A1A] text-white" stiffness={60} damping={40}>
        {(progress, raw) => {
          const leftX = useTransform(progress, [0.05, 0.3], [-windowWidth, 0], { ease: t => t * (2 - t) });
          const rightX = useTransform(progress, [0.05, 0.3], [windowWidth, 0], { ease: t => t * (2 - t) });
          const opacity = useTransform(progress, [0.05, 0.25], [0, 1], { ease: t => t * (2 - t) });

          return (
            <div className="container mx-auto px-6 lg:px-16 xl:px-40 py-4 lg:pt-20 flex flex-col lg:flex-row gap-4 lg:gap-24 items-center lg:items-start justify-center min-h-screen">
              <motion.div style={{ x: leftX, opacity }} className="lg:w-[40%] text-left">
                <span className="text-[#C9A84C] font-bold tracking-[0.3em] uppercase text-[11px] block mb-2">DIRECT INQUIRY</span>
                <h2 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
                  Start Your Journey
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-5 items-center">
                    <div className="w-12 h-12 rounded-full border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-[#C9A84C]" size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-0.5">Head Office</h3>
                      <p className="text-white/40 text-base font-normal">Hainan Province, China</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-center">
                    <div className="w-12 h-12 rounded-full border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="text-[#C9A84C]" size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-0.5">Legal Rep</h3>
                      <p className="text-white/40 text-base font-normal uppercase tracking-wide">OLEKSII MANKOV</p>
                    </div>
                  </div>

                  <div className="flex gap-5 items-center">
                    <div className="w-12 h-12 rounded-full border border-[#C9A84C]/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="text-[#C9A84C]" size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-0.5">Email Us</h3>
                      <p className="text-white/40 text-base font-normal">ceo@ninhao.shop</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div style={{ x: rightX, opacity }} className="lg:w-[500px] w-full max-w-[500px] -mt-[11px] lg:mt-0">
                <div className="bg-[#242424] p-10 md:p-14 rounded-[3.5rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.4)] min-h-[440px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {contactStatus === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center space-y-5"
                      >
                        <div className="w-20 h-20 rounded-full border-2 border-[#C9A84C] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(201,168,76,0.3)]">
                          <ShieldCheck className="text-[#C9A84C] animate-bounce" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Thank You!</h3>
                        <p className="text-white/60 text-sm max-w-[280px] mx-auto font-light leading-relaxed">
                          Your inquiry has been sent successfully. We will get back to you shortly.
                        </p>
                        <button
                          onClick={() => setContactStatus('idle')}
                          className="text-[10px] text-[#C9A84C] uppercase tracking-widest font-bold border border-[#C9A84C]/20 rounded-full px-6 py-2.5 hover:bg-[#C9A84C]/5 hover:border-[#C9A84C] transition-all mt-4 cursor-pointer"
                        >
                          Send Another Message
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4 w-full"
                        onSubmit={handleContactSubmit}
                      >
                        <div>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="NAME"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors uppercase text-[11px] font-bold tracking-widest"
                          />
                        </div>

                        <div>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="EMAIL"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors uppercase text-[11px] font-bold tracking-widest"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={4}
                            required
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="YOUR MESSAGE"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors resize-none uppercase text-[11px] font-bold tracking-widest"
                          />
                        </div>

                        {contactStatus === 'error' && (
                          <p className="text-red-400 text-[10px] text-center font-bold tracking-wider uppercase">
                            Something went wrong. Please try again or email ceo@ninhao.shop directly.
                          </p>
                        )}

                        <motion.button
                          disabled={contactStatus === 'sending'}
                          animate={contactStatus !== 'sending' ? {
                            boxShadow: [
                              "0 0 0 0px rgba(201, 168, 76, 0)",
                              "0 0 20px 2px rgba(201, 168, 76, 0.3)",
                              "0 0 0 0px rgba(201, 168, 76, 0)"
                            ],
                            scale: [1, 1.02, 1]
                          } : {}}
                          whileHover={contactStatus !== 'sending' ? {
                            boxShadow: "0 0 50px 15px rgba(255, 215, 0, 0.5), 0 0 20px 5px rgba(201, 168, 76, 0.8)",
                            scale: 1.03
                          } : {}}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-full py-6 bg-[#C9A84C] text-charcoal font-bold uppercase tracking-[0.3em] text-[11px] rounded-[2rem] transition-all duration-500 shadow-xl shadow-gold/10 mt-4 relative overflow-hidden group/btn cursor-pointer flex items-center justify-center disabled:opacity-50"
                        >
                          <span className="relative z-10">{contactStatus === 'sending' ? 'Sending Inquiry...' : 'Send Inquiry'}</span>
                          {/* Internal shimmering light sweep */}
                          {contactStatus !== 'sending' && (
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                            />
                          )}
                        </motion.button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          );
        }}
      </AssembledSection>

      {/* Footer & Overlays */}
      <footer className="bg-cream py-12 border-t border-gold/10">
        <div className="container mx-auto px-6 lg:px-16 xl:px-40 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 font-bold text-sm tracking-tight"><div className="w-6 h-6 border border-gold rounded-full" />HAIKOU AMIT</div>
          <div className="text-[9px] uppercase tracking-widest font-bold text-mid opacity-60">© 2026 Haikou Amit Import and Export Trading Co., Ltd.</div>
        </div>
      </footer>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-cream flex flex-col p-8"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="self-end p-2 text-charcoal hover:text-gold transition-all duration-300"
            >
              <X size={32} />
            </button>
            <div className="flex-1 flex flex-col items-center justify-center gap-6 text-2xl font-serif text-charcoal">
              {[
                { name: 'Home', id: 'hero' },
                { name: 'About', id: 'about' },
                { name: 'Network', id: 'network' },
                { name: 'Platform', id: 'platform' },
                { name: 'Franchise', id: 'franchise' },
                { name: 'Investment', id: 'investment' },
                { name: 'Certificate', id: 'certificate' }
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    scrollToSection(e as any, item.id);
                  }}
                  className="hover:text-gold transition-colors py-2"
                >
                  {item.name}
                </a>
              ))}
              <button
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  scrollToSection(e as any, 'contact');
                }}
                className="mt-8 px-16 py-5 bg-gold text-white rounded-full font-bold text-lg uppercase tracking-widest shadow-xl shadow-gold/20 active:scale-95 transition-all duration-300"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && !isInContact && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 bg-gold text-white rounded-full flex items-center justify-center shadow-2xl"
          >
            <ChevronUp size={28} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

const CertificateSectionContent = ({ progress }: { progress: any }) => {
  const [isCertHovered, setIsCertHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const hoverShift = useMotionValue(0);

  // Mouse position for tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 100, damping: 30 });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 100, damping: 30 });

  React.useEffect(() => {
    animate(hoverShift, (isCertHovered || isClicked) ? 1 : 0, {
      type: "spring",
      stiffness: 150,
      damping: 25
    });

    if (!isCertHovered) {
      animate(mouseX, 0);
      animate(mouseY, 0);
    }
  }, [isCertHovered, isClicked]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };


  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const baseRotateY = useTransform(progress, [0.32, 0.42], [180, 0]);
  const flipRotateY = useTransform([baseRotateY, hoverShift, tiltY], ([base, h, ty]) => {
    const baseVal = (base as number) * (1 - (h as number));
    // Apply tilt only when front is visible (baseVal near 0)
    const tiltAmount = (h === 1 || base === 0) ? (ty as number) : 0;
    return baseVal + tiltAmount;
  });

  const finalRotateX = useTransform([baseRotateY, hoverShift, tiltX], ([base, h, tx]) => {
    return (h === 1 || base === 0) ? (tx as number) : 0;
  });

  const cardX = useTransform(progress, [0.1, 0.4], [-100, 0], { ease: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t });
  const cardOpacity = useTransform(progress, [0.1, 0.4], [0, 1], { ease: t => t * (2 - t) });

  return (
    <div className="container mx-auto px-6 lg:px-16 xl:px-40 pt-10 pb-0 flex flex-col items-center">
      {/* Centered Headline */}
      <div className="text-center mb-2">
        <h2 className="text-4xl md:text-5xl font-serif text-charcoal opacity-90">Official Certification</h2>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-16 w-full max-w-6xl">
        {/* Left Side: Info Card */}
        <motion.div
          style={{ x: cardX, opacity: cardOpacity }}
          className="lg:w-1/2 w-full flex justify-center lg:justify-end lg:mt-[60px]"
        >
          <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-black/[0.03] w-full max-w-[528px]">
            <div className="space-y-8">
              <div>
                <div className="text-[9px] tracking-[0.2em] font-extrabold text-charcoal/30 uppercase mb-2">Company Name</div>
                <div className="text-[1.75rem] font-serif text-charcoal leading-tight">Haikou Amit Trading Co., Ltd.</div>
              </div>

              <div>
                <div className="text-[9px] tracking-[0.2em] font-extrabold text-charcoal/30 uppercase mb-2">Legal Representative</div>
                <div className="text-xl font-sans text-charcoal/80 tracking-wide font-medium">OLEKSII MANKOV</div>
              </div>

              <div>
                <div className="text-[9px] tracking-[0.2em] font-extrabold text-charcoal/30 uppercase mb-2">Social Credit Code</div>
                <div className="text-2xl font-mono text-[#D4B55F] font-bold tracking-widest">91460000MAG09U613J</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: 3D Flip Card */}
        <div
          className="lg:w-1/2 flex justify-center perspective-2000 h-[400px] items-start w-full cursor-pointer relative z-10 pointer-events-auto"
          onMouseEnter={() => setIsCertHovered(true)}
          onMouseLeave={() => setIsCertHovered(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsClicked(!isClicked)}
        >
          <motion.div
            style={{
              rotateY: flipRotateY,
              rotateX: finalRotateX,
              transformStyle: "preserve-3d"
            }}
            className="relative w-full max-w-[528px] aspect-[1.58/1] -mt-[52px] lg:mt-[52px]"
          >
            {/* Front Face (Certificate Image) */}
            <div className="absolute inset-0 backface-hidden z-10 [transform:rotateY(0deg)]">
              <img src="cert.webp" loading="lazy" className="w-full h-full object-cover rounded-[1.5rem] shadow-2xl border-[6px] border-white" alt="Cert" style={{ aspectRatio: "1.58 / 1" }} />
            </div>

            {/* Back Face (Golden Jacket) */}
            <div
              className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] z-0 rounded-[1.5rem] flex items-center justify-center border border-white/40 overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #9A7A2C 0%, #F5D68A 50%, #9A7A2C 100%)',
              }}
            >
              {/* Dynamic Shimmer Overlay */}
              <motion.div
                style={{
                  left: useTransform(progress, [0.32, 0.47], ["-100%", "200%"]),
                }}
                className="absolute inset-0 z-10 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] blur-xl"
              />

              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-16 border-2 border-charcoal/20 rounded-lg mb-6 flex items-center justify-center p-2">
                  <div className="w-full h-full grid grid-cols-2 gap-1">
                    {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-1 bg-charcoal/20 rounded-full" />)}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-charcoal/80 tracking-[0.3em] uppercase">
                  Certificate
                </div>
                <div className="w-12 h-[1px] bg-charcoal/20 mt-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const TiltCard = ({
  children,
  className = "",
  onClick,
  baseRotateY = 0,
  baseRotateX = 0,
  baseOpacity = 1,
  baseFilter = "none",
  baseX = 0
}: {
  children: React.ReactNode,
  className?: string,
  onClick?: () => void,
  baseRotateY?: any,
  baseRotateX?: any,
  baseOpacity?: any,
  baseFilter?: any,
  baseX?: any
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const fallbackZero = useMotionValue(0);

  const actualBaseRotateY = (baseRotateY && typeof baseRotateY !== 'number') ? baseRotateY : fallbackZero;
  const actualBaseRotateX = (baseRotateX && typeof baseRotateX !== 'number') ? baseRotateX : fallbackZero;

  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 100, damping: 30 });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    animate(mouseX, 0);
    animate(mouseY, 0);
  };

  const combinedRotateY = useTransform([actualBaseRotateY, tiltY], ([base, t]) => {
    const b = typeof baseRotateY === 'number' ? baseRotateY : (base as number);
    return b + (t as number);
  });

  const combinedRotateX = useTransform([actualBaseRotateX, tiltX], ([base, t]) => {
    const b = typeof baseRotateX === 'number' ? baseRotateX : (base as number);
    return b + (t as number);
  });

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: combinedRotateX,
        rotateY: combinedRotateY,
        opacity: baseOpacity,
        filter: baseFilter,
        x: baseX,
        transformStyle: "preserve-3d"
      }}
      className={`perspective-1000 ${className}`}
    >
      {children}
    </motion.div>
  );
};
