'use server';

/**
 * @fileOverview AI opponent that adapts its difficulty based on player performance.
 *
 * - getAiPaddlePosition - A function that calculates the AI paddle position.
 * - AIPaddlePositionInput - The input type for the getAiPaddlePosition function.
 * - AIPaddlePositionOutput - The return type for the getAiPaddlePosition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPaddlePositionInputSchema = z.object({
  puckX: z.number().describe('The x coordinate of the puck.'),
  puckY: z.number().describe('The y coordinate of the puck.'),
  paddleX: z.number().describe('The x coordinate of the AI paddle.'),
  paddleY: z.number().describe('The y coordinate of the AI paddle.'),
  difficulty: z.number().describe('The difficulty level of the AI (0-1).'),
});
export type AIPaddlePositionInput = z.infer<typeof AIPaddlePositionInputSchema>;

const AIPaddlePositionOutputSchema = z.object({
  x: z.number().describe('The new x coordinate of the AI paddle.'),
});
export type AIPaddlePositionOutput = z.infer<typeof AIPaddlePositionOutputSchema>;

export async function getAiPaddlePosition(input: AIPaddlePositionInput): Promise<AIPaddlePositionOutput> {
  return aiAdaptiveOpponentFlow(input);
}

const aiAdaptiveOpponentPrompt = ai.definePrompt({
  name: 'aiAdaptiveOpponentPrompt',
  input: {schema: AIPaddlePositionInputSchema},
  output: {schema: AIPaddlePositionOutputSchema},
  prompt: `You are an AI that plays air hockey. Your goal is to position your paddle to intercept the puck.

  The difficulty level is a number between 0 and 1, where 0 is the easiest and 1 is the hardest.

  Given the following game state, determine the best x coordinate for the AI paddle:

  Puck X: {{{puckX}}}
  Puck Y: {{{puckY}}}
  Paddle X: {{{paddleX}}}
  Paddle Y: {{{paddleY}}}
  Difficulty: {{{difficulty}}}

  Return the new x coordinate of the AI paddle.
  The value must be between 0 and 360.
  Do not provide any explanation, only return a number.
  `,
});

const aiAdaptiveOpponentFlow = ai.defineFlow(
  {
    name: 'aiAdaptiveOpponentFlow',
    inputSchema: AIPaddlePositionInputSchema,
    outputSchema: AIPaddlePositionOutputSchema,
  },
  async input => {
    const {output} = await aiAdaptiveOpponentPrompt(input);
    return output!;
  }
);
