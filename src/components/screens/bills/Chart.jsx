import React from 'react';
import {Dimensions, View} from 'react-native';
import {StackedBarChart} from 'react-native-chart-kit';
import COLORS from '../../../constants/Theme';

const CBarChart = ({cData}) => {
  const data = {
    labels: cData?.labels ?? [],
    legend: cData?.legend ?? [],
    data: cData?.data ?? [],
    barColors: cData?.barColors ?? [],
  };
  return (
    <View className={'rounded-xl overflow-hidden'}>
      <StackedBarChart
        hideLegend={true}
        // style={graphStyle}
        data={data}
        width={Dimensions.get('window').width * 0.9}
        height={300}
        verticalLabelRotation={30}
        fromZero
        yAxisSuffix={'k'}
        chartConfig={{
          propsForLabels: {
            fontFamily: 'Inter-Regular',
            fontSize: 11,
          },
          propsForBackgroundLines: {fill: 'white'},
          backgroundColor: COLORS.white,
          backgroundGradientTo: COLORS.white,
          backgroundGradientFrom: COLORS.primary_bg_pale,
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `#000`,
          labelColor: (opacity = 1) => `#000`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '0',
            stroke: '#fff',
          },
        }}
      />
    </View>
  );
};

export default CBarChart;
