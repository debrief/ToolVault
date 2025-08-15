/**
 * Word Count Tool
 * 
 * Analyzes text input and returns comprehensive word and character statistics.
 */

import { ToolValidationError } from '../types';
import { WordCountInput, WordCountOutput, isWordCountInput } from './types';

/**
 * Main tool execution function
 */
export default function run(input: WordCountInput): WordCountOutput {
  // Validate input
  if (!isWordCountInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with text property');
  }

  const { text } = input;

  if (typeof text !== 'string') {
    throw new ToolValidationError('Invalid input: text must be a string');
  }

  try {
    // Count characters
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    // Count words (split on whitespace and filter empty strings)
    const words = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    const count = words.length;

    // Count sentences (basic implementation)
    const sentences = text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .length;

    return {
      count,
      characters,
      charactersNoSpaces,
      words,
      sentences
    };
  } catch (error) {
    throw new Error(`Word count execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is WordCountInput {
  return isWordCountInput(input);
}

/**
 * Tool metadata
 */
export const metadata = {
  version: '1.0.0',
  author: 'ToolVault',
  dependencies: []
};