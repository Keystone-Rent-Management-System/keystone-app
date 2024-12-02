import {padZero} from '../utils/addZeroToDateFormat';

export const useFormatStartAndEndDate = (month, year) => {
  let startDate, endDate;

  // Check if 12 Months is selected
  if (month === 12) {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  } else {
    // Initialize start date
    startDate = `${year}-${padZero(parseInt(month, 10) + 1)}-01`;

    // Calculate end date
    if (month === 1) {
      // February
      // Check if it's a leap year
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      endDate = `${year}-${padZero(parseInt(month, 10) + 1)}-${
        isLeapYear ? '29' : '28'
      }`;
    } else {
      const formattedEndDate = new Date(year, parseInt(month, 10) + 1, 0);
      endDate = `${year}-${padZero(parseInt(month, 10) + 1)}-${padZero(
        formattedEndDate.getDate(),
      )}`;
    }
  }

  return {startDate, endDate};
};

export const useMonthStartAndEndDate = () => {
  const currentDate = new Date();

  let firstDayOfNextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1,
  );

  let lastDay = new Date(firstDayOfNextMonth - 1);

  const startDate = `${currentDate.getFullYear()}-${padZero(
    currentDate.getMonth() + 1,
  )}-01`;

  const endDate = `${currentDate.getFullYear()}-${padZero(
    currentDate.getMonth() + 1,
  )}-${padZero(lastDay.getDate())}`;

  return {startDate, endDate};
};

export const useWeekStartAndEndDate = () => {
  const currentDate = new Date();

  const currentDayOfWeek = currentDate.getDay();

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

  const endOfWeek = new Date(currentDate);
  endOfWeek.setDate(currentDate.getDate() + (6 - currentDayOfWeek));

  const startDate = `${startOfWeek.getFullYear()}-${padZero(
    startOfWeek.getMonth() + 1,
  )}-${padZero(startOfWeek.getDate())}`;
  const endDate = `${endOfWeek.getFullYear()}-${padZero(
    endOfWeek.getMonth() + 1,
  )}-${padZero(endOfWeek.getDate())}`;

  return {startDate, endDate};
};
