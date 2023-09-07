import { showErrorToast } from "@components/Toast";

import { asbDeclineBecomeAGuarantorService } from "@services/apiServiceAsb";

import {
    ASB_DECLINE_BECOME_GUARANTOR_CONSENT_LOADING,
    ASB_DECLINE_BECOME_GUARANTOR_ERROR,
    ASB_DECLINE_BECOME_GUARANTOR_SUCCESS,
} from "@redux/actions/ASBServices/asbDeclineBecomeAGuarantorAction";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbDeclineBecomeAGuarantor = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_DECLINE_BECOME_GUARANTOR_CONSENT_LOADING });
            const response = await asbDeclineBecomeAGuarantorService(dataReducer, true);
            const result = response?.data?.result;
            const messageHeader = result?.msgHeader;

            if (messageHeader?.responseCode === STATUS_CODE_SUCCESS && result) {
                dispatch({
                    type: ASB_DECLINE_BECOME_GUARANTOR_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else {
                showErrorToast({
                    message:
                        result?.responseDesc ||
                        messageHeader?.responseDesc ||
                        result?.statusDescription ||
                        result?.statusDesc ||
                        COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: ASB_DECLINE_BECOME_GUARANTOR_ERROR, error });
        }
    };
};
