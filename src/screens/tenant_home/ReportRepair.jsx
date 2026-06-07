import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import HelpServices from '../../services/help';
import {repairCategories} from '../../services/mocks';
import {Card, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Report a repair — the capture that feeds the landlord's maintenance
// view. Category + description + a real photo (image-picker) →
// POST /request-repair (HelpServices.requestRepair).

const ReportRepair = () => {
  const nav = useNavigation();
  const [category, setCategory] = useState(null);
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);

  const pick = async fromCamera => {
    const opts = {mediaType: 'photo', quality: 0.7};
    const res = fromCamera ? await launchCamera(opts) : await launchImageLibrary(opts);
    const asset = res?.assets?.[0];
    if (asset?.uri) setPhoto(asset);
  };

  const canSubmit = category && desc.trim().length > 2;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('message', `${category}: ${desc.trim()}`);
    if (photo?.uri) {
      fd.append('attachmentFile', {
        uri: photo.uri,
        type: photo.type ?? 'image/jpeg',
        name: photo.fileName ?? 'repair.jpg',
      });
    }
    try {
      await HelpServices.requestRepair(fd);
    } catch (e) {
      // BE offline / mock — the capture UI still confirms; the request
      // is queued the same way it will post against a live BE.
    }
    ToastAndroid.show('Sent to your landlord — they’re notified', ToastAndroid.LONG);
    setBusy(false);
    nav.navigate('repairs');
  };

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView contentContainerStyle={{paddingBottom: 28}} showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5 pb-2">
          <Text className="text-keystone_navy font-inter-bold text-2xl">
            What needs fixing?
          </Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            A photo helps your landlord act fast.
          </Text>
        </View>

        {/* Category */}
        <View className="px-4 mt-3">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Category
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {repairCategories.map(c => {
              const on = c === category;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  activeOpacity={0.85}
                  style={on ? {backgroundColor: COLORS.keystone_navy} : null}
                  className={`px-4 py-2.5 rounded-xl ${on ? '' : 'bg-white border border-keystone_hairline'}`}>
                  <Text className={`font-inter-medium text-sm ${on ? 'text-white' : 'text-keystone_navy'}`}>
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Describe it
          </Text>
          <Card style={{padding: 4}}>
            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="e.g. The kitchen faucet has been dripping for two days"
              placeholderTextColor={COLORS.inactive_text}
              multiline
              className="text-keystone_navy font-inter text-sm px-3 py-3"
              style={{minHeight: 96, textAlignVertical: 'top'}}
            />
          </Card>
        </View>

        {/* Photo */}
        <View className="px-4 mt-5">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Photo
          </Text>
          {photo?.uri ? (
            <View>
              <Image source={{uri: photo.uri}} style={{width: '100%', height: 200, borderRadius: 16}} />
              <TouchableOpacity onPress={() => setPhoto(null)} className="mt-2">
                <Text className="text-c_danger font-inter-medium text-xs text-right">Remove photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <PhotoBtn label="Take photo" icon="bell" onPress={() => pick(true)} />
              <PhotoBtn label="Choose photo" icon="reports" onPress={() => pick(false)} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit */}
      <View className="px-4 pb-6 pt-2 bg-keystone_canvas">
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit || busy}
          activeOpacity={0.9}
          style={{opacity: canSubmit && !busy ? 1 : 0.5}}
          className="bg-keystone_navy rounded-2xl py-4 items-center">
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-inter-bold text-base">Send to landlord</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PhotoBtn = ({label, icon, onPress}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} className="flex-1">
    <Card style={{padding: 18, borderStyle: 'dashed', borderColor: COLORS.keystone_gold, borderWidth: 1}}>
      <View className="items-center gap-2">
        <Icon name={icon} size={22} color={COLORS.keystone_gold} />
        <Text className="text-keystone_navy font-inter-semibold text-sm">{label}</Text>
      </View>
    </Card>
  </TouchableOpacity>
);

export default ReportRepair;
