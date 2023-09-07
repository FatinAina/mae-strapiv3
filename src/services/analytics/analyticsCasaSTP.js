import {
    ACTIVATE_NOW_GA,
    APPLY_M2U_COMPLETED,
    MAKE_AN_APPOINTMENT,
    CARD_REQUESTCARD_DEBITCARD_SUCCESSFUL,
    CARD_REQUESTCARD_DEBITCARD_FAILURE,
    APPLY_M2U_CREATEM2UID,
    APPLY_DEBIT_CARD,
    APPLY_WEBVIEW_M2U,
} from "@screens/CasaSTP/helpers/AnalyticsEventConstants";

import { logEvent } from "@services/analytics";

import { M2U_REGISTRATION_BUTTON } from "@constants/casaStrings";
import {
    FA_ACTION_NAME,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_VIEW_SCREEN,
    FA_FIELD_INFORMATION,
    FA_FORM_ERROR,
    FA_TRANSACTION_ID,
    FA_FORM_PROCEED,
    FA_FORM_COMPLETE,
    FA_TAB_NAME,
    DOITLATER_READY,
    ACCOUNT_TYPE,
} from "@constants/strings";

export const GACasaSTP = {
    onActivateNowButtonDidTap: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: tabName,
            [FA_ACTION_NAME]: ACTIVATE_NOW_GA,
        });
    },

    onPremierActivation: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: tabName,
        });
    },

    onPremierActivationWithRef: function (tabName, referenceId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: tabName,
            [FA_TRANSACTION_ID]: referenceId,
        });
    },

    onPremierActivationWithoutRef: function (tabName) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: tabName,
        });
    },

    onPremierSuccWithoutRef: function (tabName, productName) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: tabName,
            [FA_FIELD_INFORMATION]: ACCOUNT_TYPE + productName,
        });
    },

    onPremierActivationPending: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: APPLY_M2U_COMPLETED,
            [FA_ACTION_NAME]: MAKE_AN_APPOINTMENT,
        });
    },

    onPremierOtpVerificationSucc: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_SUCCESSFUL,
        });
    },

    onPremierOtpVerificationFail: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_FAILURE,
        });
    },

    onPremierOtpVerificationDebitCardSucc: function (messageID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_SUCCESSFUL,
            [FA_TRANSACTION_ID]: messageID,
        });
    },

    onPremierOtpVerificationDebitCardFail: function (messageID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: CARD_REQUESTCARD_DEBITCARD_FAILURE,
            [FA_TRANSACTION_ID]: messageID,
        });
    },

    onPremierIdentityDetails: function (screenName, identityType) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: identityType,
        });
    },

    onPremierSuccessMyKad: function (analyticScreenName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: analyticScreenName,
            [FA_ACTION_NAME]: APPLY_M2U_CREATEM2UID,
        });
    },

    onApplyDebitCardButtonDidTap: function (analyticScreenName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: analyticScreenName,
            [FA_ACTION_NAME]: APPLY_DEBIT_CARD,
        });
    },

    onregisterM2U: function (screenName, productName) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: M2U_REGISTRATION_BUTTON,
            [FA_FIELD_INFORMATION]: ACCOUNT_TYPE + productName,
        });

        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: APPLY_WEBVIEW_M2U,
        });
    },

    onPremierIdentityDetailsNext: function (screenName, productName) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: ACCOUNT_TYPE + productName,
        });
    },

    onPremierOtpVerificationUnsucc: function (screenName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
    onPremierOtpVerificationDebitCardUnsucc: function (screenName, messageID) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: messageID,
        });
    },

    onProductTileSelect: function (screenName, tabName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: actionName,
        });
    },

    onClickMaybeLater: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: tabName,
            [FA_ACTION_NAME]: DOITLATER_READY,
        });
    },
};
