const renderSingularPlural = (num, render, nullRender = '') =>
  parseInt(num) > 1 ? render : nullRender;

const Helper = {renderSingularPlural};

export default Helper;
