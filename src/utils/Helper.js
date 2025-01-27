import {Linking} from 'react-native';
import {PALLAX_SUPPORT_NUMBER} from '../constants';
import moment from 'moment';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';

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

export async function generatePdf(html, fileName) {
  let options = {
    html,
    fileName,
    directory: 'Documents',
    base64: true,
  };
  let file = await RNHTMLtoPDF.convert(options);
  let filePath = RNFetchBlob.fs.dirs.DownloadDir + '/' + fileName + '.pdf';

  await RNFetchBlob.fs.writeFile(filePath, file.base64, 'base64');

  return filePath;
}

export const formatToKES = amount => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
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
