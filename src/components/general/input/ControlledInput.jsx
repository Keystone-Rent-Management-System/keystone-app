import React from 'react';
import {Controller} from 'react-hook-form';

import {LabelledCInput} from './CInput';

const ControlledInput = ({control, name, rules, ...rest}) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    render={({field: {value, onChange}, fieldState: {error}}) => {
      return (
        <LabelledCInput
          value={value}
          handleChange={val => onChange(val)}
          hasError={!!error?.message}
          error={error?.message}
          {...rest}
        />
      );
    }}
  />
);

export default ControlledInput;
