import numberWithCommas from './numberWithCommas';

const numberConverter = (number: number) =>
  number < 0
    ? `(${numberWithCommas(Number(-number || 0))})`
    : numberWithCommas(Number(number || 0));

export default numberConverter;
