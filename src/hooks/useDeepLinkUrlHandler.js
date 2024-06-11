import {useEffect} from 'react';
import {Linking} from 'react-native';
import * as RootNavigation from '../RootNavigation';
import useGlobals from '../provider/store/useGlobals';

export const useInitialURL = () => {
  const {auth} = useGlobals(state => state.state);
  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl === null) {
        return;
      }
      if (auth?.access_token) {
        NavigationCallback({url: initialUrl});
      } else {
        RootNavigation.navigate('auth__login');
      }
    };

    getUrlAsync();
  }, [auth?.access_token]);
};

export const useDeepLinkUrlListener = () => {
  const {auth} = useGlobals(state => state.state);
  useEffect(() => {
    if (auth?.access_token) {
      Linking.addEventListener('url', NavigationCallback);
    } else {
      RootNavigation.navigate('auth__login');
    }
  }, [auth?.access_token]);
};

const NavigationCallback = ({url}) => {
  if (
    url.includes('agreements') &&
    url.includes('current-agreements') &&
    url.split('/').length === 5
  ) {
    RootNavigation.navigate('more__agreements', {
      screen: 'agreements_current',
    });
  } else if (url.includes('invoices') && url.split('/').length === 5) {
    RootNavigation.navigate('invoice_view', {id: url.split('/')[4]});
  }
};
