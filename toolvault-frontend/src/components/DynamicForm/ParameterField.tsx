import React from 'react';
import type { ParameterSchema } from './ParameterValidation';
import './ParameterField.css';

interface ParameterFieldProps {
  schema: ParameterSchema;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const ParameterField: React.FC<ParameterFieldProps> = ({
  schema,
  value,
  onChange,
  error
}) => {
  const renderField = () => {
    switch (schema.type) {
      case 'number':
        return (
          <input
            type="number"
            className={`parameter-input ${error ? 'error' : ''}`}
            value={value || schema.default || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={schema.min}
            max={schema.max}
            step={schema.step || 'any'}
            placeholder={String(schema.default || '')}
          />
        );

      case 'string':
        if (schema.enum) {
          return (
            <select
              className={`parameter-select ${error ? 'error' : ''}`}
              value={value || schema.default || ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {schema.enum.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        
        if (schema.description && schema.description.length > 100) {
          return (
            <textarea
              className={`parameter-textarea ${error ? 'error' : ''}`}
              value={value || schema.default || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={String(schema.default || '')}
              rows={3}
            />
          );
        }

        return (
          <input
            type="text"
            className={`parameter-input ${error ? 'error' : ''}`}
            value={value || schema.default || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={String(schema.default || '')}
            pattern={schema.pattern}
          />
        );

      case 'boolean':
        return (
          <label className="parameter-checkbox-label">
            <input
              type="checkbox"
              className="parameter-checkbox"
              checked={value !== undefined ? value : (schema.default || false)}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="checkbox-text">
              {value !== undefined ? value : (schema.default || false) ? 'Yes' : 'No'}
            </span>
          </label>
        );

      case 'array':
        return (
          <textarea
            className={`parameter-textarea ${error ? 'error' : ''}`}
            value={Array.isArray(value) ? value.join(', ') : (schema.default ? schema.default.join(', ') : '')}
            onChange={(e) => onChange(e.target.value.split(',').map(item => item.trim()).filter(item => item))}
            placeholder="Enter comma-separated values"
            rows={2}
          />
        );

      default:
        return (
          <input
            type="text"
            className={`parameter-input ${error ? 'error' : ''}`}
            value={value || schema.default || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={String(schema.default || '')}
          />
        );
    }
  };

  return (
    <div className="parameter-field">
      <label className="parameter-label">
        {schema.name}
        {schema.required && <span className="required">*</span>}
      </label>
      
      {renderField()}
      
      {schema.description && (
        <div className="parameter-description">
          {schema.description}
        </div>
      )}
      
      {error && (
        <div className="parameter-error">
          {error}
        </div>
      )}
    </div>
  );
};