import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Info, Heart, AlertTriangle, CheckCircle, Sparkles, TrendingDown } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

type CortisolLevel = 'low' | 'normal' | 'high';

interface Fortune {
  level: CortisolLevel;
  title: string;
  meaning: string;
  why: string;
  tips: string[];
  luckRate: string;
}

export default function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Fortune | null>(null);
  const [rotation, setRotation] = useState(-90); // Start at "Low" left side
  const [error, setError] = useState<string | null>(null);

  const generateFortune = async (level: CortisolLevel): Promise<Fortune | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a unique, creative, and scientifically-inspired cortisol level fortune for a '${level}' cortisol level. The fortune should be exactly for this person based on how they feel.`,
        config: {
          systemInstruction: "You are a mystical health oracle. Generate a unique, creative, and scientifically-inspired cortisol level fortune. The fortune should include a title, a meaning (how the person feels), a 'why' (potential causes), 3 tips for a better life, and a luck rate (percentage or rare status). Be diverse and never repeat the same phrasing. The tone should be empathetic yet slightly mystical.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A creative title for this state" },
              meaning: { type: Type.STRING, description: "How the person feels in this state" },
              why: { type: Type.STRING, description: "Potential reasons why they have this level" },
              tips: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "3 unique tips for a better life experience"
              },
              luckRate: { type: Type.STRING, description: "A luck rate or rarity status" }
            },
            required: ["title", "meaning", "why", "tips", "luckRate"]
          }
        }
      });

      const data = JSON.parse(response.text);
      return {
        ...data,
        level
      };
    } catch (err) {
      console.error("Failed to generate fortune:", err);
      return null;
    }
  };

  const spin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    setError(null);
    
    // Randomize level
    const rand = Math.random();
    let level: CortisolLevel;
    let targetRotation: number;

    if (rand < 0.1) { // 10% Low
      level = 'low';
      targetRotation = -60 + (Math.random() * 30 - 15);
    } else if (rand < 0.7) { // 60% Normal
      level = 'normal';
      targetRotation = 0 + (Math.random() * 40 - 20);
    } else { // 30% High
      level = 'high';
      targetRotation = 60 + (Math.random() * 30 - 15);
    }

    // Animate needle
    const extraSpins = 360 * 3;
    setRotation(rotation + extraSpins + targetRotation - (rotation % 360));

    // Generate unique fortune via AI
    const fortune = await generateFortune(level);

    if (fortune) {
      setTimeout(() => {
        setResult(fortune);
        setIsSpinning(false);
      }, 2000);
    } else {
      setError("The oracle is resting. Please try again.");
      setIsSpinning(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Background YouTube Video - Fixed to right side */}
      <div className="fixed top-0 right-0 w-full md:w-1/2 h-full pointer-events-none z-0 overflow-hidden">
        <iframe
          className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/9EX3-LNYMG4?autoplay=1&loop=1&playlist=9EX3-LNYMG4&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1"
          allow="autoplay; encrypted-media"
          frameBorder="0"
        ></iframe>
        {/* Subtle overlay to blend */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        <main className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 min-h-screen">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-white/40 backdrop-blur-md rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-white/60"
          >
            <header className="text-center mb-10">
              <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 mb-2">
                Cortisol <span className="text-emerald-500">Gacha</span>
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                Stress Level Fortune
              </p>
            </header>

            {/* Meter UI */}
            <div className="relative flex flex-col items-center mb-12">
              <div className="w-72 h-36 overflow-hidden relative">
                {/* Gauge Arc */}
                <div className="absolute inset-0 border-[20px] border-slate-100 rounded-t-full" />
                <div className="absolute inset-0 flex">
                  <div className="w-1/3 h-full border-t-[20px] border-l-[20px] border-emerald-500 rounded-tl-full opacity-90" />
                  <div className="w-1/3 h-full border-t-[20px] border-amber-400 opacity-90" />
                  <div className="w-1/3 h-full border-t-[20px] border-r-[20px] border-rose-500 rounded-tr-full opacity-90" />
                </div>
                
                {/* Labels */}
                <div className="absolute bottom-2 left-5 text-[11px] font-black text-emerald-600 uppercase tracking-tighter">Low</div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] font-black text-amber-600 uppercase tracking-tighter">Normal</div>
                <div className="absolute bottom-2 right-5 text-[11px] font-black text-rose-600 uppercase tracking-tighter">High</div>
              </div>

              {/* Needle */}
              <motion.div 
                className="absolute bottom-0 left-1/2 w-1.5 h-32 bg-slate-900 origin-bottom -translate-x-1/2 rounded-full"
                animate={{ rotate: rotation }}
                transition={{ type: "spring", stiffness: 35, damping: 12 }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45 rounded-sm" />
              </motion.div>
              <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-900 rounded-full border-[6px] border-white shadow-xl" />
            </div>

            {/* Action Button */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <button
                onClick={spin}
                disabled={isSpinning}
                className={`
                  group relative px-10 py-5 rounded-2xl font-black text-xl transition-all duration-500
                  ${isSpinning 
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed scale-95' 
                    : 'bg-slate-900 text-white hover:bg-black hover:scale-105 active:scale-95 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]'}
                `}
              >
                <div className="flex items-center gap-3">
                  {isSpinning ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  )}
                  {isSpinning ? 'SCANNING...' : 'GENERATE'}
                </div>
              </button>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-bold text-rose-500 uppercase tracking-widest"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Results Area */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className={`p-6 rounded-[2rem] border-2 flex flex-col gap-4 ${
                    result.level === 'low' ? 'bg-emerald-50/50 border-emerald-100' :
                    result.level === 'normal' ? 'bg-amber-50/50 border-amber-100' :
                    'bg-rose-50/50 border-rose-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${
                        result.level === 'low' ? 'bg-emerald-500 text-white' :
                        result.level === 'normal' ? 'bg-amber-400 text-white' :
                        'bg-rose-500 text-white'
                      }`}>
                        {result.level === 'low' ? <CheckCircle className="w-7 h-7" /> :
                         result.level === 'normal' ? <Heart className="w-7 h-7" /> :
                         <AlertTriangle className="w-7 h-7" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{result.title}</h2>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          result.level === 'low' ? 'bg-emerald-500 text-white' :
                          result.level === 'normal' ? 'bg-amber-400 text-white' :
                          'bg-rose-500 text-white'
                        }`}>
                          {result.level} LEVEL
                        </span>
                      </div>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed font-medium italic">
                      "{result.meaning}"
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <div className="bg-white/50 p-5 rounded-2xl border border-slate-100">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5" /> THE CAUSE
                      </h3>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {result.why}
                      </p>
                    </div>

                    <div className="bg-white/50 p-5 rounded-2xl border border-slate-100">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5" /> LIFE TIPS
                      </h3>
                      <ul className="space-y-3">
                        {result.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-700 font-semibold flex items-start gap-3">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                              result.level === 'low' ? 'bg-emerald-400' :
                              result.level === 'normal' ? 'bg-amber-400' :
                              'bg-rose-400'
                            }`} />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LUCK PROBABILITY</span>
                      <span className={`text-sm font-black ${
                        result.level === 'low' ? 'text-emerald-600' : 'text-slate-600'
                      }`}>
                        {result.luckRate}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer Info */}
          <footer className="mt-10 text-center max-w-xs">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed opacity-50">
              *Simulation only. Consult a doctor for medical advice.
            </p>
          </footer>
        </main>
        
        {/* Right side spacer for video visibility */}
        <div className="hidden md:block md:w-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
