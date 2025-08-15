/**
 * Change Color to Red Tool
 * 
 * Converts text to HTML with red color styling for any color words found.
 * This tool demonstrates simple text processing with HTML output.
 */

import { ToolValidationError } from '../types';
import { ChangeColorToRedInput, ChangeColorToRedOutput, isChangeColorToRedInput } from './types';

// List of color words to replace
const COLOR_WORDS = [
  'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white', 'gray', 'grey',
  'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'silver', 'gold', 'violet',
  'indigo', 'turquoise', 'crimson', 'scarlet', 'azure', 'beige', 'coral', 'ivory', 'khaki'
];

/**
 * Main tool execution function
 */
export default function run(input: ChangeColorToRedInput): ChangeColorToRedOutput {
  // Validate input
  if (!isChangeColorToRedInput(input)) {
    throw new ToolValidationError('Invalid input: expected object with text property');
  }

  const { text } = input;

  if (typeof text !== 'string') {
    throw new ToolValidationError('Invalid input: text must be a string');
  }

  try {
    let html = text;
    let colorChanges = 0;
    const originalText = text;

    // Replace color words with red-styled versions
    COLOR_WORDS.forEach(color => {
      // Use case-insensitive regex with word boundaries
      const regex = new RegExp(`\\b${color}\\b`, 'gi');
      const matches = html.match(regex);
      
      if (matches) {
        colorChanges += matches.length;
        html = html.replace(regex, '<span style="color: red; font-weight: bold;">red</span>');
      }
    });

    return {
      html,
      originalText,
      colorChanges
    };
  } catch (error) {
    throw new Error(`Change color to red execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Input validation function
 */
export function validate(input: any): input is ChangeColorToRedInput {
  return isChangeColorToRedInput(input);
}

/**
 * Tool metadata
 */
export const metadata = {
  version: '1.0.0',
  author: 'ToolVault',
  dependencies: []
};