const renderSingularPlural = (num, render, nullRender = '') =>
  parseInt(num, 10) > 1 ? render : nullRender;

const getGreetings = () => {
  const date = new Date();
  const hours = date.getHours();
  console.log('HOURS', hours < 12);

  if (hours < 12) {
    return 'Good Morning!';
  } else if (hours < 16) {
    return 'Good Afternoon!';
  } else {
    return 'Good Evening!';
  }
};

const Helper = {renderSingularPlural, getGreetings};

export default Helper;
