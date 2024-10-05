import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';
import AgreementServices from '../../../services/AgreementServices';
import {useQuery} from '@tanstack/react-query';

interface IPdfViewerProps {
  agreementId?: string;
}

const PdfViewer = ({
  agreementId = 'd80e03fe-8f3f-4758-bab5-c1351d3fdf53',
}: IPdfViewerProps) => {
  const {
    data: pdfUri,
    isError,
    isPending,
  } = useQuery({
    queryKey: ['agreement-pdf'],
    queryFn: () => AgreementServices.fetchPDF(agreementId),
  });

  useEffect(() => {
    if (isError) {
      ToastAndroid.show('Error while fetching pdf', ToastAndroid.LONG);
    }
  }, [isError]);
  const source = {
    uri: pdfUri,
    cache: true,
  };

  if (isPending) {
    return (
      <View
        style={{width: Dimensions.get('window').width}}
        className={'flex flex-col items-center py-16 '}>
        <ActivityIndicator color={'#022374'} size="small" />
        <Text className={'text-primary font-inter-semibold text-sm mt-3'}>
          Fetching agreement...
        </Text>
      </View>
    );
  }

  return (
    <View
      className={'flex-1 w-[100%] p-0'}
      style={{width: Dimensions.get('window').width}}>
      <Pdf
        source={source}
        onLoadComplete={numberOfPages => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={page => {
          console.log(`Current page: ${page}`);
        }}
        onError={error => {
          console.log(error);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    padding: 0,
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  pdf: {
    flex: 1,
    padding: 3,
    borderWidth: 5,
    borderColor: 'white',
    height: '100%',
  },
});

export default PdfViewer;
