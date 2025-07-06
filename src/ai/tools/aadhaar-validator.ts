'use server';
/**
 * @fileOverview A tool for validating an Aadhaar number.
 *
 * - validateAadhaarNumber - A tool that simulates validating an Aadhaar number.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// A simple regex for 12-digit numbers.
const AADHAAR_REGEX = /^\d{12}$/;

export const validateAadhaarNumber = ai.defineTool(
  {
    name: 'validateAadhaarNumber',
    description:
      "Validates an Indian Aadhaar number. It checks if the number is a valid 12-digit number. This is a simulation and does not connect to a government database.",
    inputSchema: z.object({
      aadhaarNumber: z.string().describe('The 12-digit Aadhaar number to validate, with spaces removed.'),
    }),
    outputSchema: z.object({
      isValid: z.boolean().describe('Whether the Aadhaar number is valid.'),
    }),
  },
  async (input) => {
    // In a real application, this would call a government API.
    // For this prototype, we'll just simulate it by checking the format.
    const isValid = AADHAAR_REGEX.test(input.aadhaarNumber.replace(/\s/g, ''));
    return {isValid};
  }
);
