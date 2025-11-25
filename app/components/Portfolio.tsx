import { useState, useEffect, useRef, useCallback } from "react";

// Ripple type
interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

// Interactive grid component with trail effect
function InteractiveGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cols = 28;
  const rows = 18;
  const totalCells = cols * rows;
  const chars = ["·", "•", "○", "◉", "●"];

  // Store activation levels for each cell (0 to 1)
  const [activations, setActivations] = useState<number[]>(
    Array.from({ length: totalCells }, () => 0)
  );
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Ripple[]>([]);
  const animationRef = useRef<number | null>(null);

  // Update mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePosRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle click for ripple effect
  const handleClick = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create a new ripple
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(rect.width, rect.height),
        opacity: 1,
      });
    }
  };

  // Animation loop for trail effect
  useEffect(() => {
    const decay = 0.92; // How fast the trail fades (lower = faster fade)
    const maxDistance = 150;
    const rippleSpeed = 12; // How fast ripples expand
    const rippleWidth = 60; // Width of the ripple ring
    const rippleFade = 0.02; // How fast ripples fade out

    const animate = () => {
      if (!containerRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const cellWidth = rect.width / cols;
      const cellHeight = rect.height / rows;
      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      // Update ripples - expand and fade
      ripplesRef.current = ripplesRef.current
        .map((ripple) => ({
          ...ripple,
          radius: ripple.radius + rippleSpeed,
          opacity: ripple.opacity - rippleFade,
        }))
        .filter(
          (ripple) => ripple.opacity > 0 && ripple.radius < ripple.maxRadius
        );

      setActivations((prev) => {
        const next = [...prev];

        for (let i = 0; i < totalCells; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);

          const cellX = col * cellWidth + cellWidth / 2;
          const cellY = row * cellHeight + cellHeight / 2;

          const distance = Math.sqrt(
            Math.pow(mouseX - cellX, 2) + Math.pow(mouseY - cellY, 2)
          );

          // Calculate new activation from mouse proximity
          const mouseActivation = Math.max(0, 1 - distance / maxDistance);

          // Calculate ripple activation
          let rippleActivation = 0;
          for (const ripple of ripplesRef.current) {
            const distToCenter = Math.sqrt(
              Math.pow(ripple.x - cellX, 2) + Math.pow(ripple.y - cellY, 2)
            );
            // Activate cells that are near the ripple ring edge
            const distFromRing = Math.abs(distToCenter - ripple.radius);
            if (distFromRing < rippleWidth) {
              const ringActivation =
                (1 - distFromRing / rippleWidth) * ripple.opacity;
              rippleActivation = Math.max(rippleActivation, ringActivation);
            }
          }

          // Keep the higher value between decayed previous, mouse activation, and ripple
          next[i] = Math.max(
            prev[i] * decay,
            mouseActivation,
            rippleActivation
          );
        }

        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalCells]);

  const getCharAndStyle = useCallback(
    (index: number) => {
      const activation = activations[index];
      const charIndex = Math.floor(activation * (chars.length - 1));
      const opacity = 0.12 + activation * 0.88;
      const scale = 1 + activation * 0.8;

      return {
        char: chars[Math.max(0, charIndex)],
        opacity,
        scale,
      };
    },
    [activations]
  );

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className='absolute right-0 top-1/2 -translate-y-1/2 w-[50vw] h-[70vh] select-none cursor-crosshair overflow-hidden'
    >
      <div
        className='w-full h-full grid text-white'
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: totalCells }).map((_, i) => {
          const { char, opacity, scale } = getCharAndStyle(i);

          return (
            <span
              key={i}
              className='flex items-center justify-center text-base md:text-lg'
              style={{
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const projects = [
  {
    id: "01",
    title: "VOID",
    category: "Brand Identity",
    year: "2024",
    description:
      "A complete rebrand for a luxury fashion house, focusing on minimalist aesthetics and timeless elegance.",
  },
  {
    id: "02",
    title: "RESONANCE",
    category: "Digital Experience",
    year: "2024",
    description:
      "An immersive web experience for a contemporary art museum, blending art and technology.",
  },
  {
    id: "03",
    title: "APEX",
    category: "Editorial Design",
    year: "2023",
    description:
      "Art direction and design for a biannual architecture publication celebrating brutalist structures.",
  },
  {
    id: "04",
    title: "SILENT",
    category: "Motion Design",
    year: "2023",
    description:
      "A series of abstract motion pieces exploring the relationship between sound and visual form.",
  },
  {
    id: "05",
    title: "FORM",
    category: "Typography",
    year: "2023",
    description:
      "Custom typeface design for a Berlin-based creative agency, balancing geometry and warmth.",
  },
];

export function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className='grain min-h-screen font-mono'>
      {/* Navigation */}
      <nav className='fixed top-0 left-0 right-0 z-50 mix-blend-difference'>
        <div className='flex justify-between items-center px-6 md:px-12 py-6'>
          <a
            href='#'
            className={`text-[10px] tracking-[0.4em] uppercase text-white animate-initial ${loaded ? "animate-fade-in" : ""}`}
          >
            A.CHEN
          </a>
          <div
            className={`flex gap-8 animate-initial ${loaded ? "animate-fade-in delay-200" : ""}`}
          >
            <a
              href='#work'
              className='text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors hover-line'
            >
              Work
            </a>
            <a
              href='#about'
              className='text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors hover-line'
            >
              About
            </a>
            <a
              href='#contact'
              className='text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors hover-line'
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 relative overflow-hidden'>
        <InteractiveGrid />
        <div className='max-w-[1800px] mx-auto pointer-events-none w-full relative z-10'>
          <div className='overflow-hidden'>
            <p
              className={`text-[10px] tracking-[0.4em] text-white/30 mb-8 animate-initial ${loaded ? "animate-fade-up" : ""}`}
            >
              CREATIVE DIRECTOR & DESIGNER
            </p>
          </div>

          <div className='overflow-hidden'>
            <h1
              className={`text-[15vw] md:text-[12vw] leading-[0.9] font-bold tracking-[-0.02em] animate-initial ${loaded ? "animate-fade-up delay-100" : ""}`}
            >
              CRAFT
            </h1>
          </div>

          <div className='overflow-hidden flex items-baseline gap-4 md:gap-8'>
            <h1
              className={`font-serif text-[15vw] md:text-[12vw] leading-[0.9] italic tracking-[-0.02em] animate-initial ${loaded ? "animate-fade-up delay-200" : ""}`}
            >
              visual
            </h1>
            <span
              className={`text-[10px] tracking-[0.3em] text-white/30 hidden md:block animate-initial ${loaded ? "animate-fade-in delay-400" : ""}`}
            >
              SINCE//2018
            </span>
          </div>

          <div className='overflow-hidden'>
            <h1
              className={`text-[15vw] md:text-[12vw] leading-[0.9] font-bold tracking-[-0.02em] text-stroke animate-initial ${loaded ? "animate-fade-up delay-300" : ""}`}
            >
              POETRY
            </h1>
          </div>

          <div
            className={`mt-16 md:mt-24 flex justify-between items-end animate-initial ${loaded ? "animate-fade-up delay-500" : ""}`}
          >
            <p className='text-xs md:text-sm max-w-sm leading-[1.8] text-white/50 tracking-wide'>
              Multidisciplinary designer based in Tokyo—specializing in brand
              identity, digital experiences, and editorial design.
            </p>
            <div className='hidden md:block text-right'>
              <p className='text-[10px] tracking-[0.3em] text-white/20 mb-3'>
                [SCROLL]
              </p>
              <div className='w-px h-20 bg-white/10 ml-auto'>
                <div className='w-px h-10 bg-white/60 animate-pulse' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className='py-8 border-y border-white/10'>
        <div className='max-w-[1800px] mx-auto px-6 md:px-12'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {[
              { label: "PROJECTS", value: "47+" },
              { label: "CLIENTS", value: "32" },
              { label: "AWARDS", value: "12" },
              { label: "YEARS", value: "08" },
            ].map((stat) => (
              <div key={stat.label} className='text-center md:text-left'>
                <p className='text-[10px] tracking-[0.3em] text-white/30 mb-2'>
                  {stat.label}
                </p>
                <p className='text-3xl md:text-4xl font-bold'>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id='work' className='py-32 md:py-48 px-6 md:px-12'>
        <div className='max-w-[1800px] mx-auto'>
          <div className='flex items-end justify-between mb-16 md:mb-24'>
            <div>
              <p className='text-[10px] tracking-[0.4em] text-white/30 mb-4'>
                [001]
              </p>
              <h2 className='text-5xl md:text-7xl font-bold tracking-tight'>
                SELECTED
                <br />
                <span className='font-serif italic font-normal'>Works</span>
              </h2>
            </div>
            <p className='text-[10px] tracking-[0.2em] text-white/30 hidden md:block'>
              2023—2024
            </p>
          </div>

          <div className='space-y-0'>
            {projects.map((project) => (
              <div
                key={project.id}
                className='group border-t border-white/10 py-6 md:py-10 cursor-pointer'
                onMouseEnter={() => setActiveProject(project.id)}
                onMouseLeave={() => setActiveProject(null)}
              >
                <div className='flex items-start md:items-center justify-between gap-4 flex-col md:flex-row'>
                  <div className='flex items-baseline gap-6 md:gap-12'>
                    <span className='text-[10px] text-white/20 tabular-nums'>
                      {project.id}
                    </span>
                    <h3
                      className={`text-3xl md:text-6xl font-bold tracking-tight transition-all duration-300 ${activeProject === project.id ? "translate-x-2 md:translate-x-4" : ""}`}
                    >
                      {project.title}
                    </h3>
                  </div>
                  <div className='flex items-center gap-6 md:gap-12'>
                    <span className='text-[10px] tracking-[0.2em] uppercase text-white/30'>
                      {project.category}
                    </span>
                    <span className='text-[10px] text-white/20 tabular-nums'>
                      {project.year}
                    </span>
                    <span
                      className={`text-lg transition-all duration-300 ${activeProject === project.id ? "translate-x-1 opacity-100" : "opacity-20"}`}
                    >
                      →
                    </span>
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-400 ${activeProject === project.id ? "max-h-20 opacity-100 mt-4" : "max-h-0 opacity-0"}`}
                >
                  <p className='text-xs text-white/40 max-w-lg pl-12 md:pl-20 leading-relaxed'>
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-16 flex justify-center'>
            <a
              href='#'
              className='text-[10px] tracking-[0.3em] uppercase border border-white/20 px-10 py-5 hover:bg-white hover:text-black transition-all duration-300'
            >
              VIEW ARCHIVE
            </a>
          </div>
        </div>
      </section>

      {/* Large Statement */}
      <section className='py-20 md:py-32 overflow-hidden border-y border-white/10'>
        <div className='flex items-center'>
          <h2 className='text-[18vw] md:text-[12vw] font-bold leading-none tracking-tighter whitespace-nowrap animate-marquee'>
            <span className='text-stroke-thick'>LESS</span>
            <span className='mx-4 md:mx-8 font-serif italic font-normal'>
              is
            </span>
            <span className='text-stroke-thick'>MORE</span>
            <span className='mx-8 md:mx-16 text-white/10'>✦</span>
            <span className='text-stroke-thick'>LESS</span>
            <span className='mx-4 md:mx-8 font-serif italic font-normal'>
              is
            </span>
            <span className='text-stroke-thick'>MORE</span>
            <span className='mx-8 md:mx-16 text-white/10'>✦</span>
          </h2>
        </div>
      </section>

      {/* About Section */}
      <section
        id='about'
        className='py-32 md:py-48 px-6 md:px-12 bg-white text-black'
      >
        <div className='max-w-[1800px] mx-auto'>
          <div className='grid md:grid-cols-2 gap-16 md:gap-24'>
            <div>
              <p className='text-[10px] tracking-[0.4em] text-black/30 mb-8'>
                [002] ABOUT
              </p>
              <h2 className='text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight'>
                DESIGN IS
                <br />
                <span className='font-serif italic font-normal'>thinking</span>
                <br />
                MADE VISUAL.
              </h2>
            </div>
            <div className='flex flex-col justify-end'>
              <p className='text-sm md:text-base leading-[2] text-black/60 mb-8'>
                With over eight years of experience, I've had the privilege of
                working with brands ranging from emerging startups to
                established institutions. My approach combines strategic
                thinking with meticulous craft.
              </p>
              <p className='text-sm md:text-base leading-[2] text-black/60 mb-12'>
                I believe in the power of restraint—that the most impactful
                design often emerges from what we choose to leave out.
              </p>
              <div className='grid grid-cols-2 gap-12'>
                <div>
                  <p className='text-[10px] tracking-[0.3em] text-black/30 mb-4'>
                    EXPERIENCE
                  </p>
                  <ul className='space-y-3'>
                    <li className='text-xs text-black/50'>Pentagram, NYC</li>
                    <li className='text-xs text-black/50'>Studio Dumbar</li>
                    <li className='text-xs text-black/50'>Independent</li>
                  </ul>
                </div>
                <div>
                  <p className='text-[10px] tracking-[0.3em] text-black/30 mb-4'>
                    RECOGNITION
                  </p>
                  <ul className='space-y-3'>
                    <li className='text-xs text-black/50'>AWWWARDS SOTD</li>
                    <li className='text-xs text-black/50'>
                      Type Directors Club
                    </li>
                    <li className='text-xs text-black/50'>D&AD Pencil</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className='py-32 md:py-48 px-6 md:px-12'>
        <div className='max-w-[1800px] mx-auto'>
          <p className='text-[10px] tracking-[0.4em] text-white/30 mb-16'>
            [003] SERVICES
          </p>
          <div className='grid md:grid-cols-3 gap-16 md:gap-8'>
            {[
              {
                number: "01",
                title: "BRAND\nIDENTITY",
                description:
                  "Strategic brand development, visual identity systems, and guidelines that capture your essence.",
              },
              {
                number: "02",
                title: "DIGITAL\nEXPERIENCE",
                description:
                  "Websites and digital products that combine stunning aesthetics with intuitive functionality.",
              },
              {
                number: "03",
                title: "ART\nDIRECTION",
                description:
                  "Creative direction for campaigns, editorials, and visual storytelling across all mediums.",
              },
            ].map((service) => (
              <div key={service.number} className='group'>
                <p className='text-[10px] tracking-[0.2em] text-white/20 mb-6'>
                  /{service.number}
                </p>
                <h3 className='text-2xl md:text-3xl font-bold leading-[1.2] mb-6 whitespace-pre-line tracking-tight'>
                  {service.title}
                </h3>
                <p className='text-xs text-white/40 leading-[2]'>
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id='contact'
        className='py-32 md:py-48 px-6 md:px-12 border-t border-white/10'
      >
        <div className='max-w-[1800px] mx-auto'>
          <div className='grid md:grid-cols-2 gap-16 items-end'>
            <div>
              <p className='text-[10px] tracking-[0.4em] text-white/30 mb-8'>
                [004] CONTACT
              </p>
              <h2 className='text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight'>
                LET'S CREATE
                <br />
                <span className='font-serif italic font-normal'>something</span>
                <br />
                TOGETHER.
              </h2>
            </div>
            <div className='text-left md:text-right'>
              <a
                href='mailto:hello@alexandra.design'
                className='inline-block text-xl md:text-2xl font-bold hover-line pb-1 transition-all duration-300 hover:opacity-60'
              >
                HELLO@ALEXANDRA.DESIGN
              </a>
              <div className='mt-12 flex md:justify-end gap-8'>
                {["IG", "DR", "LI", "TW"].map((social) => (
                  <a
                    key={social}
                    href='#'
                    className='text-[10px] tracking-[0.2em] text-white/30 hover:text-white transition-colors'
                  >
                    [{social}]
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-6 px-6 md:px-12 border-t border-white/10'>
        <div className='max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-[10px] tracking-[0.2em] text-white/20'>
            © 2024 ALEXANDRA CHEN
          </p>
          <p className='text-[10px] tracking-[0.2em] text-white/20'>
            TOKYO // NEW YORK
          </p>
        </div>
      </footer>
    </div>
  );
}
