import {
    ASB_GUARANTOR_PREPOSTQUAL_LOADING,
    ASB_GUARANTOR_PREPOSTQUAL_ERROR,
    ASB_GUARANTOR_PREPOSTQUAL_SUCCESS,
    ASB_GUARANTOR_PREPOSTQUAL_CLEAR,
    ASB_GUARANTOR_PREPOSTQUAL_ID_NO_UPDATE,
    ASB_UPDATE_PREPOSTQUAL_DETAILS,
    ASB_UPDATE_FINANCING_DETAILS,
    ASB_UPDATE_PERSONAL_DETAILS,
    ASB_UPDATE_EMPLOYMENT_DETAILS,
    ASB_PREPOSTQUAL_SCORE_PARTY_SUCCESS,
    ASB_PREPOSTQUAL_SCORE_PARTY_FAILURE,
    ASB_UPDATE_OVERALL_VALIDATION_DETAILS,
} from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    data: null,
    statusCode: null,
    statusDesc: null,
    pan: null,
    isStaff: null,
    addr1: null,
    addr2: null,
    addr3: null,
    addr4: null,
    birthDate: null,
    bodInd: null,
    branchApprovalStatusCode: null,
    city: null,
    custStatus: null,
    customerName: null,
    customerRiskRating: null,
    deChequeHostStatus: null,
    emailAddress: null,
    empType: null,
    empTypeValue: null,
    employerName: null,
    finanicalObjective: null,
    gcif: null,
    genderCode: null,
    genderValue: null,
    idNo: null,
    idType: null,
    localCifNo: null,
    m2uAccessNo: null,
    m2uIndicator: null,
    maeInd: null,
    mobileNo: null,
    monthlyIncomeRange: null,
    monthlyIncomeRangeValue: null,
    nationality: null,
    occupationCode: null,
    occupationValue: null,
    onBoardingStatusInfo: null,
    onboardingIndicatorCode: null,
    onlineRegUrl: null,
    pep: null,
    postCode: null,
    preferredBRDistrict: null,
    preferredBRState: null,
    preferredBranch: null,
    purpose: null,
    purposeValue: null,
    raceCode: null,
    raceValue: null,
    resumeStageInd: null,
    rsaIndicator: null,
    saDailyInd: null,
    saFormInvestmentExp: null,
    saFormInvestmentNature: null,
    saFormInvestmentRisk: null,
    saFormInvestmentTerm: null,
    saFormPIDM: null,
    saFormProductFeature: null,
    saFormSecurities: null,
    saFormSuitability: null,
    saTermInd: null,
    screeningStatus: null,
    sector: null,
    sectorValue: null,
    staffInd: null,
    state: null,
    stateValue: null,
    stateCode: null,
    universalCifNo: null,
    title: null,
    sourceOfFund: null,
    sourceOfFundValue: null,
    viewPartyResult: null,
    requestMsgRefNo: null,
    mainStpReferenceNo: null,

    country: null,
    countryCode: null,
    mobCountryCode: null,
    mobAreaCode: null,
    religionCode: null,
    religionValue: null,
    employmentTypeCode: null,
    employmentTypeValue: null,
    occupationSectorCode: null,
    occupationSectorValue: null,
    nameOfEmployer: null,
    salutationCode: null,
    salutationValue: null,
    dateOfBirth: null,
    addressType: null,
    grossIncome: null,
    stpReferenceNo: null,
    lastUpdatedDate: null,
    unitHolderId: null,
    idTypeCode: null,
    maritalStatus: null,
    mainApplicantName: null,
    mainApplicantIDNumber: null,

    stpApp: null,
    resumeData: null,
    loanInformation: null,
    eligibilityData: null,
    stpEligibilityResponse: null,
    stpScreenResume: null,
    stpAssessmentId: null,
    stpDeclarePdpa: null,
    financingDetailsList: [],
    personDetailsList: [],
    employmentDetailList: [],

    responseJsonString: null,
    customerRiskRatingCode: null,
    customerRiskRatingValue: null,
    manualRiskRatingCode: null,
    manualRiskRatingValue: null,
    assessmentId: null,
    scorePartyError: null,
    overallValidationResult: null,
    additionalDetails: null,
    resultAsbApplicationDetails: null,
};

// Reducer
function asbGuarantorPrePostQualReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_GUARANTOR_PREPOSTQUAL_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_GUARANTOR_PREPOSTQUAL_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_GUARANTOR_PREPOSTQUAL_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
                statusCode: action.statusCode,
                statusDesc: action.statusDesc,
                pan: action.pan,
                isStaff: action.isStaff,
                addr1: action.addr1,
                addr2: action.addr2,
                addr3: action.addr3,
                addr4: action.addr4,
                birthDate: action.birthDate,
                bodInd: action.bodInd,
                branchApprovalStatusCode: action.branchApprovalStatusCode,
                city: action.city,
                custStatus: action.custStatus,
                customerName: action.customerName,
                customerRiskRating: action.customerRiskRating,
                deChequeHostStatus: action.deChequeHostStatus,
                emailAddress: action.emailAddress,
                empType: action.empType,
                empTypeValue: action.empTypeValue,
                employerName: action.employerName,
                finanicalObjective: action.finanicalObjective,
                gcif: action.gcif,
                genderCode: action.genderCode,
                genderValue: action.genderValue,
                idNo: action.idNo,
                idType: action.idType,
                localCifNo: action.localCifNo,
                m2uAccessNo: action.m2uAccessNo,
                m2uIndicator: action.m2uIndicator,
                maeInd: action.maeInd,
                mobileNo: action.mobileNo,
                monthlyIncomeRange: action.monthlyIncomeRange,
                monthlyIncomeRangeValue: action.monthlyIncomeRangeValue,
                nationality: action.nationality,
                occupationCode: action.occupationCode,
                occupationValue: action.occupationValue,
                onBoardingStatusInfo: action.onBoardingStatusInfo,
                onboardingIndicatorCode: action.onboardingIndicatorCode,
                onlineRegUrl: action.onlineRegUrl,
                pep: action.pep,
                postCode: action.postCode,
                preferredBRDistrict: action.preferredBRDistrict,
                preferredBRState: action.preferredBRState,
                preferredBranch: action.preferredBranch,
                purpose: action.purpose,
                purposeValue: action.purposeValue,
                raceCode: action.raceCode,
                raceValue: action.raceValue,
                resumeStageInd: action.resumeStageInd,
                rsaIndicator: action.rsaIndicator,
                saDailyInd: action.saDailyInd,
                saFormInvestmentExp: action.saFormInvestmentExp,
                saFormInvestmentNature: action.saFormInvestmentNature,
                saFormInvestmentRisk: action.saFormInvestmentRisk,
                saFormInvestmentTerm: action.saFormInvestmentTerm,
                saFormPIDM: action.saFormPIDM,
                saFormProductFeature: action.saFormProductFeature,
                saFormSecurities: action.saFormSecurities,
                saFormSuitability: action.saFormSuitability,
                saTermInd: action.saTermInd,
                screeningStatus: action.screeningStatus,
                sector: action.sector,
                sectorValue: action.sectorValue,
                staffInd: action.staffInd,
                state: action.state,
                stateValue: action.stateValue,
                stateCode: action.stateCode,
                universalCifNo: action.universalCifNo,
                title: action.title,
                sourceOfFund: action.sourceOfFund,
                sourceOfFundValue: action.sourceOfFundValue,
                viewPartyResult: action.viewPartyResult,
                requestMsgRefNo: action.requestMsgRefNo,
                mainStpReferenceNo: action.mainStpReferenceNo,

                country: action.country,
                countryCode: action.countryCode,
                mobCountryCode: action.mobCountryCode,
                mobAreaCode: action.mobAreaCode,
                religionCode: action.religionCode,
                religionValue: action.religionValue,
                employmentTypeCode: action.employmentTypeCode,
                employmentTypeValue: action.employmentTypeValue,
                occupationSectorCode: action.occupationSectorCode,
                occupationSectorValue: action.occupationSectorValue,
                nameOfEmployer: action.nameOfEmployer,
                salutationCode: action.salutationCode,
                salutationValue: action.salutationValue,
                dateOfBirth: action.dateOfBirth,
                addressType: action.addressType,
                grossIncome: action.grossIncome,
                stpReferenceNo: action.stpreferenceNo,
                lastUpdatedDate: action.lastUpdatedDate,
                unitHolderId: action.unitHolderId,
                idTypeCode: action.idTypeCode,
                maritalStatus: action.maritalStatus,
                mainApplicantName: action.mainApplicantName,
                mainApplicantIDNumber: action.stpReferenceMAainApplicantNo,
            };

        case ASB_GUARANTOR_PREPOSTQUAL_ID_NO_UPDATE:
            return {
                ...state,
                idNo: action.idNo,
                mainApplicantName: action.mainApplicantName,
                mainApplicantIDNumber: action.stpReferenceMAainApplicantNo,
            };

        case ASB_UPDATE_PREPOSTQUAL_DETAILS:
            return {
                ...state,
                resultAsbApplicationDetails: action.resultAsbApplicationDetails,
                resumeData: action.resumeData,
                loanInformation: action?.loanInformation,
                eligibilityData: action?.eligibilityData,
                stpEligibilityResponse: action?.stpEligibilityResponse,
                stpScreenResume: action?.stpScreenResume,
                stpReferenceNo: action?.stpReferenceNo,
                stpAssessmentId: action?.stpAssessmentId,
                stpDeclarePdpa: action?.stpDeclarePdpa,
                idNo: action?.idNo,
                lastUpdatedDate: action?.lastUpdatedDate,
                eligibilityCheckOutcomeData: action?.eligibilityCheckOutcomeData,
                additionalDetails: action?.additionalDetails,
            };

        case ASB_UPDATE_FINANCING_DETAILS:
            return {
                ...state,
                financingDetailsList: action.financingDetailsList,
            };

        case ASB_UPDATE_PERSONAL_DETAILS:
            return {
                ...state,
                personDetailsList: action.personDetailsList,
            };

        case ASB_UPDATE_EMPLOYMENT_DETAILS:
            return {
                ...state,
                employmentDetailList: action.employmentDetailList,
            };

        case ASB_PREPOSTQUAL_SCORE_PARTY_SUCCESS:
            return {
                ...state,
                responseJsonString: action.responseJsonString,
                customerRiskRatingCode: action.customerRiskRatingCode,
                customerRiskRatingValue: action.customerRiskRatingValue,
                manualRiskRatingCode: action.manualRiskRatingCode,
                manualRiskRatingValue: action.manualRiskRatingValue,
                assessmentId: action.assessmentId,
            };

        case ASB_PREPOSTQUAL_SCORE_PARTY_FAILURE:
            return {
                ...state,
                scorePartyError: action.scorePartyError,
            };

        case ASB_UPDATE_OVERALL_VALIDATION_DETAILS:
            return {
                ...state,
                overallValidationResult: action.overallValidationResult,
            };

        case ASB_GUARANTOR_PREPOSTQUAL_CLEAR:
            return {
                ...state,
                status: STATUS_IDLE,
                data: null,
                statusCode: null,
                statusDesc: null,
                pan: null,
                isStaff: null,
                addr1: null,
                addr2: null,
                addr3: null,
                addr4: null,
                birthDate: null,
                bodInd: null,
                branchApprovalStatusCode: null,
                city: null,
                custStatus: null,
                customerName: null,
                customerRiskRating: null,
                deChequeHostStatus: null,
                emailAddress: null,
                empType: null,
                empTypeValue: null,
                employerName: null,
                finanicalObjective: null,
                gcif: null,
                genderCode: null,
                genderValue: null,
                idNo: null,
                idType: null,
                localCifNo: null,
                m2uAccessNo: null,
                m2uIndicator: null,
                maeInd: null,
                mobileNo: null,
                monthlyIncomeRange: null,
                monthlyIncomeRangeValue: null,
                nationality: null,
                occupationCode: null,
                occupationValue: null,
                onBoardingStatusInfo: null,
                onboardingIndicatorCode: null,
                onlineRegUrl: null,
                pep: null,
                postCode: null,
                preferredBRDistrict: null,
                preferredBRState: null,
                preferredBranch: null,
                purpose: null,
                purposeValue: null,
                raceCode: null,
                raceValue: null,
                resumeStageInd: null,
                rsaIndicator: null,
                saDailyInd: null,
                saFormInvestmentExp: null,
                saFormInvestmentNature: null,
                saFormInvestmentRisk: null,
                saFormInvestmentTerm: null,
                saFormPIDM: null,
                saFormProductFeature: null,
                saFormSecurities: null,
                saFormSuitability: null,
                saTermInd: null,
                screeningStatus: null,
                sector: null,
                sectorValue: null,
                staffInd: null,
                state: null,
                stateValue: null,
                stateCode: null,
                universalCifNo: null,
                title: null,
                sourceOfFund: null,
                sourceOfFundValue: null,
                viewPartyResult: null,
                requestMsgRefNo: null,
                mainStpReferenceNo: null,

                country: null,
                countryCode: null,
                mobCountryCode: null,
                mobAreaCode: null,
                religionCode: null,
                religionValue: null,
                employmentTypeCode: null,
                employmentTypeValue: null,
                occupationSectorCode: null,
                occupationSectorValue: null,
                nameOfEmployer: null,
                salutationCode: null,
                salutationValue: null,
                dateOfBirth: null,
                addressType: null,
                grossIncome: null,
                stpReferenceNo: null,
                lastUpdatedDate: null,
                unitHolderId: null,
                idTypeCode: null,
                maritalStatus: null,
                mainApplicantName: null,

                stpApp: null,
                resumeData: null,
                loanInformation: null,
                eligibilityData: null,
                stpEligibilityResponse: null,
                stpScreenResume: null,
                stpAssessmentId: null,
                stpDeclarePdpa: null,
                financingDetailsList: [],
                personDetailsList: [],
                employmentDetailList: [],
                responseJsonString: null,
                customerRiskRatingCode: null,
                customerRiskRatingValue: null,
                manualRiskRatingCode: null,
                manualRiskRatingValue: null,
                assessmentId: null,
                scorePartyError: null,
                overallValidationResult: null,
                additionalDetails: null,
                resultAsbApplicationDetails: null,
            };

        default:
            return state;
    }
}

export default asbGuarantorPrePostQualReducer;
