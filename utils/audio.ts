export const playSound = (soundType: string): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (soundType === 'beep') {
      oscillator.frequency.value = 440;
    } else if (soundType === 'complete') {
      oscillator.frequency.value = 880;
    } else {
      oscillator.frequency.value = 520;
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Erro ao reproduzir áudio:', error);
  }
};
