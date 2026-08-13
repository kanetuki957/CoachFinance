const NOTES = [
  [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 392.0],
  [220.0, 261.63, 329.63, 440.0, 329.63, 261.63, 246.94, 329.63],
  [196.0, 246.94, 293.66, 392.0, 293.66, 246.94, 220.0, 293.66],
  [174.61, 220.0, 261.63, 349.23, 261.63, 220.0, 196.0, 261.63],
];

const BEAT_SECONDS = 0.34;

const playNote = (context, destination, frequency, startTime) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.075, startTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + BEAT_SECONDS * 0.9);

  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + BEAT_SECONDS);
};

export const createGoalBgm = () => {
  let context;
  let timer;
  let measure = 0;

  const scheduleMeasure = () => {
    const startTime = context.currentTime + 0.04;
    const notes = NOTES[measure % NOTES.length];

    notes.forEach((note, index) => playNote(context, context.destination, note, startTime + index * BEAT_SECONDS));
    measure += 1;
  };

  return {
    async start() {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return false;
        context = new AudioContext();
      }

      await context.resume();
      if (timer) return true;

      scheduleMeasure();
      timer = window.setInterval(scheduleMeasure, NOTES[0].length * BEAT_SECONDS * 1000);
      return true;
    },
    stop() {
      if (timer) window.clearInterval(timer);
      timer = undefined;
      if (context && context.state !== 'closed') context.suspend();
    },
    dispose() {
      if (timer) window.clearInterval(timer);
      timer = undefined;
      if (context && context.state !== 'closed') context.close();
      context = undefined;
    },
  };
};
