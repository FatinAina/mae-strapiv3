// Residential details actions

export const DEBIT_CARD_ADDRESS_LINE_ONE_ACTION = (addressLineOne) => ({
    addressLineOne,
});

export const DEBIT_CARD_ADDRESS_LINE_TWO_ACTION = (addressLineTwo) => ({
    addressLineTwo,
});

export const DEBIT_CARD_ADDRESS_LINE_THREE_ACTION = (addressLineThree) => ({
    addressLineThree,
});

export const DEBIT_CARD_POSTAL_CODE_ACTION = (postalCode) => ({
    postalCode,
});

export const DEBIT_CARD_STATE_ACTION = (stateIndex, stateValue) => ({
    stateIndex,
    stateValue,
});

export const DEBIT_CARD_CITY_ACTION = (city) => ({
    city,
});

export const ZEST_API_REQ_BODY_ACTION = (reqBody) => ({
    reqBody,
});

export const ZEST_BACKUP_DEBIT_CARD_DATA = (
    addressLineOneBackup,
    addressLineTwoBackup,
    addressLineThreeBackup,
    postalCodeBackup,
    cityBackup,
    stateIndexBackup,
    stateValueBackup,
    isTermsConditionAgreeBackup
) => ({
    addressLineOneBackup,
    addressLineTwoBackup,
    addressLineThreeBackup,
    postalCodeBackup,
    cityBackup,
    stateIndexBackup,
    stateValueBackup,
    isTermsConditionAgreeBackup,
});

export const DEBIT_CARD_GET_STATE_DROPDOWN_ITEMS_ACTION = (stateDropdownItems) => ({
    stateDropdownItems,
});

export const DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION = (
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage
) => ({
    userStatus,
    mobileNumber,
    mobileNumberErrorMessage,
});

export const DEBIT_CARD_RESIDENTIAL_DETAILS_CLEAR = () => ({});

export const DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION = (isAddressLineOneMaskingOn) => ({
    isAddressLineOneMaskingOn,
});

export const DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION = (isAddressLineTwoMaskingOn) => ({
    isAddressLineTwoMaskingOn,
});

export const DEBIT_CARD_TERMS_CONDITION = (isAddressLineThreeMaskingOn) => ({
    isAddressLineThreeMaskingOn,
});
