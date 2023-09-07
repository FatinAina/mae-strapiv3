import { showErrorToast } from "@components/Toast";

import { asbRequestTac } from "@services";

import {
    GUARANTOR_REQUEST_OTP_SUCCESS,
    GUARANTOR_REQUEST_OTP_ERROR,
} from "@redux/actions/ASBFinance/asbGuarantorOTPAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbGuarantorRequestOTP = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            const response = await asbRequestTac(dataReducer, true);
            const result = response?.data;
            const token = result?.token;

            const statusCode = result?.statusCode;
            if (statusCode === "0") {
                dispatch({
                    type: GUARANTOR_REQUEST_OTP_SUCCESS,
                    data: token,
                });

                if (callback) {
                    callback(token);
                }
            } else {
                showErrorToast({
                    message:
                        result?.responseDesc ||
                        result?.errors[0]?.message ||
                        result?.statusDescription ||
                        result?.statusDesc ||
                        COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: GUARANTOR_REQUEST_OTP_ERROR, error });
        }
    };
};
