import React, {forwardRef} from 'react';

import {Text, TouchableOpacity, View} from 'react-native';
import CustomBottomSheetModal from './CustomBottomSheetModal';
import {CButton} from '../general';
import {CloseSvg} from '../../assets/icons';
import moment from 'moment';
import {BottomSheetScrollView, useBottomSheetModal} from '@gorhom/bottom-sheet';
import Badge from '../screens/explore/Badge';

const AgreementModalSheet = forwardRef((props, ref) => {
  const date = moment().subtract('4', 'm').format('DD-MM-yyyy');

  return (
    <CustomBottomSheetModal
      ref={ref}
      snapPoints={['50%', '99%']}
      handleComponent={() => renderSheetHeader(props?.type)}>
      <BottomSheetScrollView style={{padding: 16}} className={'p-4 flex-col '}>
        <Text className={'text-grey_1 text-xs font-inter leading-5'}>
          This Tenancy Agreement ("Agreement") is made and entered into on this{' '}
          <Text className={'font-inter-semibold text-grey_1 text-xs leading-5'}>
            {date}
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

        <AgreementItem title={'Terms of Tenancy'} ClassName={'pl-1'}>
          <View className={'pl-1'}>
            {tenancyTerms.map((term, ind) => (
              <View className={'flex-row pr-3 space-x-1'} key={ind}>
                <Text
                  className={'leading-6 text-grey_1 text-xs font-inter mt-1'}>
                  {ind + 1}.
                </Text>
                <Text
                  key={ind}
                  className={
                    'capitalize font-inter text-grey_1 text-xs leading-5'
                  }>
                  <Text className={'leading-6'}>{term}</Text>
                </Text>
              </View>
            ))}
          </View>
        </AgreementItem>

        <AgreementItem title={'General Provisions'} ClassName={'pl-1'}>
          <View className={''}>
            {generalProvisions.map((prov, ind) => (
              <View className={'flex-row pr-3 space-x-1'} key={ind}>
                <Text
                  className={'leading-6 text-grey_1 text-xs font-inter mt-1'}>
                  {ind + 1}.
                </Text>
                <Text
                  key={ind}
                  className={
                    'capitalize font-inter text-grey_1 text-xs leading-5'
                  }>
                  <Text className={'leading-6'}>{prov}</Text>
                </Text>
              </View>
            ))}
          </View>
        </AgreementItem>

        <View className={'h-5 w-full'} />
      </BottomSheetScrollView>
      {props.type !== 'previous' && (
        <View className={'py-5 pb-10 w-full flex-row justify-center'}>
          <TouchableOpacity onPress={props.handleIssueTermination}>
            <Text className={'text-red-700 font-inter-semibold'}>
              Issue Termination Notice
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </CustomBottomSheetModal>
  );
});
export default AgreementModalSheet;

const AgreementItem = ({title, ClassName, children}) => (
  <View className={'mt-4'}>
    <Text className={'uppercase font-inter text-black text-xs leading-5 mb-1 '}>
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
        <Text className={'font-inter-semibold text-lg text-black mr-2'}>
          Agreement
        </Text>

        <Badge
          ClassName={` ${
            type === 'previous' ? 'bg-red-100' : 'bg-green-100'
          }  px-4`}>
          {type === 'previous' ? (
            <Text className={'text-red-700 font-inter text-11'}>
              Terminated
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

const tenantDetails = {
  name: "[Tenant's Name]",
  address: "[Tenant's Address]",
  contact: "[Tenant's Phone/Email]",
};

const propertyDetails = {
  'property name': '[Property Name]',
  'unit name': '[Unit Name]',
  location: '[Location]',
};

const tenancyTerms = [
  'Rent: The monthly rent for the property is agreed upon at [Rent] to be paid on or before the ___ day of every month.',
  'Date: The tenancy begins on {Date}',
  'Punishment: Any breach of this agreement may result in penalties as defined by local laws and regulations. Such penalties may include fines, eviction, or legal action.',
  "Termination: a. Either party may terminate this agreement by providing a written notice of termination at least ___ days prior to the intended termination date. b. In case of tenant's breach of this agreement, the landlord may terminate the tenancy with a ___ day notice.",
];
const generalProvisions = [
  'Rent: The monthly rent for the property is agreed upon at [Rent] to be paid on or before the ___ day of every month.',
  'Date: The tenancy begins on {Date}',
  'Punishment: Any breach of this agreement may result in penalties as defined by local laws and regulations. Such penalties may include fines, eviction, or legal action.',
  "Termination: a. Either party may terminate this agreement by providing a written notice of termination at least ___ days prior to the intended termination date. b. In case of tenant's breach of this agreement, the landlord may terminate the tenancy with a ___ day notice.",
];

//TENANT:
// Name: [Tenant's Full Name]
// Address: [Tenant's Address]
// Contact: [Tenant's Phone/Email]
//
// PROPERTY INFORMATION:
// Property Name: [Property Name]
// Unit Name: [Unit Name]
// Location: [Location]
//
// TERMS OF TENANCY:
// Rent: The monthly rent for the property is agreed upon at [Rent] to be paid on or before the ___ day of every month.
// Date: The tenancy begins on {Date}
// Punishment: Any breach of this agreement may result in penalties as defined by local laws and regulations. Such penalties may include fines, eviction, or legal action.
// Termination: a. Either party may terminate this agreement by providing a written notice of termination at least ___ days prior to the intended termination date. b. In case of tenant's breach of this agreement, the landlord may terminate the tenancy with a ___ day notice.
// GENERAL PROVISIONS:
// Maintenance and Repairs: The tenant shall be responsible for minor repairs and maintenance. Major repairs and structural issues will be the responsibility of the landlord.
// Utilities: The tenant is responsible for paying utilities unless otherwise specified in writing.
// Security Deposit: The tenant has paid a security deposit of [$X] which will be refunded within ___ days after termination, less any deductions for unpaid rent or damages.
// Governing Law: This agreement shall be governed by the laws of the state of [State], and any disputes shall be subject to the jurisdiction of the courts within [Location].
