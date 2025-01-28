import {useNavigation, useRoute} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useCallback, useEffect} from 'react';
import {ActivityIndicator, Text, ToastAndroid} from 'react-native';

import Layout from '../../components/Layout';
import COLORS from '../../constants/Theme';
import {useActiveAgrement} from '../../hooks';
import StatementServices from '../../services/StatementServices';
import {getError} from '../../utils/getError';
import Helper from '../../utils/Helper';
import {getStatementDetails} from '../../utils/statement';

const Statements = ({params}) => {
  const {agreement} = useActiveAgrement();
  const route = useRoute();
  const dateRange = route.params?.dateRange;
  const navigation = useNavigation();

  const {tenants, propertyUnits} = agreement;

  const {data, error, isError} = useQuery({
    queryKey: ['statements', JSON.stringify(params || '_')],
    queryFn: () =>
      StatementServices.getFilteredStatements(route?.params?.dateRange, 0, 500),

    enabled: !!route?.params?.dateRange,
  });

  const source = {
    html: `
      <div style="padding: 10px; border-width: 0.5px; border-color: #00000020;">
      <!--  Header    -->
      <header>
        <div style="display: flex; flex-direction: row; justify-content: space-between; color:black; margin-bottom:3px">
        
          <h4 style="font-weight: 500; font-size: 20px; flex:1;">BLESKET KE LIMITED</h4>
          
          <h4 style="color: #022374; font-size: 20px; flex:1;">STATEMENT</h4>
        </div> 
        
        <!--    Details      -->
        <div style="display: flex; flex-direction: row; justify-content: space-between; color:black;">
          <div style="display: flex; flex-direction: column;"> 
            <div style="margin-bottom:3px; font-size: 18px; font-weight: 500;"> 
              ${tenants?.user?.firstName} ${tenants?.user?.lastName}
            </div>
            <div style="margin-bottom:3px; font-size: 18px; font-weight: 500;"> 
              ${tenants?.user?.email}
            </div>
            <div style="margin-bottom:3px; font-size: 18px; font-weight: 500;"> 
              ${tenants?.user?.phoneNumber}
            </div>
            <span style="margin-bottom:3px; font-size: 18px; font-weight: 500;"> 
              Unit: ${propertyUnits?.name}
            </span>
          </div>
          <div style="max-width: 50%"> 
            <div style="display: flex; flex-direction: row; gap:10px;"> 
              <div style="color: #00000080; min-width: 50px; font-size: 18px; font-weight: 400;"> Property: </div>
              <span style="color: #000; font-size: 18px; font-weight: 400; text-wrap: wrap;"> ${
                propertyUnits?.property?.name
              }, ${propertyUnits?.property?.address?.line} </span>
            </div>
            <div style="display: flex; flex-direction: row; width: 80%"> 
              <div style="color: #00000080; min-width: 50px; font-size: 18px; font-weight: 400; margin-right: 10px;"> Statement: </div>
              <span style="color: #000; font-size: 18px; font-weight: 400; text-wrap: wrap;"> ${moment(
                dateRange?.to,
              ).format('DD MMM YYYY')}</span>
            </div>
            <div style="display: flex; flex-direction: row; width: 80%"> 
              <div style="color: #00000080; min-width: 50px; font-size: 18px; font-weight: 400; margin-right: 10px;"> Period: </div>
              <span style="color: #000; font-size: 18px; font-weight: 400; text-wrap: wrap;"> ${moment(
                dateRange?.from,
              ).format('DD MMM YYYY')} to ${moment(dateRange?.to).format(
      'DD MMM YYYY',
    )}</span>
            </div>
          </div>
        </div>
        
        <div style="padding-top:8px; padding-bottom: 8px; margin-top: 10px; border-top-width: 0.5px; border-color: #00000020;">
          <!--    Title     -->
          <p style="text-align: center; margin: 0; font-size: 18px; font-weight: 500; color: black;">TENTANT STATEMENT FOR THE PERIOD ${moment(
            dateRange?.from,
          ).format('D/MM/yyyy')} TO ${moment(dateRange?.to).format(
      'D/MM/yyyy',
    )}</p>
        </div>
      </header>
      <table style="width: 100%;">
        <!--    Header Row    -->
        <tr style="display: flex; gap: 10px; padding: 5px; border-color: black; border-top-width: 0.5px; border-bottom-width: 0.5px;">
          <th style="flex: 1; font-weight: 500; font-size: 18px; color: black; text-align: left;">Date</th>
          <th style="flex: 1; font-weight: 500; font-size: 18px; color: black; text-align: left;">TXT No</th>
          <th style="flex: 1; font-weight: 500; font-size: 18px; color: black; text-align: left;">Details</th>
          <th style="flex: 1; font-weight: 500; font-size: 18px; color: black; text-align: left;">Charge</th>
          <th style="flex: 1; font-weight: 500; font-size: 18px; color: black; text-align: left;">Payment</th>
          <th style="flex: 1; font-weight: 500; font-size: 18px; color: black; text-align: left;">R.Balance</th>
        </tr>
        ${
          data &&
          data
            ?.map(statement => {
              return `
          <tr style="display: flex; gap: 10px; padding: 5px; border-color: #00000060; border-bottom-width: 0.5px;">
            <td style="flex: 1; font-weight: 400; font-size: 18px; color: black;">
              ${statement?.timeOfDayLabel}
            </td>
            <td style="flex: 1; font-weight: 400; font-size: 18px; color: black;">
              ${statement?.transaction.invoice_details?.invoice_number}
            </td>
            <td style="flex: 1; font-weight: 400; font-size: 18px; color: black;">
              ${getStatementDetails(statement?.transaction?.invoice_details)}
            </td>
            <td style="flex: 1; font-weight: 400; font-size: 18px; color: black;">
              KES ${statement?.transaction?.invoice_details?.total_amount ?? 0}
            </td>
            <td style="flex: 1; font-weight: 400; font-size: 18px; color: black;">
              KES ${statement?.transaction?.payment_details?.paid_amount ?? 0}
            </td>
            <td style="flex: 1; font-weight: 400; font-size: 18px; color: black;">
              KES ${statement?.transaction?.payment_details?.balance ?? 0}
            </td>
          </tr>`;
            })
            .join('')
        }
      </table>
    </div>
    `,
  };

  const createPDF = useCallback(async () => {
    const fileName = `${moment(dateRange?.from).format('DMMyy')}${moment(
      dateRange?.to,
    ).format('DMMyy')}`;

    try {
      await Helper.generatePdf(source?.html, fileName);

      ToastAndroid.show('Statement saved to Downloads', ToastAndroid.LONG);
      navigation.goBack();
    } catch (e) {
      ToastAndroid.show('Statement Download Error', ToastAndroid.LONG);
      navigation.goBack();
    }
  }, [dateRange?.from, dateRange?.to, navigation, source?.html]);

  useEffect(() => {
    if (data) {
      createPDF();
    }
  }, [createPDF, data]);

  useEffect(() => {
    if (isError) {
      ToastAndroid.show(`Failed to Generate statement.${getError(error)}`);
      navigation.goBack();
    }
  }, [error, isError, navigation]);

  return (
    <Layout ClassName={'px-3 flex-1 justify-center items-center'}>
      <ActivityIndicator color={COLORS.primary} size={50} />
      <Text className="text-primary mt-5">Generating Statement ...</Text>
    </Layout>
  );
};

export default Statements;
