import {
    ASB_SEND_NOTIFICATION_LOADING,
    ASB_SEND_NOTIFICATION_ERROR,
    ASB_SEND_NOTIFICATION_SUCCESS,
    ASB_SEND_NOTIFICATION_CLEAR,
} from "@redux/actions/ASBServices/asbSendNotificationAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    data: null,
};

// Reducer
function asbSendNotificationReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_SEND_NOTIFICATION_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_SEND_NOTIFICATION_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_SEND_NOTIFICATION_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
            };

        case ASB_SEND_NOTIFICATION_CLEAR:
            return {
                ...state,
                status: STATUS_IDLE,
                data: null,
            };

        default:
            return state;
    }
}

export default asbSendNotificationReducer;
