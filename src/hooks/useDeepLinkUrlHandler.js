import {useEffect} from 'react';
import {Linking} from 'react-native';
import * as RootNavigation from '../RootNavigation';
import useAuthSession, {AUTHENTICATED} from '../provider/store/authSession';
import {toast} from '../utils/toast';

export const useInitialURL = () => {
  // The gate decides whether a deep link may open a protected screen.
  // Reading the token mirror here meant a link that arrived during a
  // failed refresh was routed as if the session were live.
  const isAuthed = useAuthSession(s => s.status) === AUTHENTICATED;

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleNavigation(initialUrl, isAuthed);
      }
    };

    getUrlAsync();
  }, [isAuthed]);
};

export const useDeepLinkUrlListener = () => {
  const isAuthed = useAuthSession(s => s.status) === AUTHENTICATED;

  useEffect(() => {
    const onReceiveURL = ({url}) => {
      handleNavigation(url, isAuthed);
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      subscription.remove();
    };
  }, [isAuthed]);
};

const handleNavigation = (url, isAuthed) => {
  try {
    const parts = url.split('/');

    if (url.includes('portfolio')) {
      RootNavigation.navigate('apartment_view', {
        apartment: parts[4],
      });
    } else if (isAuthed) {
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
    } else if (url.includes('claim')) {
      // An invite link is the ONE unauthenticated deep link that carries
      // its own context. Sending it to Sign In threw the invitation away
      // and asked the applicant to log into an account they do not have
      // yet — the exact thing the invite exists to create. Preserve the
      // code and open the claim screen.
      const code =
        url.match(/[?&]code=([^&]+)/)?.[1] ??
        url.match(/[?&]token=([^&]+)/)?.[1] ??
        null;
      RootNavigation.navigate('auth__claim', code ? {code} : undefined);
    } else {
      RootNavigation.navigate('auth__login');
    }
  } catch (err) {
    toast.show('Failed to handle deep link!' + err, toast.SHORT);
  }
};
