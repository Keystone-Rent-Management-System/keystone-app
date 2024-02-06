const renderSingularPlural = (num, render, nullRender = '') =>
  parseInt(num, 10) > 1 ? render : nullRender;

const getGreetings = () => {
  const date = new Date();
  const hours = date.getHours();

  switch (hours) {
    case hours < 12:
      return 'Good Morning!';
    case hours < 16:
      return 'Good Afternoon!';
    default:
      return 'Good Evening!';
  }
};

const Helper = {renderSingularPlural, getGreetings};

export default Helper;
