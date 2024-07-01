export const generateYears = () => {
  let years = ['All'];

  const currentYear = new Date().getFullYear();

  const startYear = 2024;
  const endYear = currentYear;

  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
};
