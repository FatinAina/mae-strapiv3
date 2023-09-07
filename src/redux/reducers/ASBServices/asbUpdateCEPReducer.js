import {
    ASB_UPDATE_CEP_LOADING,
    ASB_UPDATE_CEP_ERROR,
    ASB_UPDATE_CEP_SUCCESS,
    ASB_UPDATE_CEP_CLEAR,
} from "@redux/actions/ASBServices/asbUpdateCEPAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    data: null,
};

// Reducer
function asbUpdateCEPReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_UPDATE_CEP_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_UPDATE_CEP_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_UPDATE_CEP_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
            };

        case ASB_UPDATE_CEP_CLEAR:
            return {
                ...state,
                status: STATUS_IDLE,
                data: null,
            };

        default:
            return state;
    }
}

export default asbUpdateCEPReducer;
