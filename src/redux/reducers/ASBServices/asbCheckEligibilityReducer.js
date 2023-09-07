import {
    ASB_CHECK_ELIGIBILITY_LOADING,
    ASB_CHECK_ELIGIBILITY_ERROR,
    ASB_CHECK_ELIGIBILITY_SUCCESS,
} from "@redux/actions/ASBServices/asbCheckEligibilityAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    overallValidationResult: null,
    dataType: null,
    checkEligibilityResponse: null,
};

// Reducer
function asbCheckEligibilityReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_CHECK_ELIGIBILITY_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_CHECK_ELIGIBILITY_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_CHECK_ELIGIBILITY_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                overallValidationResult: action.overallValidationResult,
                dataType: action.dataType,
                checkEligibilityResponse: action.checkEligibilityResponse,
            };

        default:
            return state;
    }
}

export default asbCheckEligibilityReducer;
