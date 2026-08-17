import React from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import COLORS from '../../constants/Theme';
import Icon from '../premium/icons';

// ── Photo capture & evidence — kit addendum 4a, rules P1–P5 ────────
// Photos are evidence in this product (deposits, repairs, screening
// docs), so states are explicit:
//   P1 capture tile: dashed hairline, radius 12, gold camera glyph;
//      tap → system sheet (camera / library) — never a custom camera.
//   P2 uploading: dimmed + spinner; failed: danger border + Retry —
//      a failed upload never silently drops the photo.
//   P3 grid: 64px thumbs, radius 12, max 3 visible + "+N" overflow.
//   P4 count chip on the gold keystone_chip tint — neutral evidence,
//      not status. P5 counts surface in parent rows.

const GOLD = COLORS.keystone_gold;
const NAVY = COLORS.keystone_navy;

const PICKER_OPTS = {mediaType: 'photo', quality: 0.7};

/** P1 system sheet → resolves to an image-picker asset (or null). */
export const pickPhoto = () =>
  new Promise(resolve => {
    const run = async fromCamera => {
      // A rejected picker must still settle this promise — callers hold
      // `capturing` flags open on it, and an unresolved pick freezes the
      // capture tile for the rest of the screen's life.
      try {
        const res = fromCamera
          ? await launchCamera(PICKER_OPTS)
          : await launchImageLibrary(PICKER_OPTS);
        resolve(res?.assets?.[0] ?? null);
      } catch (err) {
        resolve(null);
      }
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {options: ['Take photo', 'Choose from library', 'Cancel'], cancelButtonIndex: 2},
        i => (i === 2 ? resolve(null) : run(i === 0)),
      );
    } else {
      Alert.alert('Add photo', null, [
        {text: 'Take photo', onPress: () => run(true)},
        {text: 'Choose from library', onPress: () => run(false)},
        {text: 'Cancel', style: 'cancel', onPress: () => resolve(null)},
      ]);
    }
  });

/**
 * P1/P2 capture tile. `state`: 'default' | 'uploading' | 'failed'.
 * size 88 in forms (4f), 64 inline.
 */
export const PhotoCaptureTile = ({state = 'default', onPress, size = 88, label = 'Add photo', style}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    disabled={state === 'uploading'}
    onPress={onPress}
    style={[
      styles.tile,
      {width: size, height: size},
      state === 'failed' && styles.tileFailed,
      state === 'uploading' && styles.tileUploading,
      style,
    ]}>
    {state === 'uploading' ? (
      <>
        <ActivityIndicator size="small" color={GOLD} />
        <Text style={styles.tileText}>Uploading…</Text>
      </>
    ) : state === 'failed' ? (
      <>
        <Text style={styles.failMark}>!</Text>
        <Text style={[styles.tileText, {color: '#B32020', fontFamily: 'Inter-SemiBold'}]}>Retry</Text>
      </>
    ) : (
      <>
        <Icon name="camera" size={size >= 88 ? 24 : 20} color={GOLD} />
        <Text style={styles.tileText}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

/**
 * P3 thumbnail row: 64px thumbs, max 3 visible + "+N" overflow tile.
 * `photos`: [{uri}] · `onView(index)` opens the full-screen viewer.
 * `onAdd` (optional) appends a capture tile at the end.
 */
export const PhotoThumbRow = ({photos = [], onView, onAdd, addState, style}) => {
  const visible = photos.slice(0, 3);
  const overflow = photos.length - visible.length;
  return (
    <View style={[{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}, style]}>
      {visible.map((p, i) => (
        <TouchableOpacity
          key={p.uri ?? i}
          activeOpacity={0.85}
          onPress={() => onView?.(i)}
          style={styles.thumbWrap}>
          {p.uri ? (
            <Image source={{uri: p.uri}} style={styles.thumb} />
          ) : (
            // P5 placeholder tile — BE hasn't served photo URLs yet
            <View
              style={[
                styles.thumb,
                {backgroundColor: i % 2 ? '#A89977' : '#3B5366'},
              ]}
            />
          )}
          {p.state === 'uploading' ? (
            <View style={styles.thumbOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : null}
        </TouchableOpacity>
      ))}
      {overflow > 0 ? (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onView?.(3)} style={[styles.thumbWrap, styles.overflowTile]}>
          <Text style={styles.overflowText}>+{overflow}</Text>
        </TouchableOpacity>
      ) : null}
      {onAdd ? <PhotoCaptureTile size={64} label="Add" state={addState} onPress={onAdd} /> : null}
    </View>
  );
};

/** P4 count chip — gold keystone_chip tint; neutral evidence, not status. */
export const PhotoCountChip = ({count, style}) => {
  if (!count) return null;
  return (
    <View style={[styles.countChip, style]}>
      <Icon name="camera" size={12} color="#7A6A48" />
      <Text style={styles.countText}>
        {count} PHOTO{count === 1 ? '' : 'S'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(21,37,53,0.20)',
    backgroundColor: 'rgba(21,37,53,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tileUploading: {opacity: 0.6, borderStyle: 'solid'},
  tileFailed: {borderColor: COLORS.c_danger, borderStyle: 'solid', backgroundColor: 'rgba(229,53,53,0.04)'},
  tileText: {color: COLORS.keystone_slate, fontFamily: 'Inter-Medium', fontSize: 11},
  failMark: {color: '#B32020', fontFamily: 'Inter-Bold', fontSize: 18},
  thumbWrap: {width: 64, height: 64, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(21,37,53,0.06)'},
  thumb: {width: '100%', height: '100%'},
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21,37,53,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowTile: {alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,37,53,0.08)'},
  overflowText: {color: NAVY, fontFamily: 'Inter-SemiBold', fontSize: 15},
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.keystone_chip,
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 24,
  },
  countText: {color: '#7A6A48', fontFamily: 'Inter-SemiBold', fontSize: 11, letterSpacing: 0.66},
});
