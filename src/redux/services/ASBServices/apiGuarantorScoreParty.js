import { showErrorToast } from "@components/Toast";

import { scorePartyApi } from "@services";

import {
    ASB_PREPOSTQUAL_SCORE_PARTY_FAILURE,
    ASB_PREPOSTQUAL_SCORE_PARTY_SUCCESS,
} from "@redux/actions/ASBServices/asbGuarantorPrePostQualAction";

import { COMMON_ERROR_MSG, SUCCESS_STATUS } from "@constants/strings";

export const guarantorScoreParty = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            const response = await scorePartyApi(dataReducer);
            const result = response?.data;
            if (result?.message === SUCCESS_STATUS) {
                const responseJsonString =
                    result?.result?.responseJsonString &&
                    JSON.parse(result?.result?.responseJsonString.replace(/\r\n/, ""));

                const customerRiskRatingCode = responseJsonString?.customerRiskRating?.code;
                const customerRiskRatingValue = responseJsonString?.customerRiskRating?.value;
                const manualRiskRatingCode = responseJsonString?.manualRiskRating?.code;
                const manualRiskRatingValue = responseJsonString?.manualRiskRating?.value;
                const assessmentId = responseJsonString?.assessmentId;

                dispatch({
                    type: ASB_PREPOSTQUAL_SCORE_PARTY_SUCCESS,
                    responseJsonString,
                    customerRiskRatingCode,
                    customerRiskRatingValue,
                    manualRiskRatingCode,
                    manualRiskRatingValue,
                    assessmentId,
                });

                if (callback) {
                    callback(
                        responseJsonString,
                        customerRiskRatingCode,
                        customerRiskRatingValue,
                        manualRiskRatingCode,
                        manualRiskRatingValue,
                        assessmentId
                    );
                }
            } else {
                const errorMessage =
                    result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG;
                showErrorToast({
                    message: errorMessage,
                });
                dispatch({
                    type: ASB_PREPOSTQUAL_SCORE_PARTY_FAILURE,
                    scorePartyError: errorMessage,
                });
            }
        } catch (error) {
            dispatch({ type: ASB_PREPOSTQUAL_SCORE_PARTY_FAILURE, scorePartyError: error });
        }
    };
};
