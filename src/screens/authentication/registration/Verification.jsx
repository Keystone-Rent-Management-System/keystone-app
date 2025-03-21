import React, {useMemo, useRef, useState} from 'react';
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {CButton, Layout} from '../../../components';
import useGlobals from '../../../provider/store/useGlobals';

export default function Verification({navigation, route: {params}}) {
  let otpInputRef = useRef();

  const {
    state: {registering_user},
    updateRegisteringUser,
  } = useGlobals(data => data);

  const [otp, setOtp] = useState(
    registering_user?.token?.toString().split('') || [],
  );
  const [inputIsFocused, setInputIsFocused] = useState(false);

  const VERIFICATION_LENGTH = useMemo(() => 6, []);

  const codeArray = new Array(VERIFICATION_LENGTH).fill(0);

  const handleOtpChange = (index, value) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
  };

  const handleContinue = async () => {
    // Validate OTP
    if (otp?.length < 6) {
      return ToastAndroid.show('Invalid OTP', ToastAndroid.SHORT);
    }
    const code = parseInt(otp?.join(''), 10);

    updateRegisteringUser({token: code});
    /**
     *  check if passwords are already populated
     * This occurs if token was wrong and user is redirected back to this page
     */
    if (registering_user?.password) {
      return navigation.navigate('auth__registration_profile');
    } else {
      navigation.navigate('auth__registration_password');
    }
  };

  const handleFocus = () => {
    otpInputRef.current.focus();

    setInputIsFocused(true);
    // Keyboard?.emit;
  };

  const fillCodeDigitInput = (_, index) => {
    const emptyChar = ' ';

    const digit = otp[index] || emptyChar;
    const isCurrentDigit = index === otp?.length;
    const isLastDigit = index === VERIFICATION_LENGTH;
    const isCodeFull = otp.length === VERIFICATION_LENGTH;

    const isDigitFocused = isCurrentDigit || (isLastDigit && isCodeFull);
    const isCurrent = isDigitFocused && inputIsFocused;
    return (
      <Pressable
        className={`flex flex-1 items-center justify-center ${
          isCurrent ? 'border border-primary ' : 'border border-gray-300'
        }`}
        onPress={handleFocus}
        key={index}
        style={styles.otpBox}
        onChangeText={val => handleOtpChange(0, val)}>
        <Text className={'text-xl font-open-sauce-sans-semibold text-primary'}>
          {digit}
        </Text>
      </Pressable>
    );
  };

  return (
    <Layout ClassName={'px-4'}>
      {/*hidden input*/}

      <TextInput
        ref={otpInputRef}
        keyboardType="number-pad"
        style={styles.otpInputStyle}
        onChangeText={text => setOtp(text.split(''))}
        maxLength={VERIFICATION_LENGTH}
      />

      <View className={'flex-1'}>
        <Text className={'font-open-sauce-sans text-xs text-neutral-500 my-3'}>
          Enter the 6 digit PIN code sent to
          <Text className={'text-black'}>
            &nbsp;{registering_user?.email}&nbsp;
          </Text>
          to verify your email
        </Text>

        <View className={'flex-row justify-between my-3'}>
          {codeArray?.map(fillCodeDigitInput)}
        </View>

        <Text className={'font-open-sauce-sans text-xs text-neutral-500 my-3'}>
          Didn’t get the PIN? Chek your email or
          <Text
            className={'text-primary font-open-sauce-sans-medium underline'}
            onPress={() => navigation.navigate('auth__registration_email')}>
            {' '}
            Request Pin
          </Text>
        </Text>

        <StatusBar style="auto" />
      </View>

      <CButton
        ClassName={
          'bg-primary text-white py-3.5 mb-3 absolute bottom-5 inset-x-0 mx-4'
        }
        disabled={otp.length < VERIFICATION_LENGTH}
        onPress={handleContinue}
        textClassName={'text-white font'}
        text={'Complete Verification'}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '20%',
  },

  tex: {
    fontSize: 15,
    marginBottom: 25,
    color: '#888',
    alignSelf: 'flex-start',
    paddingLeft: 25,
  },
  text: {
    fontSize: 25,
    marginBottom: 25,
    color: '#283797',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    paddingLeft: 25,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    // borderColor: '#DBDBDB',
    borderRadius: 5,
    fontSize: 20,
    textAlign: 'center',
    marginRight: 10,
    color: 'black',
  },
  btn: {
    backgroundColor: '#DA1E29',
    width: 350,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    marginBottom: 30,
    alignSelf: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Roboto',
    textAlign: 'center',
    paddingBottom: 10,
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
  otpInputStyle: {
    backgroundColor: '#ddd',
    bottom: -10,
    right: 0,
    opacity: 0,
    position: 'absolute',
    width: 5,
    height: 5,
  },
});
