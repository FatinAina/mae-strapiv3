import numeral from "numeral";

import { updateDataOnReducerBaseOnApplicationDetails } from "@screens/ASB/Financing/helpers/CustomerDetailsPrefiller";
import { removeCommas } from "@screens/PLSTP/PLSTPController";

import { showErrorToast } from "@components/Toast";

import { applicationDetailsApi } from "@services";

import {
    ASB_APPLICAION_DEATAILS_LOADING,
    ASB_APPLICAION_DEATAILS_ERROR,
    ASB_APPLICAION_DEATAILS_SUCCESS,
} from "@redux/actions/ASBServices/asbApplicationDetailsAction";
import {
    ASB_UPDATE_OVERALL_VALIDATION_DETAILS,
    ASB_UPDATE_PREPOSTQUAL_DETAILS,
} from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";

import {
    COMMON_ERROR_MSG,
    MONTHLY_PAYMENT,
    PROFIT_INTEREST,
    TAKAFUL_INSURANCE_FEE,
    TENURE,
    SMALL_YEARS,
    FIRST,
    DT_RECOM,
    SUCCESS_STATUS,
} from "@constants/strings";

export const asbApplicationDetails = (
    dataReducer,
    callback,
    responseData,
    masterData,
    mainApplicantName,
    navigation
) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_APPLICAION_DEATAILS_LOADING });
            let response;
            if (responseData) {
                response = responseData;
            } else {
                response = await applicationDetailsApi(dataReducer, true);
            }

            const applicationDetailsResult = response?.data?.result;
            const additionalDetails = applicationDetailsResult?.msgBody?.additionalDetails;

            const result = response?.data?.result?.msgBody?.stpApp;
            const message = response?.data?.message;

            if (message === SUCCESS_STATUS && result) {
                const stpScreenResume = result?.stpScreenResume;
                const stpReferenceNo = result?.stpReferenceNo;
                const stpAssessmentId = result?.stpAssessmentId;
                const stpDeclarePdpa = result?.stpDeclarePdpa;

                const eligibilityCheckData = JSON.parse(additionalDetails?.stpEligibilityResponse);
                let eligibilityCheckOutcome;
                if (eligibilityCheckData?.eligibilityCheckOutcome) {
                    eligibilityCheckOutcome = eligibilityCheckData?.eligibilityCheckOutcome;
                } else {
                    eligibilityCheckOutcome =
                        JSON.parse(eligibilityCheckData)?.eligibilityCheckOutcome;
                }

                let eligibilityCheckOutcomeData;
                eligibilityCheckOutcome?.map((data) => {
                    eligibilityCheckOutcomeData = data;
                    if (data.dataType === DT_RECOM) {
                        eligibilityCheckOutcomeData = data;
                    }
                });

                const bodyList = [];
                bodyList.push({
                    heading: TENURE,
                    headingValue: `${eligibilityCheckOutcomeData?.tenure} years`,
                    isVisible: eligibilityCheckOutcomeData?.tenure,
                });

                let yearCount = 0;
                const tireList = eligibilityCheckOutcomeData?.tierList;
                tireList?.map((data, index) => {
                    yearCount += data?.year;

                    if (tireList?.length > 1) {
                        bodyList.push({
                            heading:
                                tireList?.length === 1
                                    ? ""
                                    : data?.tier === 1
                                    ? `${FIRST}  ${data?.year} ${SMALL_YEARS}`
                                    : index !== tireList?.length - 1
                                    ? `${yearCount} ${SMALL_YEARS}`
                                    : `${index + 3} - ${yearCount} ${SMALL_YEARS}`,
                            isMutiTierVisible: true,
                        });
                    }

                    bodyList.push({
                        heading: PROFIT_INTEREST,
                        headingValue: `${numeral(data?.interestRate).format(",0.00")}%`,
                        isVisible: data?.interestRate,
                    });
                    bodyList.push({
                        heading: MONTHLY_PAYMENT,
                        headingValue: `RM ${numeral(data?.installmentAmount).format(",0.00")}`,
                        isVisible: data?.installmentAmount,
                    });

                    if (tireList?.length > 1) {
                        bodyList.push({
                            divider: true,
                        });
                    }
                });

                bodyList.push({
                    heading: TAKAFUL_INSURANCE_FEE,
                    headingValue: `RM ${numeral(
                        eligibilityCheckOutcomeData?.totalGrossPremium
                    ).format(",0.00")}`,
                    isVisible: eligibilityCheckOutcomeData?.totalGrossPremium,
                });

                const loanInformation = {
                    stpId: result?.additionalDetails?.stpUserId,
                    downpayment: 0,
                    financingType: "C",
                    loanFinancingAmountRM: eligibilityCheckOutcomeData?.loanAmount
                        ? parseInt(removeCommas(eligibilityCheckOutcomeData?.loanAmount))
                        : 0,
                    loanTenure: eligibilityCheckOutcomeData?.tenure
                        ? `${eligibilityCheckOutcomeData?.tenure} ${SMALL_YEARS}`
                        : 0,
                };

                const stpEligibilityResponse = result?.stpEligibilityResponse
                    ? JSON.parse(result?.stpEligibilityResponse)
                    : result?.stpEligibilityResponse;
                const resumeResponse = JSON.stringify(result);
                const eligibilityData = result?.stpEligibilityResponse
                    ? JSON.parse(result?.stpEligibilityResponse)
                    : result?.stpEligibilityResponse;
                const resumeData = JSON.parse(resumeResponse);
                const idNo = resumeData?.stpIdno;
                const lastUpdatedDate = result?.stpLastUpdatedDate;

                const overallValidationResult =
                    eligibilityCheckData?.overallValidationResult ??
                    JSON.parse(eligibilityCheckData)?.overallValidationResult;

                dispatch({
                    type: ASB_UPDATE_PREPOSTQUAL_DETAILS,
                    resultAsbApplicationDetails: result,
                    resumeData,
                    loanInformation,
                    eligibilityData,
                    stpEligibilityResponse,
                    stpScreenResume,
                    stpReferenceNo,
                    stpAssessmentId,
                    stpDeclarePdpa,
                    idNo,
                    lastUpdatedDate,
                    eligibilityCheckOutcomeData,
                    additionalDetails,
                });

                dispatch({
                    type: ASB_UPDATE_OVERALL_VALIDATION_DETAILS,
                    overallValidationResult,
                });

                dispatch({
                    type: ASB_APPLICAION_DEATAILS_SUCCESS,
                    data: result,
                    bodyList,
                });

                if (callback && masterData && navigation) {
                    updateDataOnReducerBaseOnApplicationDetails(
                        result,
                        masterData,
                        eligibilityCheckOutcomeData,
                        dispatch,
                        navigation,
                        true,
                        false,
                        additionalDetails
                    );
                }

                if (callback) {
                    callback(
                        result,
                        bodyList,
                        eligibilityCheckOutcomeData,
                        eligibilityData,
                        stpEligibilityResponse,
                        stpScreenResume,
                        stpReferenceNo,
                        stpAssessmentId,
                        stpDeclarePdpa,
                        dispatch,
                        additionalDetails
                    );
                }
            } else {
                showErrorToast({
                    message:
                        result?.responseDesc ||
                        result?.statusDescription ||
                        result?.statusDesc ||
                        COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: ASB_APPLICAION_DEATAILS_ERROR, error });
        }
    };
};
