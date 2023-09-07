import { logEvent } from "@services/analytics";

import {
    FA_ACTION_NAME,
    FA_FIELD_INFORMATION,
    FA_FIELD_INFORMATION_2,
    FA_FIELD_INFORMATION_3,
    FA_FORM_COMPLETE,
    FA_FORM_ERROR,
    FA_FORM_PROCEED,
    FA_M2U_SENDREQUEST_MONEY,
    FA_METHOD,
    FA_OPEN_MENU,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_SELECT_MENU,
    FA_SELECT_REQUEST,
    FA_SHARE,
    FA_TAB_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    SHARE_RECEIPT,
} from "@constants/strings";

export const RTPanalytics = {
    //Generally shared by all flows
    registerPopUp: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RegisterDNAD",
        });
    },
    screenLoadDuitNowReviewDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    formDuitNowReviewDetailsConfirmation: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_FIELD_INFORMATION]: `dn_type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    detailScreenLoad: function (refId) {
        refId
            ? logEvent(FA_VIEW_SCREEN, {
                  [FA_SCREEN_NAME]: "DuitNow_DNR",
                  [FA_TRANSACTION_ID]: refId,
              })
            : logEvent(FA_VIEW_SCREEN, {
                  [FA_SCREEN_NAME]: "DuitNow_DNR",
              });
    },
    detailScreenLoadWithoutId: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
        });
    },
    detailScreenOpenMenu: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
        });
    },

    //DuitNow Req Payment Related
    screenLoadAccount: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AccountNumber",
        });
    },
    screenLoadAmount: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Amount",
        });
    },
    screenLoadReference: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RecipientReference",
        });
    },
    screenLoadConfirmation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    addAnotherRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Add Another Request",
        });
    },
    screenLoadSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_RequestSuccessful",
        });
    },
    // formComplete: function (refId, data) {
    //     logEvent(FA_FORM_COMPLETE, {
    //         [FA_SCREEN_NAME]: "DuitNowRequest_RequestSuccessful",
    //         [FA_TRANSACTION_ID]: refId,
    //         [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
    //         [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
    //     });
    // },
    screenLoadUnSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestUnsuccessful",
        });
    },
    formError: function (refId, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_RequestUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    //DuitNow Req RSA
    screenLoadProcessed: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestProcessed",
        });
    },
    formCompleteProcessed: function (refId, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RequestProcessed",
            [FA_TRANSACTION_ID]: refId,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    //DuitNow Req S2U reject
    screenLoadAuthorisationFailed: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AuthorisationFailed",
        });
    },
    formCompleteAuthorisationFailed: function (refId, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_AuthorisationFailed",
            [FA_TRANSACTION_ID]: refId,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    editAutoDebit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Edit",
        });
    },
    formComplete: function (refID, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_TRANSACTION_ID]: `${refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    addToFavourite: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_ACTION_NAME]: "Add To Favourite",
        });
    },
    addToFavouriteProcessed: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_RequestProcessed",
            [FA_ACTION_NAME]: "Add To Favourite",
        });
    },
    shareReceiptDNRSetup: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },

    // DuitNow Request Details Screen (shared by DuitNow Request and DuitNow AutoDebit Req)
    screenLoad: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestDetails",
        });
    },
    selectContinue: function (requestVia) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_RequestDetails",
            [FA_FIELD_INFORMATION]: `request_via: ${requestVia}`,
        });
    },

    //AutoDebit Request (creditor)
    screenLoadADDebitDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AutoDebitDetails",
        });
    },
    screenLoadADAddAnother: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Add Another Request",
        });
    },
    screenLoadADEdit: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_ACTION_NAME]: "Edit",
        });
    },
    screenLoadADformProceed: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data.autodebit},frequency: ${data.frequency},limit_transaction: ${data.limit_transaction},cancellation: ${data.cancellation}`,
        });
    },
    // success AD request
    screenLoadADRequestSubmitted: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
        });
    },
    formADRequestSubmitted: function (refID, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    screenLoadADReqUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestUnsuccessful",
        });
    },
    formADReqUnsuccessful: function (refID, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_RequestUnsuccessful",
            [FA_TRANSACTION_ID]: `${refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    ADShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_RequestSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadADShareReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
        });
    },

    //can't find scenario
    screenLoadADScheduled: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestScheduled",
        });
    },
    formCompleteADScheduled: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestScheduled",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    //end

    screenLoadADSuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestSuccessful",
        });
    },
    formCompleteADSuccessful: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //can't find scenario
    screenLoadADProcessed: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestProcessed",
        });
    },
    formCompleteADProcessed: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestProcessed",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    //end

    screenLoadADUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestUnsuccessful",
        });
    },
    formCompleteADUnsuccessful: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitRequestUnsuccessful",
            [FA_FORM_ERROR]: refId,
        });
    },

    //AutoBill

    //AutoBilling Dashboard
    screenLoadABDashboard: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "M2U - Auto Billing",
            [FA_TAB_NAME]: tabName,
        });
    },
    selectSetUpAB: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "M2U - Auto Billing",
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "Set Up Auto Billing",
        });
    },
    selectViewAllMYC: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "M2U - Auto Billing",
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "View All Customers",
        });
    },
    selectViewAllMYB: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "M2U - Auto Billing",
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "View All Bills",
        });
    },
    selectMYC: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "M2U - Auto Billing",
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "Select Customer",
        });
    },
    selectMYB: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "M2U - Auto Billing",
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: "Select Bill",
        });
    },

    //Setup AutoBilling
    screenLoadABMerchant: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ABMerchantDetails",
        });
    },
    screenLoadABSearch: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_MerchantSearch",
        });
    },
    screenLoadABDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_DebitDetails",
        });
    },
    // success AB request
    screenLoadABSubmitted: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SetupRequestSubmitted",
        });
    },
    formABSubmitted: function (refID, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_SetupRequestSubmitted",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    screenLoadABUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SetupRequestUnsuccessful",
        });
    },
    formABUnsuccessful: function (refID, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_SetupRequestUnsuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },

    //Share receipt for AutoBilling setup and Charge Now
    selectActionDuitNowShareReceipt: function (screenName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },

    //Approve AutoBilling and Autodebit
    selectABApprove: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Approve Now",
        });
    },
    screenLoadABApproveSuccessfull: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ApprovalSuccessful",
        });
    },
    formABApproveSuccessfull: function (data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_ApprovalSuccessful",
            [FA_TRANSACTION_ID]: `${data.refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.dn_type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.product_name}, num_request: ${data.num_request}`,
        });
    },
    screenLoadABApproveUnsuccessfull: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ApprovalUnsuccessful",
        });
    },
    formABApproveUnsuccessfull: function (data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_ApprovalUnsuccessful",
            [FA_TRANSACTION_ID]: `${data.refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.dn_type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.product_name}, num_request: ${data.num_request}`,
        });
    },
    ABApproveShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_ApprovalSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    ADApproveShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadABApproveShareReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
        });
    },

    //My customer, My bills screen
    selectABCancelPopup: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Cancel DuitNow AutoDebit",
        });
    },
    selectABSwitchPopup: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Switch Account",
        });
    },
    selectABPausePopup: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Pause DuitNow AutoDebit",
        });
    },
    selectRenewRequest: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Renew Request",
        });
    },

    //Autobilling switch
    viewDNSwitchAccSelect: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Switch_SelectAccount",
        });
    },

    //Autobilling Pause
    selectABPausePopupScreen: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_PauseAD",
        });
    },
    screenLoadABPauseSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_PauseSuccessful",
        });
    },
    formABPauseSuccess: function (refID, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_PauseSuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data.type}`,
        });
    },
    screenLoadABPauseUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_PauseUnsuccessful",
        });
    },
    formABPauseUnSuccess: function (refID, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_PauseUnsuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data.type}`,
        });
    },

    //Autobilling Resume
    screenSelectABresume: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Resume AutoDebit",
        });
    },
    screenLoadABResumeSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ResumeSuccessful",
        });
    },
    formABResumeSuccess: function (refID, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_ResumeSuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data.type}`,
        });
    },
    screenLoadABResumeUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ResumeUnsuccessful",
        });
    },
    formABResumeUnSuccess: function (refID, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_ResumeUnsuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${data.type}`,
        });
    },

    // AutoBilling cancel
    screenLoadABCancelReason: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_CancellationReason",
        });
    },
    formABCancel: function (reasonCancel) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_CancellationReason",
            [FA_FIELD_INFORMATION]: `reason: ${reasonCancel}`,
        });
    },
    screenLoadABCancelSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_CancellationSuccessful",
        });
    },
    formABCancelSuccess: function (refID, type) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_CancellationSuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${type}`,
        });
    },
    screenLoadABCancelUnsuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_CancellationUnsuccessful",
        });
    },
    formABCanceUnsuccess: function (refID, type) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_CancellationUnsuccessful",
            [FA_TRANSACTION_ID]: refID,
            [FA_FIELD_INFORMATION]: `type: ${type}`,
        });
    },

    //DuitNow send again
    selectSendAgain: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Send Again",
        });
    },

    //DuitNow request again
    selectRequestAgain: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Request Again",
        });
    },

    //DuitNow Request
    selectPayNowDuitNowRequest: function (refundCheck) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: refundCheck ? "Refund Now" : "Pay Now",
        });
    },
    selectRejectDuitNowRequest: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Reject Request",
        });
    },
    screenLoadDuitNowRequestToPayConfirmation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SelectAccount",
        });
    },
    screenLoadDuitNowRequestADConfirmation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
        });
    },
    formADuitNowRequestADConfirmation: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_FIELD_INFORMATION]: `dn_type: ${data.dn_type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.product_name}, num_request: ${data.num_request}`,
        });
    },
    screenLoadErrorDecoupleDNRAck: function (refundCheck) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: refundCheck
                ? "DuitNow_RefundUnsuccessful"
                : "DuitNow_PaymentUnsuccessful",
        });
    },
    screenLoadErrorCoupleDNRAck: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionUnsuccessful",
        });
    },
    screenLoadCompleteDecoupleDNRAck: function (refundCheck) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: refundCheck
                ? "DuitNow_RefundSuccessful"
                : "DuitNow_PaymentSuccessful",
        });
    },
    screenLoadDCompleteCoupleDNRAck: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionSuccessful",
        });
    },
    formErrorDecoupleDNRAck: function (data, refundCheck) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: refundCheck
                ? "DuitNow_RefundUnsuccessful"
                : "DuitNow_PaymentUnsuccessful",
            [FA_TRANSACTION_ID]: `${data.refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    formErrorCoupleDNRAck: function (data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionUnsuccessful",
            [FA_TRANSACTION_ID]: `${data.refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    formCompleteDecoupleDNRAck: function (data, refundCheck) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: refundCheck
                ? "DuitNow_RefundSuccessful"
                : "DuitNow_PaymentSuccessful",
            [FA_TRANSACTION_ID]: `${data.refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    formCompleteCoupleDNRAck: function (data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_TransactionSuccessful",
            [FA_TRANSACTION_ID]: `${data.refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    shareReceiptDecoupleDNR: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptCoupleDNR: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    screenLoadRejectPopupDNR: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RejectDNR",
        });
    },
    selectedRejectADR: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ReviewDetails",
            [FA_ACTION_NAME]: "Reject AutoDebit",
        });
    },

    //Charge Customer
    selectChargeCust: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Charge Now",
        });
    },
    viewEnterAmount: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_EnterAmount",
        });
    },
    viewChargeNowSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ChargeSuccessful",
        });
    },
    formCompleteChargeNow: function (refID, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_ChargeSuccessful",
            [FA_TRANSACTION_ID]: `${refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },
    chargeNowShareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_ChargeSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    viewChargeNowUnsuccessful: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_ChargeUnsuccessful",
        });
    },
    formErrorChargeNow: function (refID, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_ChargeUnsuccessful",
            [FA_TRANSACTION_ID]: `${refID}`,
            [FA_FIELD_INFORMATION]: `type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },

    viewReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Receipt",
        });
    },
    shareReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Receipt",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptSuccess: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_Receipt",
            [FA_METHOD]: method,
        });
    },

    // viewDNCompOngoingRejectResend: function (status) {
    //     logEvent(FA_VIEW_SCREEN, {
    //         [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
    //     });
    // },
    // viewDNCompOngoingRejectResendMenu: function (status) {
    //     logEvent(FA_OPEN_MENU, {
    //         [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
    //     });
    // },
    // viewDNCompOngoingRejectResendMenuSelection: function (status, selected) {
    //     logEvent(FA_SELECT_MENU, {
    //         [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
    //         [FA_ACTION_NAME]: selected,
    //     });
    // },
    viewDNCompOngoingMenuSelection: function (status, selected) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: `DuitNowRequest_View_${status}`,
            [FA_ACTION_NAME]: selected,
        });
    },

    viewAdditionalPopup: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "DuitNowRequest_ReviewDetails_AddRequest",
        });
    },
    viewTransactionHistory: function () {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit_TransactionHistory",
        });
    },

    //setup DuitNowRequest
    viewDNRSetupAmtToggel: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestAmount",
        });
    },

    //Add Favourite screen
    viewDNRAddFav: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AddFavourite",
        });
    },
    viewDNRAddFavConfirmation: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_AddFavourite_Confirmation",
        });
    },
    viewDNRAddFavSuccessful: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_AddFavourite_Successful",
        });
    },
    //payment success
    shareReceiptPayment: function (status, refundCheck) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: refundCheck
                ? `DuitNow_Refund${status}`
                : `DuitNow_Transaction${status}`,
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptPaymentSuccess: function (status, method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `DuitNow_Transaction${status}`,
            [FA_METHOD]: method,
        });
    },

    //Unsuccessful
    viewPaymentUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_PaymentUnsuccessful",
        });
    },
    formErrorPayment: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_PaymentUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //Request timeout
    viewPaymentTimeout: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RequestTimeout",
        });
    },
    formErrorPaymentTimeout: function (refId, data) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_RequestTimeout",
            [FA_TRANSACTION_ID]: refId,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },

    //Autodebit payment success
    viewADPaymentSuccess: function (status = "Successful") {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
        });
    },
    formCompleteADPayment: function (status, refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
            [FA_TRANSACTION_ID]: refId,
        });
    },
    shareReceiptADPayment: function (status) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptADPaymentSuccess: function (status, method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: `DuitNowRequest_AutoDebitPayment${status}`,
            [FA_METHOD]: method,
        });
    },

    //AD Setup successful
    viewADSetupSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
        });
    },
    formSuccessADSetup: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    shareReceiptADSetup: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    shareReceiptADSetupSuccess: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpSuccessful",
            [FA_METHOD]: method,
        });
    },

    //AD Setup Unsuccessful
    viewADSetupUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpUnSuccessful",
        });
    },
    formErrorADSetup: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoDebitSetUpUnSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //AB Setup successful
    viewABSetupSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpSuccessful",
        });
    },
    formCompleteABSetup: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //AB Setup Unsuccessful
    viewABSetupUnSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpUnSuccessful",
        });
    },
    formErrorABSetup: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNowRequest_AutoBillSetUpUnSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    disableAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNowRequest_DisableDuitNowAutoDebit",
        });
    },

    //Block request
    blockRequester: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_BlockDNR",
        });
    },
    selectBlockDuitNowRequest: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Block Request",
        });
    },
    blockRequesterSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_BlockDNR_Successful",
        });
    },

    //Reject request DuitNow
    rejectRequest: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_RejectRequest",
        });
    },
    rejectRequestSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_RejectDNR_Successful",
        });
    },

    //Forward
    selectForwardMenu: function () {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: "DuitNow_DNR",
            [FA_ACTION_NAME]: "Forward Request",
        });
    },
    viewForward: function (status) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: status ? "DuitNow_ForwardSuccessful" : "DuitNow_ForwardUnsuccessful",
        });
    },
    formSuccessForward: function (refId, data, status) {
        logEvent(status ? FA_FORM_COMPLETE : FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: status ? "DuitNow_ForwardSuccessful" : "DuitNow_ForwardUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
            [FA_FIELD_INFORMATION]: `dn_type: ${data.type}, frequency: ${data.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data.productName}, num_request: ${data.numRequest}`,
        });
    },

    //share receipt for All DuitNow
    viewDuitNowShareReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_Receipt",
        });
    },

    //Settings

    // selectAccountDNSettings: function () {   //no longer applicable; kiv
    //     logEvent(FA_SELECT_ACTION, {
    //         [FA_SCREEN_NAME]: "Settings_DuitNow",
    //         [FA_ACTION_NAME]: "Select DuitNow ID",
    //     });
    // },
    // selectADDNSettings: function () {   //no longer applicable; kiv
    //     logEvent(FA_SELECT_ACTION, {
    //         [FA_SCREEN_NAME]: "Settings_DuitNow",
    //         [FA_ACTION_NAME]: "DuitNow AutoDebit",
    //     });
    // },
    // selectBLDNSettings: function () {   //no longer applicable; kiv
    //     logEvent(FA_SELECT_ACTION, {
    //         [FA_SCREEN_NAME]: "Settings_DuitNow",
    //         [FA_ACTION_NAME]: "Blocked Request ID",
    //     });
    // },

    viewDNADSettings: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit",
        });
    },
    selectDNADSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit",
            [FA_ACTION_NAME]: "Select DuitNow ID",
        });
    },
    viewDNADViewSettings: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_View",
        });
    },
    cancelDNADViewSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_View",
            [FA_ACTION_NAME]: "Cancel AutoDebit",
        });
    },
    switchDNADViewSettings: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit_View",
            [FA_ACTION_NAME]: "Switch Account",
        });
    },
    settingsCancelAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_CancelAutoDebit",
        });
    },
    settingsCancelSuccessAD: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_CancelAutoDebit",
        });
    },
    settingsSwitchACAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SwitchAutoDebitAccount",
        });
    },
    settingsReviewAD: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_ReviewDetails",
        });
    },
    settingsViewSwitchAC: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SuccessfullySwitchedAccount",
        });
    },
    settingsViewSwitchACSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_SuccessfullySwitchedAccount",
        });
    },
    settingsUnblock: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_UnblockDNR",
        });
    },
    settingsUnblockSuccess: function () {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_UnblockDNR_Successful",
        });
    },
    settingsUnblockUnsuccess: function () {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_UnblockDNR_Unsuccessful",
        });
    },

    //New Redirect Online Banking autodebit
    duitNowOnlineBankingReview: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Duitnow_OnlineBanking_ReviewDetails",
        });
    },
    duitNowOnlineBankingFormProceed: function (data) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Duitnow_OnlineBanking_ReviewDetails",
            [FA_FIELD_INFORMATION]: `autodebit: ${data.autodebit}, frequency: ${data.frequency}, edit_amount: ${data.edit_amount}, cancellation: ${data.cancellation}`,
            [FA_FIELD_INFORMATION_2]: `payment_method: ${data.payment_method}`,
            [FA_FIELD_INFORMATION_3]: `product_name: ${data.product_name}`,
        });
    },
    duitNowOnlineBankingPaymentSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentSuccessful",
        });
    },
    duitNowOnlineBankingPaymentSuccessForm: function (refId, data) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentSuccessful",
            [FA_TRANSACTION_ID]: refId,
            [FA_FIELD_INFORMATION]: `type: ${data?.type}, frequency: ${data?.frequency}`,
            [FA_FIELD_INFORMATION_2]: `product_name: ${data?.productName}, num_request: ${data?.numRequest}`,
        });
    },
    duitNowOnlineBankingPaymentSuccessReceipt: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "DuitNow_PaymentSuccessful",
            [FA_ACTION_NAME]: SHARE_RECEIPT,
        });
    },
    duitNowOnlineBankingPaymentReject: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentRejected",
        });
    },
    duitNowOnlineBankingPaymentRejectForm: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_PaymentRejected",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    duitNowOnlineBankingPaymentReqTimeout: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_RequestTimeout",
        });
    },
    duitNowOnlineBankingPaymentReqTimeoutForm: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_OnlineBanking_RequestTimeout",
            [FA_TRANSACTION_ID]: refId,
        });
    },

    //rtp Online Banking
    onlineBankingSuccess: function (status = "Successful") {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: `Pay_OnlineBanking_Payment${status}`,
        });
    },
    onlineBankingFormComplete: function (status, refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: `Pay_OnlineBanking_Payment${status}`,
            [FA_TRANSACTION_ID]: refId,
        });
    },
    onlineBankingShare: function (status) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: `Pay_OnlineBanking_Payment${status}`,
            [FA_TRANSACTION_ID]: SHARE_RECEIPT,
        });
    },

    //settings Duitnow
    viewDNSettingsDashboard: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings",
            [FA_TAB_NAME]: "Maybank",
        });
    },
    selectDNSettingsDashboard: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings",
            [FA_TAB_NAME]: "Maybank",
            [FA_ACTION_NAME]: "DuitNow",
        });
    },
    //settings Duitnow Switch Account
    viewDNSettingsAutoDebit: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AutoDebit",
        });
    },
    viewDNSettingsSwitchAcc: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AD_ViewAD",
        });
    },
    selectDNSettingsSwitchAcc: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_AD_ViewAD",
            [FA_ACTION_NAME]: "Cancel AutoDebit",
        });
    },
    viewDNSettingsSwitchAccSelect: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_SelectAccount",
        });
    },
    viewDNSettingsSwitchAccReviewDetails: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchAccount_ReviewDetails",
        });
    },
    viewDNSettingsSwitchAccAckError: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchUnsuccessful",
        });
    },
    formDNSettingsSwitchAccAckError: function (refId) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchUnsuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    viewDNSettingsSwitchAccAckSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchSuccessful",
        });
    },
    formDNSettingsSwitchAccAckSuccess: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "DuitNow_SwitchSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    //settings Duitnow Blocked
    viewDNSettingsBlockedList: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_BlockedList",
        });
    },

    //Setup Online Banking
    onlineBankingSetupSuccess: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_AutoDebitPaymentSetUpSuccessful",
        });
    },
    onlineBankingSetupFormComplete: function (refId) {
        logEvent(FA_FORM_COMPLETE, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_AutoDebitPaymentSetUpSuccessful",
            [FA_TRANSACTION_ID]: refId,
        });
    },
    onlineBankingSetupShare: function () {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_AutoDebitPaymentSetUpSuccessful",
            [FA_TRANSACTION_ID]: SHARE_RECEIPT,
        });
    },

    //Share
    onlineBankingReceipt: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_Receipt",
        });
    },
    onlineBankingReceiptMethod: function (method) {
        logEvent(FA_SHARE, {
            [FA_SCREEN_NAME]: "Pay_OnlineBanking_Receipt",
            [FA_METHOD]: method,
        });
    },

    //Dashboard
    viewDashboard: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tabName,
        });
    },
    selectionDashboard: function (tabName, selectedOption) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: selectedOption,
        });
    },
    selectRequest: function (tabName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tabName,
            [FA_ACTION_NAME]: FA_SELECT_REQUEST,
        });
    },
    regDNADDashboard: function (tabName) {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Settings_DuitNow_RegisterDNAD",
        });
    },
    //View All Requests
    viewDashboardRequests: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_Requests",
        });
    },
    //View All DuitNow
    viewDashboardDuitNow: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowRequests",
        });
    },
    //View All AutoDebit
    viewDashboardAutoDebit: function () {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "SendRequest_DuitNowAutoDebit",
        });
    },

    // Dashboard Selection
    selectionDashboardWidget: function (tab, selectedOption) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: FA_M2U_SENDREQUEST_MONEY,
            [FA_TAB_NAME]: tab,
            [FA_ACTION_NAME]: selectedOption,
        });
    },
};
