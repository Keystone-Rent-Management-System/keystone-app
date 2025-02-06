import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Keyboard, ToastAndroid} from 'react-native';

import {useActiveAgreement} from '../provider/store';
import {useProfileStore} from '../provider/store/profile';
import useGlobals from '../provider/store/useGlobals';
import AgreementServices from '../services/AgreementServices';
import AuthServices from '../services/AuthServices';
import NotificationService from '../services/Notification';
import {getError} from '../utils/getError';
import {DEFAULT_AGREEMENT} from '../constants/agreement';
import {IAgreement} from '../types/agreement';

export const useLogin = () => {
  const navigation = useNavigation();
  const {updateAuth} = useGlobals(data => data);
  const {saveProfile} = useProfileStore();
  const {saveAgreement, saveInactiveAgreement} = useActiveAgreement();

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: res => {
      const {userProfile, activeAgreement, inactiveAgreement, ...rest} = res;

      updateAuth(rest);
      saveProfile(userProfile);
      saveAgreement(activeAgreement);
      saveInactiveAgreement(inactiveAgreement as IAgreement);

      NotificationService.registerDeviceToken().then();
      // @ts-ignore
      navigation.navigate('bottom-nav');
      //   register device token
    },
    onError: err => {
      ToastAndroid.show('Login Error: ' + getError(err), ToastAndroid.SHORT);
    },
  });

  const handleSignin = (props: any) => {
    Keyboard.dismiss();
    loginMutation.mutate(props);
  };

  return {loginMutation, handleSignin};
};

const getActiveAgreement = async (response: any) => {
  try {
    return await AgreementServices.getActiveAgreement(response?.access_token);
  } catch (error) {
    return DEFAULT_AGREEMENT; // Return an empty object if an error occurs
  }
};

const getCurrentAgreement = async (response: any) => {
  try {
    return await AgreementServices.getAgreements(0, 5, response?.access_token);
  } catch (error) {
    return null;
  }
};

async function login(props: any) {
  // login
  const response = await AuthServices.login(props);

  // Run getProfile and getActiveAgreement in parallel
  const [userProfile, activeAgreement] = await Promise.all([
    AuthServices.getProfile(response?.access_token).catch(() => ({})),
    getActiveAgreement(response),
  ]);

  // Get the first current agreement if there is no active agreement
  let inactiveAgreement = null;
  if (!activeAgreement?.id) {
    const agreements = await getCurrentAgreement(response);
    inactiveAgreement = agreements?.content[0] || null;
  }

  // return login response
  return {
    userProfile,
    activeAgreement,
    inactiveAgreement,
    ...response,
  };
}
