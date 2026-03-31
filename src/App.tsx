import { useState, useEffect, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// --- Game Types ---
interface HLS {
  h: number;
  l: number;
  s: number;
}

function App() {
  const [count, setCount] = useState(0)

  // --- Game State ---
  const [target, setTarget] = useState<HLS>({ h: 0, l: 0, s: 0 });
  const [guess, setGuess] = useState<HLS>({ h: 0, l: 0.5, s: 0.5 });
  const [isGuessing, setIsGuessing] = useState<boolean>(false);
  const [isMemoryPhase, setIsMemoryPhase] = useState<boolean>(true);
  const [score, setScore] = useState<number | null>(null);

  // --- Game Logic ---
  const hlsToCss = (color: HLS): string => {
    return `hsl(${color.h * 360}, ${color.s * 100}%, ${color.l * 100}%)`;
  };

  const startNewRound = useCallback(() => {
    setTarget({
      h: Math.random(),
      l: 0.3 + Math.random() * 0.4,
      s: 0.4 + Math.random() * 0.5,
    });
    setGuess({ h: 0, l: 0.5, s: 0.5 });
    setScore(null);
    setIsGuessing(false);
    setIsMemoryPhase(true);

    setTimeout(() => {
      setIsMemoryPhase(false);
      setIsGuessing(true);
    }, 3000);
  }, []);

  const handleLockIn = () => {
    if (score !== null) {
      startNewRound();
      return;
    }
    setIsGuessing(false);
    let hDiff = Math.abs(target.h - guess.h);
    if (hDiff > 0.5) hDiff = 1.0 - hDiff;
    const dist = Math.sqrt(Math.pow(hDiff * 3, 2) + Math.pow(target.l - guess.l, 2) + Math.pow(target.s - guess.s, 2));
    setScore(Math.max(0, Math.floor(100 - dist * 110)));
  };

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started lol</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      {/* --- NEW GAME SECTION --- */}
      <section id="game-section" style={{ padding: '40px 0', textAlign: 'center' }}>
        <h2 style={{ color: score !== null || isMemoryPhase ? '#00ff88' : 'white', fontSize: '2rem' }}>
          {score !== null ? `SCORE: ${score}%` : isMemoryPhase ? 'MEMORIZE' : 'MATCH IT'}
        </h2>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0' }}>
          <div 
            style={{ 
              width: '140px', height: '180px', border: '1px solid #333',
              backgroundColor: isMemoryPhase || score !== null ? hlsToCss(target) : '#222' 
            }} 
          />
          <div 
            style={{ 
              width: '140px', height: '180px', border: '1px solid #333',
              backgroundColor: isGuessing || score !== null ? hlsToCss(guess) : '#1a1a1a' 
            }} 
          />
        </div>

        <div style={{ maxWidth: '300px', margin: '0 auto 30px' }}>
          {['h', 's', 'l'].map((key) => (
            <div key={key} style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '10px', color: '#666', display: 'block' }}>
                {key === 'h' ? 'HUE' : key === 's' ? 'SATURATION' : 'BRIGHTNESS'}
              </label>
              <input
                type="range"
                min="0" max="1" step="0.01"
                disabled={!isGuessing}
                value={guess[key as keyof HLS]}
                onChange={(e) => setGuess({ ...guess, [key]: parseFloat(e.target.value) })}
                style={{ width: '100%', cursor: isGuessing ? 'pointer' : 'not-allowed' }}
              />
            </div>
          ))}
        </div>

        <button
          className="counter"
          style={{ backgroundColor: isMemoryPhase ? '#333' : '#00ff88', color: '#121212' }}
          onClick={handleLockIn}
          disabled={isMemoryPhase}
        >
          {score !== null ? 'PLAY AGAIN' : isMemoryPhase ? 'WAIT...' : 'LOCK IN'}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        {/* ... existing Documentation and Social divs ... */}
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App