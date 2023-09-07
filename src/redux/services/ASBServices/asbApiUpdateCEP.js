import { showErrorToast } from "@components/Toast";

import { updateApiCEP } from "@services";

import {
    ASB_UPDATE_CEP_LOADING,
    ASB_UPDATE_CEP_ERROR,
    ASB_UPDATE_CEP_SUCCESS,
} from "@redux/actions/ASBServices/asbUpdateCEPAction";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbUpdateCEP = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_UPDATE_CEP_LOADING });

            const response = await updateApiCEP(dataReducer);
            const result = response?.data?.result.msgHeader;
            const statusCode = result.responseCode;

            if (statusCode === STATUS_CODE_SUCCESS) {
                dispatch({
                    type: ASB_UPDATE_CEP_SUCCESS,
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
            dispatch({ type: ASB_UPDATE_CEP_ERROR, error });
        }
    };
};
