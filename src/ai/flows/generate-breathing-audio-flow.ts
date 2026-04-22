'use server';
/**
 * @fileOverview A flow for generating breathing guide audio using TTS.
 *
 * - generateBreathingAudio - Function to generate audio for a specific breathing instruction.
 * - BreathingAudioInput - The input type for the flow.
 * - BreathingAudioOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const BreathingAudioInputSchema = z.object({
  text: z.string().describe('The instruction text to convert to speech.'),
});
export type BreathingAudioInput = z.infer<typeof BreathingAudioInputSchema>;

const BreathingAudioOutputSchema = z.object({
  audioUri: z.string().describe('A data URI containing the generated audio in WAV format.'),
});
export type BreathingAudioOutput = z.infer<typeof BreathingAudioOutputSchema>;

export async function generateBreathingAudio(input: BreathingAudioInput): Promise<BreathingAudioOutput> {
  return generateBreathingAudioFlow(input);
}

const generateBreathingAudioFlow = ai.defineFlow(
  {
    name: 'generateBreathingAudioFlow',
    inputSchema: BreathingAudioInputSchema,
    outputSchema: BreathingAudioOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // Reliable female meditation trainer voice
          },
        },
      },
      prompt: input.text,
    });

    if (!media || !media.url) {
      throw new Error('No audio media returned from the model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
