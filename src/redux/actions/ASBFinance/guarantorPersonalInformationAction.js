export const GUARANTOR_ADDRESS_LINE_ONE_ACTION = (addressLineOne) => ({
    addressLineOne,
});

export const GUARANTOR_ADDRESS_LINE_TWO_ACTION = (addressLineTwo) => ({
    addressLineTwo,
});

export const GUARANTOR_ADDRESS_LINE_THREE_ACTION = (addressLineThree) => ({
    addressLineThree,
});

export const GUARANTOR_POSTAL_CODE_ACTION = (postalCode) => ({
    postalCode,
});

export const GUARANTOR_STATE_ACTION = (stateIndex, stateValue) => ({
    stateIndex,
    stateValue,
});

export const GUARANTOR_MARITAL_ACTION = (maritalIndex, maritalValue) => ({
    maritalIndex,
    maritalValue,
});

export const GUARANTOR_EDUCATION_ACTION = (educationIndex, educationValue) => ({
    educationIndex,
    educationValue,
});

export const GUARANTOR_COUNTRY_ACTION = (countryIndex, countryValue) => ({
    countryIndex,
    countryValue,
});

export const GUARANTOR_CITY_ACTION = (city) => ({
    city,
});

export const GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION = (raceData) => ({
    raceData,
});

export const GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION = (isAddressLineOneMaskingOn) => ({
    isAddressLineOneMaskingOn,
});

export const GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION = (isAddressLineTwoMaskingOn) => ({
    isAddressLineTwoMaskingOn,
});

export const GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION = (isAddressLineThreeMaskingOn) => ({
    isAddressLineThreeMaskingOn,
});

export const GUARANTOR_EMAIL_ADDRESS_ACTION = (emailAddress) => ({
    emailAddress,
});

export const GUARANTOR_RACE_ACTION = (raceIndex, raceValue) => ({
    raceIndex,
    raceValue,
});

export const GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION = (mobileNumberWithoutExtension) => ({
    mobileNumberWithoutExtension,
});

export const GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION = (mobileNumberWithExtension) => ({
    mobileNumberWithExtension,
});

export const GUARANTOR_MOBILE_NUMBER_MASK_ACTION = (isMobileNumberMaskingOn) => ({
    isMobileNumberMaskingOn,
});
export const GUARANTOR_POSTAL_CODE_MASK_ACTION = (isPostalCodeMaskingOn) => ({
    isPostalCodeMaskingOn,
});
export const GUARANTOR_CITY_MASK_ACTION = (isCityMaskingOn) => ({
    isCityMaskingOn,
});
export const GUARANTOR_EMAIL_MASK_ACTION = (isEmailMaskingOn) => ({
    isEmailMaskingOn,
});

export const GUARANTOR_IS_STATE_ENABLED_ACTION = (isStateDropdownEnabled) => ({
    isStateDropdownEnabled,
});

export const GUARANTOR_PERSONAL_DETAILS_CONFIRMATION_ACTION = (
    isFromConfirmationScreenForPersonalDetails
) => ({
    isFromConfirmationScreenForPersonalDetails,
});

export const GUARANTOR_IS_STATE_CHANGED_ACTION = (isStateChanged) => ({
    isStateChanged,
});

export const GUARANTOR_IS_POSTAL_CODE_CHANGED_ACTION = (isPostalCodeChanged) => ({
    isPostalCodeChanged,
});

export const GUARANTOR_PRMIMARY_INCOME_ACTION = (primaryIncomeIndex, primaryIncome) => ({
    primaryIncomeIndex,
    primaryIncome,
});

export const GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_ACTION = (
    primarySourceOfWealthIndex,
    primarySourceOfWealth
) => ({
    primarySourceOfWealthIndex,
    primarySourceOfWealth,
});

export const GUARANTOR_ADDITIONAL_INCOME_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const GUARANTOR_DECLARATION = (isAcceptedDeclaration) => ({ isAcceptedDeclaration });

export const GUARANTOR_DECLARATION_AGREE_TO_EXCUTE = (isAgreeToExecute) => ({ isAgreeToExecute });

export const GUARANTOR_MAIN_APPLICANT_DATA_UPDATE_ACTION = (
    mainApplicantEmail,
    mainApplicantPhoneNumber
) => ({
    mainApplicantEmail,
    mainApplicantPhoneNumber,
});
