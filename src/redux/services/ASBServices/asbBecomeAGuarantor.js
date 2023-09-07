import { showErrorToast } from "@components/Toast";

import { asbBecomeAGuarantorService } from "@services";

import {
    ASB_BECOME_GUARANTOR_CONSENT_LOADING,
    ASB_BECOME_GUARANTOR_ERROR,
    ASB_BECOME_GUARANTOR_SUCCESS,
} from "@redux/actions/ASBServices/asbBecomeAGuarantorAction";

import { COMMON_ERROR_MSG, SUCCESS_STATUS } from "@constants/strings";

export const asbBecomeAGuarantor = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_BECOME_GUARANTOR_CONSENT_LOADING });

            const response = await asbBecomeAGuarantorService(dataReducer, true);
            const result = response?.data?.result;
            const message = response?.data?.message;

            if (message === SUCCESS_STATUS && result) {
                dispatch({
                    type: ASB_BECOME_GUARANTOR_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
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
            dispatch({ type: ASB_BECOME_GUARANTOR_ERROR, error });
        }
    };
};
