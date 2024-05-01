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

const Helper = {renderSingularPlural, getGreetings, getInitials};

export default Helper;
