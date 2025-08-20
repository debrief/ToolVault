import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ParameterField } from './ParameterField';
import { ParameterValidation } from './ParameterValidation';
import type { ParameterSchema } from './ParameterValidation';
import './ParameterForm.css';

interface ParameterFormProps {
  parameters: ParameterSchema[];
  initialValues?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>, isValid: boolean) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
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
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const isUpdatingRef = useRef(false);

  // Initialize form values with defaults
  useEffect(() => {
    const defaultValues: Record<string, unknown> = {};
    
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
      const isEmpty = Object.keys(prev).length === 0;
      
      // Check if initial values actually changed by comparing with current values
      const hasInitialValues = Object.keys(initialValues).length > 0;
      const initialValuesChanged = hasInitialValues && Object.keys(initialValues).some(key => {
        return initialValues[key] !== undefined && initialValues[key] !== prev[key];
      });
      
      if (needsUpdate || isEmpty || initialValuesChanged) {
        // Merge defaults first, then initial values to ensure initial values take precedence
        const newValues = { ...defaultValues, ...initialValues };
        isUpdatingRef.current = true; // Prevent onChange callback during internal update
        return newValues;
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
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }
    const isValid = validateForm();
    onChange?.(values, isValid);
  }, [values, validateForm, onChange]);

  const handleFieldChange = (paramName: string, value: unknown) => {
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