import { showErrorToast } from "@components/Toast";

import { asbSendNotificationService } from "@services";

import {
    ASB_SEND_NOTIFICATION_LOADING,
    ASB_SEND_NOTIFICATION_ERROR,
    ASB_SEND_NOTIFICATION_SUCCESS,
} from "@redux/actions/ASBServices/asbSendNotificationAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const asbSendNotification = (dataReducer, callback, url) => {
    return async (dispatch) => {
        try {
            dispatch({ type: ASB_SEND_NOTIFICATION_LOADING });

            const response = await asbSendNotificationService(dataReducer, url);
            const result = response?.data?.result;
            const status = result.status;

            if (status === "Accepted") {
                dispatch({
                    type: ASB_SEND_NOTIFICATION_SUCCESS,
                    data: result,
                });

                if (callback) {
                    callback(result);
                }
            } else {
                dispatch({
                    type: ASB_SEND_NOTIFICATION_ERROR,
                    error: result?.statusDescription || result?.statusDesc || COMMON_ERROR_MSG,
                });
                showErrorToast({
                    message:
                        result?.responseDesc ||
                        result?.statusDescription ||
                        result?.statusDesc ||
                        COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            dispatch({ type: ASB_SEND_NOTIFICATION_ERROR, error });
        }
    };
};
