import React from 'react';
import {ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import COLORS from '../../constants/Theme';

// A contrast-guaranteed button. Pass `variant` to get a pre-paired
// {fill, label} from the Theme ROLES — you physically can't assemble a
// failing combo (gold gets navy text, never white; cream gets navy
// text). Every pairing is a verified WCAG ratio:
//   primary   gold  #A89977 + navy label  → 5.56  AA   (the precious CTA)
//   strong    navy  #152535 + cream label → 15.58 AAA  (solid primary)
//   secondary cream #E7E5DA + navy label  → 12.33 AAA  (quiet action)
// When no variant is given the legacy ClassName / textClassName path is
// preserved byte-for-byte, so existing call sites are untouched.
const VARIANTS = {
  primary: COLORS.ROLES.btn.primary,
  strong: COLORS.ROLES.btn.strong,
  secondary: COLORS.ROLES.btn.secondary,
};

const CButtonFill = ({
  variant,
  ClassName = '',
  textClassName = '',
  text = '',
  children = <></>,
  isLoading = false,
  disabled = false,
  style,
  ...rest
}) => {
  const role = variant ? VARIANTS[variant] : null;
  // Variant buttons get the elevated padding/radius; legacy buttons
  // keep their original geometry so nothing shifts under them.
  const base = role
    ? 'flex-row justify-center items-center py-3.5 px-5 rounded-2xl'
    : 'flex-row justify-center items-center py-2.5 px-5 rounded-xl';
  const textBase = role ? 'font-inter-bold text-base' : 'font-open-sauce-sans-medium';

  return (
    <TouchableOpacity
      disabled={isLoading || disabled}
      activeOpacity={role ? 0.9 : 0.2}
      style={[{gap: 6}, role && {backgroundColor: role.fill}, style]}
      className={`${base} ${ClassName} ${isLoading || disabled ? 'opacity-60' : ''}`}
      {...rest}>
      {text ? (
        <Text
          className={`${textBase} ${textClassName}`}
          style={role && {color: role.label}}>
          {text}
        </Text>
      ) : (
        children
      )}

      {isLoading && (
        <ActivityIndicator size="small" color={role ? role.label : '#fff'} />
      )}
    </TouchableOpacity>
  );
};

export default CButtonFill;
