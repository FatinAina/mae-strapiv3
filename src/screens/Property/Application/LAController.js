/**
 * Loan Application Controller
 *
 * Methods used for processing data in Loan Application flow to be added here.
 */
import moment from "moment";

import {
    LA_ELIGIBILITY_CONFIRM,
    LA_UNIT_NUMBER,
    LA_UNIT_OWNER_CONFIRMATION,
    LA_CUST_ADDRESS,
    LA_EMP_DETAILS,
    LA_EMP_ADDRESS,
    LA_FINANCING_TYPE,
    LA_PRODUCT_PLANS,
    LA_ADDITIONAL,
    LA_TNC,
    LA_CONFIRMATION,
    LA_UNIT_CONFIRMATION,
} from "@navigation/navigationConstant";

import {
    saveInputData,
    saveResultData,
    eligibilityResultStatus,
    loanSubmission,
    getApplicationDetails,
    getJointApplicationDetails,
    getProfileInfoDetails,
    getPropertyPrice,
    getUnlinkedMainApplicant,
    removeJointApplicant,
} from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { FADED_GRAY, STATUS_GREEN } from "@constants/colors";
import { DT_ELG, DT_NOTELG, DT_RECOM, PROP_LA_INPUT, PROP_LA_RESULT } from "@constants/data";
import {
    COMMON_ERROR_MSG,
    EMPLOYER_NAME_SPACES,
    EMPLOYER_NAME_SPL_CHAR,
    EMP_NAME_VALIDATION,
    VAL_UNIT_NO_MUST_NUM_ALPHA_ERR_MSG,
    VAL_UNIT_MUST_1CHAR,
    DD_MMM_YYYY,
} from "@constants/strings";

import { leadingOrDoubleSpaceRegex, employerNameAllowSomeSpclCharRegex } from "@utils/dataModel";

import { getEncValue } from "../Common/PropertyController";
import { isAgeEligible } from "../Eligibility/CEController";

function validateUnitNumber(value) {
    console.log("[LAController] >> [validateUnitNumber]");

    // Only Spaces OR Min length checking
    if (value.trim().length === 0 || value.length < 1) {
        return {
            isValid: false,
            message: VAL_UNIT_MUST_1CHAR,
        };
    }

    // Alphanumeric inclusion checking
    if (!isTextContainsAlphanumeric(value)) {
        return {
            isValid: false,
            message: VAL_UNIT_NO_MUST_NUM_ALPHA_ERR_MSG,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

function isTextContainsAlphanumeric(text) {
    const regex = /[a-zA-Z0-9]/;
    return regex.test(String(text).toLowerCase());
}

async function saveLAInput(paramsObj, showPreloader = true) {
    console.log("[LAController] >> [saveLAInput]");

    // Construct request object based on current screen
    const params = await getLAInputRequest(paramsObj);

    // Call API to Save Input Data
    const httpResp = await saveInputData(params, showPreloader).catch((error) => {
        console.log("[LAController][saveInputData] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
    };
}

async function getLAInputRequest({ screenName, formData, navParams }) {
    console.log("[LAController] >> [getLAInputRequest]");

    const screenWiseParams = {};
    const screenNameNumObj = getLANameNumObj();
    const screenNumber = screenNameNumObj[screenName];

    // Eligibility Flow Params
    const eligibilityParams = await getEligibilityFlowParams(navParams);

    for (const sName in screenNameNumObj) {
        const currentNumber = screenNameNumObj[sName];
        const paramsArray = getLAScreenParams(sName);

        paramsArray.forEach((item) => {
            if (currentNumber === screenNumber) screenWiseParams[item] = formData?.[item] ?? "";

            if (currentNumber < screenNumber) screenWiseParams[item] = navParams?.[item] ?? "";

            if (currentNumber > screenNumber) screenWiseParams[item] = "";
        });
    }

    // Return combined object
    return {
        ...screenWiseParams,
        ...eligibilityParams,
        progressStatus: PROP_LA_INPUT,
    };
}
//Application Details

function adMassageEligibilityResult(result) {
    console.log("[LAController] >> [massageEligibilityResult]");

    // For invalid response
    if (!(result instanceof Array)) return null;

    // For Eligible/NotEligible scenario
    if (
        result.length === 1 &&
        (result[0]?.dataType === DT_ELG || result[0]?.dataType === DT_NOTELG)
    ) {
        return result[0];
    }

    // For Recommendation scenario
    let resultObj;
    result.some((item) => {
        const dataType = item?.dataType;
        if (dataType === DT_RECOM) {
            resultObj = item;
            return true;
        }

        return false;
    });

    return resultObj;
}

async function getFormData(navParams, mdmData) {
    // const mdmData = await getMDMData(true);
    const encSyncId = await getEncValue(navParams?.syncId ?? "");
    return {
        gender: mdmData?.gender,
        idType: mdmData?.idType,
        mobileNoCtryCd: "+6",
        nationality: mdmData?.citizenship,
        residentStatus: mdmData?.residentStatus,
        maritalStatus: navParams?.savedData?.maritalStatus,
        religion: navParams?.savedData?.religion,
        address: [
            {
                addressType: mdmData?.addressType,
                addressLine1: mdmData?.addr1,
                addressLine2: mdmData?.addr2,
                addressLine3: mdmData?.addr3,
                addressLine4: "",
                postCode: mdmData?.postCode,
                countryCode: mdmData?.country,
                state: mdmData?.state,
                email: "",
            },
        ],
        additionalIncome: [
            {
                additionalIncomeSource: "",
                additionalAmount: "",
            },
        ],
        grossIncome: navParams?.savedData?.grossIncomeRaw,
        spouseGrossIncome: navParams?.savedData?.spouseIncomeRaw,
        nonBankCommitment: navParams?.savedData?.nonBankCommitmentsRaw,
        education: navParams?.savedData?.education,
        employmentType: navParams?.savedData?.employmentStatus,
        occupation: mdmData?.occupation,
        occupationSector: mdmData?.occupationSector,
        nameOfEmployer: mdmData?.employerName,
        businessType: navParams?.savedData?.businessType,
        publicSectorNameFinance: null,
        title: navParams?.savedData?.title,
        downpayment: navParams?.savedData?.downPaymentAmount,
        loanFinancingAmountRM: navParams?.savedData?.origLoanAmount,
        loanTenure: navParams?.savedData?.origTenure,
        propertyId: navParams?.propertyDetails?.property_id,
        unitId: navParams?.savedData?.unitId,
        customerSegment: mdmData?.customerSegment,
        customerGroup: navParams?.savedData?.residentStatus,
        ocrisStpRefNo: navParams?.savedData?.stpApplicationId ?? "",
        syncId: encSyncId,
        isNonListed: navParams?.savedData?.isPropertyListed === "Y" ? "N" : "Y",

        // Below fields are added on 13/08/2021
        propertyPurchase: navParams?.savedData?.propertyPurchase,
        ongoingLoan: navParams?.savedData?.ongoingLoan,
        totalHouseCount: navParams?.savedData?.houseLoan ?? "",
        ccrisLoanCount: navParams?.savedData?.ccrisLoanCount ?? "",
        isCcrisReportAvailable: navParams?.savedData?.ccrisReportFlag ? "Y" : "N",
        bankCommitment: {
            housingLoan: navParams?.savedData?.housingLoan,
            personalLoanOrOtherTermLoan: navParams?.savedData?.personalLoanRaw,
            creditCardRepayment: navParams?.savedData?.ccRepaymentsRaw,
            carLoan: navParams?.savedData?.carLoanRaw,
            overdraft: navParams?.savedData?.overdraft,
        },
    };
}

async function getEligiblityCEResultNavParams(navParams, propertyName) {
    const propertyDetails = navParams?.propertyDetails ?? {};
    const latitude = navParams?.latitude ?? "";
    const longitude = navParams?.longitude ?? "";
    const savedData = navParams?.savedData ?? {};
    const { age } = isAgeEligible(savedData?.dob);

    return {
        ...savedData,

        // Common
        latitude,
        longitude,
        propertyDetails,
        age,
        syncId: navParams?.syncId,

        // Property Data
        propertyId: propertyDetails?.property_id ?? "",
        propertyName,

        // Input Data
        propertyPrice: savedData?.propertyPriceRaw,
        downPaymentAmount: savedData?.downPaymentAmountRaw,
        loanAmount: savedData?.loanAmountRaw,
        tenure: savedData?.tenure,
        spouseIncome: savedData?.spouseIncomeRaw,
        grossIncome: savedData?.grossIncomeRaw,
        housingLoan: savedData?.housingLoan,
        personalLoan: savedData?.personalLoanRaw,
        ccRepayments: savedData?.ccRepaymentsRaw,
        carLoan: savedData?.carLoanRaw,
        overdraft: savedData?.overdraft,
        nonBankCommitments: savedData?.nonBankCommitmentsRaw,

        aipAmount: savedData?.loanAmountRaw,
        recommendedDownpayment: savedData?.recommendedDownpaymentRaw,
        installmentAmount: savedData?.monthlyInstalmentRaw,
        monthlyInstalment: savedData?.monthlyInstalmentRaw,
        stpApplicationId: savedData?.stpApplicationId,
    };
}

async function getEligibilityFlowParams(navParams) {
    const encSyncId = await getEncValue(navParams?.syncId ?? "");

    return {
        // MDM Data
        customerName: navParams?.customerName,

        // Property Data
        propertyId: navParams?.propertyDetails?.property_id ?? "",
        propertyName: navParams?.propertyName,

        // Input Data
        staffPfNo: navParams?.staffPfNo,
        staffName: navParams?.staffName,
        unitId: navParams?.unitId,
        unitTypeName: navParams?.unitTypeName,
        propertyAddress1: navParams?.propertyAddress1,
        propertyAddress2: navParams?.propertyAddress2,
        propertyAddress3: navParams?.propertyAddress3,
        propertyPostcode: navParams?.propertyPostcode,
        propertyState: navParams?.propertyState,
        propertyPrice: navParams?.propertyPrice,
        downPaymentAmount: navParams?.downPaymentAmount,
        downPaymentPercent: navParams?.downPaymentPercent,
        loanAmount: navParams?.loanAmount,
        tenure: navParams?.tenure,
        title: navParams?.title,
        residentStatus: navParams?.residentStatus,
        education: navParams?.education,
        maritalStatus: navParams?.maritalStatus,
        religion: navParams?.religion,
        spouseIncome: navParams?.spouseIncome,
        employmentStatus: navParams?.employmentStatus,
        businessType: navParams?.businessType,
        occupation: navParams?.occupation,
        grossIncome: navParams?.grossIncome,
        houseLoan: navParams?.houseLoan,
        housingLoan: navParams?.housingLoan,
        personalLoan: navParams?.personalLoan,
        ccRepayments: navParams?.ccRepayments,
        carLoan: navParams?.carLoan,
        overdraft: navParams?.overdraft,
        nonBankCommitments: navParams?.nonBankCommitments,
        ccrisLoanCount: navParams?.ccrisLoanCount,
        propertyPurchase: navParams?.propertyPurchase,
        ongoingLoan: navParams?.ongoingLoan,

        // Common
        syncId: encSyncId,
        screenNo: navParams?.screenNo,
        saveData: "Y",
        isPropertyListed: navParams?.isPropertyListed,

        // Result Data
        dataType: navParams?.dataType,
        interestRate: navParams?.interestRate,
        spreadRate: navParams?.spreadRate,
        baseRate: navParams?.baseRate,
        monthlyInstalment: navParams?.monthlyInstalment,
        recommendedTenure: navParams?.recommendedTenure,
        recommendedDownpayment: navParams?.recommendedDownpayment,
        salesRepRequest: navParams?.salesRepRequest,
        stpApplicationId: navParams?.stpApplicationId,
        eligibilityStatus: navParams?.eligibilityStatus,
        minTenure: navParams?.minTenure,
        maxTenure: navParams?.maxTenure,
    };
}

function getLAScreenParams(screenName) {
    switch (screenName) {
        case LA_ELIGIBILITY_CONFIRM:
            return [];
        case LA_UNIT_NUMBER:
            return ["unitNo"];
        case LA_UNIT_OWNER_CONFIRMATION:
            return ["isUnitOwner"];
        case LA_UNIT_CONFIRMATION:
            return ["isJaUnitOwner", "propertyOwner"];
        case LA_CUST_ADDRESS:
            return [
                "correspondenseAddr1",
                "correspondenseAddr2",
                "correspondenseAddr3",
                "correspondenseCity",
                "correspondensePostCode",
                "correspondenseState",
                "correspondenseCountry",
                "isMailingAddr",
                "mailingAddr1",
                "mailingAddr2",
                "mailingAddr3",
                "mailingCity",
                "mailingPostCode",
                "mailingState",
                "mailingCountry",
            ];
        case LA_EMP_DETAILS:
            return ["employerName", "occupationSector", "empYears", "empMonths"];
        case LA_EMP_ADDRESS:
            return [
                "employerAddr1",
                "employerAddr2",
                "employerAddr3",
                "employerCity",
                "employerPostCode",
                "employerState",
                "employerCountry",
                "employerPhoneNo",
            ];
        case LA_FINANCING_TYPE:
            return ["financingType", "financingTypeTitle"];
        case LA_PRODUCT_PLANS:
            return ["financingPlan", "financingPlanTitle"];
        case LA_ADDITIONAL:
            return ["primaryIncome", "primarySourceOfIncome"];
        case LA_TNC:
            return [
                "radioPDSChecked",
                "radioDeclarationChecked",
                "radioFATCA1Checked",
                "radioFATCA2Checked",
                "radioPNChecked",
                "radioPNYesChecked",
                "radioAcceptProductChecked",
            ];
        case LA_CONFIRMATION:
            return [];
        default:
            return [];
    }
}

function getLANameNumObj() {
    console.log("[LAController] >> [getLANameNumObj]");

    const screenNameArray = [
        LA_ELIGIBILITY_CONFIRM,
        LA_UNIT_NUMBER,
        LA_UNIT_CONFIRMATION,
        LA_UNIT_OWNER_CONFIRMATION,
        LA_CUST_ADDRESS,
        LA_EMP_DETAILS,
        LA_EMP_ADDRESS,
        LA_FINANCING_TYPE,
        LA_PRODUCT_PLANS,
        LA_ADDITIONAL,
        LA_TNC,
        LA_CONFIRMATION,
    ];

    const mappingObj = {};

    screenNameArray.forEach((item, index) => {
        mappingObj[item] = index + 1;
    });

    return mappingObj;
}

async function saveLAResult(paramsObj) {
    console.log("[LAController] >> [saveLAResult]");

    // Construct request object
    const params = await getLAResultRequest(paramsObj);

    // Call API to Save Result Data
    const httpResp = await saveResultData(params, false).catch((error) => {
        console.log("[LAController][saveResultData] >> Exception: ", error);
    });
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
    };
}

async function getLAResultRequest(params) {
    console.log("[LAController] >> [getLAResultRequest]");

    // Eligibility Flow Params
    const eligibilityParams = await getEligibilityFlowParams(params);

    // Loan Application Flow Params
    const laParams = getLAFlowParams(params);

    // Return combined object
    return {
        ...eligibilityParams,
        ...laParams,
        progressStatus: PROP_LA_RESULT,
    };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function getLAFlowParams(navParams) {
    return {
        // Input Data
        unitNo: navParams?.unitNo,

        isUnitOwner: navParams?.isUnitOwner,

        correspondenseAddr1: navParams?.correspondenseAddr1,
        correspondenseAddr2: navParams?.correspondenseAddr2,
        correspondenseAddr3: navParams?.correspondenseAddr3,
        correspondenseCity: navParams?.correspondenseCity,
        correspondensePostCode: navParams?.correspondensePostCode,
        correspondenseState: navParams?.correspondenseState,
        correspondenseCountry: navParams?.correspondenseCountry,
        isMailingAddr: navParams?.isMailingAddr,
        mailingAddr1: navParams?.mailingAddr1,
        mailingAddr2: navParams?.mailingAddr2,
        mailingAddr3: navParams?.mailingAddr3,
        mailingCity: navParams?.mailingCity,
        mailingPostCode: navParams?.mailingPostCode,
        mailingState: navParams?.mailingState,

        occupation: navParams?.occupation,
        employerName: navParams?.employerName,
        occupationSector: navParams?.occupationSector,
        empYears: navParams?.empYears,
        empMonths: navParams?.empMonths,

        employerAddr1: navParams?.employerAddr1,
        employerAddr2: navParams?.employerAddr2,
        employerAddr3: navParams?.employerAddr3,
        employerCity: navParams?.employerCity,
        employerPostCode: navParams?.employerPostCode,
        employerState: navParams?.employerState,
        employerCountry: navParams?.employerCountry,
        employerPhoneNo: navParams?.employerPhoneNo,

        financingType: navParams?.financingType,
        financingTypeTitle: navParams?.financingTypeTitle,

        financingPlan: navParams?.financingPlan,
        financingPlanTitle: navParams?.financingPlanTitle,

        primaryIncome: navParams?.primaryIncome,
        primarySourceOfIncome: navParams?.primarySourceOfIncome,

        radioPDSChecked: navParams?.radioPDSChecked,
        radioDeclarationChecked: navParams?.radioDeclarationChecked,
        radioFATCA1Checked: navParams?.radioFATCA1Checked,
        radioFATCA2Checked: navParams?.radioFATCA2Checked,
        radioPNChecked: navParams?.radioPNChecked,
        radioPNYesChecked: navParams?.radioPNYesChecked,
        radioAcceptProductChecked: navParams?.radioAcceptProductChecked,
    };
}

function validateEmpName(value) {
    console.log("[LAController] >> [validateEmpName]");

    // Min length check
    if (value.length < 5) {
        return {
            isValid: false,
            message: EMP_NAME_VALIDATION,
        };
    }

    // Check for leading or double spaces
    if (!leadingOrDoubleSpaceRegex(value)) {
        return {
            isValid: false,
            message: EMPLOYER_NAME_SPACES,
        };
    }

    // Employer Name Special Char check
    if (employerNameAllowSomeSpclCharRegex(value)) {
        return {
            isValid: false,
            message: EMPLOYER_NAME_SPL_CHAR,
        };
    }

    // Return true if no validation error
    return {
        isValid: true,
    };
}

async function prequalCheckAPI(syncId = "", isJointApplicantAdded = false) {
    console.log("[LAController] >> [prequalCheckAPI]");

    // Request object
    const params = {
        syncId: String(syncId),
        isJointApplicantAdded,
    };

    const response = await eligibilityResultStatus(params).catch((error) => {
        console.log("[LAController][eligibilityResultStatus] >>Exception: ", error);
    });
    const status = response?.data?.result?.status ?? null;
    const isSameDay = response?.data?.result?.isSameDay ?? null;
    const onboardingInd = response?.data?.result?.onboardingInd ?? null;

    // return status === "GREEN" && isSameDay === "Y";
    return { status, isSameDay, onboardingInd };
}

async function fetchApplicationDetails(params, showPreloader = true) {
    // API call to fetch application details
    const httpResp = await getApplicationDetails(params, showPreloader).catch((error) => {
        console.log("[LAController][getApplicationDetails] >> Exception: ", error);
    });
    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
    const propertyDetails = result?.propertyDetails ?? null;
    const savedData = result?.savedData ?? null;
    const cancelReason = result?.cancelReason ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        propertyDetails,
        savedData,
        cancelReason,
    };
}

async function fetchJointApplicationDetails(params, showPreloader = true) {
    // API call to fetch application details
    const httpResp = await getJointApplicationDetails(params, showPreloader).catch((error) => {
        console.log("[LAController][eligibilityResultStatus] >> Exception: ", error);
    });
    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
    const propertyDetails = result?.propertyDetails ?? null;
    const savedData = result?.savedData ?? null;
    const cancelReason = result?.cancelReason ?? null;
    const jointApplicantDetails = result?.jointApplicantDetails ?? null;
    console.log(result, "JADetails");
    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        propertyDetails,
        savedData,
        cancelReason,
        jointApplicantDetails,
    };
}

async function fetchGetApplicants(params, showPreloader = true) {
    // API call to fetch main and joint applicant details

    const httpResp = await getProfileInfoDetails(params, showPreloader).catch((error) => {
        console.log("[LAController][getProfileInfoDetails] >> Exception: ", error);
    });

    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
    const mainApplicantDetails = result?.mainApplicant ?? null;
    const jointApplicantDetails = result?.jointApplicant ?? null;
    const currentUser = result?.currentUser ?? null;
    const syncId = result?.syncId ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        mainApplicantDetails,
        jointApplicantDetails,
        currentUser,
        syncId,
    };
}

async function fetchPropertyPrice(params, showPreloader = true) {
    // API call to fetch main and joint applicant details

    const httpResp = await getPropertyPrice(params, showPreloader).catch((error) => {
        console.log("[LAController][ChatGetPropertyPrice] >> Exception: ", error);
    });
    console.log("[LAController][ChatGetPropertyPrice] >> : ", httpResp);
    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;
    const syncId = httpResp?.data?.result?.syncId ?? null;
    const propertyPrice = httpResp?.data?.result?.propertyPrice ?? null;
    const mainCustomerName = httpResp?.data?.result?.mainCustomerName ?? null;
    const jointCustomerName = httpResp?.data?.result?.jointCustomerName ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        syncId,
        propertyPrice,
        mainCustomerName,
        jointCustomerName,
    };
}

async function loanSubmissionRequest(paramsObj, showPreloader = true) {
    console.log("[LAController] >> [loanSubmissionRequest]");

    const httpResp = await loanSubmission(paramsObj, showPreloader).catch((error) => {
        console.log("[LAController][loanSubmission] >> Exception: ", error);
    });

    const statusCode = httpResp?.data?.result?.statusCode ?? null;
    const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
    const stpId = httpResp?.data?.result?.stpId ?? null;
    const overallStatus = httpResp?.data?.result?.overallStatus ?? null;
    const eligibilityResult = httpResp?.data?.result?.eligibilityResult ?? null;
    const baseRateLabel = httpResp?.data?.result?.baseRateLabel ?? null;
    const massagedResult = massageEligibilityResult(eligibilityResult);

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        stpId,
        eligibilityResult: massagedResult,
        overallStatus,
        baseRateLabel,
    };
}

function massageEligibilityResult(result) {
    console.log("[LAController] >> [massageEligibilityResult]");

    // For invalid response
    if (!(result instanceof Array)) return null;

    // For Eligible scenario
    if (result.length === 1 && result[0]?.dataType === "Eligible") return result[0];

    return result;
}

async function fetchUnlinkedMainApplicant(encSyncId, showPreloader = true) {
    const httpResp = await getUnlinkedMainApplicant(encSyncId, showPreloader).catch((error) => {
        console.log("[LAController][getUnlinkedMainApplicant] >> Exception: ", error);
    });

    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? null;
    const mainApplicantDetails = result?.mainApplicant ?? null;
    const currentUser = result?.currentUser ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
        mainApplicantDetails,
        currentUser,
    };
}

function getDates(stDate = "", updDate = "") {
    console.log("[LAController] >> [getDates]");

    const startDate = moment(stDate).format("DD MMM YYYY, h:mm a");
    const updatedDate = moment(updDate).format(DD_MMM_YYYY);

    return { startDate, updatedDate };
}

function getStatusDetails(isInActive) {
    console.log("[LAController] >> [getStatusDetails]");

    return {
        statusText: isInActive ? "Inactive" : "Active",
        statusColor: isInActive ? FADED_GRAY : STATUS_GREEN,
    };
}

async function removeYourJointApplicant(params, showPreloader = true) {
    const httpResp = await removeJointApplicant(params, showPreloader).catch((error) => {
        console.log("[LAController][removeYourJointApplicant] >> Exception: ", error);
    });

    const result = httpResp?.data?.result ?? {};
    const statusCode = result?.statusCode ?? null;
    const statusDesc = result?.statusDesc ?? null;

    return {
        success: statusCode === STATUS_CODE_SUCCESS,
        errorMessage: statusDesc,
    };
}

export {
    saveLAInput,
    saveLAResult,
    validateEmpName,
    prequalCheckAPI,
    loanSubmissionRequest,
    fetchApplicationDetails,
    fetchJointApplicationDetails,
    validateUnitNumber,
    isTextContainsAlphanumeric,
    fetchGetApplicants,
    fetchPropertyPrice,
    fetchUnlinkedMainApplicant,
    getDates,
    getStatusDetails,
    removeYourJointApplicant,
    getFormData,
    getEligiblityCEResultNavParams,
    adMassageEligibilityResult,
};
