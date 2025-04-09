
import { useState, useCallback, ChangeEvent } from 'react';
import { debounce } from '../utils/debounce';
import { ValidationError } from '../types/modelTypes';

interface UseFormFieldOptions {
  initialValue: string;
  onChange: (value: string) => void;
  validate?: (value: string) => ValidationError | null;
  debounceMs?: number;
}

export const useFormField = ({
  initialValue,
  onChange,
  validate,
  debounceMs = 300
}: UseFormFieldOptions) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<ValidationError | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  // Debounced change handler
  const debouncedChange = useCallback(
    debounce((newValue: string) => {
      if (validate) {
        const validationError = validate(newValue);
        setError(validationError);
      }
      onChange(newValue);
    }, debounceMs),
    [onChange, validate, debounceMs]
  );

  // Handle change event
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedChange(newValue);
  }, [debouncedChange]);

  // Handle blur event
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
  }, [value, validate]);

  // Reset the field
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsTouched(false);
  }, [initialValue]);

  return {
    value,
    setValue,
    error,
    isTouched,
    handleChange,
    handleBlur,
    reset,
    inputProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur
    }
  };
};
