/**
 * Type definitions for the change-color-to-red tool
 */

export interface ChangeColorToRedInput {
  text: string;
}

export interface ChangeColorToRedOutput {
  html: string;
  originalText: string;
  colorChanges: number;
}

/**
 * Input validation for change color to red tool
 */
export function isChangeColorToRedInput(input: any): input is ChangeColorToRedInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof input.text === 'string'
  );
}