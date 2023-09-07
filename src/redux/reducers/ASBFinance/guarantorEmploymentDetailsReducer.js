import {
    validateEmployerName,
    validatAddress,
    validatePostalCode,
    validateOfficeMobileNumber,
    validateEmpCity,
} from "@screens/ASB/Financing/AsbFinanceValidation";

import {
    GUARANTOR_EMPLOYER_NAME_ACTION,
    GUARANTOR_OCCUPATION_ACTION,
    GUARANTOR_SECTOR_ACTION,
    GUARANTOR_EMPLOYMENT_TYPE_ACTION,
    GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION,
    GUARANTOR_EMPLOYMENT_DETAILS_CLEAR,
    GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_CITY_ACTION,
    GUARANTOR_EMPLOYMENT_COUNTRY_ACTION,
    GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION,
    GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_STATE_ACTION,
    GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION,
    GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION,
    GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_IS_STATE_CHANGED_ACTION,
    GUARANTOR_EMPLOYMENT_IS_POSTAL_CODE_CHANGED_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
} from "@redux/actions/ASBFinance/guarantorEmploymentDetailsAction";

// Employment details default value
const initialState = {
    employerName: null,
    occupationIndex: null,
    occupationValue: null,
    sectorIndex: null,
    sectorValue: null,
    employmentTypeIndex: null,
    employmentTypeValue: null,

    employerNameErrorMessage: null,
    isUSeries: false,
    isEmploymentDetailsContinueButtonEnabled: false,
    isFromConfirmationScreenForEmploymentDetails: false,

    addressLineOneEmployment: null,
    addressLineTwoEmployment: null,
    addressLineThreeEmployment: null,
    postalCodeEmployment: null,
    stateIndexEmployment: null,
    stateValueEmployment: null,
    countryIndexEmployment: null,
    countryValueEmployment: null,
    cityEmployment: null,
    mobileNumberWithoutExtensionEmployment: null,
    mobileNumberWithExtensionEmployment: null,
    mobileNumberErrorMessageEmployment: null,

    addressLineOneErrorMessageEmployment: null,
    addressLineTwoErrorMessageEmployment: null,
    addressLineThreeErrorMessageEmployment: null,
    postalCodeErrorMessageEmployment: null,
    cityErrorMessageEmployment: null,

    isAddressLineOneMaskingOnEmployment: false,
    isAddressLineTwoMaskingOnEmployment: false,
    isAddressLineThreeMaskingOnEmployment: false,
    isPostalCodeMaskingOnEmployment: false,
    isCityMaskingOnEmployment: false,
    isStateDropdownEnabledEmployment: false,
    isEmploeymentDetails2ContinueButtonEnabled: false,
    isStateChangedEmployment: false,
    isPostalCodeChangedEmployment: false,
    isMobileNumberMaskingOnEmployment: false,
};

// Employment details reducer
export default function guarantorEmploymentDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_EMPLOYER_NAME_ACTION:
            return {
                ...state,
                employerName: action.employerName,
                employerNameErrorMessage: validateEmployerName(action.employerName),
            };

        case GUARANTOR_OCCUPATION_ACTION:
            return {
                ...state,
                occupationIndex: action.occupationIndex,
                occupationValue: action.occupationValue,
                isUSeries: !!(
                    action.occupationValue?.value &&
                    (action.occupationValue?.value.charAt(0) === "U" ||
                        action.occupationValue?.value.charAt(0) === "u")
                ),
            };

        case GUARANTOR_SECTOR_ACTION:
            return {
                ...state,
                sectorIndex: action.sectorIndex,
                sectorValue: action.sectorValue,
            };

        case GUARANTOR_EMPLOYMENT_TYPE_ACTION:
            return {
                ...state,
                employmentTypeIndex: action.employmentTypeIndex,
                employmentTypeValue: action.employmentTypeValue,
            };

        case GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION:
            return {
                ...state,
                isEmploymentDetailsContinueButtonEnabled:
                    checkEmploymentDetailsContinueButtonStatus(state),
            };

        case GUARANTOR_EMPLOYMENT_DETAILS_CONFIRMATION_ACTION:
            return {
                ...state,
                isFromConfirmationScreenForEmploymentDetails:
                    action.isFromConfirmationScreenForEmploymentDetails,
            };

        case GUARANTOR_EMPLOYMENT_DETAILS_CLEAR:
            return {
                ...state,
                employerName: null,
                occupationIndex: null,
                occupationValue: null,
                sectorIndex: null,
                sectorValue: null,
                employmentTypeIndex: null,
                employmentTypeValue: null,
                employerNameErrorMessage: null,

                isEmploymentDetailsContinueButtonEnabled: false,
                isFromConfirmationScreenForEmploymentDetails: false,
            };

        case GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION:
            return {
                ...state,
                addressLineOneEmployment: action.addressLineOneEmployment,
                addressLineOneErrorMessageEmployment: validatAddress(
                    action.addressLineOneEmployment
                ),
            };

        case GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION:
            return {
                ...state,
                addressLineTwoEmployment: action.addressLineTwoEmployment,
                addressLineTwoErrorMessageEmployment: validatAddress(
                    action.addressLineTwoEmployment
                ),
            };

        case GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION:
            return {
                ...state,
                addressLineThreeEmployment: action.addressLineThreeEmployment,
                addressLineThreeErrorMessageEmployment: validatAddress(
                    action.addressLineThreeEmployment
                ),
            };

        case GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION:
            return {
                ...state,
                postalCodeEmployment: action.postalCodeEmployment,
                postalCodeErrorMessageEmployment: validatePostalCode(action.postalCodeEmployment),
            };

        case GUARANTOR_EMPLOYMENT_STATE_ACTION:
            return {
                ...state,
                stateIndexEmployment: action.stateIndexEmployment,
                stateValueEmployment: action.stateValueEmployment,
            };

        case GUARANTOR_EMPLOYMENT_COUNTRY_ACTION:
            return {
                ...state,
                countryIndexEmployment: action.countryIndexEmployment,
                countryValueEmployment: action.countryValueEmployment,
            };

        case GUARANTOR_EMPLOYMENT_CITY_ACTION:
            return {
                ...state,
                cityEmployment: action.cityEmployment,
                cityErrorMessageEmployment: validateEmpCity(action.cityEmployment),
            };

        case GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION:
            return {
                ...state,
                isEmploeymentDetails2ContinueButtonEnabled:
                    checkEmployemntDetails2ContinueButtonStatus(state),
            };

        case GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION:
            return {
                ...state,
                isAddressLineOneMaskingOnEmployment: action.isAddressLineOneMaskingOnEmployment,
            };

        case GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION:
            return {
                ...state,
                isAddressLineTwoMaskingOnEmployment: action.isAddressLineTwoMaskingOnEmployment,
            };

        case GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION:
            return {
                ...state,
                isAddressLineThreeMaskingOnEmployment: action.isAddressLineThreeMaskingOnEmployment,
            };

        case GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION:
            return {
                ...state,
                isPostalCodeMaskingOnEmployment: action.isPostalCodeMaskingOnEmployment,
            };

        case GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION:
            return {
                ...state,
                isCityMaskingOnEmployment: action.isCityMaskingOnEmployment,
            };

        case GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION:
            return {
                ...state,
                isStateDropdownEnabledEmployment: action.isStateDropdownEnabledEmployment,
            };

        case GUARANTOR_EMPLOYMENT_IS_STATE_CHANGED_ACTION:
            return {
                ...state,
                isStateChangedEmployment: action.isStateChangedEmployment,
            };

        case GUARANTOR_EMPLOYMENT_IS_POSTAL_CODE_CHANGED_ACTION:
            return {
                ...state,
                isPostalCodeChangedEmployment: action.isPostalCodeChangedEmployment,
            };

        case GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithoutExtensionEmployment:
                    action.mobileNumberWithoutExtensionEmployment,
                mobileNumberErrorMessageEmployment: validateOfficeMobileNumber(
                    action.mobileNumberWithoutExtensionEmployment
                ),
            };

        case GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION:
            return {
                ...state,
                mobileNumberWithExtensionEmployment: action.mobileNumberWithExtensionEmployment,
            };

        case GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION:
            return {
                ...state,
                isMobileNumberMaskingOnEmployment: action.isMobileNumberMaskingOnEmployment,
            };

        default:
            return state;
    }
}

// Check employment details continue button status
export const checkEmploymentDetailsContinueButtonStatus = (state) => {
    if (state.isUSeries) {
        return state.occupationIndex !== null && state.occupationValue;
    } else {
        return (
            state.employerName?.trim()?.length > 0 &&
            state.occupationValue &&
            state.sectorValue &&
            state.employmentTypeValue &&
            state.employerNameErrorMessage === null
        );
    }
};

export const checkEmployemntDetails2ContinueButtonStatus = (state) => {
    return (
        state.addressLineOneEmployment?.trim()?.length > 0 &&
        state.addressLineTwoEmployment?.trim()?.length > 0 &&
        state.postalCodeEmployment?.trim()?.length > 0 &&
        state.stateValueEmployment &&
        state.countryValueEmployment &&
        state.cityEmployment?.trim()?.length > 0 &&
        state.addressLineOneErrorMessageEmployment === null &&
        state.addressLineTwoErrorMessageEmployment === null &&
        state.addressLineThreeErrorMessageEmployment === null &&
        state.postalCodeErrorMessageEmployment === null &&
        state.cityErrorMessageEmployment === null &&
        state.mobileNumberWithoutExtensionEmployment?.trim()?.length > 0 &&
        state.mobileNumberErrorMessageEmployment === null
    );
};
