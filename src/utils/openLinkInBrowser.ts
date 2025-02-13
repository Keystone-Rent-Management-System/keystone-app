import {Linking} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import COLORS from '../constants/Theme';

/**
 * Helper for opening a give URL in an external browser.
 */
export async function openLinkInBrowser(url: string) {
  if (await InAppBrowser.isAvailable()) {
    await InAppBrowser.open(url, {
      // iOS Properties
      dismissButtonStyle: 'cancel',
      preferredBarTintColor: COLORS.text_color,
      preferredControlTintColor: 'white',
      readerMode: false,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'partialCurl',
      modalEnabled: true,
      enableBarCollapsing: false,
      // Android Properties
      showTitle: true,
      toolbarColor: COLORS.primary,
      secondaryToolbarColor: 'black',
      enableUrlBarHiding: true,
      enableDefaultShare: true,
      forceCloseOnRedirection: false,
      // Specify full animation resource identifier(package:anim/name)
      // or only resource name(in case of animation bundled with app).
      animations: {
        startEnter: 'slide_in_right',
        startExit: 'slide_out_left',
        endEnter: 'slide_in_left',
        endExit: 'slide_out_right',
      },
    });
  } else {
    Linking.canOpenURL(url).then(canOpen => canOpen && Linking.openURL(url));
  }
}
