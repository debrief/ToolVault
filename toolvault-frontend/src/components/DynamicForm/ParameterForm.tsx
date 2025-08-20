import React, { useState, useEffect, useCallback } from 'react';
import { ParameterField } from './ParameterField';
import { ParameterValidation } from './ParameterValidation';
import type { ParameterSchema } from './ParameterValidation';
import './ParameterForm.css';

interface ParameterFormProps {
  parameters: ParameterSchema[];
  initialValues?: Record<string, any>;
  onChange?: (values: Record<string, any>, isValid: boolean) => void;
  onSubmit?: (values: Record<string, any>) => void;
  showSubmitButton?: boolean;
  submitLabel?: string;
}

export const ParameterForm: React.FC<ParameterFormProps> = ({
  parameters,
  initialValues = {},
  onChange,
  onSubmit,
  showSubmitButton = false,
  submitLabel = 'Submit'
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form values with defaults
  useEffect(() => {
    const defaultValues: Record<string, any> = {};
    
    parameters.forEach(param => {
      if (initialValues[param.name] !== undefined) {
        defaultValues[param.name] = initialValues[param.name];
      } else if (param.default !== undefined) {
        defaultValues[param.name] = param.default;
      }
    });

    // Only set values if they haven't been initialized yet or if parameters changed
    setValues(prev => {
      // Check if we need to update
      const needsUpdate = parameters.some(param => !(param.name in prev));
      if (needsUpdate || Object.keys(prev).length === 0) {
        return { ...prev, ...defaultValues };
      }
      return prev;
    });
  }, [parameters, initialValues]);

  // Validate form whenever values change
  const validateForm = useCallback(() => {
    const newErrors = ParameterValidation.validateForm(values, parameters);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, parameters]);

  useEffect(() => {
    const isValid = validateForm();
    onChange?.(values, isValid);
  }, [values, validateForm, onChange]);

  const handleFieldChange = (paramName: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [paramName]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [paramName]: true
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allTouched: Record<string, boolean> = {};
    parameters.forEach(param => {
      allTouched[param.name] = true;
    });
    setTouched(allTouched);

    const isValid = validateForm();
    if (isValid && onSubmit) {
      onSubmit(values);
    }
  };

  const getVisibleParameters = () => {
    // For now, show all parameters
    // This can be extended to support conditional parameter display
    return parameters;
  };

  const visibleParameters = getVisibleParameters();

  return (
    <form className="parameter-form" onSubmit={handleSubmit}>
      {visibleParameters.length === 0 && (
        <div className="no-parameters">
          No parameters required for this tool.
        </div>
      )}
      
      {visibleParameters.map(param => (
        <ParameterField
          key={param.name}
          schema={param}
          value={values[param.name]}
          onChange={(value) => handleFieldChange(param.name, value)}
          error={touched[param.name] ? errors[param.name] : undefined}
        />
      ))}
      
      {showSubmitButton && visibleParameters.length > 0 && (
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={Object.keys(errors).length > 0}
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};