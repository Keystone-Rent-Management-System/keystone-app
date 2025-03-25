import * as Sentry from '@sentry/react-native';
import moment from 'moment';
import {Linking, PermissionsAndroid} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';

import {PALLAX_SUPPORT_NUMBER} from '../constants';
import {getError} from './getError';

const renderSingularPlural = (num, render, nullRender = '') =>
  parseInt(num, 10) > 1 ? render : nullRender;

const getGreetings = () => {
  const date = new Date();
  const hours = date.getHours();

  if (hours < 12) {
    return 'Good Morning!';
  } else if (hours < 16) {
    return 'Good Afternoon!';
  } else {
    return 'Good Evening!';
  }
};

const getInitials = fullName => {
  const names = fullName?.split(' ');
  const firstName = names?.at(0);
  const lastName = names?.at(1);

  const firstInitial = firstName?.charAt(0);
  const secondInitial = lastName ? lastName.charAt(0) : firstName?.charAt(1);
  return `${firstInitial}${secondInitial}`.toUpperCase();
};

const handleCallSupport = async () => {
  await handleCall(PALLAX_SUPPORT_NUMBER);
};

const handleCall = async phoneNumber => {
  const validatedPhoneNumber = phoneNumber.startsWith('07')
    ? phoneNumber.slice(1)
    : phoneNumber;

  await Linking.openURL(`tel:+254${validatedPhoneNumber}`);
};

const handleSmsSupport = async () => {
  await Linking.openURL(`sms:+254${PALLAX_SUPPORT_NUMBER}`);
};
const handleSms = async phoneNumber => {
  const validatedPhoneNumber = phoneNumber.startsWith('07')
    ? phoneNumber.slice(1)
    : phoneNumber;

  await Linking.openURL(`sms:+254${validatedPhoneNumber}`);
};

const getCurrentMonthInNumberForm = () => {
  const date = new Date();
  return date.getMonth() + 1;
};

const getCurrentYear = () => {
  const date = new Date();
  return date.getFullYear();
};

const calculateDaysRemaining = sampleDate => {
  const currentDate = new Date();
  return moment(sampleDate).diff(currentDate, 'days').toString();
};

async function requestWriteExternalStoragePermission() {
  try {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'External Storage Permission',
        message: 'This app needs access to your external storage to save files',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
  } catch (err) {
    // console.warn(err);
    throw new Error(
      'Failed to request external storage permission',
      getError(err),
    );
  }
}

let isFileViewerOpen = false; // Flag to prevent duplicate calls

export async function generatePdf(html, fileName) {
  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  if (granted) {
    return;
  } else {
    // Request the permission
    requestWriteExternalStoragePermission();
  }

  try {
    if (!html || !fileName) {
      throw new Error(
        'Invalid parameters: HTML content or file name is missing.',
      );
    }

    // Generate the PDF
    const options = {
      html,
      fileName,
      directory: 'Documents',
      base64: true,
    };

    const file = await RNHTMLtoPDF.convert(options);
    if (!file || !file.base64) {
      throw new Error('Failed to generate PDF. The file object is invalid.');
    }

    // Write the file to the Downloads directory
    const filePath = `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}.pdf`;
    await RNFetchBlob.fs.writeFile(filePath, file.base64, 'base64');

    // Ensure FileViewer.open is only called once
    if (!isFileViewerOpen) {
      isFileViewerOpen = true;
      try {
        await FileViewer.open(filePath, {
          showOpenWithDialog: true,
          showAppsSuggestions: true,
        });
      } catch (viewerError) {
        console.error('Error opening the file with FileViewer:', viewerError);
        throw new Error(
          'Failed to open the PDF file. Please check your file viewer.',
        );
      } finally {
        isFileViewerOpen = false; // Reset the flag
      }
    }

    return filePath;
  } catch (error) {
    console.error('Error generating or opening PDF:', error);
    isFileViewerOpen = false; // Reset the flag in case of an error
    handleReportError(error); // Report the error to Sentry
    throw new Error(
      'Please retry. An error occurred while generating the PDF.',
    );
  }
}

export const formatToKES = amount => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(Math.abs(amount));
};

export const handleReportError = error => {
  // if (ENVIRON === APP_MODE.production) {
  Sentry.captureException(error);
  // }
};

const Helper = {
  renderSingularPlural,
  getGreetings,
  getInitials,
  handleCallSupport,
  handleSmsSupport,
  handleCall,
  handleSms,
  getCurrentMonthInNumberForm,
  getCurrentYear,
  calculateDaysRemaining,
  generatePdf,
};

export default Helper;
