import {Alert, Keyboard} from 'react-native';
import AuthServices from '../services/AuthServices';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import useGlobals from '../provider/store/useGlobals';
import {getError} from '../utils/getError';
import {useProfileStore} from '../provider/store/profile';
import useAuthSession, {AUTHENTICATED} from '../provider/store/authSession';
import formatPhone from '../utils/formatPhone';
import {useEffect} from 'react';
import {toast} from '../utils/toast';

export const profileQueryKey = ['user', 'profile'];

const useAuth = () => {
  const {profile, saveProfile} = useProfileStore();
  // `/manage-profile/me` is an AUTHENTICATED request. Gating it only on
  // "no profile cached" meant it fired on the signed-out Welcome screen —
  // `MainNav` calls `useAuth()` unconditionally, and a fresh install has
  // no cached profile — producing a guaranteed 401 with no session to
  // refresh, on the one screen that exists precisely because there is no
  // session. Bootstrapping was gated; this is the other half, the
  // requests that follow a `signedOut` conclusion.
  const isAuthed = useAuthSession(s => s.status) === AUTHENTICATED;

  const {isLoading, error, data, refetch, isSuccess} = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => AuthServices.getProfile(),
    enabled: isAuthed && !profile?.userId,
  });

  useEffect(() => {
    if (!profile?.userId) {
      saveProfile(data);
    }
  }, [data, isSuccess, profile?.userId, saveProfile]);

  return {
    isPending: profile?.userId ? false : isLoading,
    error,
    profile: {
      ...profile,
      ...data,
    },
    refetch,
  };
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
      toast.show(
        'Verifing email failed ' + getError(err),
        toast.SHORT,
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
      toast.show(
        'Registration successful. Signin to the created account',
        toast.SHORT,
      );
      navigation.navigate('auth__login');
      resetRegisteringUser();
      // Push registration removed from here too — it follows the session
      // status now. This path navigates to the LOGIN screen, so there is
      // no authenticated session to register against at this point.
    },
    onError: err => {
      if (
        err.response?.data?.message
          ?.toLowerCase()
          ?.includes('invalid email or token')
      ) {
        toast.show('Registration failed ' + getError(err), toast.SHORT);
        navigation.navigate('auth__registration_verification');
        return;
      }

      // BE returns 422 for every tenant self-signup on api-dev, because
      // §T16 makes Keystone provisioned-only: a landlord creates the
      // tenant and the tenant *claims* the account. Its raw message is
      // "The request would violate a database constraint", which tells a
      // renter nothing and offers no way forward. Name the real situation
      // and hand them the path that works.
      if (err.response?.status === 422) {
        Alert.alert(
          'Your landlord needs to add you first',
          'Keystone accounts are created by your landlord. If they have already added you, enter the invite code they sent to finish setting up.',
          [
            {text: 'Not now', style: 'cancel'},
            {
              text: 'Enter invite code',
              onPress: () => navigation.navigate('auth__claim'),
            },
          ],
        );
        return;
      }

      toast.show('Registration failed ' + getError(err), toast.SHORT);
    },
  });

  const onSubmit = props => {
    Keyboard.dismiss();
    // update details to global state incase mutation is not successful
    const {firstName, lastName, phoneNumber, identificationNumber} = props;
    updateRegisteringUser(props);
    const formattedPhoneNumber = formatPhone(phoneNumber);

    registerTenantMutation.mutateAsync({
      firstName: firstName,
      lastName: lastName,
      identificationType: 'NATIONAL_ID',
      identificationNumber: identificationNumber,
      phoneNumber: formattedPhoneNumber,
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
      toast.show('Password updated successfully', toast.LONG);
    },
    onError: err => {
      toast.show('Updating password failed ' + getError(err), 4000);
    },
  });

  const handleChangePassword = props => {
    if (props.password !== props.confirmPassword) {
      toast.show('Passwords do not match', toast.SHORT);
    } else {
      changePasswordMutation.mutate({
        currentPassword: props.currentPassword,
        newPassword: props.password,
      });
    }
  };

  return {changePasswordMutation, handleChangePassword};
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
      toast.show(
        'Request password reset failed ' + getError(err),
        toast.SHORT,
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
      toast.show(
        'Reset password failed ' + getError(err),
        toast.SHORT,
      );
    },
  });

  const handlePasswordReset = props => {
    if (props.password !== props.confirmPassword) {
      toast.show('Passwords do not match', toast.SHORT);
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
