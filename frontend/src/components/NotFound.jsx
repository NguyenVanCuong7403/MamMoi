import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

/* =========================================================
   MầmMới - 404 Khu Vườn Bí Mật
   Converted from HTML - EXACT SAME DESIGN
========================================================= */

const cssStyles = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  .notfound-root {
    position: relative;
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    font-family: 'Quicksand', sans-serif;
    background: linear-gradient(135deg, #0D1F0D 0%, #1A3A1A 25%, #0F2A0F 50%, #1A3A1A 75%, #0D1F0D 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ===== KEYFRAMES ===== */

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-12px) rotate(2deg); }
    75% { transform: translateY(8px) rotate(-2deg); }
  }

  @keyframes floatSlow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes sway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }

  @keyframes pulseGlow {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(255, 152, 0, 0.4)) drop-shadow(0 0 40px rgba(255, 152, 0, 0.2));
    }
    50% {
      filter: drop-shadow(0 0 35px rgba(255, 152, 0, 0.6)) drop-shadow(0 0 60px rgba(255, 152, 0, 0.3));
    }
  }

  @keyframes treeGlow {
    0%, 100% {
      filter: drop-shadow(0 0 15px rgba(76, 175, 80, 0.3)) drop-shadow(0 0 30px rgba(76, 175, 80, 0.15));
    }
    50% {
      filter: drop-shadow(0 0 25px rgba(76, 175, 80, 0.5)) drop-shadow(0 0 50px rgba(76, 175, 80, 0.25));
    }
  }

  @keyframes leafFall {
    0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
    10% { opacity: 0.9; }
    90% { opacity: 0.9; }
    100% { transform: translateY(110vh) translateX(100px) rotate(720deg); opacity: 0; }
  }

  @keyframes firefly {
    0%, 100% { opacity: 0; transform: scale(0.3); }
    50% { opacity: 1; transform: scale(1); }
  }

  @keyframes fireflyPath {
    0% { transform: translate(0, 0); }
    20% { transform: translate(30px, -20px); }
    40% { transform: translate(-15px, 15px); }
    60% { transform: translate(25px, 10px); }
    80% { transform: translate(-10px, -25px); }
    100% { transform: translate(0, 0); }
  }

  @keyframes sparkleRotate {
    0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
    50% { transform: rotate(180deg) scale(1.3); opacity: 1; }
    100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
  }

  @keyframes orbitSpark {
    0% { transform: rotate(0deg) translateX(80px) rotate(0deg); opacity: 0.8; }
    100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); opacity: 0.8; }
  }

  @keyframes textReveal {
    0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }

  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(139, 195, 74, 0.3), 0 0 40px rgba(139, 195, 74, 0.2); }
    50% { text-shadow: 0 0 40px rgba(139, 195, 74, 0.6), 0 0 80px rgba(139, 195, 74, 0.4); }
  }

  @keyframes fruitPop {
    0% { transform: scale(1); }
    15% { transform: scale(0.9); }
    30% { transform: scale(1.15); }
    45% { transform: scale(0.95); }
    60% { transform: scale(1.05); }
    75% { transform: scale(0.98); }
    100% { transform: scale(1); }
  }

  @keyframes juiceSplash {
    0% { transform: scale(0) translate(0, 0); opacity: 1; }
    100% { transform: scale(1) translate(var(--tx), var(--ty)); opacity: 0; }
  }

  @keyframes waveMotion {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-25px); }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes particleFloat {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-10px) translateX(5px); }
    50% { transform: translateY(-5px) translateX(-5px); }
    75% { transform: translateY(-15px) translateX(3px); }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    20% { transform: rotate(5deg); }
    40% { transform: rotate(-5deg); }
    60% { transform: rotate(3deg); }
    80% { transform: rotate(-3deg); }
  }

  @keyframes morphBlob {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    50% { border-radius: 50% 60% 30% 60% / 30% 50% 70% 50%; }
    75% { border-radius: 60% 40% 60% 30% / 70% 30% 50% 60%; }
  }

  /* ===== BACKGROUND ===== */

  .bg-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: morphBlob 15s ease-in-out infinite, floatSlow 8s ease-in-out infinite;
  }

  .bg-orb-1 {
    top: -20%;
    left: -15%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, transparent 70%);
  }

  .bg-orb-2 {
    bottom: -20%;
    right: -15%;
    width: 55%;
    height: 55%;
    background: radial-gradient(circle, rgba(255, 152, 0, 0.15) 0%, transparent 70%);
    animation-delay: 3s;
  }

  .bg-orb-3 {
    top: 40%;
    left: 50%;
    width: 40%;
    height: 40%;
    background: radial-gradient(circle, rgba(139, 195, 74, 0.1) 0%, transparent 70%);
    animation-delay: 6s;
  }

  .grid-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.02;
    background-image:
      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: waveMotion 20s ease-in-out infinite;
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%);
  }

  .noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* ===== FLOATING PARTICLES ===== */

  .particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: particleFloat 4s ease-in-out infinite, pulse 3s ease-in-out infinite;
  }

  .particle-green {
    background: radial-gradient(circle, rgba(139, 195, 74, 0.8) 0%, transparent 70%);
    box-shadow: 0 0 10px rgba(139, 195, 74, 0.5);
  }

  .particle-orange {
    background: radial-gradient(circle, rgba(255, 152, 0, 0.8) 0%, transparent 70%);
    box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
  }

  .particle-yellow {
    background: radial-gradient(circle, rgba(255, 235, 59, 0.8) 0%, transparent 70%);
    box-shadow: 0 0 10px rgba(255, 235, 59, 0.5);
  }

  /* ===== FALLING LEAVES ===== */

  .leaf {
    position: absolute;
    pointer-events: none;
    user-select: none;
    z-index: 10;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    animation: leafFall var(--duration) linear infinite;
    animation-delay: var(--delay);
  }

  /* ===== FIREFLIES ===== */

  .firefly {
    position: absolute;
    pointer-events: none;
    z-index: 20;
    border-radius: 50%;
    background: radial-gradient(circle, #FFFDE7 0%, #FFEB3B 40%, transparent 70%);
    animation: firefly var(--blink) ease-in-out infinite, fireflyPath var(--path) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  /* ===== GRASS ===== */

  .grass {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 80px;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  }

  .grass svg {
    width: 100%;
    height: 100%;
  }

  /* ===== MAIN CONTENT ===== */

  .main-content {
    position: relative;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }

  /* ===== 404 DISPLAY ===== */

  .display-404 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    position: relative;
  }

  @media (min-width: 768px) { .display-404 { gap: 1.5rem; } }

  /* Orbiting sparks around 404 */
  .orbit-container {
    position: absolute;
    width: 350px;
    height: 200px;
    pointer-events: none;
  }

  .orbit-spark {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    margin: -4px;
    border-radius: 50%;
    background: #FFD54F;
    box-shadow: 0 0 10px #FFD54F, 0 0 20px #FFD54F;
    animation: orbitSpark 8s linear infinite;
  }

  .orbit-spark:nth-child(2) { animation-delay: -2.67s; }
  .orbit-spark:nth-child(3) { animation-delay: -5.33s; }

  /* Tree 4 */
  .tree-4 {
    width: 5rem;
    height: 8rem;
    animation: sway 4s ease-in-out infinite, treeGlow 3s ease-in-out infinite;
  }

  @media (min-width: 768px) { .tree-4 { width: 7rem; height: 11rem; } }
  @media (min-width: 1024px) { .tree-4 { width: 8rem; height: 13rem; } }

  .tree-4.right { animation-delay: 0.5s; }

  .leaves-group {
    animation: breathe 3s ease-in-out infinite;
    transform-origin: center;
  }

  /* Fruit 0 */
  .fruit-container {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .fruit-container:hover { transform: scale(1.05); }
  .fruit-container:active { transform: scale(0.95); }

  .fruit-0 {
    width: 7rem;
    height: 7rem;
    animation: breathe 2.5s ease-in-out infinite, pulseGlow 3s ease-in-out infinite;
    transition: filter 0.3s ease;
  }

  @media (min-width: 768px) { .fruit-0 { width: 10rem; height: 10rem; } }
  @media (min-width: 1024px) { .fruit-0 { width: 12rem; height: 12rem; } }

  .fruit-container.popping .fruit-0 {
    animation: fruitPop 0.6s ease-out;
  }

  /* Juice Splash */
  .juice-splash {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FFCC80 0%, #FF9800 100%);
    pointer-events: none;
    opacity: 0;
  }

  .juice-splash.animate {
    animation: juiceSplash 0.8s ease-out forwards;
  }

  /* Mini fruits */
  .mini-fruit {
    position: absolute;
    font-size: 1.5rem;
    pointer-events: none;
    opacity: 0;
    transition: all 0.5s ease-out;
  }

  .mini-fruit.show {
    opacity: 1;
  }

  /* ===== TYPOGRAPHY ===== */

  .title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    animation: textReveal 0.8s ease-out 0.3s forwards, textGlow 3s ease-in-out infinite;
    animation-delay: 0.3s, 0s;
    opacity: 0;
  }

  @media (min-width: 768px) { .title { font-size: 2.5rem; } }
  @media (min-width: 1024px) { .title { font-size: 3.5rem; } }

  .text-gradient {
    background: linear-gradient(135deg, #A5D6A7 0%, #81C784 30%, #66BB6A 60%, #81C784 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 4s ease infinite;
  }

  .subtitle {
    font-size: 1rem;
    color: rgba(255,255,255,0.6);
    margin-bottom: 2rem;
    max-width: 500px;
    line-height: 1.7;
    animation: textReveal 0.8s ease-out 0.5s forwards;
    opacity: 0;
  }

  @media (min-width: 768px) { .subtitle { font-size: 1.125rem; } }

  /* ===== MESSAGE CARD ===== */

  .message-card {
    width: 100%;
    max-width: 420px;
    margin: 0 auto 2rem;
    animation: textReveal 0.8s ease-out 0.6s forwards;
    opacity: 0;
  }

  .message-card-inner {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 1.25rem;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
    position: relative;
    overflow: hidden;
  }

  .message-card-inner::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shimmer 3s infinite;
  }

  .message-icon {
    font-size: 2.5rem;
    animation: float 3s ease-in-out infinite, wiggle 4s ease-in-out infinite;
    flex-shrink: 0;
  }

  .message-text {
    color: rgba(255,255,255,0.9);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .message-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .message-dot {
    height: 6px;
    border-radius: 9999px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    border: none;
    padding: 0;
  }

  .message-dot.active {
    background: linear-gradient(90deg, #4ade80, #22c55e);
    width: 2rem;
    box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
  }

  .message-dot.inactive {
    background: rgba(255,255,255,0.3);
    width: 6px;
  }

  .message-dot.inactive:hover {
    background: rgba(255,255,255,0.5);
    transform: scale(1.2);
  }

  /* ===== BUTTONS ===== */

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: textReveal 0.8s ease-out 0.7s forwards;
    opacity: 0;
  }

  @media (min-width: 640px) { .buttons { flex-direction: row; } }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 1.1rem;
    font-family: 'Quicksand', sans-serif;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  .btn:hover::before { left: 100%; }

  .btn-primary {
    background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .btn-primary:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(76, 175, 80, 0.5), inset 0 1px 0 rgba(255,255,255,0.3);
  }

  .btn-primary:active { transform: translateY(-2px); }

  .btn-secondary {
    background: rgba(255,255,255,0.08);
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
    backdrop-filter: blur(10px);
  }

  .btn-secondary:hover {
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  }

  .btn svg {
    transition: transform 0.3s ease;
  }

  .btn:hover svg { transform: scale(1.1); }

  /* ===== FOOTER ===== */

  .footer-hint {
    margin-top: 2.5rem;
    color: rgba(255,255,255,0.4);
    font-size: 0.8rem;
    animation: textReveal 0.8s ease-out 0.9s forwards, pulse 3s ease-in-out infinite;
    animation-delay: 0.9s, 2s;
    opacity: 0;
  }

  /* ===== CORNER DECORATIONS ===== */

  .corner {
    position: absolute;
    pointer-events: none;
    opacity: 0.25;
    animation: float 5s ease-in-out infinite;
  }

  @media (max-width: 1023px) { .corner { display: none; } }

  .corner-tl { top: 2rem; left: 2rem; }
  .corner-tr { top: 2rem; right: 2rem; animation-delay: 1s; }
  .corner-br { bottom: 2rem; right: 2rem; animation-delay: 2s; }

  /* ===== SPARKLE STARS ===== */

  .sparkle-star {
    position: absolute;
    pointer-events: none;
    z-index: 15;
    animation: sparkleRotate 4s linear infinite;
  }

  .sparkle-star svg {
    filter: drop-shadow(0 0 5px currentColor);
  }
`;

export default function NotFound() {
    const [currentMsg, setCurrentMsg] = useState(0);
    const [isPopping, setIsPopping] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const splashRefs = useRef([]);
    const miniFruitRefs = useRef([]);

    const messages = [
        { icon: '🌱', text: 'Đừng lo, mọi hành trình đều có những ngã rẽ bất ngờ!' },
        { icon: '🍊', text: 'Cây ăn quả cũng cần thời gian để ra trái ngọt.' },
        { icon: '✨', text: 'Lạc đường đôi khi dẫn ta đến những vườn cây tuyệt vời!' },
        { icon: '🌳', text: 'Hãy để chúng tôi đưa bạn về vườn xanh tươi!' },
    ];

    // Message rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMsg(prev => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Fruit click effect
    const handleFruitClick = useCallback(() => {
        setClickCount(prev => prev + 1);
        setIsPopping(true);
        setTimeout(() => setIsPopping(false), 600);

        // Juice splash effect
        splashRefs.current.forEach((splash, i) => {
            if (!splash) return;
            const angle = (i / 8) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 30;

            splash.style.setProperty('--tx', tx + 'px');
            splash.style.setProperty('--ty', ty + 'px');
            splash.style.width = (10 + Math.random() * 15) + 'px';
            splash.style.height = splash.style.width;
            splash.classList.remove('animate');
            splash.offsetHeight;
            splash.classList.add('animate');
        });

        // Mini fruits fly out on every 3rd click
        if ((clickCount + 1) % 3 === 0) {
            miniFruitRefs.current.forEach((fruit, i) => {
                if (!fruit) return;
                const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
                const distance = 100 + Math.random() * 80;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;

                fruit.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`;
                fruit.classList.add('show');

                setTimeout(() => {
                    fruit.classList.remove('show');
                    fruit.style.transform = 'translate(0, 0)';
                }, 800);
            });
        }
    }, [clickCount]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <div className="notfound-root">
                {/* Background */}
                <div className="bg-container">
                    <div className="bg-orb bg-orb-1"></div>
                    <div className="bg-orb bg-orb-2"></div>
                    <div className="bg-orb bg-orb-3"></div>
                    <div className="grid-pattern"></div>
                    <div className="vignette"></div>
                    <div className="noise"></div>
                </div>

                {/* Floating Particles */}
                <div className="particle particle-green" style={{ width: 8, height: 8, top: '15%', left: '10%', animationDelay: '0s' }}></div>
                <div className="particle particle-orange" style={{ width: 6, height: 6, top: '25%', left: '85%', animationDelay: '1s' }}></div>
                <div className="particle particle-yellow" style={{ width: 10, height: 10, top: '70%', left: '15%', animationDelay: '2s' }}></div>
                <div className="particle particle-green" style={{ width: 5, height: 5, top: '60%', left: '90%', animationDelay: '0.5s' }}></div>
                <div className="particle particle-orange" style={{ width: 7, height: 7, top: '80%', left: '50%', animationDelay: '1.5s' }}></div>
                <div className="particle particle-yellow" style={{ width: 6, height: 6, top: '10%', left: '60%', animationDelay: '2.5s' }}></div>

                {/* Falling Leaves */}
                <div className="leaf" style={{ left: '5%', fontSize: 26, '--duration': '18s', '--delay': '0s' }}>🍁</div>
                <div className="leaf" style={{ left: '15%', fontSize: 22, '--duration': '22s', '--delay': '3s' }}>🍃</div>
                <div className="leaf" style={{ left: '28%', fontSize: 28, '--duration': '20s', '--delay': '6s' }}>🌿</div>
                <div className="leaf" style={{ left: '42%', fontSize: 24, '--duration': '19s', '--delay': '2s' }}>🍊</div>
                <div className="leaf" style={{ left: '55%', fontSize: 26, '--duration': '21s', '--delay': '8s' }}>🍋</div>
                <div className="leaf" style={{ left: '68%', fontSize: 20, '--duration': '17s', '--delay': '4s' }}>🌸</div>
                <div className="leaf" style={{ left: '78%', fontSize: 24, '--duration': '23s', '--delay': '1s' }}>🍃</div>
                <div className="leaf" style={{ left: '88%', fontSize: 22, '--duration': '18s', '--delay': '7s' }}>🍁</div>
                <div className="leaf" style={{ left: '95%', fontSize: 20, '--duration': '20s', '--delay': '5s' }}>🌿</div>

                {/* Fireflies */}
                <div className="firefly" style={{ left: '8%', top: '25%', width: 7, height: 7, boxShadow: '0 0 20px 8px rgba(255,235,59,0.5)', '--blink': '3s', '--path': '12s', '--delay': '0s' }}></div>
                <div className="firefly" style={{ left: '22%', top: '65%', width: 5, height: 5, boxShadow: '0 0 15px 6px rgba(255,235,59,0.4)', '--blink': '3.5s', '--path': '15s', '--delay': '1.5s' }}></div>
                <div className="firefly" style={{ left: '45%', top: '20%', width: 8, height: 8, boxShadow: '0 0 24px 10px rgba(255,235,59,0.5)', '--blink': '2.8s', '--path': '10s', '--delay': '3s' }}></div>
                <div className="firefly" style={{ left: '65%', top: '75%', width: 6, height: 6, boxShadow: '0 0 18px 7px rgba(255,235,59,0.4)', '--blink': '4s', '--path': '14s', '--delay': '0.8s' }}></div>
                <div className="firefly" style={{ left: '82%', top: '30%', width: 7, height: 7, boxShadow: '0 0 21px 8px rgba(255,235,59,0.5)', '--blink': '3.2s', '--path': '11s', '--delay': '2.2s' }}></div>
                <div className="firefly" style={{ left: '92%', top: '55%', width: 5, height: 5, boxShadow: '0 0 15px 6px rgba(255,235,59,0.4)', '--blink': '3.8s', '--path': '13s', '--delay': '4s' }}></div>
                <div className="firefly" style={{ left: '35%', top: '85%', width: 6, height: 6, boxShadow: '0 0 18px 7px rgba(255,235,59,0.4)', '--blink': '3s', '--path': '12s', '--delay': '1s' }}></div>
                <div className="firefly" style={{ left: '75%', top: '15%', width: 5, height: 5, boxShadow: '0 0 15px 6px rgba(255,235,59,0.4)', '--blink': '3.5s', '--path': '16s', '--delay': '2.8s' }}></div>

                {/* Sparkle Stars */}
                <div className="sparkle-star" style={{ left: '12%', top: '35%', color: '#FFD54F', animationDelay: '0s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                </div>
                <div className="sparkle-star" style={{ left: '85%', top: '45%', color: '#81C784', animationDelay: '1s' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                </div>
                <div className="sparkle-star" style={{ left: '25%', top: '75%', color: '#FFB74D', animationDelay: '2s' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                </div>
                <div className="sparkle-star" style={{ left: '70%', top: '20%', color: '#A5D6A7', animationDelay: '3s' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                </div>
                <div className="sparkle-star" style={{ left: '55%', top: '90%', color: '#FFCC80', animationDelay: '1.5s' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" /></svg>
                </div>

                {/* Grass */}
                <div className="grass">
                    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="g1" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#1B5E20" />
                                <stop offset="100%" stopColor="#2E7D32" />
                            </linearGradient>
                            <linearGradient id="g2" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#2E7D32" />
                                <stop offset="100%" stopColor="#43A047" />
                            </linearGradient>
                        </defs>
                        <path d="M0 80 Q30 50 60 65 Q90 35 120 55 Q150 40 180 60 Q210 35 240 50 Q270 45 300 65 Q330 35 360 55 Q390 45 420 60 Q450 35 480 50 Q510 50 540 65 Q570 40 600 55 Q630 35 660 60 Q690 45 720 50 Q750 35 780 65 Q810 40 840 55 Q870 50 900 60 Q930 35 960 50 Q990 45 1020 65 Q1050 35 1080 55 Q1110 40 1140 60 Q1170 45 1200 50 Q1230 35 1260 65 Q1290 50 1320 55 Q1350 35 1380 60 Q1410 45 1440 50 L1440 80 L0 80 Z" fill="url(#g1)" opacity="0.7" />
                        <path d="M0 80 Q20 55 40 68 Q60 40 80 60 Q100 50 120 65 Q140 45 160 55 Q180 55 200 68 Q220 40 240 60 Q260 50 280 65 Q300 38 320 55 Q340 45 360 68 Q380 50 400 60 Q420 40 440 65 Q460 45 480 55 Q500 55 520 68 Q540 38 560 60 Q580 45 600 65 Q620 50 640 55 Q660 40 680 68 Q700 45 720 60 Q740 50 760 65 Q780 38 800 55 Q820 55 840 68 Q860 40 880 60 Q900 45 920 65 Q940 50 960 55 Q980 40 1000 68 Q1020 45 1040 60 Q1060 55 1080 65 Q1100 38 1120 55 Q1140 45 1160 68 Q1180 50 1200 60 Q1220 40 1240 65 Q1260 45 1280 55 Q1300 55 1320 68 Q1340 40 1360 60 Q1380 45 1400 65 Q1420 50 1440 55 L1440 80 L0 80 Z" fill="url(#g2)" />
                    </svg>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* 404 Display */}
                    <div className="display-404">
                        {/* Orbiting Sparks */}
                        <div className="orbit-container">
                            <div className="orbit-spark"></div>
                            <div className="orbit-spark"></div>
                            <div className="orbit-spark"></div>
                        </div>

                        {/* Tree 4 Left */}
                        <svg viewBox="0 0 120 200" className="tree-4">
                            <defs>
                                <linearGradient id="trunk" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8D6E63" />
                                    <stop offset="50%" stopColor="#6D4C41" />
                                    <stop offset="100%" stopColor="#5D4037" />
                                </linearGradient>
                                <radialGradient id="leaf" cx="30%" cy="30%">
                                    <stop offset="0%" stopColor="#A5D6A7" />
                                    <stop offset="60%" stopColor="#66BB6A" />
                                    <stop offset="100%" stopColor="#43A047" />
                                </radialGradient>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                </filter>
                            </defs>
                            <path d="M85 20 C85 20 88 40 86 70 C84 100 85 130 85 160 C85 175 83 190 85 195" fill="none" stroke="url(#trunk)" strokeWidth="18" strokeLinecap="round" />
                            <path d="M20 100 C35 100 50 98 70 100 C80 101 90 100 100 100" fill="none" stroke="url(#trunk)" strokeWidth="14" strokeLinecap="round" />
                            <path d="M25 100 C30 90 40 70 50 50 C60 30 70 15 85 5" fill="none" stroke="url(#trunk)" strokeWidth="14" strokeLinecap="round" />
                            <g className="leaves-group">
                                <ellipse cx="85" cy="8" rx="14" ry="9" fill="url(#leaf)" transform="rotate(-30, 85, 8)" filter="url(#glow)" />
                                <ellipse cx="75" cy="18" rx="11" ry="7" fill="url(#leaf)" transform="rotate(-50, 75, 18)" />
                                <ellipse cx="95" cy="14" rx="10" ry="6" fill="url(#leaf)" transform="rotate(25, 95, 14)" />
                                <ellipse cx="98" cy="65" rx="12" ry="7" fill="url(#leaf)" transform="rotate(20, 98, 65)" />
                                <ellipse cx="72" cy="72" rx="9" ry="6" fill="url(#leaf)" transform="rotate(-25, 72, 72)" />
                                <ellipse cx="22" cy="92" rx="12" ry="7" fill="url(#leaf)" transform="rotate(-15, 22, 92)" />
                                <ellipse cx="18" cy="108" rx="10" ry="6" fill="url(#leaf)" transform="rotate(35, 18, 108)" />
                                <ellipse cx="93" cy="175" rx="14" ry="8" fill="url(#leaf)" transform="rotate(15, 93, 175)" />
                                <ellipse cx="78" cy="182" rx="11" ry="6" fill="url(#leaf)" transform="rotate(-30, 78, 182)" />
                            </g>
                            <g className="fruits">
                                <circle cx="68" cy="88" r="7" fill="#FF9800"><animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite" /></circle>
                                <circle cx="66" cy="86" r="2.5" fill="rgba(255,255,255,0.5)" />
                                <circle cx="96" cy="48" r="6" fill="#FFC107"><animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite" /></circle>
                                <circle cx="94" cy="46" r="2" fill="rgba(255,255,255,0.5)" />
                            </g>
                        </svg>

                        {/* Fruit 0 (Orange) */}
                        <div className={`fruit-container ${isPopping ? 'popping' : ''}`} onClick={handleFruitClick}>
                            {/* Juice Splash Elements */}
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="juice-splash" ref={el => splashRefs.current[i] = el}></div>
                            ))}

                            {/* Mini Fruits */}
                            {['🍊', '🍋', '🥭', '🍑'].map((emoji, i) => (
                                <div key={i} className="mini-fruit" ref={el => miniFruitRefs.current[i] = el}>{emoji}</div>
                            ))}

                            <svg viewBox="0 0 160 160" className="fruit-0">
                                <defs>
                                    <radialGradient id="orange" cx="35%" cy="35%">
                                        <stop offset="0%" stopColor="#FFCC80" />
                                        <stop offset="40%" stopColor="#FF9800" />
                                        <stop offset="80%" stopColor="#F57C00" />
                                        <stop offset="100%" stopColor="#E65100" />
                                    </radialGradient>
                                    <radialGradient id="highlight" cx="30%" cy="25%">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </radialGradient>
                                    <pattern id="texture" patternUnits="userSpaceOnUse" width="6" height="6">
                                        <circle cx="3" cy="3" r="0.5" fill="rgba(230, 81, 0, 0.3)" />
                                    </pattern>
                                    <linearGradient id="stem" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#2E7D32" />
                                        <stop offset="100%" stopColor="#66BB6A" />
                                    </linearGradient>
                                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#E65100" floodOpacity="0.4" />
                                    </filter>
                                </defs>
                                <circle cx="80" cy="85" r="65" fill="url(#orange)" filter="url(#shadow)" />
                                <circle cx="80" cy="85" r="63" fill="url(#texture)" opacity="0.5" />
                                <ellipse cx="55" cy="55" rx="32" ry="28" fill="url(#highlight)" />
                                <ellipse cx="45" cy="48" rx="16" ry="12" fill="rgba(255,255,255,0.35)" />
                                <ellipse cx="80" cy="22" rx="9" ry="5" fill="#5D4037" />
                                <g style={{ animation: 'sway 3s ease-in-out infinite', transformOrigin: '80px 22px' }}>
                                    <path d="M82 20 Q98 6 110 14 Q98 24 82 20" fill="url(#stem)" />
                                    <path d="M82 20 Q96 12 105 16" stroke="#2E7D32" strokeWidth="0.8" fill="none" />
                                </g>
                                <path d="M78 22 Q68 10 58 17 Q68 25 78 22" fill="url(#stem)" opacity="0.85" />
                                <ellipse cx="80" cy="146" rx="7" ry="4" fill="#E65100" opacity="0.5" />
                                <g className="orange-sparkles">
                                    <circle cx="42" cy="68" r="2.5" fill="#FFF" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                                    <circle cx="52" cy="48" r="2" fill="#FFF" style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '0.7s' }} />
                                    <circle cx="38" cy="88" r="1.5" fill="#FFF" style={{ animation: 'pulse 2s ease-in-out infinite', animationDelay: '1.4s' }} />
                                </g>
                            </svg>
                        </div>

                        {/* Tree 4 Right */}
                        <svg viewBox="0 0 120 200" className="tree-4 right" style={{ transform: 'scaleX(-1)' }}>
                            <defs>
                                <linearGradient id="trunk2" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8D6E63" />
                                    <stop offset="50%" stopColor="#6D4C41" />
                                    <stop offset="100%" stopColor="#5D4037" />
                                </linearGradient>
                                <radialGradient id="leaf2" cx="30%" cy="30%">
                                    <stop offset="0%" stopColor="#A5D6A7" />
                                    <stop offset="60%" stopColor="#66BB6A" />
                                    <stop offset="100%" stopColor="#43A047" />
                                </radialGradient>
                            </defs>
                            <path d="M85 20 C85 20 88 40 86 70 C84 100 85 130 85 160 C85 175 83 190 85 195" fill="none" stroke="url(#trunk2)" strokeWidth="18" strokeLinecap="round" />
                            <path d="M20 100 C35 100 50 98 70 100 C80 101 90 100 100 100" fill="none" stroke="url(#trunk2)" strokeWidth="14" strokeLinecap="round" />
                            <path d="M25 100 C30 90 40 70 50 50 C60 30 70 15 85 5" fill="none" stroke="url(#trunk2)" strokeWidth="14" strokeLinecap="round" />
                            <g className="leaves-group" style={{ animationDelay: '0.3s' }}>
                                <ellipse cx="85" cy="8" rx="14" ry="9" fill="url(#leaf2)" transform="rotate(-30, 85, 8)" filter="url(#glow)" />
                                <ellipse cx="75" cy="18" rx="11" ry="7" fill="url(#leaf2)" transform="rotate(-50, 75, 18)" />
                                <ellipse cx="95" cy="14" rx="10" ry="6" fill="url(#leaf2)" transform="rotate(25, 95, 14)" />
                                <ellipse cx="98" cy="65" rx="12" ry="7" fill="url(#leaf2)" transform="rotate(20, 98, 65)" />
                                <ellipse cx="72" cy="72" rx="9" ry="6" fill="url(#leaf2)" transform="rotate(-25, 72, 72)" />
                                <ellipse cx="22" cy="92" rx="12" ry="7" fill="url(#leaf2)" transform="rotate(-15, 22, 92)" />
                                <ellipse cx="18" cy="108" rx="10" ry="6" fill="url(#leaf2)" transform="rotate(35, 18, 108)" />
                                <ellipse cx="93" cy="175" rx="14" ry="8" fill="url(#leaf2)" transform="rotate(15, 93, 175)" />
                                <ellipse cx="78" cy="182" rx="11" ry="6" fill="url(#leaf2)" transform="rotate(-30, 78, 182)" />
                            </g>
                            <g className="fruits">
                                <circle cx="70" cy="90" r="6" fill="#FFC107"><animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite" /></circle>
                                <circle cx="68" cy="88" r="2" fill="rgba(255,255,255,0.5)" />
                                <circle cx="95" cy="55" r="7" fill="#FF9800"><animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite" /></circle>
                                <circle cx="93" cy="53" r="2.5" fill="rgba(255,255,255,0.5)" />
                            </g>
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="title"><span className="text-gradient">Khu Vườn Bí Mật</span></h1>

                    {/* Subtitle */}
                    <p className="subtitle">
                        Có vẻ như bạn đã đi lạc vào một khu vườn chưa được khám phá.<br />
                        Hãy để Mầm Mới dẫn bạn về vườn cây xanh tươi!
                    </p>

                    {/* Message Card */}
                    <div className="message-card">
                        <div className="message-card-inner">
                            <span className="message-icon" key={currentMsg}>{messages[currentMsg].icon}</span>
                            <p className="message-text">{messages[currentMsg].text}</p>
                        </div>
                        <div className="message-dots">
                            {messages.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`message-dot ${idx === currentMsg ? 'active' : 'inactive'}`}
                                    onClick={() => setCurrentMsg(idx)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="buttons">
                        <Link to="/" className="btn btn-primary">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span>Về Trang Chủ</span>
                        </Link>
                        <button onClick={() => window.history.back()} className="btn btn-secondary">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                            <span>Quay Lại</span>
                        </button>
                    </div>


                </div>

                {/* Corner Decorations */}
                <div className="corner corner-tl">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22V8" />
                        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                        <path d="m8 8 4-4 4 4" />
                        <path d="M12 4a4 4 0 0 0-4 4" />
                        <path d="M12 4a4 4 0 0 1 4 4" />
                    </svg>
                </div>
                <div className="corner corner-tr" style={{ opacity: 0.15 }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m8 2 1.88 1.88" />
                        <path d="M14.12 3.88 16 2" />
                        <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                        <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                        <path d="M12 20v-9" />
                        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                        <path d="M6 13H2" />
                        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                        <path d="M22 13h-4" />
                        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
                    </svg>
                </div>
                <div className="corner corner-br">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 7.5V18" />
                    </svg>
                </div>
            </div>
        </>
    );
}