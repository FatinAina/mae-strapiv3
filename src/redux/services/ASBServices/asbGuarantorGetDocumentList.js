import { showErrorToast } from "@components/Toast";

import { asbGetDocumentListService } from "@services";

import {
    ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_LG,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_LG,
    ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_LG,
} from "@redux/actions/ASBServices/asbGuarantorGetDocumentAction";

import { COMMON_ERROR_MSG, SUCCESS_STATUS } from "@constants/strings";

export const asbGuarantorGetDocumentList = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            if (dataReducer?.docType === "DLB") {
                dispatch({ type: ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_DLB });
            } else {
                dispatch({ type: ASB_GUARANTOR_GET_DOCUMENT_LIST_LOADING_LG });
            }

            const response = await asbGetDocumentListService(dataReducer?.data);
            const result = response?.data?.result;
            const message = response?.data?.message;
            if (message === SUCCESS_STATUS) {
                const docList = result?.docs;

                if (dataReducer?.docType === "DLB") {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_DLB,
                        documentListDLB: docList,
                    });
                } else {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_LIST_SUCCESS_LG,
                        documentListLG: docList,
                    });
                }

                if (callback) {
                    callback(docList);
                }
            } else {
                if (dataReducer?.docType === "DLB") {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_DLB,
                        errorDocumentListDLB: COMMON_ERROR_MSG,
                    });
                } else {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_LG,
                        errorDocumentListLG: COMMON_ERROR_MSG,
                    });
                }

                showErrorToast({
                    message: result?.statusDescription ?? result?.statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            if (dataReducer?.docType === "DLB") {
                dispatch({
                    type: ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_DLB,
                    errorDocumentListDLB: error,
                });
            } else {
                dispatch({
                    type: ASB_GUARANTOR_GET_DOCUMENT_LIST_ERROR_LG,
                    errorDocumentListLG: error,
                });
            }
        }
    };
};
