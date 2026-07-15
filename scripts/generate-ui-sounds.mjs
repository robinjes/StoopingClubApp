import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../assets/sounds');

function writeWav(filePath, { duration = 0.15, frequency = 440, volume = 0.25, type = 'sine' }) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const attack = Math.min(1, i / (sampleRate * 0.008));
    const release = Math.min(1, (numSamples - i) / (sampleRate * 0.06));
    const env = attack * release;
    let sample = 0;

    if (type === 'sine') {
      sample = Math.sin(2 * Math.PI * frequency * t);
    } else if (type === 'noise') {
      sample = (Math.random() * 2 - 1) * 0.4;
    } else if (type === 'chirp') {
      const f = frequency * 0.5 + ((frequency * 2.2 - frequency * 0.5) * t) / duration;
      sample = Math.sin(2 * Math.PI * f * t);
    } else if (type === 'chime') {
      sample =
        Math.sin(2 * Math.PI * frequency * t) * 0.6 +
        Math.sin(2 * Math.PI * frequency * 1.26 * t) * 0.35;
    }

    const val = Math.max(-32767, Math.min(32767, sample * volume * env * 32767));
    buffer.writeInt16LE(val, 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

writeWav(path.join(outDir, 'pop.wav'), { duration: 0.07, frequency: 520, volume: 0.16 });
writeWav(path.join(outDir, 'swoosh.wav'), { duration: 0.2, frequency: 300, volume: 0.1, type: 'chirp' });
writeWav(path.join(outDir, 'paper.wav'), { duration: 0.1, frequency: 200, volume: 0.07, type: 'noise' });
writeWav(path.join(outDir, 'page-rustle.wav'), { duration: 0.16, frequency: 240, volume: 0.09, type: 'noise' });
writeWav(path.join(outDir, 'success.wav'), { duration: 0.42, frequency: 660, volume: 0.17, type: 'chime' });
writeWav(path.join(outDir, 'slide-out.wav'), { duration: 0.12, frequency: 220, volume: 0.09, type: 'chirp' });
writeWav(path.join(outDir, 'notification.wav'), { duration: 0.32, frequency: 784, volume: 0.14, type: 'chime' });

console.log('Generated UI sounds in assets/sounds/');
