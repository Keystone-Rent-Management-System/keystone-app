import {Text, View} from 'react-native';
import React, {Component} from 'react';

export default class StatsCard extends Component {
  render() {
    return (
      <View className={'mt-2 bg-primary rounded-xl h-40 p-3'}>
        <Text className={'text-primary'}>StatsCard</Text>
      </View>
    );
  }
}
