/**
 * Type definitions for the word-count tool
 */

export interface WordCountInput {
  text: string;
}

export interface WordCountOutput {
  count: number;
  characters: number;
  charactersNoSpaces: number;
  words: string[];
  sentences: number;
}

/**
 * Input validation for word count tool
 */
export function isWordCountInput(input: any): input is WordCountInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof input.text === 'string'
  );
}