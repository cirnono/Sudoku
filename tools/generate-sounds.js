const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outputDir, { recursive: true });

function createWave(filename, notes, volume = 0.22) {
  const sampleRate = 22050;
  const duration = notes.reduce((total, note) => total + note.duration, 0);
  const samples = Math.ceil(sampleRate * duration);
  const data = Buffer.alloc(samples * 2);
  let sampleOffset = 0;

  for (const note of notes) {
    const noteSamples = Math.ceil(sampleRate * note.duration);
    for (let i = 0; i < noteSamples && sampleOffset < samples; i++, sampleOffset++) {
      const progress = i / noteSamples;
      const attack = Math.min(1, progress / 0.06);
      const release = Math.pow(1 - progress, 2.3);
      const fundamental = Math.sin(2 * Math.PI * note.frequency * i / sampleRate);
      const overtone = Math.sin(4 * Math.PI * note.frequency * i / sampleRate) * 0.16;
      const value = (fundamental + overtone) * attack * release * volume;
      data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(value * 32767))), sampleOffset * 2);
    }
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(outputDir, filename), Buffer.concat([header, data]));
}

createWave('tap.wav', [{ frequency: 660, duration: 0.055 }], 0.12);
createWave('place.wav', [
  { frequency: 523.25, duration: 0.07 },
  { frequency: 659.25, duration: 0.09 },
], 0.16);
createWave('complete.wav', [
  { frequency: 523.25, duration: 0.12 },
  { frequency: 659.25, duration: 0.12 },
  { frequency: 783.99, duration: 0.12 },
  { frequency: 1046.5, duration: 0.32 },
], 0.18);
