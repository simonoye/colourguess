import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

interface HSL { h: number; s: number; l: number; }
interface User { name: string; postcode: string; age?: string; }
interface RoundResult { round: number; target: HSL; guess: HSL; score: number; }
interface LeaderboardEntry { name: string; postcode: string; highscore: number; }

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<User>({ name: '', postcode: '' });
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ age: '' });
  
  const [hardMode, setHardMode] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [round, setRound] = useState(1);
  const [isMemoryPhase, setIsMemoryPhase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5.00);
  const [score, setScore] = useState<number | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [target, setTarget] = useState<HSL>({ h: 0, s: 0, l: 0 });
  const [guess, setGuess] = useState<HSL>({ h: 0, s: 0.5, l: 0.5 });
  
  const timerRef = useRef<number | null>(null);
  const flashIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('color_leaderboard');
    if (saved) setLeaderboard(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isMemoryPhase) {
      if (hardMode) {
        setIsFlashing(true);
        let flashCount = 0;
        const maxFlashes = 6; 

        flashIntervalRef.current = window.setInterval(() => {
          setFlashColor(`hsl(${Math.random() * 360}, 80%, 50%)`);
          flashCount++;

          if (flashCount >= maxFlashes) {
            if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
            setFlashColor(null);
            setIsFlashing(false);
            startCountdown(3000); 
          }
        }, 250);
      } else {
        setIsFlashing(false);
        startCountdown(5000);
      }
    }

    function startCountdown(duration: number) {
      const startTime = Date.now();
      const updateTimer = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (duration - elapsed) / 1000);
        setTimeLeft(remaining);

        if (remaining > 0) {
          timerRef.current = requestAnimationFrame(updateTimer);
        } else {
          setIsMemoryPhase(false);
        }
      };
      timerRef.current = requestAnimationFrame(updateTimer);
    }

    return () => { 
      if (timerRef.current) cancelAnimationFrame(timerRef.current); 
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    };
  }, [isMemoryPhase, hardMode]);

  const hslToCss = (c: HSL) => `hsl(${c.h * 360}, ${c.s * 100}%, ${c.l * 100}%)`;

  const hslToRgb = (h: number, s: number, l: number) => {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (n: number) => {
      let t = (n + h * 6) % 6;
      if (t < 1) return p + (q - p) * t;
      if (t < 3) return q;
      if (t < 4) return p + (q - p) * (4 - t);
      return p;
    };
    return { r: f(2) * 255, g: f(0) * 255, b: f(4) * 255 };
  };

  const startRound = useCallback(() => {
    setTarget({ h: Math.random(), s: 0.3 + Math.random() * 0.5, l: 0.4 + Math.random() * 0.2 });
    setGuess({ h: 0, s: 0.5, l: 0.5 });
    setScore(null);
    setTimeLeft(hardMode ? 3.00 : 5.00);
    setIsMemoryPhase(true);
  }, [hardMode]);

  const handleAction = () => {
    if (score !== null) {
      const result: RoundResult = { round, target, guess, score };
      const newHistory = [...history, result];
      setHistory(newHistory);
      if (round < 5) { 
        setRound(prev => prev + 1); 
        startRound(); 
      } else { 
        const totalScore = newHistory.reduce((acc, curr) => acc + curr.score, 0);
        const newEntry = { name: user!.name, postcode: user!.postcode, highscore: parseFloat(totalScore.toFixed(2)) };
        const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.highscore - a.highscore).slice(0, 5);
        setLeaderboard(updatedLeaderboard);
        localStorage.setItem('color_leaderboard', JSON.stringify(updatedLeaderboard));
        setGameStarted(false); 
        setShowResults(true);
      }
      return;
    }
    const t = hslToRgb(target.h, target.s, target.l);
    const g = hslToRgb(guess.h, guess.s, guess.l);
    const dist = Math.sqrt(0.3 * (t.r - g.r)**2 + 0.59 * (t.g - g.g)**2 + 0.11 * (t.b - g.b)**2);
    setScore(parseFloat(Math.max(0, 10 - (dist / 15)).toFixed(2)));
  };

  if (!user || showSurvey) {
    return (
      <div className="centered-screen">
        <div className="login-card">
          <h1>{!user ? "Color Study" : "Settings"}</h1>
          {!user ? (
            <form onSubmit={(e) => { e.preventDefault(); setShowSurvey(true); setUser(form); }}>
              <input placeholder="Name" required onChange={e => setForm({...form, name: e.target.value})} />
              <input placeholder="Postcode" required onChange={e => setForm({...form, postcode: e.target.value})} />
              <button type="submit" className="counter">Enter</button>
            </form>
          ) : (
            <div className="survey-box">
              <select onChange={e => setSurveyData({age: e.target.value})}>
                <option value="">Age Range...</option>
                <option value="18-35">18-35</option>
                <option value="36-55">36-55</option>
                <option value="55+">55+</option>
              </select>
              <div className="hard-mode-toggle" onClick={() => setHardMode(!hardMode)}>
                <span>Hard Mode (3s)</span>
                <div className={`toggle-switch ${hardMode ? 'active' : ''}`}></div>
              </div>
              <button className="counter" onClick={() => setShowSurvey(false)} disabled={!surveyData.age}>Start Game</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showResults) {
    const finalTotal = history.reduce((acc, curr) => acc + curr.score, 0);
    return (
      <main className="centered-screen">
        <div className="results-container">
          <h2 className="final-title">TOTAL SCORE</h2>
          <h1 className="final-value">{finalTotal.toFixed(2)}</h1>
          <div className="results-grid">
            {history.map((res, i) => (
              <div key={i} className="result-item">
                <div className="result-swatch" style={{ background: `linear-gradient(135deg, ${hslToCss(res.target)} 50%, ${hslToCss(res.guess)} 50%)` }}>
                  <span className="round-num">{res.round}</span>
                </div>
                <div className="result-score">+{res.score.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <button className="counter result-btn" onClick={() => setShowResults(false)}>Menu</button>
        </div>
      </main>
    );
  }

  return (
    <main className="centered-screen">
      {!gameStarted ? (
        <div className="menu-stack">
          <button className="go-btn" onClick={() => { setHistory([]); setRound(1); setGameStarted(true); startRound(); }}>GO</button>
          {leaderboard.length > 0 && (
            <div className="leaderboard-classic">
              <h3>TOP SCORES</h3>
              {leaderboard.map((entry, i) => (
                <div key={i} className="lb-entry">
                  <span>{entry.name}</span>
                  <span className="dots"></span>
                  <span className="val">{entry.highscore.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="game-stack">
          <div className="top-indicator">ROUND {round} / 5 {hardMode && <span className="hard-tag">HARD</span>}</div>
          
          <div className="console-wrapper">
            <div className={`game-console ${(isMemoryPhase || score !== null) ? 'console-full-round' : 'console-split'}`}>
              <div className="swatch-container">
                <div 
                  className="main-swatch" 
                  style={{ 
                      backgroundColor: flashColor || (isMemoryPhase ? hslToCss(target) : hslToCss(guess)), 
                      '--target': hslToCss(target), 
                      '--guess': hslToCss(guess),
                      backgroundImage: score !== null ? 'linear-gradient(135deg, var(--target) 50%, var(--guess) 50%)' : 'none'
                  } as any}
                >
                  {isMemoryPhase && !isFlashing && <div className="timer-text">{timeLeft.toFixed(2)}</div>}
                  {isFlashing && <div className="timer-text active-flash">?</div>}
                  {score !== null && <div className="floating-score">+{score.toFixed(2)}</div>}
                </div>
              </div>

              {!isMemoryPhase && score === null && (
                <div className="horizontal-sliders">
                  {(['h', 's', 'l'] as const).map((key) => {
                    let dynamicBg = "";
                    if (key === 'h') dynamicBg = "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
                    else if (key === 's') dynamicBg = `linear-gradient(to right, hsl(${guess.h * 360}, 0%, 50%), hsl(${guess.h * 360}, 100%, 50%))`;
                    else dynamicBg = `linear-gradient(to right, #000, hsl(${guess.h * 360}, ${guess.s * 100}%, 50%), #fff)`;
                    
                    return (
                      <div key={key} className="h-slider-wrap" style={{ background: dynamicBg }}>
                        <input 
                          type="range" min="0" max="1" step="0.001" 
                          className="h-range"
                          value={guess[key]} 
                          onChange={e => setGuess({...guess, [key]: parseFloat(e.target.value)})} 
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="action-area">
               {!isMemoryPhase && (
                 <button className="circle-btn" onClick={handleAction}>
                   {score !== null ? (
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                   ) : (
                     <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                   )}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;