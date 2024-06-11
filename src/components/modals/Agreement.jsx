import React, {forwardRef} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import CustomBottomSheetModal from './CustomBottomSheetModal';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import moment from 'moment';
import {BottomSheetScrollView, useBottomSheetModal} from '@gorhom/bottom-sheet';
import Badge from '../screens/explore/Badge';
import numberWithCommas from '../../utils/numberWithCommas';

const AgreementModalSheet = forwardRef((props, ref) => {
  const tenantDetails = {
    Name: `${props?.agreement?.tenants?.tenantUser?.firstName} ${props?.agreement?.tenants?.tenantUser?.lastName}`,
    ID: props?.agreement?.tenants?.tenantUser?.identificationNumber,
    Contact: props?.agreement?.tenants?.tenantUser?.phoneNumber,
  };

  const propertyDetails = {
    'Property Name': props?.agreement?.propertyUnits?.property?.name,
    'Unit Name': props?.agreement?.propertyUnits?.name,
    Landlord: `${props?.agreement?.propertyUnits?.property?.landlord?.landlordUser?.firstName} ${props?.agreement?.propertyUnits?.property?.landlord?.landlordUser?.lastName}`,
    location: `${props?.agreement?.propertyUnits?.property?.country}, ${props?.agreement?.propertyUnits?.property?.county}, ${props?.agreement?.propertyUnits?.property?.neighborhood}`,
  };

  const terms = [
    `WHEREAS, the Landlord is the owner of the apartment located at ${props?.agreement?.propertyUnits?.property?.country}, ${props?.agreement?.propertyUnits?.property?.county}, ${props?.agreement?.propertyUnits?.property?.neighborhood}.`,
    'WHEREAS, the Tenant wishes to take the Premises from the Landlord under the terms and conditions set forth in this Agreement.',
    'NOW, THEREFORE, in consideration of the mutual covenants and promises herein contained, the parties hereto agree as follows:',
    [
      '1. Premises',
      'The Landlord hereby agrees to let to the Tenant, and the Tenant hereby agree to take from the Landlord, the Premises described above.',
    ],
    [
      '2. Term',
      `The term of this agreement shall commence on the ${moment(
        props?.agreement?.tenancyBeginningDate,
      ).format(
        'DD-MM-yyyy',
      )}, and shall continue until the ____ day of ____________, 20, unless terminated earlier in accordance with the provisions of this Agreement.`,
    ],
    [
      '3. Rent',
      `The Tenant agrees to pay a monthly rent of KES ${numberWithCommas(
        props?.agreement?.propertyUnits?.rent,
      )}.`,
      `The Rent is due and payable on or before the ${props?.agreement?.rentDueDate} day of each month.`,
      'Payment shall be made via bank transfer to the Landlord’s designated account or any other payment method mutually agreed upon by both parties.',
    ],
    [
      '4. Security Deposit',
      `Upon signing this Agreement, the Tenant shall pay a security deposit of KES ${numberWithCommas(
        props?.agreement?.propertyUnits?.deposit,
      )}, which shall be held by the Landlord as security for the performance of the Tenant's obligations under this Agreement.`,
      `The security deposit shall be refundable within ${props?.agreement?.daysOfDepositRefundAfterTermination} days after the agreement Term ends, provided the Tenant has fulfilled all obligations and returned the Premises and its contents in good condition, subject to normal wear and tear.`,
    ],
    [
      '5. Condition of Premises and Inventory',
      'The Tenant agrees to inspect the Premises prior to moving in and confirm that they are in good condition and working order. Any discrepancies or issues must be reported to the Landlord within three (3) days of taking possession of the Premises.',
      'The Tenant agrees to maintain the Premises in good condition throughout the agreement Term.',
    ],
    [
      '6. Use of Premises',
      'The Premises shall be used solely for residential purposes and shall be occupied only by the Tenant and list any additional occupants if applicable.',
      'The Tenant agrees to comply with all community rules and regulations and not to engage in any illegal or disruptive activities.',
    ],
    [
      '7. Maintenance and Repairs',
      'The Landlord shall be responsible for major repairs and maintenance of the Premises.',
      'The Tenant shall promptly notify the Landlord of any damage or need for repairs. The Tenant shall be responsible for any damage caused by negligence or misuse.',
    ],
    [
      '8. Utilities',
      'The Tenant shall be responsible for the payment of all utility charges, including electricity, water, internet, and any other utilities, unless otherwise specified in this Agreement.',
    ],
    [
      '9. Termination',
      `Either party may terminate this Agreement by providing ${props?.agreement?.daysOfTerminationNotice} days written notice to the other party.`,
      `The Landlord reserves the right to terminate this Agreement within ${props?.agreement?.daysOfTerminationAfterAgreementBreach} days if the Tenant fails to pay the Rent for two (2) consecutive months or breaches any terms of this Agreement.`,
    ],
    [
      '10. Governing Law',
      'This Agreement shall be governed by and construed in accordance with the laws of Kenya.',
    ],
    [
      '11. Dispute Resolution',
      'Any disputes arising out of or in connection with this Agreement shall be resolved through amicable negotiations between the parties.',
      'If the parties are unable to resolve the dispute amicably, the matter shall be referred to arbitration in accordance with the laws of Kenya.',
    ],
    [
      '12. Entire Agreement',
      'This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements and understandings, whether written or oral, relating to such subject matter.',
    ],
    [
      '13. Amendments',
      'No amendment or modification of this Agreement shall be valid unless made in writing and signed by both parties.',
    ],
  ];

  return (
    <CustomBottomSheetModal
      ref={ref}
      snapPoints={['50%', '99%']}
      handleComponent={() => renderSheetHeader(props?.type)}>
      <BottomSheetScrollView style={{padding: 16}} className={'p-4 flex-col '}>
        <Text className={'text-grey_1 text-xs font-inter leading-5'}>
          This Tenancy Agreement ("Agreement") is made and entered into on this{' '}
          <Text className={'font-inter-semibold text-grey_1 text-xs leading-5'}>
            {moment(props?.agreement?.tenancyBeginningDate).format(
              'DD-MM-yyyy',
            )}
          </Text>{' '}
          ("Effective Date"), by and between:
        </Text>
        {/*  Tenant's information  */}
        <AgreementItem title={'Tenant'}>
          {Object.keys(tenantDetails).map((tenant, ind) => (
            <Text
              key={ind}
              className={'capitalize font-inter text-grey_1 text-xs leading-5'}>
              {tenant}:{' '}
              <Text className={'font-inter-semibold leading-6'}>
                {tenantDetails[tenant]}
              </Text>
            </Text>
          ))}
        </AgreementItem>

        {/*  property's information  */}
        <AgreementItem title={'Property Information'}>
          {Object.keys(propertyDetails).map((prop, ind) => (
            <Text
              key={ind}
              className={'capitalize font-inter text-grey_1 text-xs leading-5'}>
              {prop}:{' '}
              <Text className={'font-inter-semibold leading-6'}>
                {propertyDetails[prop]}
              </Text>
            </Text>
          ))}
        </AgreementItem>

        <AgreementItem title={'RECITALS'} ClassName={'pl-1'}>
          <View className={'pl-1'}>
            {terms.map((term, ind) => (
              <View>
                {typeof term === 'object' ? (
                  <View className={'flex flex-col pr-3 space-y-0.5'} key={ind}>
                    <Text
                      className={'font-inter text-grey_1 text-xs leading-5'}>
                      <Text className={'leading-6 font-inter-semibold'}>
                        {term[0]}
                      </Text>
                    </Text>
                    <View className="flex flex-col pl-2">
                      {term.slice(1).map((innerTerm, index) => (
                        <Text
                          className={
                            'font-inter text-grey_1 text-xs leading-5'
                          }>
                          <Text className={'leading-5'}>
                            <Text
                              className={
                                'text-black text-3xl font-inter-semibold'
                              }>
                              .
                            </Text>{' '}
                            {innerTerm}
                          </Text>
                        </Text>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text
                    key={ind}
                    className={'font-inter text-grey_1 text-xs leading-5'}>
                    <Text className={'leading-6'}>{term}</Text>
                  </Text>
                )}
              </View>
            ))}
          </View>
        </AgreementItem>

        <View className={'h-5 w-full'} />
      </BottomSheetScrollView>
      {props.type === 'agreed' ? (
        <View className={'py-5 pb-10 w-full flex-row justify-center'}>
          <TouchableOpacity onPress={props.handleIssueTermination}>
            <Text className={'text-red-700 font-inter-semibold'}>
              Issue Termination Notice
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        props.type === 'pending' && (
          <View className={'py-5 pb-10 w-full flex-row justify-around'}>
            <TouchableOpacity
              onPress={() => props.handleAcceptAgreement(props.agreement.id)}>
              <Text className={'text-c_green font-inter-semibold'}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                props.handleTerminateAgreement(props.agreement.id)
              }>
              <Text className={'text-red-700 font-inter-semibold'}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </CustomBottomSheetModal>
  );
});
export default AgreementModalSheet;

const AgreementItem = ({title, ClassName, children}) => (
  <View className={'mt-4'}>
    <Text className={'uppercase font-bold text-black text-xs leading-5 mb-1 '}>
      {title}
    </Text>

    {children}
  </View>
);

const renderSheetHeader = type => <SheetHeader type={type} />;
const SheetHeader = ({type}) => {
  const {dismiss} = useBottomSheetModal();

  return (
    <View
      className={
        ' top-0 bg-none py-3 z-50 flex-row justify-between items-end border-b border-border_grey mx-4 space-x-2'
      }>
      <View className={'flex-row'}>
        <Text
          className={'font-inter-semibold text-lg text-black mr-2 uppercase'}>
          Tenancy Agreement
        </Text>

        <Badge
          ClassName={` ${
            type === 'previous'
              ? 'bg-red-100'
              : type === 'pending'
              ? 'bg-gray-100'
              : 'bg-green-100'
          }  px-4`}>
          {type === 'previous' ? (
            <Text className={'text-red-700 font-inter text-11'}>
              Terminated
            </Text>
          ) : type === 'pending' ? (
            <Text className={'text-gray-700 font-inter text-11'}>
              Awaiting acceptance
            </Text>
          ) : (
            <Text className={'text-c_green font-inter text-11'}>
              Agreed & Active
            </Text>
          )}
        </Badge>
      </View>

      <CButton
        ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
        onPress={() => dismiss()}>
        <CloseSvg />
      </CButton>
    </View>
  );
};
