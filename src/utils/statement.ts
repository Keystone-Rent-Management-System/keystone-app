import moment from 'moment';

export type Duration =
  | 'today'
  | 'yesterday'
  | 'this_month'
  | `${number}_days`
  | `${number}_months`
  | `${number}_years`;

export interface IFromEndDate {
  from: Date;
  to: Date;
}

/**
 * Method to get the from and to date from a certain duration
 * @param duration - Duration of the statement. Allowed Formats: today, yesterday, n_days, n_months, n_years
 * @returns IFromEndDate - Object containing the from and to date
 */
export function getFromAndEndDateFromDuration(
  duration: Duration,
): IFromEndDate {
  const today = moment();
  let from = moment();
  let to = moment();

  let durationUnit;
  let durationValue: number | string;

  // Get the duration unit & value: Check if the duration is today or yesterday and if not,
  // duration must be of the format n_days, n_months, n_years
  if (duration === 'today') {
    durationUnit = 'days';
    durationValue = 'today';
  } else if (duration === 'yesterday') {
    durationUnit = 'days';
    durationValue = 'yesterday';
  }
  // If the duration is this_month, set the durationUnit to months and durationValue to 1
  else if (duration === 'this_month') {
    durationUnit = 'months';
    durationValue = 0;
  } else {
    const durationParts = duration.split('_');

    durationUnit = durationParts[1];
    durationValue = parseInt(durationParts[0], 10);
  }

  // Set from & to dates based on the durationValue
  if (durationValue === 'today') {
    from = today;
    to = today;
  } else if (durationValue === 'yesterday') {
    from = today.clone().subtract(1, 'days');
    to = today.clone().subtract(1, 'days');
  } else {
    if (durationUnit === 'days') {
      from = today.clone().subtract(durationValue as number, 'days');
      to = today;
    } else if (durationUnit === 'months') {
      // This month
      if (durationValue === 0) {
        from = today.clone().startOf('month');
        to = today.clone().endOf('month');
      } else {
        from = today.clone().subtract(durationValue as number, 'months');
        to = today;
      }
    } else if (durationUnit === 'years') {
      from = today.clone().subtract(durationValue as number, 'years');
      to = today;
    }
  }

  return {from: from.toDate(), to: to.toDate()};
}
