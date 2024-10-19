import * as React from 'react';
import {View} from 'react-native';
import WebView from 'react-native-webview';
import {virtualStyle} from '../../modals/VirtualTour';

interface IMatterPortPreview {
  htmlIframe: any;
}

const MatterPortPreview = (props: IMatterPortPreview) => {
  return (
    <View className={'relative h-60 bg-active_text'}>
      <WebView
        source={{
          html: props.htmlIframe,
        }}
        style={virtualStyle?.webview}
      />
    </View>
  );
};

export default MatterPortPreview;
