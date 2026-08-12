import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import "./styles.css";

const products = [
  {
    title: "Football Motion Pack",
    tag: "BEST SELLER",
    price: "€9.99",
    oldPrice: "€14.99",
    desc: "Transiciones, zooms y movimientos rápidos para edits de fútbol.",
    gradient: "linear-gradient(135deg,#17122d,#5227ff 55%,#0b0b10)"
  },
  {
    title: "4K Velocity Presets",
    tag: "NEW",
    price: "€7.99",
    oldPrice: "",
    desc: "Presets de velocidad y shakes para darle más impacto a tus clips.",
    gradient: "linear-gradient(135deg,#101b24,#00a8ff 55%,#08090d)"
  },
  {
    title: "Cinematic Color Pack",
    tag: "POPULAR",
    price: "€6.99",
    oldPrice: "",
    desc: "Looks oscuros y cinematográficos para clips, reels y highlights.",
    gradient: "linear-gradient(135deg,#21140f,#d66a24 55%,#08090d)"
  }
];

function Aurora({ colorStops = ["#5227FF", "#7CFF67", "#5227FF"], speed = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, antialias: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";

    const vertex = `#version 300 es
      in vec2 position;
      void main(){ gl_Position = vec4(position,0.0,1.0); }`;

    const fragment = `#version 300 es
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColorStops[3];
      out vec4 fragColor;

      float hash(vec2 p){
        return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
      }

      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                   mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      void main(){
        vec2 uv=gl_FragCoord.xy/uResolution.xy;
        float n=noise(vec2(uv.x*2.4+uTime*.12,uv.y*2.0-uTime*.08));
        float wave=sin(uv.x*5.2+uTime*.65+n*2.2)*.10;
        float band=smoothstep(.0,.72,uv.y+wave+n*.18);
        vec3 c=mix(uColorStops[0],uColorStops[1],smoothstep(.15,.65,uv.x));
        c=mix(c,uColorStops[2],smoothstep(.55,1.0,uv.x));
        float glow=smoothstep(.05,.95,band)*(1.0-uv.y*.45);
        fragColor=vec4(c*glow*.48,glow*.65);
      }`;

    const colors = colorStops.map((hex) => {
      const c = new Color(hex);
      return [c.r, c.g, c.b];
    });

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [container.clientWidth, container.clientHeight] },
        uColorStops: { value: colors }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      program.uniforms.uResolution.value = [container.clientWidth, container.clientHeight];
    };
    resize();
    window.addEventListener("resize", resize);

    let raf;
    const animate = (t) => {
      program.uniforms.uTime.value = t * 0.001 * speed;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
    };
  }, [speed]);

  return <div className="aurora" ref={ref} aria-hidden="true" />;
}

function App() {
  const scrollToStore = () =>
    document.getElementById("store")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app">
      <header className="nav">
        <div className="brand"><span>AE</span> PRESETS</div>
        <nav>
          <a href="#store">Presets</a>
          <a href="#about">Qué incluye</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="navButton" onClick={scrollToStore}>Ver packs</button>
      </header>

      <main>
        <section className="hero">
          <Aurora />
          <div className="heroGlow" />
          <div className="heroContent">
            <div className="eyebrow"><span className="dot" /> PRESETS PARA EDITORES</div>
            <h1>HBZ.<br /><em>PRESETS.</em></h1>
            <p>
              Presets de After Effects creados para edits de fútbol,
              reels y contenido que necesita verse pro desde el primer frame.
            </p>
            <div className="heroActions">
              <button className="primary" onClick={scrollToStore}>Explorar presets <span>↗</span></button>
              <a className="secondary" href="#about">Ver qué incluye</a>
            </div>
            <div className="trust">
              <span>✦ Compatible con After Effects</span>
              <span>✦ Descarga digital</span>
              <span>✦ 4K ready</span>
            </div>
          </div>
          <div className="scrollHint">SCROLL ↓</div>
        </section>

        <section className="ticker">
          <span>AFTER EFFECTS</span><b>✦</b><span>FOOTBALL EDITS</span><b>✦</b>
          <span>4K QUALITY</span><b>✦</b><span>SMOOTH MOTION</span><b>✦</b>
        </section>

        <section className="store section" id="store">
          <div className="sectionHead">
            <div>
              <p className="kicker">THE STORE</p>
              <h2>Elige tu <em>pack.</em></h2>
            </div>
            <p className="muted">Presets listos para instalar y usar en tus proyectos.</p>
          </div>

          <div className="products">
            {products.map((p, i) => (
              <article className="card" key={p.title}>
                <div className="preview" style={{ background: p.gradient }}>
                  <div className="previewNoise" />
                  <div className="previewLogo">AE<span>{String(i + 1).padStart(2, "0")}</span></div>
                  <div className="play">▶</div>
                  <div className="tag">{p.tag}</div>
                </div>
                <div className="cardBody">
                  <div className="titleRow">
                    <h3>{p.title}</h3>
                    <div className="price">{p.price} {p.oldPrice && <del>{p.oldPrice}</del>}</div>
                  </div>
                  <p>{p.desc}</p>
                  <button className="buy">Comprar pack <span>→</span></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="feature section" id="about">
          <div className="featureVisual">
            <div className="fakeTimeline">
              <div className="timelineTop">AFTER EFFECTS / HBZPRESETS</div>
              <div className="timelineLine" />
              <div className="timelineClip c1" />
              <div className="timelineClip c2" />
              <div className="timelineClip c3" />
              <div className="timelineClip c4" />
              <div className="timelinePlay">▶</div>
            </div>
          </div>
          <div className="featureCopy">
            <p className="kicker">HECHO PARA EDITORES</p>
            <h2>Menos tiempo ajustando.<br /><em>Más tiempo creando.</em></h2>
            <p>Una experiencia de compra sencilla: eliges el pack, recibes tus archivos y los instalas en tu proyecto.</p>
            <div className="checks">
              <div>✓ Presets organizados</div>
              <div>✓ Tutorial de instalación</div>
              <div>✓ Compatibles con proyectos verticales</div>
              <div>✓ Diseñados para contenido social</div>
            </div>
          </div>
        </section>

        <section className="faq section" id="faq">
          <p className="kicker">FAQ</p>
          <h2>Preguntas <em>rápidas.</em></h2>
          <div className="faqGrid">
            <details open><summary>¿Para qué programa son?</summary><p>Para Adobe After Effects. La página está preparada para que después conectes cada botón a tu sistema de entrega.</p></details>
            <details><summary>¿Puedo vender varios packs?</summary><p>Sí. Solo tienes que duplicar una tarjeta y cambiar nombre, precio, preview y descripción.</p></details>
            <details><summary>¿Cómo agrego mis imágenes?</summary><p>Puedes sustituir los fondos de preview por imágenes o videos reales de tus presets.</p></details>
            <details><summary>¿Tiene versión móvil?</summary><p>Sí. El diseño es responsive y está pensado primero para pantallas pequeñas.</p></details>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand"><span>AE</span> PRESETS</div>
        <p>Presets & tools for editors.</p>
        <p>© 2026 AE PRESETS</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
