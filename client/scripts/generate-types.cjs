#!/usr/bin/env node

const { compile } = require('json-schema-to-typescript');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../src/types/index.schema.json');
const outputPath = path.join(__dirname, '../src/types/index.ts');

async function generateTypes() {
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    const ts = await compile(schema, 'ToolVaultIndex', {
      bannerComment: `/* tslint:disable */
/**
 * This file was automatically generated from index.schema.json.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'pnpm generate-types' to regenerate this file.
 */`,
      style: {
        singleQuote: true,
      },
      additionalProperties: false,
      strictIndexSignatures: true,
      enableConstEnums: true,
    });

    // Add our custom type aliases and utilities
    const additionalTypes = `
// Additional type aliases for convenience
export type Tool = ToolVaultIndex['tools'][number];
export type ToolInput = Tool['inputs'][number];  
export type ToolOutput = Tool['outputs'][number];

// Type guards for runtime validation
export function isToolVaultIndex(data: unknown): data is ToolVaultIndex {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'version' in data &&
    'tools' in data &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).version === 'string' &&
    Array.isArray((data as any).tools)
  );
}

export function isTool(data: unknown): data is Tool {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'description' in data &&
    'inputs' in data &&
    'outputs' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).name === 'string' &&
    typeof (data as any).description === 'string' &&
    Array.isArray((data as any).inputs) &&
    Array.isArray((data as any).outputs)
  );
}
`;

    fs.writeFileSync(outputPath, ts + additionalTypes);
    console.log(`✅ TypeScript types generated successfully at ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

generateTypes();