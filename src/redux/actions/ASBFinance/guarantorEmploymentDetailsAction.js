// Employment details actions

export const GUARANTOR_EMPLOYER_NAME_ACTION = (employerName) => ({
    employerName,
});

export const GUARANTOR_OCCUPATION_ACTION = (occupationIndex, occupationValue) => ({
    occupationIndex,
    occupationValue,
});

export const GUARANTOR_SECTOR_ACTION = (sectorIndex, sectorValue) => ({
    sectorIndex,
    sectorValue,
});

export const GUARANTOR_EMPLOYMENT_TYPE_ACTION = (employmentTypeIndex, employmentTypeValue) => ({
    employmentTypeIndex,
    employmentTypeValue,
});

export const GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForEmploymentDetails
) => ({
    isFromConfirmationScreenForEmploymentDetails,
});

export const GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION = () => ({});

export const GUARANTOR_EMPLOYMENT_DETAILS_CLEAR = () => ({});

export const GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION = (addressLineOneEmployment) => ({
    addressLineOneEmployment,
});
export const GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION = (
    isAddressLineOneMaskingOnEmployment
) => ({
    isAddressLineOneMaskingOnEmployment,
});

export const GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION = (addressLineTwoEmployment) => ({
    addressLineTwoEmployment,
});

export const GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION = (addressLineThreeEmployment) => ({
    addressLineThreeEmployment,
});

export const GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION = (
    isAddressLineTwoMaskingOnEmployment
) => ({
    isAddressLineTwoMaskingOnEmployment,
});

export const GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION = (
    isAddressLineThreeMaskingOnEmployment
) => ({
    isAddressLineThreeMaskingOnEmployment,
});

export const GUARANTOR_EMPLOYMENT_CITY_ACTION = (cityEmployment) => ({
    cityEmployment,
});
export const GUARANTOR_EMPLOYMENT_COUNTRY_ACTION = (
    countryIndexEmployment,
    countryValueEmployment
) => ({
    countryIndexEmployment,
    countryValueEmployment,
});
export const GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION = (postalCodeEmployment) => ({
    postalCodeEmployment,
});
export const GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION = (isPostalCodeMaskingOnEmployment) => ({
    isPostalCodeMaskingOnEmployment,
});
export const GUARANTOR_EMPLOYMENT_STATE_ACTION = (stateIndexEmployment, stateValueEmployment) => ({
    stateIndexEmployment,
    stateValueEmployment,
});
export const GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION = (isStateDropdownEnabledEmployment) => ({
    isStateDropdownEnabledEmployment,
});
export const GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION = (isCityMaskingOnEmployment) => ({
    isCityMaskingOnEmployment,
});

export const GUARANTOR_EMPLOYMENT_IS_STATE_CHANGED_ACTION = (isStateChangedEmployment) => ({
    isStateChangedEmployment,
});

export const GUARANTOR_EMPLOYMENT_IS_POSTAL_CODE_CHANGED_ACTION = (
    isPostalCodeChangedEmployment
) => ({
    isPostalCodeChangedEmployment,
});

export const GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION = (
    isMobileNumberMaskingOnEmployment
) => ({
    isMobileNumberMaskingOnEmployment,
});

export const GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION = (
    mobileNumberWithoutExtensionEmployment
) => ({
    mobileNumberWithoutExtensionEmployment,
});

export const GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION = (
    mobileNumberWithExtensionEmployment
) => ({
    mobileNumberWithExtensionEmployment,
});
