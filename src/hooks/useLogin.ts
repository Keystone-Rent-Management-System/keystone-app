import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {Keyboard, ToastAndroid} from 'react-native';

import {DEFAULT_AGREEMENT} from '../constants/agreement';
import {useActiveAgreement} from '../provider/store';
import {useProfileStore} from '../provider/store/profile';
import useGlobals from '../provider/store/useGlobals';
import AuthServices from '../services/AuthServices';
import NotificationService from '../services/Notification';
import {getError} from '../utils/getError';

export const useLogin = () => {
  const navigation = useNavigation();
  const {updateAuth} = useGlobals(data => data);
  const {saveProfile} = useProfileStore();
  const {saveAgreement} = useActiveAgreement();

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: res => {
      const {userProfile, activeAgreement, ...rest} = res;

      updateAuth(rest);
      saveProfile(userProfile);
      saveAgreement(activeAgreement);

      NotificationService.registerDeviceToken().then();
      // @ts-ignore
      navigation.navigate('bottom-nav');
      //   register device token
    },
    onError: err => {
      ToastAndroid.show('Login failed ' + getError(err), ToastAndroid.SHORT);
    },
  });

  const handleSignin = (props: any) => {
    Keyboard.dismiss();
    loginMutation.mutate(props);
  };

  return {loginMutation, handleSignin};
};

const getActiveAgreement = async (response: any) => {
  // try {
  //   return AgreementServices.getActiveAgreement(response?.access_token);
  // } catch (_) {
  //   return DEFAULT_AGREEMENT;
  // }
  return DEFAULT_AGREEMENT;
};

async function login(props: any) {
  try {
    // login
    const response = await AuthServices.login(props);
    // Get user profile
    const [userProfile, activeAgreement] = await Promise.all([
      AuthServices.getProfile(response?.access_token),
      getActiveAgreement(response),
    ]);

    // return login response
    if (userProfile && activeAgreement) {
      return {...response, userProfile, activeAgreement};
    }
    return {...response, userProfile: null, activeAgreement: DEFAULT_AGREEMENT};
  } catch (err) {
    console.log(err);
  }
}
