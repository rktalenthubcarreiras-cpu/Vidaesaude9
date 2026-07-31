import React, { useState, useEffect, useRef } from 'react';
import { ActiveTab, AudioBookTrack, PowerAffirmation, WisdomQuote, JapamalaState, ReaderSettings, RoutineTask, VaultEntry, WeightEntry, ExerciseGuide, UploadedVideo, SyllabusTopic, ConcursoHeaderInfo, WaterLog, MonthlyTrophy } from './types';
import { RuseTimeGlow } from './hooks/useTimeGlow';
import { StorageService } from './utils/storage';
import { SoundEngine } from './utils/audio';

// Components
import { Navbar } from './components/layout/Navbar';
import { BottomBar } from './components/layout/BottomBar';
import { GlobalAudioPlayer } from './components/audio/GlobalAudioPlayer';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';

// Modules
import { InicioModule } from './components/modules/InicioModule';
import { MenteInabalavelModule } from './components/modules/MenteInabalavelModule';
import { RotinaModule } from './components/modules/RotinaModule';
import { TreinosModule } from './components/modules/TreinosModule';
import { EstudosModule } from './components/modules/EstudosModule';
import { FeModule } from './components/modules/FeModule';
import { ProgressoModule } from './components/modules/ProgressoModule';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const { mode, changeMode, isDaytime, glowStyles } = useTimeGlow();

  // PWA installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA instalado com sucesso!');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // --- STATE WITH OFFLINE STORAGE ---
  const [affirmations, setAffirmations] = useState<PowerAffirmation[]>(() => StorageService.getAffirmations());
  const [wisdomQuotes, setWisdomQuotes] = useState<WisdomQuote[]>(() => StorageService.getWisdomQuotes());
  const [japamala, setJapamala] = useState<JapamalaState>(() => StorageService.getJapamala());
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => StorageService.getReaderSettings());
  const [routines, setRoutines] = useState<RoutineTask[]>(() => StorageService.getRoutines());
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>(() => StorageService.getVault());
  const [weights, setWeights] = useState<WeightEntry[]>(() => StorageService.getWeights());
  const [exercises, setExercises] = useState<ExerciseGuide[]>(() => StorageService.getExercises());
  const [videos, setVideos] = useState<UploadedVideo[]>(() => StorageService.getVideos());
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>(() => StorageService.getSyllabus());
  const [concursoInfo, setConcursoInfo] = useState<ConcursoHeaderInfo>(() => StorageService.getConcursoInfo());
  const [notebookText, setNotebookText] = useState<string>(() => StorageService.getNotebook());
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => StorageService.getWaterLogs());
  const [waterTarget, setWaterTarget] = useState<number>(() => StorageService.getWaterTarget());
  const [trophies, setTrophies] = useState<MonthlyTrophy[]>(() => StorageService.getTrophies());
  const [complaintStreak, setComplaintStreak] = useState<number>(() => StorageService.getComplaintStreak());

  // --- AUDIOBOOK ENGINE STATE ---
  const [currentAudioTrack, setCurrentAudioTrack] = useState<AudioBookTrack | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);

  // Web Speech API utterance ref
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Update storage on state updates
  const handleUpdateAffirmations = (newVal: PowerAffirmation[]) => {
    setAffirmations(newVal);
    StorageService.saveAffirmations(newVal);
  };

  const handleUpdateJapamala = (newVal: JapamalaState) => {
    setJapamala(newVal);
    StorageService.saveJapamala(newVal);
  };

  const handleUpdateRoutines = (newVal: RoutineTask[]) => {
    setRoutines(newVal);
    StorageService.saveRoutines(newVal);
  };

  const handleUpdateVault = (newVal: VaultEntry[]) => {
    setVaultEntries(newVal);
    StorageService.saveVault(newVal);
  };

  const handleUpdateWeights = (newVal: WeightEntry[]) => {
    setWeights(newVal);
    StorageService.saveWeights(newVal);
  };

  const handleUpdateSyllabus = (newVal: SyllabusTopic[]) => {
    setSyllabus(newVal);
    StorageService.saveSyllabus(newVal);
  };

  const handleUpdateNotebook = (newVal: string) => {
    setNotebookText(newVal);
    StorageService.saveNotebook(newVal);
  };

  const handleUpdateWaterLogs = (newVal: WaterLog[]) => {
    setWaterLogs(newVal);
    StorageService.saveWaterLogs(newVal);
  };

  // --- TTS SPEECH SYNTHESIS ENGINE ---
  const speakCurrentParagraph = (track: AudioBookTrack, pIndex: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // stop current utterance

    if (!track.contentParagraphs || !track.contentParagraphs[pIndex]) return;

    const textToSpeak = track.contentParagraphs[pIndex];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = readerSettings.ttsSpeed || 1.0;

    utterance.onend = () => {
      // Advance to next paragraph automatically!
      if (pIndex + 1 < track.contentParagraphs.length) {
        setActiveParagraphIndex(pIndex + 1);
        speakCurrentParagraph(track, pIndex + 1);
      } else {
        setIsAudioPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsAudioPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudioTrack = (track: AudioBookTrack, paragraphIndex = 0) => {
    setCurrentAudioTrack(track);
    setActiveParagraphIndex(paragraphIndex);
    setIsAudioPlaying(true);
    speakCurrentParagraph(track, paragraphIndex);
  };

  const handleToggleAudioPlay = () => {
    if (!currentAudioTrack) return;

    if (isAudioPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsAudioPlaying(false);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          speakCurrentParagraph(currentAudioTrack, activeParagraphIndex);
        }
      }
      setIsAudioPlaying(true);
    }
  };

  const handleNextParagraph = () => {
    if (!currentAudioTrack) return;
    const nextIdx = Math.min(currentAudioTrack.contentParagraphs.length - 1, activeParagraphIndex + 1);
    setActiveParagraphIndex(nextIdx);
    if (isAudioPlaying) speakCurrentParagraph(currentAudioTrack, nextIdx);
  };

  const handlePrevParagraph = () => {
    if (!currentAudioTrack) return;
    const prevIdx = Math.max(0, activeParagraphIndex - 1);
    setActiveParagraphIndex(prevIdx);
    if (isAudioPlaying) speakCurrentParagraph(currentAudioTrack, prevIdx);
  };

  const handleUpdateReaderSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...readerSettings, ...newSettings };
    setReaderSettings(updated);
    StorageService.saveReaderSettings(updated);
  };

  const handleQuickWater = (amountMl: number) => {
    SoundEngine.triggerHaptic(20);
    SoundEngine.playJapamalaChime();
    const newLog: WaterLog = {
      id: `wl-${Date.now()}`,
      amountMl,
      timestamp: new Date().toISOString()
    };
    handleUpdateWaterLogs([...waterLogs, newLog]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      {/* ELEGANT DARK SUNSET SIDE GLOW OVERLAYS */}
      <div className="sunset-glow-left" />
      <div className="sunset-glow-right" />

      {/* DYNAMIC SOL E NOITE BORDER GLOW CONTAINERS */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-2 z-30 pointer-events-none transition-all duration-700 ${glowStyles.borderGlowLeft}`}
      />
      <div
        className={`fixed top-0 bottom-0 right-0 w-2 z-30 pointer-events-none transition-all duration-700 ${glowStyles.borderGlowRight}`}
      />

      {/* HEADER NAVBAR */}
      <Navbar
        activeTab={activeTab}
        timeMode={mode}
        isDaytime={isDaytime}
        onToggleTimeMode={() => {
          const nextMode = mode === 'auto' ? 'sol' : mode === 'sol' ? 'noite' : 'auto';
          changeMode(nextMode);
        }}
        complaintStreak={complaintStreak}
        canInstallPWA={true}
        onInstallPWA={handleInstallPWA}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {activeTab === 'inicio' && (
          <InicioModule
            affirmation={affirmations[0]}
            complaintStreak={complaintStreak}
            routines={routines}
            onSelectTab={setActiveTab}
            onDeclareAffirmation={() => {
              SoundEngine.triggerHaptic([40, 30, 60]);
              SoundEngine.playJapamalaChime();
              const updated = affirmations.map((a, i) => (i === 0 ? { ...a, declaredToday: true } : a));
              handleUpdateAffirmations(updated);
            }}
            onQuickWater={handleQuickWater}
          />
        )}

        {activeTab === 'rotina' && (
          <div className="space-y-6">
            <MenteInabalavelModule
              affirmations={affirmations}
              wisdomQuotes={wisdomQuotes}
              japamala={japamala}
              onUpdateAffirmations={handleUpdateAffirmations}
              onUpdateJapamala={handleUpdateJapamala}
            />
            <RotinaModule
              routines={routines}
              vaultEntries={vaultEntries}
              complaintStreak={complaintStreak}
              onUpdateRoutines={handleUpdateRoutines}
              onUpdateVault={handleUpdateVault}
              onUpdateComplaintStreak={(s) => {
                setComplaintStreak(s);
                StorageService.saveComplaintStreak(s);
              }}
            />
          </div>
        )}

        {activeTab === 'treinos' && (
          <TreinosModule
            weights={weights}
            exercises={exercises}
            videos={videos}
            onUpdateWeights={handleUpdateWeights}
            onUpdateExercises={(ex) => {
              setExercises(ex);
              StorageService.saveExercises(ex);
            }}
            onUpdateVideos={(vids) => {
              setVideos(vids);
              StorageService.saveVideos(vids);
            }}
          />
        )}

        {activeTab === 'estudos' && (
          <EstudosModule
            syllabus={syllabus}
            concursoInfo={concursoInfo}
            notebookText={notebookText}
            onUpdateSyllabus={handleUpdateSyllabus}
            onUpdateConcursoInfo={(info) => {
              setConcursoInfo(info);
              StorageService.saveConcursoInfo(info);
            }}
            onUpdateNotebook={handleUpdateNotebook}
            onPlayAudioTrack={handlePlayAudioTrack}
          />
        )}

        {activeTab === 'fe' && (
          <FeModule
            currentPlayingTrack={currentAudioTrack}
            isPlaying={isAudioPlaying}
            activeParagraphIndex={activeParagraphIndex}
            readerSettings={readerSettings}
            onPlayTrack={handlePlayAudioTrack}
            onTogglePlay={handleToggleAudioPlay}
          />
        )}

        {activeTab === 'progresso' && (
          <ProgressoModule
            waterLogs={waterLogs}
            waterTarget={waterTarget}
            weights={weights}
            syllabus={syllabus}
            trophies={trophies}
            japamala={japamala}
            onUpdateWaterLogs={handleUpdateWaterLogs}
            onUpdateWaterTarget={(t) => {
              setWaterTarget(t);
              StorageService.saveWaterTarget(t);
            }}
          />
        )}
      </main>

      {/* GLOBAL AUDIO PLAYER FLOATING MINI BAR */}
      <GlobalAudioPlayer
        currentTrack={currentAudioTrack}
        isPlaying={isAudioPlaying}
        activeParagraphIndex={activeParagraphIndex}
        readerSettings={readerSettings}
        onTogglePlay={handleToggleAudioPlay}
        onNextParagraph={handleNextParagraph}
        onPrevParagraph={handlePrevParagraph}
        onSelectParagraph={(idx) => {
          setActiveParagraphIndex(idx);
          if (currentAudioTrack) speakCurrentParagraph(currentAudioTrack, idx);
        }}
        onClosePlayer={() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setIsAudioPlaying(false);
          setCurrentAudioTrack(null);
        }}
        onUpdateSettings={handleUpdateReaderSettings}
      />

      {/* PWA INSTALLATION BANNER & MODAL */}
      <PwaInstallPrompt
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallPWA}
      />

      {/* 6-COLUMN BOTTOM NAVIGATION BAR */}
      <BottomBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
