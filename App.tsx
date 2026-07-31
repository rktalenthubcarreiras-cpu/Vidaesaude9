import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Droplets, 
  Activity, 
  Timer, 
  Moon, 
  Sun, 
  Plus, 
  Minus, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'water' | 'japamala' | 'timer'>('home');
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('water_count');
    return saved ? JSON.parse(saved) : 0;
  });
  const [japaCount, setJapaCount] = useState<number>(() => {
    const saved = localStorage.getItem('japa_count');
    return saved ? JSON.parse(saved) : 0;
  });
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('water_count', JSON.stringify(waterGlasses));
  }, [waterGlasses]);

  useEffect(() => {
    localStorage.setItem('japa_count', JSON.stringify(japaCount));
  }, [japaCount]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-rose-300 fill-current" />
          <h1 className="text-xl font-bold tracking-wide">Vida e Saúde</h1>
        </div>
        <span className="text-xs bg-emerald-700 px-2.5 py-1 rounded-full text-emerald-100">PWA Ready</span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full pb-24">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
              <h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao seu diário de bem-estar!</h2>
              <p className="text-slate-500 text-sm mt-2">Acompanhe seus hábitos diários de saúde e hidratação.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setActiveTab('water')}
                className="bg-blue-50 border border-blue-100 p-4 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <Droplets className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-blue-900">Hidratação</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">{waterGlasses * 250} ml</p>
                <p className="text-xs text-blue-400 mt-1">{waterGlasses} copos de 250ml</p>
              </div>

              <div 
                onClick={() => setActiveTab('japamala')}
                className="bg-purple-50 border border-purple-100 p-4 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <Activity className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-purple-900">Japamala</h3>
                <p className="text-2xl font-bold text-purple-600 mt-1">{japaCount} / 108</p>
                <p className="text-xs text-purple-400 mt-1">Repetições concluídas</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-4">
              <Timer className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-900">Exercício / Meditação</h3>
                <p className="text-sm text-emerald-700">Tempo ativo hoje: {formatTime(timerSeconds)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'water' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-6">
            <div className="inline-flex p-4 bg-blue-50 rounded-full text-blue-500">
              <Droplets className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Contador de Água</h2>
              <p className="text-slate-500 text-sm">Meta diária: 2000 ml (8 copos)</p>
            </div>

            <div className="text-4xl font-extrabold text-blue-600">
              {waterGlasses * 250} <span className="text-lg font-medium text-slate-400">ml</span>
            </div>

            <div className="flex justify-center items-center space-x-4">
              <button 
                onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))}
                className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"
              >
                <Minus className="w-6 h-6" />
              </button>
              <span className="text-xl font-semibold w-12">{waterGlasses}</span>
              <button 
                onClick={() => setWaterGlasses(prev => prev + 1)}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <button 
              onClick={() => setWaterGlasses(0)}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center mx-auto space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Zerar contador</span>
            </button>
          </div>
        )}

        {activeTab === 'japamala' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-6">
            <div className="inline-flex p-4 bg-purple-50 rounded-full text-purple-500">
              <Activity className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Contador Japamala</h2>
              <p className="text-slate-500 text-sm">Contagem de mantras (Ciclo de 108)</p>
            </div>

            <div className="text-5xl font-extrabold text-purple-600">
              {japaCount}
            </div>

            <button 
              onClick={() => setJapaCount(prev => (prev >= 108 ? 0 : prev + 1))}
              className="w-full py-6 bg-purple-600 text-white text-xl font-bold rounded-2xl hover:bg-purple-700 shadow-lg active:scale-95 transition-transform"
            >
              Contar Mantra +1
            </button>

            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => setJapaCount(0)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
              {japaCount >= 108 && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ciclo Completo!</span>
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center space-y-6">
            <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600">
              <Timer className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Cronômetro de Atividade</h2>
              <p className="text-slate-500 text-sm">Monitore o tempo de meditação ou treinos</p>
            </div>

            <div className="text-5xl font-mono font-bold text-emerald-600">
              {formatTime(timerSeconds)}
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-colors ${
                  isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isTimerRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button 
                onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
                className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200"
              >
                Zerar
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 max-w-md mx-auto z-10">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <Heart className="w-6 h-6 mb-1" />
          Início
        </button>
        <button 
          onClick={() => setActiveTab('water')}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === 'water' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <Droplets className="w-6 h-6 mb-1" />
          Água
        </button>
        <button 
          onClick={() => setActiveTab('japamala')}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === 'japamala' ? 'text-purple-600' : 'text-slate-400'
          }`}
        >
          <Activity className="w-6 h-6 mb-1" />
          Japamala
        </button>
        <button 
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center text-xs font-medium ${
            activeTab === 'timer' ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <Timer className="w-6 h-6 mb-1" />
          Cronômetro
        </button>
      </nav>
    </div>
  );
}
