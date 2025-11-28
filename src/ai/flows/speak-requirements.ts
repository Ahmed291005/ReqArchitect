'use server';

/**
 * @fileOverview Converts a list of requirements into speech.
 *
 * - speakRequirements - A function that converts text to speech.
 * - SpeakRequirementsInput - The input type for the speakRequirements function.
 * - SpeakRequirementsOutput - The return type for the speakRequirements function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const SpeakRequirementsInputSchema = z.object({
  requirements: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        description: z.string(),
        priority: z.string(),
      })
    )
    .describe('An array of requirements to be spoken.'),
});
export type SpeakRequirementsInput = z.infer<
  typeof SpeakRequirementsInputSchema
>;

const SpeakRequirementsOutputSchema = z.object({
  audio: z.string().describe('The base64 encoded WAV audio data URI.'),
});
export type SpeakRequirementsOutput = z.infer<
  typeof SpeakRequirementsOutputSchema
>;

export async function speakRequirements(
  input: SpeakRequirementsInput
): Promise<SpeakRequirementsOutput> {
  return speakRequirementsFlow(input);
}

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

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const speakRequirementsFlow = ai.defineFlow(
  {
    name: 'speakRequirementsFlow',
    inputSchema: SpeakRequirementsInputSchema,
    outputSchema: SpeakRequirementsOutputSchema,
  },
  async input => {
    const requirementsText = input.requirements
      .map(
        r =>
          `Requirement ${r.id}: ${r.description} (Priority: ${r.priority})`
      )
      .join('. ');

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: `Here are the requirements. ${requirementsText}`,
    });

    if (!media) {
      throw new Error('No audio was generated.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audio: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
