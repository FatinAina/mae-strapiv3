import { showErrorToast } from "@components/Toast";

import { scorePartyService } from "@services/apiServiceZestCASA";

import {
    SCORE_PARTY_LOADING,
    SCORE_PARTY_ERROR,
    SCORE_PARTY_SUCCESS,
} from "@redux/actions/services/scorePartyAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const fetchScoreParty = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: SCORE_PARTY_LOADING });

        try {
            const response = await scorePartyService(dataReducer);
            console.log("[ZestCASA][fetchScoreParty] >> Success");
            console.log(response.data.result);

            const result = response?.data?.result;
            const statusCode = result.statusCode ?? null;

            if (statusCode === "0000" && result) {
                if (callback) {
                    callback(result);
                }
                dispatch({
                    type: SCORE_PARTY_SUCCESS,
                    data: result,
                    statusDesc: result.statusDesc,
                    requestMsgRefNo: result.requestMsgRefNo,
                    customerRiskRatingCode: result.customerRiskRatingCode,
                    customerRiskRatingValue: result.customerRiskRatingValue,
                    manualRiskRatingCode: result.manualRiskRatingCode,
                    manualRiskRatingValue: result.manualRiskRatingValue,
                    assessmentId: result.assessmentId,
                    nextReviewDate: result.nextReviewDate,
                    sanctionsTaggingCode: result.sanctionsTaggingCode,
                    sanctionsTaggingValue: result.sanctionsTaggingValue,
                    numOfWatchlistHits: result.numOfWatchlistHits,
                    universalCifNo: result.universalCifNo,
                    sourceOfFundCountry: result.sourceOfFundCountry,
                    pepDeclaration: result.pepDeclaration,
                });
            } else {
                const statusDesc = response?.data?.statusDesc ?? null;
                console.log("[ZestCASA][fetchScoreParty] >> Failure");
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                dispatch({
                    type: SCORE_PARTY_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][fetchScoreParty] >> Failure");
            dispatch({ type: SCORE_PARTY_ERROR, error: error });
        }
    };
};
