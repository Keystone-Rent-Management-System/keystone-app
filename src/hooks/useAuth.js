import {Keyboard, ToastAndroid} from 'react-native';
import AuthServices from '../services/AuthServices';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import useGlobals from '../provider/store/useGlobals';
import {getError} from '../utils/getError';
import NotificationService from '../services/Notification';

const useAuth = () => {
  const {isPending, error, data, refetch} = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => AuthServices.getProfile(),
  });

  return {isPending, error, profile: data?.data, refetch};
};

export const useVerifyEmail = () => {
  const navigation = useNavigation();
  const {updateRegisteringUser} = useGlobals(state => state);

  const verifyEmailMutation = useMutation({
    mutationKey: ['verify_email'],
    mutationFn: AuthServices.verifyRegisteringEmail,
    onSuccess: (_, data) => {
      updateRegisteringUser({email: data?.email});
      navigation.navigate('auth__registration_verification');
    },
    onError: err => {
      ToastAndroid.show(
        'Verifing email failed ' + getError(err),
        ToastAndroid.SHORT,
      );
    },
  });

  const onSubmit = props => {
    verifyEmailMutation.mutate({email: props.email});
  };

  return {onSubmit, verifyEmailMutation};
};

export const useRegister = () => {
  const navigation = useNavigation();
  const {
    state: {registering_user},
    updateRegisteringUser,
    resetRegisteringUser,
  } = useGlobals(data => data);

  const registerTenantMutation = useMutation({
    mutationKey: ['register_tenant'],
    mutationFn: AuthServices.registerTenant,
    onSuccess: () => {
      ToastAndroid.show(
        'Registration successful. Signin to the created account',
        ToastAndroid.SHORT,
      );
      navigation.navigate('auth__login');
      resetRegisteringUser();
      NotificationService.registerDeviceToken().then();
    },
    onError: err => {
      ToastAndroid.show(
        'Registration failed ' + getError(err),
        ToastAndroid.SHORT,
      );

      if (
        err.response?.data?.message
          ?.toLowerCase()
          ?.includes('invalid email or token')
      ) {
        navigation.navigate('auth__registration_verification');
      }
    },
  });

  const onSubmit = props => {
    Keyboard.dismiss();
    // update details to global state incase mutation is not successful
    const {firstName, lastName, phoneNumber, identificationNumber} = props;
    updateRegisteringUser(props);

    registerTenantMutation.mutateAsync({
      firstName: firstName,
      lastName: lastName,
      identificationType: 'NATIONAL_ID',
      identificationNumber: identificationNumber,
      phoneNumber:
        phoneNumber.length === 9 ? '0' + phoneNumber.toString() : phoneNumber,
      email: registering_user.email,
      token: registering_user.token,
      password: registering_user.password,
    });
  };

  return {registerTenantMutation, onSubmit};
};

export const useChangePassword = () => {
  const navigation = useNavigation();
  const changePasswordMutation = useMutation({
    mutationKey: ['user', 'change_password'],
    mutationFn: AuthServices.updateUserPassword,
    onSuccess: () => {
      navigation.navigate('bottom-nav', {screen: 'more'});
    },
    onError: err => {
      ToastAndroid.show('Updating password failed ' + getError(err), 4000);
    },
  });

  const handleChangePassword = props => {
    if (props.password !== props.confirmPassword) {
      ToastAndroid.show('Passwords do not match', ToastAndroid.SHORT);
    } else {
      changePasswordMutation.mutate({
        currentPassword: props.currentPassword,
        newPassword: props.password,
      });
    }
  };

  return {changePasswordMutation, handleChangePassword};
};

export const useLogin = () => {
  const navigation = useNavigation();
  const {updateAuth} = useGlobals(data => data);

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: AuthServices.login,
    onSuccess: res => {
      updateAuth(res);
      NotificationService.registerDeviceToken().then();

      navigation.navigate('bottom-nav');
      //   register device token
    },
    onError: err => {
      ToastAndroid.show('Login failed ' + getError(err), ToastAndroid.SHORT);
    },
  });

  const handleSignin = props => {
    Keyboard.dismiss();
    loginMutation.mutate(props);
  };

  return {loginMutation, handleSignin};
};

export const useRequestPasswordReset = () => {
  const navigation = useNavigation();
  const {updateResetPassword} = useGlobals(data => data);
  const requestPasswordResetMutation = useMutation({
    mutationKey: ['auth__recovery_email'],
    mutationFn: AuthServices.getResetPasswordToken,
    onSuccess: (res, variables) => {
      updateResetPassword({email: variables?.email});
      navigation.navigate('auth__recovery_verification');
    },
    onError: err => {
      ToastAndroid.show(
        'Request password reset failed ' + getError(err),
        ToastAndroid.SHORT,
      );
    },
  });

  const handleRequestPasswordReset = props => {
    requestPasswordResetMutation.mutateAsync(props);
  };

  return {requestPasswordResetMutation, handleRequestPasswordReset};
};

export const useResetPassword = () => {
  const navigation = useNavigation();
  const {
    state: {reset_password},
  } = useGlobals(data => data);

  const resetPasswordMutation = useMutation({
    mutationKey: ['auth__password_reset'],
    mutationFn: AuthServices.resetPassword,
    onSuccess: () => {
      navigation.navigate('auth__login');
    },
    onError: err => {
      ToastAndroid.show(
        'Reset password failed ' + getError(err),
        ToastAndroid.SHORT,
      );
    },
  });

  const handlePasswordReset = props => {
    if (props.password !== props.confirmPassword) {
      ToastAndroid.show('Passwords do not match', ToastAndroid.SHORT);
    } else {
      resetPasswordMutation.mutateAsync({
        ...reset_password,
        password: props.password,
      });
    }
  };

  return {resetPasswordMutation, handlePasswordReset};
};

export default useAuth;
