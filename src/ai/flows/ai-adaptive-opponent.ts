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
  puckVY: z.number().describe('The y velocity of the puck.'),
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

  The puck is at ({{{puckX}}}, {{{puckY}}}) and moving with a y-velocity of {{{puckVY}}}.
  Your paddle is at y-coordinate {{{paddleY}}}.
  Your difficulty is set to {{{difficulty}}} (0=easy, 1=hard).

  - If puck is moving away from you (puckVY > 0), move towards the center (180).
  - If puck is moving towards you (puckVY <= 0), predict the puck's trajectory to intercept it.
  - Your reaction and accuracy are determined by the difficulty. At higher difficulties, you should be more precise.
  - Return the target x-coordinate for your paddle. It must be a number between 0 and 360.
  - Do not provide any explanation, only return the JSON object with the 'x' coordinate.
  `,
});

const aiAdaptiveOpponentFlow = ai.defineFlow(
  {
    name: 'aiAdaptiveOpponentFlow',
    inputSchema: AIPaddlePositionInputSchema,
    outputSchema: AIPaddlePositionOutputSchema,
  },
  async input => {
    // If puck is moving away from AI, just center the paddle.
    if (input.puckVY > 0) {
      return { x: 180 };
    }
    const {output} = await aiAdaptiveOpponentPrompt(input);
    return output!;
  }
);
