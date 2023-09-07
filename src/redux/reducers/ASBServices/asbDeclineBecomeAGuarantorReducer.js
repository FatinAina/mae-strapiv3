import {
    ASB_DECLINE_BECOME_GUARANTOR_CONSENT_LOADING,
    ASB_DECLINE_BECOME_GUARANTOR_ERROR,
    ASB_DECLINE_BECOME_GUARANTOR_SUCCESS,
    ASB_DECLINE_BECOME_GUARANTOR_CLEAR,
} from "@redux/actions/ASBServices/asbDeclineBecomeAGuarantorAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    data: null,
};

// Reducer
function asbDeclineBecomeAGuarantor(state = initialState, action) {
    switch (action.type) {
        case ASB_DECLINE_BECOME_GUARANTOR_CONSENT_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_DECLINE_BECOME_GUARANTOR_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_DECLINE_BECOME_GUARANTOR_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
            };

        case ASB_DECLINE_BECOME_GUARANTOR_CLEAR:
            return {
                ...state,
                status: STATUS_IDLE,
                data: null,
            };

        default:
            return state;
    }
}

export default asbDeclineBecomeAGuarantor;
