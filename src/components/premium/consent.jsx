import React from 'react';
import {Linking, Text, TouchableOpacity, View} from 'react-native';
import COLORS from '../../constants/Theme';
import {LEGAL_DRAFT_BADGE} from '../../constants/legalCopy';

// Compliance UI primitives — consent capture for FCRA (rent reporting) and
// NACHA/Reg E (ACH authorization) + Dwolla ToS. All legal strings come from
// src/constants/legalCopy.js; these only render them.

/** A small amber tag marking text that is placeholder pending legal review. */
export const DraftBadge = ({label = LEGAL_DRAFT_BADGE}) => (
  <View
    className="self-start px-2 py-0.5 rounded-md mb-2"
    style={{backgroundColor: 'rgba(205,160,0,0.14)'}}>
    <Text
      className="text-gold_text font-inter-semibold"
      style={{fontSize: 10, letterSpacing: 0.5}}>
      {label}
    </Text>
  </View>
);

/** Affirmative-consent checkbox row. Required before an authorized action. */
export const ConsentRow = ({checked, onToggle, children}) => (
  <TouchableOpacity
    onPress={onToggle}
    activeOpacity={0.7}
    className="flex-row items-start mt-2">
    <View
      className="w-5 h-5 rounded items-center justify-center mt-0.5 mr-3"
      style={{
        borderWidth: 2,
        borderColor: checked ? COLORS.keystone_gold : '#CBD2D9',
        backgroundColor: checked ? COLORS.keystone_gold : 'transparent',
      }}>
      {checked && (
        <Text className="text-white" style={{fontSize: 11}}>
          ✓
        </Text>
      )}
    </View>
    <Text className="flex-1 text-keystone_navy font-inter text-xs leading-5">
      {children}
    </Text>
  </TouchableOpacity>
);

/**
 * Inline legal link. When a URL is present it renders as a live gold
 * underlined link; when the URL is still an empty placeholder it renders
 * visibly inert (muted, not underlined, suffixed "soon") so a tenant can't
 * tap a dead FCRA-dispute / ToS link that silently does nothing.
 */
export const LegalLink = ({label, url}) => {
  if (!url) {
    return (
      <Text
        className="text-text_muted font-inter text-xs"
        style={{opacity: 0.5}}>
        {label} (soon)
      </Text>
    );
  }
  return (
    <Text
      onPress={() => Linking.openURL(url)}
      className="text-gold_text font-inter-semibold text-xs underline">
      {label}
    </Text>
  );
};
