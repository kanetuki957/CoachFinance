import { BGM_SOUNDS, SE_SOUNDS } from './soundConfig';

let seVolume = 0.6;
let bgmVolume = 0.2;
let bgm;
let transitionId = 0;
const seSources = new Map();
const bgmSources = new Map();
const FADE_DURATION = 500;

const safelyPlay = async (audio) => {
  try {
    await audio.play();
    return true;
  } catch (error) {
    // Autoplay policies and missing assets must not affect app interaction.
    console.warn('Audio playback was blocked or failed.', error);
    return false;
  }
};

const getBGMSource = (name) => {
  const src = BGM_SOUNDS[name];
  if (!src || typeof Audio === 'undefined') return null;
  if (!bgmSources.has(name)) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = 'auto';
    bgmSources.set(name, audio);
  }
  return bgmSources.get(name);
};

const fadeTo = (audio, targetVolume, transition, duration = FADE_DURATION) => new Promise((resolve) => {
  const startVolume = audio.volume;
  const startedAt = performance.now();
  const update = (now) => {
    if (transition !== transitionId) { resolve(false); return; }
    const progress = Math.min((now - startedAt) / duration, 1);
    audio.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress < 1) requestAnimationFrame(update);
    else resolve(true);
  };
  requestAnimationFrame(update);
});

export const preloadAudio = () => {
  if (typeof Audio === 'undefined') return;
  Object.entries(SE_SOUNDS).forEach(([name, src]) => {
    if (!seSources.has(name)) { const audio = new Audio(src); audio.preload = 'auto'; seSources.set(name, audio); }
  });
  Object.keys(BGM_SOUNDS).filter((name) => name !== 'pocoShopping').forEach(getBGMSource);
};

export const playSE = (soundName, event) => {
  if (event?.nativeEvent) event.nativeEvent.__idelisSoundHandled = true;
  const source = seSources.get(soundName);
  if (!source) return false;
  const audio = source.cloneNode();
  audio.volume = seVolume;
  void safelyPlay(audio);
  return true;
};

export const playBGM = async (name) => {
  const nextBgm = getBGMSource(name);
  if (!nextBgm) return false;
  if (bgm === nextBgm) {
    transitionId += 1;
    bgm.volume = bgmVolume;
    return safelyPlay(bgm);
  }

  const currentTransition = ++transitionId;
  if (bgm) {
    await fadeTo(bgm, 0, currentTransition);
    if (currentTransition !== transitionId) return false;
    bgm.pause();
    bgm.currentTime = 0;
  }

  bgm = nextBgm;
  bgm.volume = 0;
  const didStart = await safelyPlay(bgm);
  if (!didStart || currentTransition !== transitionId) return didStart;
  await fadeTo(bgm, bgmVolume, currentTransition);
  return true;
};

export const retryBGM = () => bgm ? safelyPlay(bgm) : Promise.resolve(false);
export const stopBGM = () => {
  transitionId += 1;
  if (bgm) { bgm.pause(); bgm.currentTime = 0; }
};
export const setSEVolume = (volume) => { seVolume = Math.min(1, Math.max(0, Number(volume) || 0)); };
export const setBGMVolume = (volume) => { bgmVolume = Math.min(1, Math.max(0, Number(volume) || 0)); if (bgm) bgm.volume = bgmVolume; };
