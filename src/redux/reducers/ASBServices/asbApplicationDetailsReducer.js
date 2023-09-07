import {
    ASB_APPLICAION_DEATAILS_LOADING,
    ASB_APPLICAION_DEATAILS_ERROR,
    ASB_APPLICAION_DEATAILS_SUCCESS,
    ASB_APPLICAION_DEATAILSP_CLEAR,
    ASB_APPLICAION_DATA_STORE_NOTIFICATION,
    ASB_APPLICAION_DATA,
} from "@redux/actions/ASBServices/asbApplicationDetailsAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    status: STATUS_IDLE,
    data: null,
    bodyList: [],
    dataStoreValidation: null,
};

// Reducer
function asbApplicationDetailsReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_APPLICAION_DEATAILS_LOADING:
            return {
                ...state,
                status: STATUS_LOADING,
            };

        case ASB_APPLICAION_DEATAILS_ERROR:
            return {
                ...state,
                status: STATUS_ERROR,
                error: action.error,
            };

        case ASB_APPLICAION_DEATAILS_SUCCESS:
            return {
                ...state,
                status: SUCC_STATUS,
                data: action.data,
                bodyList: action.bodyList,
            };

        case ASB_APPLICAION_DATA_STORE_NOTIFICATION:
            return {
                ...state,
                dataStoreValidation: action.dataStoreValidation,
            };

        case ASB_APPLICAION_DATA:
            return {
                ...state,
                guarantorDataStore: action.guarantorDataStore,
            };

        case ASB_APPLICAION_DEATAILSP_CLEAR:
            return {
                ...state,
                status: "idle",
                data: null,
                bodyList: [],
                dataStoreValidation: null,
            };

        default:
            return state;
    }
}

export default asbApplicationDetailsReducer;
