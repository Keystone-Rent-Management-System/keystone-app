import numberWithCommas from './numberWithCommas';

const numberConverter = (number: number) =>
  number < 0
    ? `(${numberWithCommas(Number(-number))})`
    : numberWithCommas(Number(number));

export default numberConverter;
