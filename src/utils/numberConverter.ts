import {formatToKES} from './Helper';
import numberWithCommas from './numberWithCommas';

const numberConverter = (number: number) =>
  number < 0
    ? `(${numberWithCommas(Number(-number || 0))})`
    : numberWithCommas(Number(number || 0));

export const numberCurrencyConverter = (amount: number) =>
  amount < 0
    ? `(${formatToKES(Math.abs(Number(amount)))})`
    : formatToKES(Number(amount));

export default numberConverter;
