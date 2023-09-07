import { activateDebitCardService } from "@services/apiServiceZestCASA";

import {
    ACTIVATE_DEBIT_CARDS_LOADING,
    ACTIVATE_DEBIT_CARDS_ERROR,
    ACTIVATE_DEBIT_CARDS_SUCCESS,
} from "@redux/actions/services/activateDebitCardsAction";

import { COMMON_ERROR_MSG } from "@constants/strings";

export const activateDebitCards = (dataReducer, callback) => {
    return async (dispatch) => {
        dispatch({ type: ACTIVATE_DEBIT_CARDS_LOADING });

        try {
            const result = await activateDebitCardService(dataReducer);
            const statusDesc = result?.statusDesc ?? result?.statusDescription;
            const statusCode = result?.Msg?.MsgHeader?.StatusCode;
            const msgBody = result?.Msg?.MsgBody;
            const msgHeader = result?.Msg?.MsgHeader;
            const additionalStatusCodes = msgHeader?.AdditionalStatusCodes;
            const messageID = msgHeader?.MsgID;

            if ((statusCode === "0000" || statusCode === "0") && result) {
                dispatch({
                    type: ACTIVATE_DEBIT_CARDS_SUCCESS,
                    data: result,
                    msgBody,
                    msgHeader,
                    additionalStatusCodes,
                });
                if (callback) {
                    callback(result, messageID);
                }
            } else {
                if (callback) {
                    callback(null, messageID, statusDesc, statusCode);
                }

                dispatch({
                    type: ACTIVATE_DEBIT_CARDS_ERROR,
                    error: statusDesc ?? COMMON_ERROR_MSG,
                });
            }
        } catch (error) {
            const errorFromMAE = error?.error;

            if (callback) {
                callback(null, null, errorFromMAE);
            }

            dispatch({ type: ACTIVATE_DEBIT_CARDS_ERROR, error });
        }
    };
};
