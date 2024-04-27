import React from 'react';
import {Controller} from 'react-hook-form';

import {PasswordCInput} from './CInput';

const ControlledPasswordInput = ({control, name, rules, ...rest}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({field: {value, onChange}, fieldState: {error}}) => (
      <PasswordCInput
        value={value}
        handleChange={onChange}
        hasError={!!error?.message}
        error={error?.message}
        {...rest}
      />
    )}
  />
);

export default ControlledPasswordInput;
