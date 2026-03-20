import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const RANKS = [
  { min: 0,     title: "1",  icon: "", color: "#9ca3af" },
  { min: 200,   title: "2",  icon: "", color: "#60a5fa" },
  { min: 500,   title: "3",  icon: "", color: "#34d399" },
  { min: 1000,  title: "4",  icon: "", color: "#f97316" },
  { min: 2000,  title: "5",  icon: "", color: "#fbbf24" },
  { min: 4000,  title: "6",  icon: "", color: "#a78bfa" },
  { min: 7000,  title: "7",  icon: "", color: "#f43f5e" },
  { min: 10000, title: "8",  icon: "", color: "#e879f9" },
  { min: 15000, title: "9",  icon: "", color: "#38bdf8" },
];

function getRank(total: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (total >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

function getNextRank(total: number) {
  for (let i = 0; i < RANKS.length; i++) {
    if (total < RANKS[i].min) return RANKS[i];
  }
  return null;
}

interface HistoryEntry {
  value: number;
  total: number;
  time: string;
}

const STORAGE_KEY = "score_app_v1";

export default function Index() {
  const [total, setTotal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).total ?? 0;
    } catch (e) { return 0; }
    return 0;
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).history ?? [];
    } catch (e) { return []; }
    return [];
  });

  const [lastValue, setLastValue] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [rankUp, setRankUp] = useState(false);
  const prevRankRef = useRef(getRank(total).title);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ total, history }));
  }, [total, history]);

  const handleClick = () => {
    const value = Math.floor(Math.random() * 21) + 20;
    const newTotal = total + value;
    const newRank = getRank(newTotal);

    const now = new Date();
    const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    setLastValue(value);
    setTotal(newTotal);
    setHistory(prev => [{ value, total: newTotal, time: timeStr }, ...prev].slice(0, 50));

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    if (newRank.title !== prevRankRef.current) {
      setRankUp(true);
      prevRankRef.current = newRank.title;
      setTimeout(() => setRankUp(false), 2000);
    }
  };

  const handleReset = () => {
    setTotal(0);
    setHistory([]);
    setLastValue(null);
    prevRankRef.current = RANKS[0].title;
    localStorage.removeItem(STORAGE_KEY);
  };

  const rank = getRank(total);
  const nextRank = getNextRank(total);
  const progress = nextRank
    ? ((total - rank.min) / (nextRank.min - rank.min)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-black text-white font-rubik flex flex-col items-center px-4 py-8 overflow-x-hidden">
      
      {/* Фоновое свечение */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: rank.color }}
      />

      <div className="w-full max-w-md flex flex-col gap-6 relative z-10">

        {/* Заголовок */}
        <div className="text-center pt-2">
          <h1 className="font-oswald text-3xl font-bold tracking-widest text-white/80 uppercase">
            Накопитель
          </h1>
        </div>

        {/* Звание */}
        <div
          className={`relative rounded-2xl border p-5 text-center transition-all duration-500 ${rankUp ? "scale-105" : "scale-100"}`}
          style={{
            borderColor: rank.color + "55",
            background: `linear-gradient(135deg, ${rank.color}11 0%, #000 100%)`,
            boxShadow: rankUp ? `0 0 40px ${rank.color}66` : `0 0 20px ${rank.color}22`,
          }}
        >
          {rankUp && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10 bg-black/70 backdrop-blur-sm animate-fade-in">
              <span className="font-oswald text-2xl font-bold" style={{ color: rank.color }}>
                ⬆ НОВОЕ ЗВАНИЕ!
              </span>
            </div>
          )}
          <div className="flex items-center justify-center mb-1">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#ef4444", boxShadow: "0 0 20px #ef444499" }}
            >
              <span className="font-oswald text-2xl font-bold text-white">{rank.title}</span>
            </div>
          </div>
          {nextRank && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/40 mb-1 font-rubik">
                <span>{total} очков</span>
                <span>до «{nextRank.title}»: {nextRank.min - total}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: rank.color }}
                />
              </div>
            </div>
          )}
          {!nextRank && (
            <div className="text-xs text-white/40 mt-2">Максимальное звание достигнуто!</div>
          )}
        </div>

        {/* Счётчик */}
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 text-center"
          style={{ boxShadow: "0 0 40px rgba(249,115,22,0.1)" }}>
          <div className="text-xs font-rubik text-white/40 uppercase tracking-widest mb-1">Сумма очков</div>
          <div
            className={`font-oswald text-7xl font-bold transition-transform duration-300 ${isAnimating ? "scale-110" : "scale-100"}`}
            style={{
              color: "#f97316",
              textShadow: "0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(249,115,22,0.3)",
            }}
          >
            {total.toLocaleString("ru-RU")}
          </div>
          {lastValue !== null && (
            <div
              key={lastValue + "_" + total}
              className="text-lg font-oswald mt-1 animate-fade-in"
              style={{ color: "#4ade80" }}
            >
              +{lastValue}
            </div>
          )}
        </div>

        {/* Кнопка */}
        <button
          onClick={handleClick}
          className="relative w-full py-5 rounded-2xl font-oswald text-2xl font-bold uppercase tracking-widest text-black transition-all duration-150 active:scale-95 hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            boxShadow: "0 0 30px rgba(34,197,94,0.4), 0 4px 20px rgba(34,197,94,0.3)",
          }}
        >
          Получить очки
        </button>

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-2xl font-oswald text-lg font-bold uppercase tracking-widest text-white/70 border border-red-500/30 hover:border-red-500/70 hover:text-white transition-all duration-150 active:scale-95"
          style={{ background: "rgba(239,68,68,0.08)" }}
        >
          Обнулить
        </button>

        {/* Список звания */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="text-xs font-rubik text-white/40 uppercase tracking-widest mb-3">Все звания</div>
          <div className="grid grid-cols-1 gap-1.5">
            {RANKS.map((r) => (
              <div
                key={r.title}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${r.title === rank.title ? "bg-white/10" : "opacity-40"}`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#ef4444", boxShadow: r.title === rank.title ? "0 0 10px #ef444488" : "none" }}
                  >
                    <span className="font-oswald text-sm font-bold text-white">{r.title}</span>
                  </div>
                </div>
                <span className="font-oswald text-sm text-white/50">{r.min.toLocaleString("ru-RU")}+</span>
              </div>
            ))}
          </div>
        </div>

        {/* История */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-rubik text-white/40 uppercase tracking-widest">История нажатий</div>
            {history.length > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors font-rubik flex items-center gap-1"
              >
                <Icon name="Trash2" size={12} />
                Сбросить
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-center text-white/20 text-sm font-rubik py-4">
              Нажми кнопку, чтобы начать
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 ${i === 0 ? "animate-fade-in" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-oswald text-base font-bold" style={{ color: "#4ade80" }}>
                      +{entry.value}
                    </span>
                    <span className="text-xs text-white/30 font-rubik">= {entry.total.toLocaleString("ru-RU")}</span>
                  </div>
                  <span className="text-xs text-white/25 font-rubik">{entry.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}