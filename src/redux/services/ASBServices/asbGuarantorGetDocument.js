import { showErrorToast } from "@components/Toast";

import { asbGetDocumentService } from "@services";

import {
    ASB_GUARANTOR_GET_DOCUMENT_LOADING_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_ERROR_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_DLB,
    ASB_GUARANTOR_GET_DOCUMENT_LOADING_LG,
    ASB_GUARANTOR_GET_DOCUMENT_ERROR_LG,
    ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_LG,
} from "@redux/actions/ASBServices/asbGuarantorGetDocumentAction";

import { COMMON_ERROR_MSG, SUCCESS_STATUS } from "@constants/strings";

export const asbGuarantorGetDocument = (dataReducer, callback) => {
    return async (dispatch) => {
        try {
            if (dataReducer?.docType === "DLB") {
                dispatch({ type: ASB_GUARANTOR_GET_DOCUMENT_LOADING_DLB });
            } else {
                dispatch({ type: ASB_GUARANTOR_GET_DOCUMENT_LOADING_LG });
            }

            const docID = dataReducer?.docID?.replace("{", "")?.replace("}", "");
            const response = await asbGetDocumentService(docID);
            const result = response?.data?.result;
            const message = response?.data?.message;
            if (message === SUCCESS_STATUS) {
                if (dataReducer?.docType === "DLB") {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_DLB,
                        documentDataDLB: result,
                    });
                } else {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_SUCCESS_LG,
                        documentDataLG: result,
                    });
                }

                if (callback) {
                    callback(result);
                }
            } else {
                if (dataReducer?.docType === "DLB") {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_ERROR_DLB,
                        errorDocumentDLB: COMMON_ERROR_MSG,
                    });
                } else {
                    dispatch({
                        type: ASB_GUARANTOR_GET_DOCUMENT_ERROR_LG,
                        errorDocumentLG: COMMON_ERROR_MSG,
                    });
                }
                showErrorToast({
                    message: result?.statusDescription ?? result?.statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            if (dataReducer?.docType === "DLB") {
                dispatch({ type: ASB_GUARANTOR_GET_DOCUMENT_ERROR_DLB, errorDocumentDLB: error });
            } else {
                dispatch({ type: ASB_GUARANTOR_GET_DOCUMENT_ERROR_LG, errorDocumentLG: error });
            }
        }
    };
};
