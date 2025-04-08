import {useEffect} from 'react';
import {Linking, ToastAndroid} from 'react-native';
import * as RootNavigation from '../RootNavigation';
import useGlobals from '../provider/store/useGlobals';

export const useInitialURL = () => {
  const {auth} = useGlobals(state => state.state);

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleNavigation(initialUrl, auth);
      }
    };

    getUrlAsync();
  }, [auth]);
};

export const useDeepLinkUrlListener = () => {
  const {auth} = useGlobals(state => state.state);

  useEffect(() => {
    const onReceiveURL = ({url}) => {
      handleNavigation(url, auth);
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  }, [auth]);
};

const handleNavigation = (url, auth) => {
  try {
    const parts = url.split('/');

    if (url.includes('portfolio')) {
      RootNavigation.navigate('apartment_view', {
        apartment: parts[4],
      });
    } else if (auth?.access_token) {
      if (
        url.includes('agreements') &&
        url.includes('current-agreements') &&
        parts.length === 5
      ) {
        RootNavigation.navigate('more__agreements', {
          screen: 'agreements_current',
        });
      } else if (url.includes('invoices') && parts.length === 5) {
        RootNavigation.navigate('invoice_view', {id: parts[4]});
      }
    } else {
      RootNavigation.navigate('auth__login');
    }
  } catch (err) {
    ToastAndroid.show('Failed to handle deep link!' + err, ToastAndroid.SHORT);
  }
};
