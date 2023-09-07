/*
Helper to prefill customer data in respective screens
for ETB Customer after getting customer details from pre-qual service
*/
import numeral from "numeral";

import { maskAddress, maskMobile, maskEmail } from "@screens/PLSTP/PLSTPController";

import { ASB_GUARANTOR_CONFIRMATION, ASB_STACK } from "@navigation/navigationConstant";

import {
    GUARANTOR_EMPLOYER_NAME_ACTION,
    GUARANTOR_EMPLOYMENT_TYPE_ACTION,
    GUARANTOR_OCCUPATION_ACTION,
    GUARANTOR_SECTOR_ACTION,
    GUARANTOR_EMPLOYMENT_COUNTRY_ACTION,
    GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
    GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION,
    GUARANTOR_EMPLOYMENT_STATE_ACTION,
    GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_CITY_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
} from "@redux/actions/ASBFinance/guarantorEmploymentDetailsAction";
import { GUARANTOR_FATCA_DECLARATION_IS_US_PERSON } from "@redux/actions/ASBFinance/guarantorFatcaDeclarationAction";
import {
    GUARANTOR_MONTHLY_GROSS_INCOME,
    GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
} from "@redux/actions/ASBFinance/guarantorIncomeDetailsAction";
import {
    GUARANTOR_PRMIMARY_INCOME_ACTION,
    GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_ACTION,
    GUARANTOR_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_CITY_ACTION,
    GUARANTOR_CITY_MASK_ACTION,
    GUARANTOR_COUNTRY_ACTION,
    GUARANTOR_EDUCATION_ACTION,
    GUARANTOR_EMAIL_MASK_ACTION,
    GUARANTOR_MARITAL_ACTION,
    GUARANTOR_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_POSTAL_CODE_ACTION,
    GUARANTOR_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_RACE_ACTION,
    GUARANTOR_STATE_ACTION,
    GUARANTOR_EMAIL_ADDRESS_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_IS_STATE_ENABLED_ACTION,
    GUARANTOR_DECLARATION,
    GUARANTOR_ADDRESS_LINE_THREE_ACTION,
    GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION,
    GUARANTOR_DECLARATION_AGREE_TO_EXCUTE,
    GUARANTOR_MAIN_APPLICANT_DATA_UPDATE_ACTION,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import {
    EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
    EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
    EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
    EMPLOYMENT_POSTAL_CODE_ACTION,
    EMPLOYMENT_STATE_ACTION,
    EMPLOYMENT_COUNTRY_ACTION,
    EMPLOYMENT_CITY_ACTION,
    EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
    EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
    EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    EMPLOYMENT_CITY_MASK_ACTION,
    EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
} from "@redux/actions/ASBFinance/occupationInformation2Action";
import {
    EMPLOYER_NAME_ACTION,
    EMPLOYMENT_TYPE_ACTION,
    OCCUPATION_ACTION,
    SECTOR_ACTION,
} from "@redux/actions/ASBFinance/occupationInformationAction";
import {
    ADDRESS_LINE_ONE_ACTION,
    ADDRESS_LINE_TWO_ACTION,
    ADDRESS_LINE_THREE_ACTION,
    POSTAL_CODE_ACTION,
    CITY_ACTION,
    STATE_ACTION,
    COUNTRY_ACTION,
    RACE_ACTION,
    EMAIL_ADDRESS_ACTION,
    ADDRESS_LINE_ONE_MASK_ACTION,
    ADDRESS_LINE_TWO_MASK_ACTION,
    ADDRESS_LINE_THREE_MASK_ACTION,
    MOBILE_NUMBER_MASK_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    POSTAL_CODE_MASK_ACTION,
    EMAIL_MASK_ACTION,
    CITY_MASK_ACTION,
    MARITAL_ACTION,
    EDUCATION_ACTION,
} from "@redux/actions/ASBFinance/personalInformationAction";
import {
    ASB_UPDATE_EMPLOYMENT_DETAILS,
    ASB_UPDATE_FINANCING_DETAILS,
    ASB_UPDATE_PERSONAL_DETAILS,
} from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";

import { DT_RECOM } from "@constants/data";
import {
    TYPE_OF_FINANCING,
    AMOUNT_NEED,
    ASNB_ACCOUNT,
    NO_OF_CERTIFICATE,
    TENURE,
    MONTHLY_PAYMENT,
    PLSTP_SUCCESS_ADDON,
    MONTHLY_GROSS_INC,
    TOTAL_MONTHLY_NONBANK_COMMITMENTS,
    PLSTP_EDUCATION,
    STEPUP_MAE_RACE,
    EMAIL_LBL,
    COUNTRY_LBL,
    STEPUP_MAE_ADDRESS_POSTAL,
    STEPUP_MAE_ADDRESS_STATE,
    STEPUP_MAE_ADDRESS_CITY,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    MARITAL_STATUS,
    ASB_ADDRESS_LINE_ONE,
    ASB_ADDRESS_LINE_TWO,
    ASB_EMPLOYER_NAME,
    ASB_EMPLOYMENT_TYPE,
    INTEREST_PROFIT_RATE,
    PLSTP_MOBILE_NUM,
    OFFICE_ADDR1,
    OFFICE_ADDR2,
    OFFICE_ADDR3,
    OFFICE_PHNO,
    ADDRESS_LINE_THREE,
    AMANAH_SAHAM_BUMIPUTRA,
} from "@constants/strings";

export const PersonalDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    const areaCode = prePostQualReducer?.contactInformation?.phones[0]?.phone?.areaCode
        ? prePostQualReducer?.contactInformation?.phones[0]?.phone?.areaCode
        : "";

    const phoneNumber = prePostQualReducer?.contactInformation?.phones[0]?.phone?.phoneNumber
        ? prePostQualReducer?.contactInformation?.phones[0]?.phone?.phoneNumber
        : "";

    const countryCode = prePostQualReducer?.contactInformation?.phones[0]?.phone?.countryCode
        ? prePostQualReducer?.contactInformation?.phones[0]?.phone?.countryCode
        : "";

    const address = prePostQualReducer?.addresses?.filter((item) => {
        return item?.addressType?.value === "RESIDENTIAL";
    });

    dispatch({
        type: ADDRESS_LINE_ONE_ACTION,
        addressLineOne: address && address.length > 0 ? address[0].address?.line1 : "",
    });
    dispatch({
        type: ADDRESS_LINE_TWO_ACTION,
        addressLineTwo: address && address.length > 0 ? address[0].address?.line2 : "",
    });
    dispatch({
        type: ADDRESS_LINE_THREE_ACTION,
        addressLineThree: address && address.length > 0 ? address[0].address?.line3 : "",
    });
    dispatch({
        type: EMAIL_ADDRESS_ACTION,
        emailAddress: prePostQualReducer?.contactInformation?.emailAddress
            ? prePostQualReducer?.contactInformation?.emailAddress
            : "",
    });
    dispatch({
        type: POSTAL_CODE_ACTION,
        postalCode: address && address.length > 0 ? address[0].address?.postalCode : "",
    });
    dispatch({
        type: CITY_ACTION,
        city: address && address.length > 0 ? address[0].address?.town : "",
    });
    dispatch({
        type: MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
        mobileNumberWithoutExtension: mobileNumberWithAreaCode(areaCode, phoneNumber),
    });
    dispatch({
        type: MOBILE_NUMBER_WITH_EXTENSION_ACTION,
        mobileNumberWithExtension: mobileNumberWithAreaAndCountryCode(
            countryCode,
            areaCode,
            phoneNumber
        ),
    });

    const releventState = masterDataReducer.allState.find(
        ({ value }) => value === address[0].address?.country?.code
    );
    const stateListData = JSON.stringify(releventState.name);
    const stateListDataArray = stateListData.split('"');
    const finalStateList = stateListDataArray[1].split(",");
    const stateList = [];
    const len = finalStateList?.length;
    for (let i = 0; i < len; i++) {
        stateList.push({
            name: finalStateList[i],
            value: finalStateList[i],
        });
    }
    filterDropdownList(address[0].address?.state?.value, stateList, (index, value) => {
        dispatch({ type: STATE_ACTION, stateIndex: index, stateValue: value });
    });

    filterDropdownList(
        prePostQualReducer?.demographics?.race?.value,
        masterDataReducer.personalInfoRace,
        (index, value) => {
            dispatch({ type: RACE_ACTION, raceIndex: index, raceValue: value });
        }
    );

    filterDropdownList(
        address[0].address?.country?.value,
        masterDataReducer.country,
        (index, value) => {
            dispatch({ type: COUNTRY_ACTION, countryIndex: index, countryValue: value });
        }
    );

    filterDropdownList(
        prePostQualReducer?.demographics?.maritalStatus?.value,
        masterDataReducer?.maritalStatus,
        (index, value) => {
            dispatch({ type: MARITAL_ACTION, maritalIndex: index, maritalValue: value });
        }
    );

    filterDropdownList(
        prePostQualReducer?.additionalDetails?.education?.value,
        masterDataReducer?.education,
        (index, value) => {
            dispatch({ type: EDUCATION_ACTION, educationIndex: index, educationValue: value });
        }
    );

    dispatch({ type: MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: true });
    dispatch({ type: ADDRESS_LINE_THREE_MASK_ACTION, isAddressLineThreeMaskingOn: true });
    dispatch({ type: POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
    dispatch({ type: EMAIL_MASK_ACTION, isEmailMaskingOn: true });
    dispatch({ type: CITY_MASK_ACTION, isCityMaskingOn: true });
};

export const ResumeDataForOccupationOne = (dispatch, data, masterDataReducer) => {
    dispatch({
        type: EMPLOYER_NAME_ACTION,
        employerName: data?.stpEmployerName,
    });

    filterDropdownList(data?.stpOccupationDesc, masterDataReducer.occupation, (index, value) => {
        dispatch({ type: OCCUPATION_ACTION, occupationIndex: index, occupationValue: value });
    });
    filterDropdownListByCode(
        data?.stpOccupationSectorCode,
        masterDataReducer.sector,
        (index, value) => {
            dispatch({ type: SECTOR_ACTION, sectorIndex: index, sectorValue: value });
        }
    );

    filterDropdownList(
        data?.stpEmploymentTypeDesc,
        masterDataReducer.employmentType,
        (index, value) => {
            dispatch({
                type: EMPLOYMENT_TYPE_ACTION,
                employmentTypeIndex: index,
                employmentTypeValue: value,
            });
        }
    );
};

export const ResumeDataForOccupationTwo = (dispatch, data, masterDataReducer) => {
    filterDropdownList(data?.stpEmployerCountry, masterDataReducer.country, (index, value) => {
        dispatch({
            type: EMPLOYMENT_COUNTRY_ACTION,
            countryIndex: index,
            countryValue: value,
        });
    });

    const releventState = masterDataReducer.allState.find(
        ({ value }) => value === data.stpEmployerCountryCode
    );
    const stateListData = JSON.stringify(releventState?.name);
    const stateListDataArray = stateListData && stateListData.split('"');
    const finalStateList = stateListDataArray && stateListDataArray[1].split(",");
    const stateList = [];
    const len = finalStateList?.length;
    for (let i = 0; i < len; i++) {
        stateList.push({
            name: finalStateList[i],
            value: finalStateList[i],
        });
    }

    filterDropdownList(data?.stpEmployerStateCode, stateList, (index, value) => {
        dispatch({ type: EMPLOYMENT_STATE_ACTION, stateIndex: index, stateValue: value });
    });
};

export const ResumeDataForPersonalDetails = (dispatch, data, masterDataReducer) => {
    filterDropdownList(
        data?.stpMaritalStatusDesc,
        masterDataReducer?.maritalStatus,
        (index, value) => {
            dispatch({ type: MARITAL_ACTION, maritalIndex: index, maritalValue: value });
        }
    );

    filterDropdownList(data?.stpEducationDesc, masterDataReducer?.education, (index, value) => {
        dispatch({ type: EDUCATION_ACTION, educationIndex: index, educationValue: value });
    });

    filterDropdownList(data?.stpHomeCountry, masterDataReducer.country, (index, value) => {
        dispatch({
            type: COUNTRY_ACTION,
            countryIndex: index,
            countryValue: value,
        });
    });

    const releventState = masterDataReducer?.allState?.find(
        ({ value }) => value === data.stpHomeCountryCode
    );
    const stateListData = JSON.stringify(releventState?.name);
    const stateListDataArray = stateListData && stateListData.split('"');
    const finalStateList = stateListDataArray[1].split(",");
    const stateList = [];
    const len = finalStateList?.length;
    for (let i = 0; i < len; i++) {
        stateList.push({
            name: finalStateList[i],
            value: finalStateList[i],
        });
    }

    filterDropdownList(data?.stpHomeStateCode, stateList, (index, value) => {
        dispatch({ type: STATE_ACTION, stateIndex: index, stateValue: value });
    });
};
export const EmployeeDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    dispatch({
        type: EMPLOYER_NAME_ACTION,
        employerName: prePostQualReducer?.employmentDetails?.employerName?.registeredName,
    });

    filterDropdownListByCode(
        prePostQualReducer?.employmentDetails?.occupation?.code,
        masterDataReducer.occupation,
        (index, value) => {
            dispatch({ type: OCCUPATION_ACTION, occupationIndex: index, occupationValue: value });
        }
    );

    filterDropdownListByCode(
        prePostQualReducer?.employmentDetails?.occupationSector?.code,
        masterDataReducer.sector,
        (index, value) => {
            dispatch({ type: SECTOR_ACTION, sectorIndex: index, sectorValue: value });
        }
    );

    filterDropdownList(
        prePostQualReducer?.employmentDetails?.employmentType?.value,
        masterDataReducer.employmentType,
        (index, value) => {
            dispatch({
                type: EMPLOYMENT_TYPE_ACTION,
                employmentTypeIndex: index,
                employmentTypeValue: value,
            });
        }
    );
};

export const OccupationDetailsPrefiller = (dispatch, masterDataReducer, prePostQualReducer) => {
    const employmentAreaCode = prePostQualReducer?.employmentDetails?.employersPhone?.phone
        ?.areaCode
        ? prePostQualReducer?.employmentDetails?.employersPhone?.phone?.areaCode
        : "";

    const employmentPhoneNumber = prePostQualReducer?.employmentDetails?.employersPhone?.phone
        ?.phoneNumber
        ? prePostQualReducer?.employmentDetails?.employersPhone?.phone?.phoneNumber
        : "";

    const employmentCountryCode = prePostQualReducer?.employmentDetails?.employersPhone?.phone
        ?.countryCode
        ? prePostQualReducer?.employmentDetails?.employersPhone?.phone?.countryCode
        : "";

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line1 &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line1 !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
            addressLineOne: prePostQualReducer?.employmentDetails?.employerAddress?.address.line1
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.line1
                : "",
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line2 &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line2 !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
            addressLineTwo: prePostQualReducer?.employmentDetails?.employerAddress?.address.line2
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.line2
                : "",
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line3 &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.line3 !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
            addressLineThree: prePostQualReducer?.employmentDetails?.employerAddress?.address.line3
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.line3
                : "",
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_POSTAL_CODE_ACTION,
            postalCode: prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.postalCode
                : "",
        });
    }
    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address.town &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address.town !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_CITY_ACTION,
            city: prePostQualReducer?.employmentDetails?.employerAddress?.address.town
                ? prePostQualReducer?.employmentDetails?.employerAddress?.address.town
                : "",
        });
    }
    if (
        employmentAreaCode &&
        employmentAreaCode !== "" &&
        employmentPhoneNumber &&
        employmentPhoneNumber !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension: mobileNumberWithAreaCode(
                employmentAreaCode,
                employmentPhoneNumber
            ),
        });
    }
    if (
        employmentAreaCode &&
        employmentAreaCode !== "" &&
        employmentPhoneNumber &&
        employmentPhoneNumber !== "" &&
        employmentCountryCode &&
        employmentCountryCode !== ""
    ) {
        dispatch({
            type: EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtension: mobileNumberWithAreaAndCountryCode(
                employmentCountryCode,
                employmentAreaCode,
                employmentPhoneNumber
            ),
        });
    }

    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.state?.value &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.state?.value !== ""
    ) {
        const releventState = masterDataReducer.allState.find(
            ({ value }) =>
                value ===
                prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.code
        );
        const stateListData = JSON.stringify(releventState.name);
        const stateListDataArray = stateListData.split('"');
        const finalStateList = stateListDataArray[1].split(",");
        const stateList = [];
        const len = finalStateList?.length;
        for (let i = 0; i < len; i++) {
            stateList.push({
                name: finalStateList[i],
                value: finalStateList[i],
            });
        }

        filterDropdownList(
            prePostQualReducer?.employmentDetails?.employerAddress?.address?.state?.value,
            stateList,
            (index, value) => {
                dispatch({ type: EMPLOYMENT_STATE_ACTION, stateIndex: index, stateValue: value });
            }
        );
    }
    if (
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.value &&
        prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.value !== ""
    ) {
        filterDropdownList(
            prePostQualReducer?.employmentDetails?.employerAddress?.address?.country?.value,
            masterDataReducer.country,
            (index, value) => {
                dispatch({
                    type: EMPLOYMENT_COUNTRY_ACTION,
                    countryIndex: index,
                    countryValue: value,
                });
            }
        );
    }

    dispatch({ type: EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: true });
    dispatch({ type: EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION, isAddressLineOneMaskingOn: true });
    dispatch({ type: EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION, isAddressLineTwoMaskingOn: true });
    dispatch({
        type: EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
        isAddressLineThreeMaskingOn: true,
    });
    dispatch({ type: EMPLOYMENT_POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
    dispatch({ type: EMPLOYMENT_CITY_MASK_ACTION, isCityMaskingOn: true });
};

function filterDropdownList(prefilledValue, dropdownList, updateFunction) {
    dropdownList?.find((item, index) => {
        const { name } = item;
        if (name?.toLowerCase() === prefilledValue?.toLowerCase()) updateFunction(index, item);
    });
}

function filterDropdownListByCode(prefilledValue, dropdownList, updateFunction) {
    dropdownList.find((item, index) => {
        const { value } = item;
        if (value?.toLowerCase() === prefilledValue?.toLowerCase()) updateFunction(index, item);
    });
}

const mobileNumberWithAreaCode = (areaCode, mobileNumber) =>
    `${areaCode.replace("0", "")}${mobileNumber}`;

const mobileNumberWithAreaAndCountryCode = (countryCode, areaCode, mobileNumber) =>
    `${countryCode}${areaCode.replace("0", "")}${mobileNumber}`;

export const updateDataOnReducerBaseOnApplicationDetails = (
    data,
    masterData,
    eligibilityCheckOutcomeData,
    dispatch,
    navigation,
    fillEmployementDetails = true,
    needNavigation = false,
    additionalDetails
) => {
    prefillFinancingDetails(data, eligibilityCheckOutcomeData, dispatch, additionalDetails);

    let country = masterData?.countryUpdate;
    if (!country) {
        country = getUpdatedCountry(masterData?.country);
    }

    prefillPersonalDetails(data, masterData, dispatch, country, additionalDetails);

    if (fillEmployementDetails) {
        prefillEmployeDetails(data, masterData, dispatch, country);
    }

    if (data?.stpIsUsaCitizen) {
        let isUSPerson;
        if (data?.stpIsUsaCitizen === "Y") {
            isUSPerson = true;
        } else if (data?.stpIsUsaCitizen === "N") {
            isUSPerson = false;
        }

        dispatch({
            type: GUARANTOR_FATCA_DECLARATION_IS_US_PERSON,
            isUSPerson,
        });
    }

    prefillIncomeDetailsDetails(data, masterData, dispatch);

    if (needNavigation) {
        navigation.navigate(ASB_STACK, {
            screen: ASB_GUARANTOR_CONFIRMATION,
        });
    }
};

const prefillFinancingDetails = (
    data,
    eligibilityCheckOutcomeData,
    dispatch,
    additionalDetails
) => {
    let eligibilityResult = {};
    if (data?.stpEligibilityResponse) {
        const eligibilityData = JSON.parse(data?.stpEligibilityResponse);
        const checkEligibilityData = eligibilityData?.eligibilityCheckOutcome;
        checkEligibilityData.map((item) => {
            eligibilityResult = item;
            if (item.dataType === DT_RECOM) {
                eligibilityResult = item;
            }
        });
    }

    const financingDetailsList = [];
    financingDetailsList.push({
        displayKey: TYPE_OF_FINANCING,
        displayValue:
            additionalDetails?.stpTypeOfLoan === "I"
                ? "Islamic Financing"
                : "Conventional Financing",
    });

    if (additionalDetails?.stpAmountINeed || eligibilityResult?.loanAmount) {
        financingDetailsList.push({
            displayKey: AMOUNT_NEED,
            displayValue: `RM ${numeral(
                eligibilityResult
                    ? eligibilityResult?.loanAmount
                    : additionalDetails?.stpAmountINeed
            ).format(",0.00")}`,
        });
    }

    if (data?.stpAsbHolderNum) {
        financingDetailsList.push({
            displayKey: ASNB_ACCOUNT,
            displayValue: AMANAH_SAHAM_BUMIPUTRA + data?.stpAsbHolderNum,
        });
    }

    if (additionalDetails?.stpCertificatesNum) {
        financingDetailsList.push({
            displayKey: NO_OF_CERTIFICATE,
            displayValue: additionalDetails?.stpCertificatesNum,
        });
    }

    if (eligibilityCheckOutcomeData?.tenure) {
        financingDetailsList.push({
            displayKey: TENURE,
            displayValue: `${eligibilityCheckOutcomeData?.tenure} Years`,
        });
    }

    if (
        eligibilityCheckOutcomeData?.tierList &&
        eligibilityCheckOutcomeData?.tierList.length > 0 &&
        eligibilityCheckOutcomeData?.tierList[0]?.interestRate
    ) {
        financingDetailsList.push({
            displayKey: INTEREST_PROFIT_RATE,
            displayValue: `${numeral(
                eligibilityResult?.tierList?.length > 0
                    ? eligibilityResult?.tierList[0]?.interestRate
                    : additionalDetails?.stpMonthlyInstalment
            ).format(",0.00")}% p.a.`,
        });
    }
    if (additionalDetails?.stpMonthlyInstalment || eligibilityResult?.tierList?.length > 0) {
        financingDetailsList.push({
            displayKey: MONTHLY_PAYMENT,
            displayValue: `RM ${numeral(
                eligibilityResult?.tierList?.length > 0
                    ? eligibilityResult?.tierList[0]?.installmentAmount
                    : additionalDetails?.stpMonthlyInstalment
            ).format(",0.00")}`,
        });
    }
    if (eligibilityResult?.totalGrossPremium) {
        financingDetailsList.push({
            displayKey: PLSTP_SUCCESS_ADDON,
            displayValue: `RM ${numeral(eligibilityResult?.totalGrossPremium).format(",0.00")}`,
        });
    }

    if (data?.stpGrossIncome) {
        financingDetailsList.push({
            displayKey: MONTHLY_GROSS_INC,
            displayValue: `RM ${numeral(data?.stpGrossIncome).format(",0.00")}`,
        });
    }

    financingDetailsList.push({
        displayKey: TOTAL_MONTHLY_NONBANK_COMMITMENTS,
        displayValue: data?.stpOtherCommitments
            ? `RM ${numeral(data?.stpOtherCommitments).format(",0.00")}`
            : "RM 0.00",
    });
    dispatch({ type: ASB_UPDATE_FINANCING_DETAILS, financingDetailsList });
};

const prefillPersonalDetails = (data, masterData, dispatch, country, additionalDetails) => {
    const personDetailsList = [];

    let mainApplicantEmail, mainApplicantPhoneNumber;

    if (additionalDetails?.stpMobileContactNumber) {
        mainApplicantPhoneNumber =
            additionalDetails?.stpMobileContactNumber && additionalDetails?.stpMobileContactPrefix
                ? 0 +
                  additionalDetails?.stpMobileContactPrefix * 1 +
                  additionalDetails?.stpMobileContactNumber
                : additionalDetails?.stpMobileContactNumber &&
                  0 + additionalDetails?.stpMobileContactNumber;
    }

    if (additionalDetails?.stpEmail) {
        mainApplicantEmail = additionalDetails?.stpEmail?.replace(/\r\n/, "");
    }

    dispatch({
        type: GUARANTOR_MAIN_APPLICANT_DATA_UPDATE_ACTION,
        mainApplicantEmail,
        mainApplicantPhoneNumber,
    });

    if (data?.stpMaritalStatusDesc && masterData?.maritalStatus) {
        filterDropdownList(
            data?.stpMaritalStatusDesc,
            masterData?.maritalStatus,
            (index, value) => {
                dispatch({
                    type: GUARANTOR_MARITAL_ACTION,
                    maritalIndex: index,
                    maritalValue: value,
                });
            }
        );

        personDetailsList.push({
            displayKey: MARITAL_STATUS,
            displayValue: data?.stpMaritalStatusDesc,
        });
    }

    if (data?.stpEducationDesc && masterData?.education) {
        filterDropdownList(data?.stpEducationDesc, masterData?.education, (index, value) => {
            dispatch({
                type: GUARANTOR_EDUCATION_ACTION,
                educationIndex: index,
                educationValue: value,
            });
        });

        personDetailsList.push({
            displayKey: PLSTP_EDUCATION,
            displayValue: data?.stpEducationDesc,
        });
    }

    let race = masterData?.personalInfoRace;
    if (masterData?.race) {
        race = masterData?.race;
    }

    if (data?.stpEthnicCode && race) {
        let raceValue;
        filterDropdownListByCode(data?.stpEthnicCode, race, (index, value) => {
            raceValue = value;
            dispatch({ type: GUARANTOR_RACE_ACTION, raceIndex: index, raceValue: value });
        });

        personDetailsList.push({
            displayKey: STEPUP_MAE_RACE,
            displayValue: raceValue?.name,
        });
    }

    if (data?.stpMobileContactNumber) {
        dispatch({ type: GUARANTOR_MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: true });
        dispatch({
            type: GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension:
                data?.stpMobileContactNumber && data?.stpMobileContactPrefix
                    ? 0 + data?.stpMobileContactPrefix * 1 + data?.stpMobileContactNumber
                    : data?.stpMobileContactNumber && 0 + maskMobile(data?.stpMobileContactNumber),
        });
        personDetailsList.push({
            displayKey: PLSTP_MOBILE_NUM,
            displayValue:
                data?.stpMobileContactNumber && data?.stpMobileContactPrefix
                    ? 0 +
                      maskMobile(data?.stpMobileContactPrefix * 1 + data?.stpMobileContactNumber)
                    : data?.stpMobileContactNumber && 0 + maskMobile(data?.stpMobileContactNumber),
        });
    }

    if (data?.stpEmail) {
        dispatch({ type: GUARANTOR_EMAIL_MASK_ACTION, isEmailMaskingOn: true });
        dispatch({ type: GUARANTOR_EMAIL_ADDRESS_ACTION, emailAddress: data?.stpEmail });
        if (data?.stpEmail) {
            personDetailsList.push({
                displayKey: EMAIL_LBL,
                displayValue: maskEmail(data?.stpEmail?.replace(/\r\n/, "")),
            });
        }
    }

    if (data?.stpHomeCountry && country) {
        let countryObject;
        filterDropdownListByCode(data?.stpHomeCountry, country, (index, value) => {
            countryObject = value;
            dispatch({
                type: GUARANTOR_COUNTRY_ACTION,
                countryIndex: index,
                countryValue: value,
            });
        });
        dispatch({ type: GUARANTOR_IS_STATE_ENABLED_ACTION, isStateDropdownEnabled: true });
        personDetailsList.push({
            displayKey: COUNTRY_LBL,
            displayValue: capitalizeFirst(countryObject?.name),
        });
    }

    if (data?.stpHomeAddress1) {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOn: true,
        });

        dispatch({
            type: GUARANTOR_ADDRESS_LINE_ONE_ACTION,
            addressLineOne: data?.stpHomeAddress1,
        });
        personDetailsList.push({
            displayKey: ASB_ADDRESS_LINE_ONE,
            displayValue: maskAddress(data?.stpHomeAddress1),
        });
    }

    if (data?.stpHomeAddress2) {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOn: true,
        });
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_TWO_ACTION,
            addressLineTwo: data?.stpHomeAddress2,
        });
        personDetailsList.push({
            displayKey: ASB_ADDRESS_LINE_TWO,
            displayValue: maskAddress(data?.stpHomeAddress2),
        });
    }

    if (data?.stpHomeAddress3) {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION,
            isAddressLineThreeMaskingOn: true,
        });
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_THREE_ACTION,
            addressLineThree: data?.stpHomeAddress3,
        });
        personDetailsList.push({
            displayKey: ADDRESS_LINE_THREE,
            displayValue: maskAddress(data?.stpHomeAddress3),
        });
    }

    if (data?.stpHomePostcode) {
        dispatch({ type: GUARANTOR_POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: true });
        dispatch({ type: GUARANTOR_POSTAL_CODE_ACTION, postalCode: data?.stpHomePostcode });

        personDetailsList.push({
            displayKey: STEPUP_MAE_ADDRESS_POSTAL,
            displayValue: data?.stpHomePostcode,
        });
    }

    if (data?.stpHomeStateDesc && data?.stpHomeCountry) {
        const releventState = masterData?.allState.find(
            ({ value }) => value === data?.stpHomeCountry
        );

        const stateListData = JSON.stringify(releventState.name);
        const stateListDataArray = stateListData.split('"');
        const finalStateList = stateListDataArray[1]?.split(",");
        const stateList = [];
        const len = finalStateList?.length;
        for (let i = 0; i < len; i++) {
            stateList.push({
                name: finalStateList[i],
                value: finalStateList[i],
            });
        }
        filterDropdownList(data?.stpHomeStateDesc, stateList, (index, value) => {
            dispatch({ type: GUARANTOR_STATE_ACTION, stateIndex: index, stateValue: value });
        });
        personDetailsList.push({
            displayKey: STEPUP_MAE_ADDRESS_STATE,
            displayValue: data?.stpHomeStateDesc,
        });
    }

    if (data?.stpHomeCity) {
        dispatch({ type: GUARANTOR_CITY_MASK_ACTION, isCityMaskingOn: true });
        dispatch({ type: GUARANTOR_CITY_ACTION, city: data?.stpHomeCity });

        personDetailsList.push({
            displayKey: STEPUP_MAE_ADDRESS_CITY,
            displayValue: maskAddress(data?.stpHomeCity),
        });
    }

    if (data?.stpDeclarePdpa) {
        dispatch({ type: GUARANTOR_DECLARATION, isAcceptedDeclaration: data?.stpDeclarePdpa });
    }

    if (data?.stpDeclareTc) {
        dispatch({
            type: GUARANTOR_DECLARATION_AGREE_TO_EXCUTE,
            isAgreeToExecute: data?.stpDeclareTc,
        });
    }

    dispatch({ type: ASB_UPDATE_PERSONAL_DETAILS, personDetailsList });
};

const prefillEmployeDetails = (data, masterData, dispatch, country) => {
    const employmentDetailList = [];

    if (data?.stpOccupationCode && masterData?.occupation) {
        filterDropdownListByCode(
            data?.stpOccupationCode,
            masterData?.occupation,
            (index, value) => {
                dispatch({
                    type: GUARANTOR_OCCUPATION_ACTION,
                    occupationIndex: index,
                    occupationValue: value,
                });
            }
        );
        employmentDetailList.push({
            displayKey: STEPUP_MAE_OCUPATION,
            displayValue: data?.stpOccupationDesc,
        });
    }

    if (masterData?.occupationSectorlowestleafflag && masterData?.occupationSector) {
        const occupationSectorData = getCombinedData(
            masterData?.occupationSectorlowestleafflag,
            masterData?.occupationSector
        );
        const sector = occupationSectorData ?? masterData?.occupationSector;

        if (data?.stpOccupationSectorCode && sector) {
            filterDropdownListByCode(data?.stpOccupationSectorCode, sector, (index, value) => {
                dispatch({ type: GUARANTOR_SECTOR_ACTION, sectorIndex: index, sectorValue: value });
            });
            employmentDetailList.push({
                displayKey: STEPUP_MAE_SECTOR,
                displayValue: data?.stpOccupationSectorDesc,
            });
        }
    }

    if (data?.stpEmployerName) {
        dispatch({
            type: GUARANTOR_EMPLOYER_NAME_ACTION,
            employerName: data?.stpEmployerName,
        });

        employmentDetailList.push({
            displayKey: ASB_EMPLOYER_NAME,
            displayValue: data?.stpEmployerName,
        });
    }

    if (data?.stpEmploymentTypeDesc && masterData?.employmentType) {
        filterDropdownList(
            data?.stpEmploymentTypeDesc,
            masterData?.employmentType,
            (index, value) => {
                dispatch({
                    type: GUARANTOR_EMPLOYMENT_TYPE_ACTION,
                    employmentTypeIndex: index,
                    employmentTypeValue: value,
                });
            }
        );

        employmentDetailList.push({
            displayKey: ASB_EMPLOYMENT_TYPE,
            displayValue: data?.stpEmploymentTypeDesc,
        });
    }

    if (data?.stpEmployerCountry && country) {
        let countryObject;
        filterDropdownListByCode(data?.stpEmployerCountry, country, (index, value) => {
            countryObject = value;
            dispatch({
                type: GUARANTOR_EMPLOYMENT_COUNTRY_ACTION,
                countryIndexEmployment: index,
                countryValueEmployment: value,
            });
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION,
            isStateDropdownEnabledEmployment: true,
        });
        employmentDetailList.push({
            displayKey: COUNTRY_LBL,
            displayValue: capitalizeFirst(countryObject?.name),
        });
    }

    if (data?.stpEmployerAddress1) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOnEmployment: true,
        });

        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
            addressLineOneEmployment: data?.stpEmployerAddress1,
        });
        employmentDetailList.push({
            displayKey: OFFICE_ADDR1,
            displayValue: maskAddress(data?.stpEmployerAddress1),
        });
    }

    if (data?.stpEmployerAddress2) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOnEmployment: true,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
            addressLineTwoEmployment: data?.stpEmployerAddress2,
        });
        employmentDetailList.push({
            displayKey: OFFICE_ADDR2,
            displayValue: maskAddress(data?.stpEmployerAddress2),
        });
    }

    if (data?.stpEmployerAddress3) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
            isAddressLineThreeMaskingOnEmployment: true,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
            addressLineThreeEmployment: data?.stpEmployerAddress3,
        });
        employmentDetailList.push({
            displayKey: OFFICE_ADDR3,
            displayValue: maskAddress(data?.stpEmployerAddress3),
        });
    }

    if (data?.stpEmployerPostcode) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
            isPostalCodeMaskingOnEmployment: true,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION,
            postalCodeEmployment: data?.stpEmployerPostcode,
        });

        employmentDetailList.push({
            displayKey: STEPUP_MAE_ADDRESS_POSTAL,
            displayValue: data?.stpEmployerPostcode,
        });
    }

    if (data?.stpEmployerStateDesc && data?.stpEmployerCountry) {
        const releventState = masterData?.allState.find(
            ({ value }) => value === data?.stpEmployerCountry
        );

        const stateListData = JSON.stringify(releventState.name);
        const stateListDataArray = stateListData.split('"');
        const finalStateList = stateListDataArray[1]?.split(",");
        const stateList = [];
        const len = finalStateList?.length;
        for (let i = 0; i < len; i++) {
            stateList.push({
                name: finalStateList[i],
                value: finalStateList[i],
            });
        }
        filterDropdownList(data?.stpEmployerStateDesc, stateList, (index, value) => {
            dispatch({
                type: GUARANTOR_EMPLOYMENT_STATE_ACTION,
                stateIndexEmployment: index,
                stateValueEmployment: value,
            });
        });
        employmentDetailList.push({
            displayKey: STEPUP_MAE_ADDRESS_STATE,
            displayValue: data?.stpEmployerStateDesc,
        });
    }

    if (data?.stpEmployerCity) {
        dispatch({ type: GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION, isCityMaskingOnEmployment: true });
        dispatch({ type: GUARANTOR_EMPLOYMENT_CITY_ACTION, cityEmployment: data?.stpEmployerCity });

        employmentDetailList.push({
            displayKey: STEPUP_MAE_ADDRESS_CITY,
            displayValue: maskAddress(data?.stpEmployerCity),
        });
    }

    if (data?.stpEmployerContactNumber) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
            isMobileNumberMaskingOnEmployment: true,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtensionEmployment:
                data?.stpEmployerContactNumber && data?.stpEmployerContactPrefix
                    ? 0 + data?.stpEmployerContactPrefix * 1 + data?.stpEmployerContactNumber
                    : data?.stpEmployerContactNumber &&
                      0 + maskMobile(data?.stpEmployerContactNumber),
        });
        employmentDetailList.push({
            displayKey: OFFICE_PHNO,
            displayValue:
                data?.stpEmployerContactNumber && data?.stpEmployerContactPrefix
                    ? 0 +
                      maskMobile(
                          data?.stpEmployerContactPrefix * 1 + data?.stpEmployerContactNumber
                      )
                    : data?.stpEmployerContactNumber &&
                      0 + maskMobile(data?.stpEmployerContactNumber),
        });
    }

    dispatch({ type: ASB_UPDATE_EMPLOYMENT_DETAILS, employmentDetailList });
};

export const prefillIncomeDetailsDetails = (data, masterData, dispatch) => {
    if (data?.stpGrossIncome) {
        dispatch({
            type: GUARANTOR_MONTHLY_GROSS_INCOME,
            monthlyGrossInformation: data?.stpGrossIncome,
        });
    }

    if (data?.stpOtherCommitments) {
        dispatch({
            type: GUARANTOR_TOTAL_MONTHLY_NON_BANK_COMMITMENTS,
            totalMonthlyNonBNankingCommitments: data?.stpOtherCommitments,
        });
    }

    if (data?.stpSourceOfIncome && masterData?.sourceOfFundOrigin) {
        filterDropdownListByCode(
            data?.stpSourceOfIncome,
            masterData?.sourceOfFundOrigin,
            (index, value) => {
                dispatch({
                    type: GUARANTOR_PRMIMARY_INCOME_ACTION,
                    primaryIncomeIndex: index,
                    primaryIncome: value,
                });
            }
        );
    }

    if (data?.stpSourceOfWealth && masterData?.sourceOfWealthOrigin) {
        filterDropdownListByCode(
            data?.stpSourceOfWealth,
            masterData?.sourceOfWealthOrigin,
            (index, value) => {
                dispatch({
                    type: GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_ACTION,
                    primarySourceOfWealthIndex: index,
                    primarySourceOfWealth: value,
                });
            }
        );
    }
};

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getCombinedData = (data, result) => {
    const leafItem = result.map((item) => {
        return { ...item, leafFlag: 1 };
    });

    const leafItem1 = data.map((item) => {
        return { ...item, leafFlag: 0 };
    });

    const combinedData = [...leafItem, ...leafItem1];

    combinedData?.sort((a, b) => a.name.localeCompare(b.name));

    return combinedData;
};

const getUpdatedCountry = (data) => {
    const malaysiaItem = data?.find((item) => {
        const { name } = item;
        if (name.toLowerCase() === "malaysia") {
            return item;
        }
    });

    let country = data?.filter((item) => item.name.toLowerCase() !== "malaysia");
    country = [malaysiaItem, ...country];
    return country;
};
