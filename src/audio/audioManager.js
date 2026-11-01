import { BGM_SOUNDS, SE_SOUNDS } from './soundConfig';

let seVolume = 0.6;
let bgmVolume = 0.2;
let bgm;
let bgmName;
const seSources = new Map();

const safelyPlay = (audio) => {
  try {
    const result = audio.play();
    if (result?.catch) result.catch((error) => console.warn('Audio playback was blocked or failed.', error));
    return result ?? Promise.resolve();
  } catch (error) {
    console.warn('Audio playback was blocked or failed.', error);
    return Promise.resolve(false);
  }
};

export const preloadAudio = () => {
  if (typeof Audio === 'undefined') return;
  Object.entries(SE_SOUNDS).forEach(([name, src]) => {
    if (!seSources.has(name)) { const audio = new Audio(src); audio.preload = 'auto'; seSources.set(name, audio); }
  });
};

export const playSE = (soundName, event) => {
  if (event?.nativeEvent) event.nativeEvent.__idelisSoundHandled = true;
  const source = seSources.get(soundName);
  if (!source) return false;
  const audio = source.cloneNode();
  audio.volume = seVolume;
  safelyPlay(audio);
  return true;
};

export const playBGM = (name) => {
  const src = BGM_SOUNDS[name];
  if (!src || typeof Audio === 'undefined') return Promise.resolve(false);
  if (!bgm || bgmName !== name) {
    if (bgm) { bgm.pause(); bgm.currentTime = 0; }
    bgm = new Audio(src); bgm.loop = true; bgm.preload = 'auto'; bgmName = name;
  }
  bgm.volume = bgmVolume;
  return safelyPlay(bgm).then((didPlay) => didPlay === false ? false : true).catch(() => false);
};
export const stopBGM = () => { if (bgm) { bgm.pause(); bgm.currentTime = 0; } };
export const setSEVolume = (volume) => { seVolume = Math.min(1, Math.max(0, Number(volume) || 0)); };
export const setBGMVolume = (volume) => { bgmVolume = Math.min(1, Math.max(0, Number(volume) || 0)); if (bgm) bgm.volume = bgmVolume; };
