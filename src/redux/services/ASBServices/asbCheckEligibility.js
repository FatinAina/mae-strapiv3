import { showErrorToast } from "@components/Toast";

import { asbCheckEligibilityGuarantorService } from "@services";

import {
    ASB_CHECK_ELIGIBILITY_LOADING,
    ASB_CHECK_ELIGIBILITY_ERROR,
    ASB_CHECK_ELIGIBILITY_SUCCESS,
} from "@redux/actions/ASBServices/asbCheckEligibilityAction";
import { ASB_UPDATE_OVERALL_VALIDATION_DETAILS } from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";

import { COMMON_ERROR_MSG, SUCCESS_STATUS } from "@constants/strings";

export const asbCheckEligibility = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_CHECK_ELIGIBILITY_LOADING });

            const response = await asbCheckEligibilityGuarantorService(dataReducer);

            const result = response?.data?.result;
            const overallValidationResult = result?.wolocResponse?.msgBody?.overallValidationResult;
            const dataType = result?.wolocResponse?.msgBody?.eligibilityCheckOutcome[0]?.dataType;
            const checkEligibilityResponse = result?.wolocResponse?.msgBody;
            if (response?.data?.message === SUCCESS_STATUS) {
                dispatch({
                    type: ASB_CHECK_ELIGIBILITY_SUCCESS,
                    overallValidationResult,
                    dataType,
                    checkEligibilityResponse,
                });

                dispatch({
                    type: ASB_UPDATE_OVERALL_VALIDATION_DETAILS,
                    overallValidationResult,
                });

                if (callback) {
                    callback(overallValidationResult, dataType, result);
                }
            } else {
                dispatch({ type: ASB_CHECK_ELIGIBILITY_ERROR, COMMON_ERROR_MSG });
                showErrorToast({
                    message: result?.statusDescription ?? result?.statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: ASB_CHECK_ELIGIBILITY_ERROR, error });
        }
    };
};
