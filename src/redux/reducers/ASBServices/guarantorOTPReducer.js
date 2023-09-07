import {
    GUARANTOR_REQUEST_OTP_SUCCESS,
    GUARANTOR_REQUEST_OTP_ERROR,
    GUARANTOR_SUBMIT_OTP_REQUEST_BODY,
} from "@redux/actions/ASBFinance/asbGuarantorOTPAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_IDLE } from "@constants/strings";

const initialState = {
    status: STATUS_IDLE,
    data: null,
    error: null,
    requestBody: null,
};

export default function guarantorOTPReducer(state = initialState, action) {
    switch (action.type) {
        case GUARANTOR_REQUEST_OTP_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case GUARANTOR_REQUEST_OTP_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
            };

        case GUARANTOR_SUBMIT_OTP_REQUEST_BODY:
            return {
                ...state,
                requestBody: action.requestBody,
            };

        default:
            return state;
    }
}
