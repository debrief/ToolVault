#!/usr/bin/env node

/**
 * Bundle Validation Script
 * 
 * Validates the JavaScript bundle structure and metadata integrity.
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_ROOT = path.resolve(__dirname, '..');
const INDEX_JSON_PATH = path.join(BUNDLE_ROOT, 'index.json');
const TOOLS_DIR = path.join(BUNDLE_ROOT, 'tools');

function validateFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing ${description}: ${filePath}`);
    return false;
  }
  console.log(`✅ Found ${description}: ${path.relative(BUNDLE_ROOT, filePath)}`);
  return true;
}

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    console.log(`✅ Valid JSON: ${path.relative(BUNDLE_ROOT, filePath)}`);
    return parsed;
  } catch (error) {
    console.error(`❌ Invalid JSON in ${filePath}: ${error.message}`);
    return null;
  }
}

function getToolCategory(tool) {
  // Map tool IDs to their directory categories based on labels or known structure
  const categoryMap = {
    'translate': 'transform',
    'flip-horizontal': 'transform', 
    'flip-vertical': 'transform',
    'speed-series': 'analysis',
    'direction-series': 'analysis',
    'average-speed': 'statistics',
    'speed-histogram': 'statistics',
    'smooth-polyline': 'processing',
    'export-csv': 'io',
    'export-rep': 'io',
    'import-rep': 'io'
  };
  
  return categoryMap[tool.id] || (tool.labels && tool.labels[0]) || 'unknown';
}

function getToolFunctionName(toolId) {
  // Map tool IDs to their actual function names in window.ToolVault.tools
  const functionMap = {
    'translate': 'translate',
    'flip-horizontal': 'flipHorizontal',
    'flip-vertical': 'flipVertical', 
    'speed-series': 'calculateSpeedSeries',
    'direction-series': 'calculateDirectionSeries',
    'average-speed': 'calculateAverageSpeed',
    'speed-histogram': 'createSpeedHistogram',
    'smooth-polyline': 'smoothPolyline',
    'export-csv': 'exportCSV',
    'export-rep': 'exportREP',
    'import-rep': 'importREP'
  };
  
  return functionMap[toolId] || toolId;
}

function validateBundleStructure() {
  console.log('🔍 Validating bundle structure...\n');
  
  let isValid = true;
  
  // Validate index.json exists and is valid JSON
  isValid = validateFile(INDEX_JSON_PATH, 'bundle metadata') && isValid;
  const metadata = validateJSON(INDEX_JSON_PATH);
  
  if (!metadata) {
    return false;
  }
  
  // Validate tools directory exists
  isValid = validateFile(TOOLS_DIR, 'tools directory') && isValid;
  
  // Validate each tool in metadata has corresponding files
  console.log(`\n🔧 Validating ${metadata.tools?.length || 0} tools...`);
  
  if (metadata.tools) {
    for (const tool of metadata.tools) {
      const category = getToolCategory(tool);
      const toolPath = path.join(TOOLS_DIR, category, `${tool.id}.js`);
      const toolExists = validateFile(toolPath, `tool implementation (${tool.id})`);
      isValid = toolExists && isValid;
      
      if (toolExists) {
        // Basic validation that it's a proper IIFE tool
        const toolContent = fs.readFileSync(toolPath, 'utf8');
        const hasIIFE = toolContent.includes('(function()') || toolContent.includes('(() => {');
        const expectedFunctionName = getToolFunctionName(tool.id);
        const hasRegistration = toolContent.includes(`window.ToolVault.tools.${expectedFunctionName}`);
        
        if (!hasIIFE) {
          console.error(`❌ Tool ${tool.id} does not use IIFE pattern`);
          isValid = false;
        }
        
        if (!hasRegistration) {
          console.error(`❌ Tool ${tool.id} does not register properly (expected: ${expectedFunctionName})`);
          isValid = false;
        }
        
        if (hasIIFE && hasRegistration) {
          console.log(`✅ Tool ${tool.id} structure valid`);
        }
      }
    }
  }
  
  return isValid;
}

function main() {
  console.log('🚀 ToolVault JavaScript Bundle Validator\n');
  
  const isValid = validateBundleStructure();
  
  if (isValid) {
    console.log('\n🎉 Bundle validation successful! All components are present and valid.');
    process.exit(0);
  } else {
    console.log('\n💥 Bundle validation failed! Please fix the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateBundleStructure };