import { showErrorToast } from "@components/Toast";

import { submitApplicationWithTAC } from "@services";

import {
    ASB_UPDATE_CEP_LOADING,
    ASB_UPDATE_CEP_ERROR,
    ASB_UPDATE_CEP_SUCCESS,
} from "@redux/actions/ASBServices/asbUpdateCEPAction";

import { COMMON_ERROR_MSG, SUCCESS_STATUS, UNSUCCESSFUL_STATUS } from "@constants/strings";

export const asbGuarantorSubmitOTP = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_UPDATE_CEP_LOADING });

            const response = await submitApplicationWithTAC(dataReducer);
            const result = response?.data;

            if (result?.message === SUCCESS_STATUS) {
                dispatch({
                    type: ASB_UPDATE_CEP_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else if (
                result?.message === UNSUCCESSFUL_STATUS ||
                result?.result?.msgHeader?.responseCode === 6 ||
                result?.result?.msgHeader?.responseCode === 7 ||
                result?.result?.msgHeader?.responseCode === 8 ||
                result?.result?.msgHeader?.responseCode === 1
            ) {
                if (callback) {
                    callback(result, 504); // Application unsuccessful screen
                }
            } else if (result.code === 400) {
                callback(result, 400); // Invalid OTP
                showErrorToast({
                    message: "Invalid OTP",
                });
            } else if (result?.code === 9999 || result?.code === 408 || result?.code === 504) {
                callback(null, 9999); //Timeout popup
            } else {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: ASB_UPDATE_CEP_ERROR, error });
        }
    };
};
