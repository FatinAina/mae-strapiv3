import {
    ASB_MASTERDATA_LOADING,
    ASB_MASTERDATA_ERROR,
    ASB_MASTERDATA_SUCCESS,
    ASB_MASTERDATA_CLEAR,
    MASTERDATA_UPDATE_COUNTRY,
} from "@redux/actions/ASBServices/masterDataAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    error: null,
    data: null,
    branchStateData: null,
    branchStatesList: null,
    branchDistrictsList: null,
    branchList: null,
    countryOfBirth: null,
    crsStatus: null,
    employmentType: null,
    estimatedMonthlyTxnAmount: null,
    estimatedMonthlyTxnVolume: null,
    fatcaCountryList: null,
    fatcaStatus: null,
    gender: null,
    icStateCode: null,
    icTypes: null,
    incomeRange: null,
    maeResidentialCountry: null,
    permanentresidentcountry: null,
    purpose: null,
    occupation: null,
    race: null,
    residentialcountryforeigner: null,
    sector: null,
    sourceOfFundCountry: null,
    sourceOfFundOrigin: null,
    sourceOfWealthOrigin: null,
    stateData: null,
    title: null,
    maeCitizenship: null,
    article: null,
    state: null,
    zone: null,
    branch: null,
    noofcertificates: null,
    tenure: null,
    education: null,
    maritalStatus: null,
    country: null,
    personalInfoRace: null,
    yearsOfInvestment: null,
    employeeDurationMonths: null,
    employeeDurationYrs: null,
    bonusType: null,
    allState: null,
    relationshipList: null,
    tenureList: [],
    countryUpdate: null,
};

// Reducer
function masterDataReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_MASTERDATA_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_MASTERDATA_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_MASTERDATA_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
                branchStateData: action.branchStateData,
                branchStatesList: action.branchStatesList,
                branchDistrictsList: action.branchDistrictsList,
                branchList: action.branchList,
                countryOfBirth: action.countryOfBirth,
                crsStatus: action.crsStatus,
                employmentType: action.employmentType,
                estimatedMonthlyTxnAmount: action.estimatedMonthlyTxnAmount,
                estimatedMonthlyTxnVolume: action.estimatedMonthlyTxnVolume,
                fatcaCountryList: action.fatcaCountryList,
                fatcaStatus: action.fatcaStatus,
                financialObjective: action.financialObjective,
                gender: action.gender,
                icStateCode: action.icStateCode,
                icTypes: action.icTypes,
                incomeRange: action.incomeRange,
                maeResidentialCountry: action.maeResidentialCountry,
                permanentresidentcountry: action.permanentresidentcountry,
                purpose: action.purpose,
                occupation: action.occupation,
                race: action.race,
                residentialcountryforeigner: action.residentialcountryforeigner,
                sector: action.sector,
                sourceOfFundCountry: action.sourceOfFundCountry,
                sourceOfFundOrigin: action.sourceOfFundOrigin,
                sourceOfWealthOrigin: action.sourceOfWealthOrigin,
                stateData: action.stateData,
                title: action.title,
                maeCitizenship: action.maeCitizenship,
                article: action.article,
                state: action.state,
                zone: action.zone,
                branch: action.branch,
                noofcertificates: action.noofcertificates,
                tenure: action.tenure,
                education: action.education,
                maritalStatus: action.maritalStatus,
                country: action.country,
                personalInfoRace: action.personalInfoRace,
                yearsOfInvestment: action.yearsOfInvestment,
                employeeDurationMonths: action.employeeDurationMonths,
                employeeDurationYrs: action.employeeDurationYrs,
                bonusType: action.bonusType,
                allState: action.allState,
                relationshipList: action.relationshipList,
                tenureList: action.tenureList,
                occupationLowestleafflag: action.occupationLowestleafflag,
                occupationSectorlowestleafflag: action.occupationSectorlowestleafflag,
                employmentTypelowestleafflag: action.employmentTypelowestleafflag,
                countryUpdate: action.countryUpdate,
            };

        case MASTERDATA_UPDATE_COUNTRY:
            return {
                ...state,
                country: action.country,
            };

        case ASB_MASTERDATA_CLEAR:
            return {
                ...state,
                status: STATUS_IDLE,
                error: null,
                data: null,
                branchStateData: null,
                branchStatesList: null,
                branchDistrictsList: null,
                branchList: null,
                countryOfBirth: null,
                crsStatus: null,
                employmentType: null,
                estimatedMonthlyTxnAmount: null,
                estimatedMonthlyTxnVolume: null,
                fatcaCountryList: null,
                fatcaStatus: null,
                gender: null,
                icStateCode: null,
                icTypes: null,
                incomeRange: null,
                maeResidentialCountry: null,
                permanentresidentcountry: null,
                purpose: null,
                occupation: null,
                race: null,
                residentialcountryforeigner: null,
                sector: null,
                sourceOfFundCountry: null,
                sourceOfFundOrigin: null,
                sourceOfWealthOrigin: null,
                stateData: null,
                title: null,
                maeCitizenship: null,
                article: null,
                state: null,
                zone: null,
                branch: null,
                noofcertificates: null,
                tenure: null,
                education: null,
                maritalStatus: null,
                country: null,
                personalInfoRace: null,
                yearsOfInvestment: null,
                employeeDurationMonths: null,
                employeeDurationYrs: null,
                action: null,
                allState: null,
                relationshipList: null,
                tenureList: [],
                occupationLowestleafflag: null,
                occupationSectorlowestleafflag: null,
                employmentTypelowestleafflag: null,
                countryUpdate: null,
            };

        default:
            return state;
    }
}

export default masterDataReducer;
