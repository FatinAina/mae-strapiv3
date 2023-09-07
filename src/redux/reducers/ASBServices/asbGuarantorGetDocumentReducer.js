import {
    ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_LG,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_LG,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_LG,
    ASB_GUARANTOR_GET_DOCUMENT_LOADING_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_ERROR_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LOADING_LG,
    ASB_GUARANTOR_GET_DOCUMENT_ERROR_LG,
    ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_LG,
} from "@redux/actions/ASBServices/asbGuarantorGetDocumentAction";

import { SUCC_STATUS, STATUS_ERROR, STATUS_LOADING, STATUS_IDLE } from "@constants/strings";

// Reducer Default Value
const initialState = {
    statusDocumentListDLB: STATUS_IDLE,
    statusDocumentDLB: STATUS_IDLE,
    statusDocumentListLG: STATUS_IDLE,
    statusDocumentLG: STATUS_IDLE,
    documentListDLB: null,
    documentDataDLB: null,
    documentListLG: null,
    documentDataLG: null,
    errorDocumentListDLB: null,
    errorDocumentListLG: null,
    errorDocumentDLB: null,
    errorDocumentLG: null,
};

// Reducer
function asbGuarantorGetDocumentReducer(state = initialState, action) {
    switch (action.type) {
        case ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_DLB:
            return {
                ...state,
                statusDocumentListDLB: STATUS_LOADING,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_DLB:
            return {
                ...state,
                statusDocumentListDLB: STATUS_ERROR,
                errorDocumentListDLB: action.errorDocumentListDLB,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_DLB:
            return {
                ...state,
                statusDocumentListDLB: SUCC_STATUS,
                documentListDLB: action.documentListDLB,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_LG:
            return {
                ...state,
                statusDocumentListLG: STATUS_LOADING,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_LG:
            return {
                ...state,
                statusDocumentListLG: STATUS_ERROR,
                errorDocumentListLG: action.errorDocumentListLG,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_LG:
            return {
                ...state,
                statusDocumentListLG: SUCC_STATUS,
                documentListLG: action.documentListLG,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LOADING_DLB:
            return {
                ...state,
                statusDocumentDLB: STATUS_LOADING,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_ERROR_DLB:
            return {
                ...state,
                statusDocumentDLB: STATUS_ERROR,
                errorDocumentDLB: action.errorDocumentDLB,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_DLB:
            return {
                ...state,
                statusDocumentDLB: SUCC_STATUS,
                documentDataDLB: action.documentDataDLB,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_LOADING_LG:
            return {
                ...state,
                statusDocumentLG: STATUS_LOADING,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_ERROR_LG:
            return {
                ...state,
                statusDocumentLG: STATUS_ERROR,
                errorDocumentLG: action.errorDocumentLG,
            };

        case ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_LG:
            return {
                ...state,
                statusDocumentLG: SUCC_STATUS,
                documentDataLG: action.documentDataLG,
            };

        default:
            return state;
    }
}

export default asbGuarantorGetDocumentReducer;
