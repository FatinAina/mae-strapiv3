import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import {
    EmployeeDetailsPrefiller,
    PersonalDetailsPrefiller,
} from "@screens/ZestCASA/helpers/CustomerDetailsPrefiller";
import {
    listOfNonMAEAccounts,
    handleOnboardedUser,
    identifyUserStatus as zestIdentifyUserStatus,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import { bankingGetDataMayaM2u, invokeL3 } from "@services";
import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import {
    IS_PM1_ACTION,
    IS_PMA_ACTION,
    IS_KAWANKU_SAVINGS_ACTION,
    IS_KAWANKU_SAVINGS_I_ACTION,
    IS_CASA_STP_ACTION,
    IS_PRODUCT_NAME_ACTION,
} from "@redux/actions/ZestCASA/entryAction";
import { SELECT_CASA_CLEAR } from "@redux/actions/ZestCASA/selectCASAAction";
import {
    UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
    GET_ACCOUNT_LIST_CLEAR,
} from "@redux/actions/services/getAccountListAction";
import {
    PREPOSTQUAL_UPDATE_USER_STATUS,
    PREPOSTQUAL_CLEAR,
} from "@redux/actions/services/prePostQualAction";
import { checkDownTimePremier } from "@redux/services/CasaSTP/apiCheckDownTime";
import { checkFPXTransactionAndActivateAccount } from "@redux/services/CasaSTP/apiCheckFPXTransactionAndActivateAccount";
import { getMasterDataPremier } from "@redux/services/CasaSTP/apiMasterData";
import { prePostQualPremier } from "@redux/services/CasaSTP/apiPrePostQual";
import { getMasterData as zestGetMasterData } from "@redux/services/apiMasterData";
import { zestActivateAccountBody } from "@redux/utilities/actionUtilities";

import {
    PREMIER_CLEAR_ALL,
    PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
    MYKAD_CODE,
    CASA_STP_UNIDENTIFIED_USER,
    CASA_STP_NTB_USER,
    CASA_STP_DRAFT_USER,
    CASA_STP_DRAFT_BRANCH_USER,
    CASA_STP_FULL_ETB_USER,
    CASA_STP_WITHOUT_M2U_USER,
    CASA_STP_M2U_ONLY_USER,
    CASA_STP_DEBIT_CARD_NTB_USERS,
} from "@constants/casaConfiguration";
import * as casaFundConstant from "@constants/casaFundConstant";
import {
    PM1,
    PMA,
    KAWANKU_SAVINGS_PRODUCT_NAME,
    KAWANKU_SAVINGSI_PRODUCT_NAME,
    KAWANKU_SAVINGS_ACCOUNT_NAME,
    SAVINGS_ACCOUNT_I,
    PRODUCT_NAME_PM1,
    PRODUCT_NAME_PMA,
    PRODUCT_NAME_KAWANKU,
    PRODUCT_NAME_SAI,
    PM1_PRODUCT_NAME,
    PMA_PRODUCT_NAME,
    CASA_STP_PRODUCTS,
    EVENT_KAWANKU,
    EVENT_SAVING_I,
} from "@constants/casaStrings";
import {
    PREMIER_PRE_POST_ETB,
    PREMIER_RESUME_CUSTOMER_INQUIRY_ETB,
    PREMIER_CHECK_DOWNTIME_DEBIT_CARD,
} from "@constants/casaUrl";
import { M2U, S2U_PUSH, SMS_TAC, S2U_PULL } from "@constants/data";
import {
    ACTIVATION_SUCCESSFUL,
    VERIFICATION_UNSUCCESSFUL,
    COMMON_ERROR_MSG,
    ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_DESCRIPTION,
    ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_TITLE,
    ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
    ZEST_CASA_ACCOUNT_ACTIVATE_FAILED,
    RETRY,
    ALREADY_HAVE_ACCOUNT_ERROR,
    ZEST_08_ACC_TYPE_ERROR,
    AUTHORISATION_FAILED,
    ACCOUNT_LIST_NOT_FOUND_MESSAGE,
    ZEST_ACCOUNT_NAME_MATCH_VERIFACATION_UNSCCESFUL_DESCRIPTION,
} from "@constants/strings";
import { ZEST_CASA_CLEAR_ALL, ZEST_DEBIT_CARD_USER } from "@constants/zestCasaConfiguration";

import * as ModelClass from "@utils/dataModel/modelClass";
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import * as Utility from "@utils/dataModel/utility";

import {
    APPLY_INTRO_SCREEN,
    APPLY_IDENTITY_TYPE,
    APPLY_PERSONAL_DETAILS,
    APPLY_EMPLOYMENT_DETAILS,
    APPLY_ADDITIONAL_DETAILS,
    APPLY_ACCOUNT_DETAILS,
    APPLY_DECLARATION_EVENT,
    APPLY_CONFIRMATION_EVENT,
    APPLY_OTPVERIFICATION_SUCCESSFUL,
    APPLY_ACTIVATE_PROCEEDTOACTIVATE,
    APPLY_ACTIVATED_START_EKYC,
    APPLY_RESIDENTIAL_ETB_DETAILS,
    APPLY_RESIDENTIAL_DETAILS,
    APPLY_ACTIVATED_TRANSFER_TO_ACTIVATES,
    APPLY_SELECT_CASA_REVIEWDETAILS,
    APPLY_ACTIVATED_OTPVERIFICATION_SUCCESSFUL,
    APPLY_ACTIVATED_OTPVERIFICATION_UNSUCCESSFUL,
    APPLY_PREFER_BRANCH,
} from "./AnalyticsEventConstants";

export let sessionExtnInterval;
export let FPX_AR_MSG_DATA = [];
const path = "/summary?type=A";

export function identifyUserStatusPremier(
    customerStatus,
    branchApprovalStatusCode,
    m2uIndicator,
    productName,
    onBoardingIndicatorCode
) {
    FPX_AR_MSG_DATA = [];
    FPX_AR_MSG_DATA = [];
    const casaProducts = CASA_STP_PRODUCTS;
    if (customerStatus) {
        if (m2uIndicator === "3" && casaProducts.includes(productName)) {
            return CASA_STP_DRAFT_BRANCH_USER;
        }
        // Flow: Fill in all details => Confirmation => Account Creation => M2U ID Creation => eKYC => Activate via FPX (with name matching)
        if (customerStatus === "1" && m2uIndicator === "0" && casaProducts.includes(productName)) {
            return CASA_STP_NTB_USER;
        }

        // Flow: M2U Login => Pre-fill all details => Confirmation => CASA Transfer => Secure2U Authentication
        if (customerStatus === "0" && m2uIndicator === "2" && casaProducts.includes(productName)) {
            return CASA_STP_FULL_ETB_USER;
        }

        // redirect to M2U Id creation
        if (
            m2uIndicator === "0" &&
            onBoardingIndicatorCode === "FULL" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_WITHOUT_M2U_USER;
        }

        // Flow: M2U Login => Activate via FPX (without name matching)
        if (
            customerStatus === "0" &&
            m2uIndicator === "1" &&
            branchApprovalStatusCode !== "DRFT" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_M2U_ONLY_USER;
        }

        // Flow: NTB Resume Flow
        if (
            customerStatus === "0" &&
            m2uIndicator === "1" &&
            branchApprovalStatusCode === "DRFT" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_DRAFT_USER;
        }

        // Flow: Draft User
        if (
            customerStatus === "0" &&
            m2uIndicator === "0" &&
            branchApprovalStatusCode === "DRFT" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_DRAFT_USER;
        }

        // Flow: Visit branch
        if (
            customerStatus === "0" &&
            m2uIndicator === "0" &&
            branchApprovalStatusCode !== "DRFT" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_DRAFT_BRANCH_USER;
        }
    } else if (m2uIndicator) {
        if (m2uIndicator === "3" && casaProducts.includes(productName)) {
            return CASA_STP_DRAFT_BRANCH_USER;
        }
        // Flow: NTB Resume Flow
        if (
            m2uIndicator === "1" &&
            branchApprovalStatusCode === "DRFT" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_DRAFT_USER;
        }

        // redirect to M2U Id creation
        if (
            m2uIndicator === "0" &&
            onBoardingIndicatorCode === "FULL" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_WITHOUT_M2U_USER;
        }

        // Flow: Visit branch
        if (
            m2uIndicator === "0" &&
            branchApprovalStatusCode === "DRFT" &&
            casaProducts.includes(productName)
        ) {
            return CASA_STP_DRAFT_BRANCH_USER;
        }
    } else {
        if (casaProducts.includes(productName)) {
            return CASA_STP_NTB_USER;
        }
    }
}

export const initSessionExtension = (navigation, reducer) => {
    console.log("[PmaAccountNumberEntry] >> [initSessionExtension]");
    try {
        let counter = 1;
        sessionExtnInterval = setInterval(function () {
            console.log("[initSessionExtension] >> Counter: " + counter);

            if (counter < 4) {
                console.log("[initSessionExtension] >> Counter timer reset");
                counter++;
            } else {
                console.log("[initSessionExtension] >> Counter limit reached - Clear interval");

                // Navigate back to select bank screen
                navigation.navigate(navigationConstant.PREMIER_SELECT_FPX_BANK);
                // Clear interval
                clearInterval(sessionExtnInterval);

                // Force session timeout
                // IdleManager.forceTimeOut();

                // Remove loader if any
            }
        }, 3500 * 60); // Interval of 3 and half min
    } catch (e) {
        console.log("[PmaAccountNumberEntry][initSessionExtension] >> Exception: ", e);
    }
};

export const updatedViewPartyBody = (
    viewPartyResult,
    personalDetailsReducer,
    residentialDetailsReducer,
    employmentDetailsReducer,
    prePostQualReducer,
    productName
) => {
    return {
        ...viewPartyResult,
        txRefNo: prePostQualReducer.txRefNo,
        mobPhoneNumber: personalDetailsReducer.mobileNumberWithoutExtension,
        homeAddr1: residentialDetailsReducer.addressLineOne,
        homeAddr2: residentialDetailsReducer.addressLineTwo,
        homeAddr3: residentialDetailsReducer.addressLineThree,
        homePostCode: residentialDetailsReducer.postalCode,
        homeStateCode: residentialDetailsReducer.stateValue?.value,
        homeStateValue: residentialDetailsReducer.stateValue?.name,
        homeCity: residentialDetailsReducer.city,
        employerName: employmentDetailsReducer.employerName,
        occupationCode: employmentDetailsReducer.occupationValue?.value,
        occupationValue: employmentDetailsReducer.occupationValue?.name,
        occupationSectorCode: employmentDetailsReducer.sectorValue?.value,
        occupationSectorValue: employmentDetailsReducer.sectorValue?.name,
        employmentTypeCode: employmentDetailsReducer.employmentTypeValue?.value,
        employmentTypeValue: employmentDetailsReducer.employmentTypeValue?.name,
        grossIncomeRangeCode: employmentDetailsReducer.monthlyIncomeValue?.value,
        grossIncomeRangeValue: employmentDetailsReducer.monthlyIncomeValue?.name,
        sourceOfFundCountry: employmentDetailsReducer.incomeSourceValue?.value,
        sourceOfFundCountryValue: employmentDetailsReducer.incomeSourceValue?.name,
        productName,
    };
};

export const invokeFPXAuthReq = (dispatch, props, params, reducer, isZestApplyDebitCardEnable) => {
    const { navigation } = props;

    console.log("[PmaAccountNumberEntry] >> [invokeFPXAuthReq]");
    try {
        const invalidFormFields = [
            "isSuccessful",
            "statusCode",
            "statusDesc",
            "actionURL",
            "returnURL",
        ];
        const actionURL = params.actionURL;

        if (!Utility.isEmpty(actionURL)) {
            const returnURL = params.returnURL;

            let inputString = "";
            for (const i in params) {
                // Exclude unnecesary params & send only FPX ones
                if (invalidFormFields.indexOf(i) === -1) {
                    console.log(
                        "%c" + i + " : " + "%c" + params[i],
                        "font-weight:bold",
                        "font-style: italic"
                    );
                    inputString +=
                        '<input type="hidden" name="' + i + '" value="' + params[i] + '" />';
                    FPX_AR_MSG_DATA[i] = params[i];
                }
            }

            const pageContent =
                '<html><head></head><body><form id="loginForm" name="theForm" action="' +
                actionURL +
                '" method="post">' +
                inputString +
                '</form> <script type="text/javascript">document.getElementById("loginForm").submit();</script></body></html>';

            // Open WebView
            openWebView(dispatch, navigation, reducer, pageContent, returnURL, () => {
                // Clear interval
                clearSessionExtnInterval();

                fPXTransactionAndActivateAccount(
                    dispatch,
                    navigation,
                    reducer,
                    isZestApplyDebitCardEnable
                );
            });
            // Call method to init session extension
            initSessionExtension(navigation, reducer);
        } else {
            // If no actionURL, then display error msg
            showErrorPopup(COMMON_ERROR_MSG);
        }
    } catch (e) {
        console.log("[PmaAccountNumberEntry][invokeFPXAuthReq] >> Exception: ", e);
    }
};

const fPXTransactionAndActivateAccount = (
    dispatch,
    navigation,
    reducer,
    isZestApplyDebitCardEnable
) => {
    const checkFPXBody = {
        inputType: "fpx",
        msgType: "AR",
        fpxSellerOrderNo: FPX_AR_MSG_DATA.fpx_sellerOrderNo,
        acctNo: reducer.acctNo,
        // accountNumber,
        accountType: null,
        fpxBuyerEmail: reducer.customerEmail ?? reducer.emailAddress,
        m2uInd: reducer.m2uIndicator,
    };
    const dataActivateAccount = zestActivateAccountBody(reducer);
    const data = {
        fpxInquiryReq: checkFPXBody,
        activateAccountReq: { ...dataActivateAccount, productName: reducer.productName },
    };
    // Call Check FPX transaction API
    dispatch(
        checkFPXTransactionAndActivateAccount(
            data,
            (response, isRetry, refNo, dateTime, retryCount) => {
                if (response) {
                    if (isZestApplyDebitCardEnable) {
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_SUCCESS, {
                            title: ACTIVATION_SUCCESSFUL,
                            description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                            isSuccessfulAccountActivation: true,
                            accountNumber: reducer.acctNo,
                            dateAndTime: dateTime,
                            accountType: geAccountNameByEntryReducer(reducer.productName),
                            productName: reducer.productName,
                            referenceId: refNo ?? "",
                            analyticScreenName: getAnalyticScreenName(
                                reducer.productName,
                                navigationConstant.PREMIER_ACTIVATION_SUCCESS,
                                ""
                            ),
                            onDoneButtonDidTap: () => {
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            onApplyDebitCardButtonDidTap: () => {
                                const screenName = getAnalyticScreenName(
                                    reducer.productName,
                                    navigationConstant.PREMIER_ACTIVATION_SUCCESS,
                                    ""
                                );
                                GACasaSTP.onApplyDebitCardButtonDidTap(screenName);
                                dispatch(
                                    checkDownTimePremier(PREMIER_CHECK_DOWNTIME_DEBIT_CARD, () => {
                                        navigation.navigate(
                                            navigationConstant.PREMIER_ACTIVATION_SUCCESS
                                        );
                                        navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                                            screen: navigationConstant.ZEST_CASA_SELECT_DEBIT_CARD,
                                            params: {
                                                isFromActivationSuccess: true,
                                            },
                                        });
                                    })
                                );
                            },
                            needFormAnalytics: true,
                            debitCardStatusCode: response.debitCardStatusCode,
                        });
                    } else {
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_SUCCESS, {
                            title: ACTIVATION_SUCCESSFUL,
                            description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                            isSuccessfulAccountActivation: true,
                            accountNumber: reducer.acctNo,
                            dateAndTime: dateTime,
                            accountType: geAccountNameByEntryReducer(reducer.productName),
                            productName: reducer.productName,
                            referenceId: refNo ?? "",
                            analyticScreenName: getAnalyticScreenName(
                                reducer.productName,
                                navigationConstant.PREMIER_ACTIVATION_SUCCESS,
                                ""
                            ),
                            onDoneButtonDidTap: () => {
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            needFormAnalytics: true,
                        });
                    }
                } else {
                    if (isRetry) {
                        // Navigate to select bank again
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_FAILURE, {
                            title: ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_TITLE,
                            description:
                                retryCount === 1
                                    ? ZEST_ACCOUNT_VERIFACATION_UNSCCESFUL_DESCRIPTION
                                    : ZEST_ACCOUNT_NAME_MATCH_VERIFACATION_UNSCCESFUL_DESCRIPTION,
                            dateAndTime: dateTime,
                            doneButtonText: RETRY,
                            retryCount,
                            isDebitCardSuccess: false,
                            onDoneButtonDidTap: () => {
                                navigation.navigate(navigationConstant.PREMIER_SELECT_FPX_BANK);
                            },
                            accountNumber: retryCount > 2 ? reducer.acctNo : "",
                            referenceId: retryCount > 2 ? refNo : "",
                            analyticScreenName: getAnalyticScreenName(
                                reducer.productName,
                                navigationConstant.PREMIER_ACTIVATION_FAILURE,
                                ""
                            ),
                            onCancelButtonDidTap: () => {
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            needFormAnalytics: true,
                        });
                    } else {
                        //Navigate to error screen
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_FAILURE, {
                            title: VERIFICATION_UNSUCCESSFUL,
                            description: ZEST_CASA_ACCOUNT_ACTIVATE_FAILED,
                            accountNumber: reducer.acctNo,
                            referenceId: "",
                            dateAndTime: dateTime,
                            accountType: geAccountNameByEntryReducer(reducer.productName),
                            isDebitCardSuccess: false,
                            analyticScreenName: getAnalyticScreenName(
                                reducer.productName,
                                navigationConstant.PREMIER_ACTIVATION_FAILURE,
                                ""
                            ),
                            onDoneButtonDidTap: () => {
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            needFormAnalytics: true,
                        });
                    }
                }
            }
        )
    );
};

export const openWebView = (
    dispatch,
    navigation,
    reducer,
    htmlContent,
    returnURL,
    exitCallback
) => {
    console.log("[ZestCASAAccountNumberEntry] >> [openWebView]");
    try {
        ModelClass.WEBVIEW_DATA.url = htmlContent;
        ModelClass.WEBVIEW_DATA.isHTML = true;
        ModelClass.WEBVIEW_DATA.share = false;
        ModelClass.WEBVIEW_DATA.showBack = true;
        ModelClass.WEBVIEW_DATA.showClose = true;
        ModelClass.WEBVIEW_DATA.type = "url";
        ModelClass.WEBVIEW_DATA.route = navigationConstant.ZEST_CASA_ENTRY;
        ModelClass.WEBVIEW_DATA.module = navigationConstant.ZEST_CASA_STACK;
        ModelClass.WEBVIEW_DATA.title = "FPX";
        ModelClass.WEBVIEW_DATA.pdfType = "shareReceipt";
        ModelClass.WEBVIEW_DATA.noClose = true;
        ModelClass.WEBVIEW_DATA.callbackHandled = false;

        // Close button handler
        ModelClass.WEBVIEW_DATA.onClosePress = () => {
            console.log("[ZestCASAAccountNumberEntry][openWebView] >> [onClosePress]");
            if (exitCallback && !ModelClass.WEBVIEW_DATA.callbackHandled) {
                exitCallback();
                ModelClass.WEBVIEW_DATA.callbackHandled = true;
            }
        };

        // Added this to fix missing loader during enquiry call
        ModelClass.WEBVIEW_DATA.onLoad = () => {};

        // Navigation state handler
        ModelClass.WEBVIEW_DATA.onLoadEnd = (webViewState) => {
            webViewState = webViewState.nativeEvent;

            if (webViewState) {
                console.log(
                    "[ZestCASAAccountNumberEntry][openWebView][onLoadEnd] >> webViewState: ",
                    webViewState
                );
                const url = webViewState.url;
                if (
                    url &&
                    url.match(returnURL) &&
                    exitCallback &&
                    !ModelClass.WEBVIEW_DATA.callbackHandled
                ) {
                    exitCallback();
                    ModelClass.WEBVIEW_DATA.callbackHandled = true;
                }
            }
        };

        // Open WebView
        navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.WEBVIEW_INAPP_SCREEN,
        });
    } catch (e) {
        console.log("[ZestCASAAccountNumberEntry][openWebView] >> Exception: ", e);
    }
};

export const clearSessionExtnInterval = () => {
    console.log("[ZestCASAAccountNumberEntry] >> [clearSessionExtnInterval]");
    try {
        if (sessionExtnInterval) {
            clearInterval(sessionExtnInterval);
        }
    } catch (e) {
        console.log("[ZestCASAAccountNumberEntry][clearSessionExtnInterval] >> Exception: ", e);
    }
};

export const showErrorPopup = (msg) => {
    console.log("[ZestCASAAccountNumberEntry] >> [showErrorPopup]");
    try {
        showErrorToast({
            message: msg,
        });
    } catch (e) {
        console.log("[TopUpAmount][showErrorPopup] >> Exception: ", e);
    }
};

export const shouldGoToActivationPendingScreen = (accountsList) => {
    let usableAccount = null;

    if (accountsList.length > 0) {
        accountsList.forEach((account) => {
            if (
                account.group === "C1D" ||
                account.type === "C1" ||
                account.group === "0HD" ||
                account.type === "OH"
            ) {
                usableAccount = account;
            }
        });
    }

    return !!usableAccount;
};

export function isUnidentifiedUser(userStatus) {
    if (userStatus && CASA_STP_UNIDENTIFIED_USER.includes(userStatus)) {
        return true;
    }
}

export function isWithoutM2UUser(userStatus) {
    if (userStatus && userStatus === CASA_STP_WITHOUT_M2U_USER) {
        return true;
    }
}

export function isM2UOnlyUser(userStatus) {
    if (userStatus && userStatus === CASA_STP_M2U_ONLY_USER) {
        return true;
    }
}

export function isDraftUser(userStatus) {
    if (userStatus && userStatus === CASA_STP_DRAFT_USER) {
        return true;
    }
}

export function isDraftBranchUser(userStatus) {
    if (userStatus && userStatus === CASA_STP_DRAFT_BRANCH_USER) {
        return true;
    }
}

export function isNTBUser(userStatus) {
    if (
        userStatus &&
        (userStatus === CASA_STP_NTB_USER ||
            userStatus === ZEST_DEBIT_CARD_USER ||
            CASA_STP_DEBIT_CARD_NTB_USERS.includes(userStatus))
    ) {
        return true;
    }
}

export function isETBUser(userStatus, entryReducer) {
    if (
        userStatus !== CASA_STP_NTB_USER &&
        userStatus !== CASA_STP_DRAFT_USER &&
        userStatus !== CASA_STP_DRAFT_BRANCH_USER &&
        !isNTBUser(userStatus)
    ) {
        return true;
    }
}

function getUpdatedStatusByEntryReducer() {
    return CASA_STP_FULL_ETB_USER;
}

function navigateBasedOnProduct(navigation, entryReducer) {
    if (entryReducer.isPMA) {
        navigation.navigate(navigationConstant.PREMIER_SUITABILITY_ASSESSMENT);
    } else {
        navigation.navigate(navigationConstant.PREMIER_RESIDENTIAL_DETAILS);
    }
}

export function userStatusBasedAnalyticsName(userStatus, ntbUserScreenName, etbUserScrenName) {
    if (userStatus === CASA_STP_NTB_USER) {
        GACasaSTP.onPremierActivation(ntbUserScreenName);
    } else if (userStatus === CASA_STP_DRAFT_USER || userStatus === CASA_STP_FULL_ETB_USER) {
        GACasaSTP.onPremierActivation(etbUserScrenName);
    }
}

export const callPremierPrequalPostLogin = (
    navigation,
    dispatch,
    identityDetailsReducer,
    productName,
    callback
) => {
    const data = {
        idType: MYKAD_CODE,
        birthDate: "",
        preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
        icNo: identityDetailsReducer.identityNumber,
        productName,
    };
    dispatch(
        prePostQualPremier(
            PREMIER_RESUME_CUSTOMER_INQUIRY_ETB,
            data,
            (result, userStatus, exception) => {
                if (result) {
                    if (callback) {
                        callback(result, userStatus);
                    }
                } else {
                    if (exception) {
                        const { statusCode } = exception;

                        if (statusCode === "4774") {
                            showErrorToast({
                                message: ALREADY_HAVE_ACCOUNT_ERROR,
                            });
                            navigation.navigate(navigationConstant.MORE, {
                                screen: navigationConstant.APPLY_SCREEN,
                            });
                        } else if (statusCode === "6608") {
                            showErrorToast({
                                message: ZEST_08_ACC_TYPE_ERROR,
                            });
                            navigation.navigate(navigationConstant.MORE, {
                                screen: navigationConstant.APPLY_SCREEN,
                            });
                        } else if (statusCode === "6610") {
                            navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        } else {
                            dispatch({ type: PREMIER_CLEAR_ALL });
                            navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        }
                    }
                }
            }
        )
    );
};

export const callGetAccountsListService = async (
    isDraftNTB,
    dispatch,
    callback,
    userStatus = ""
) => {
    try {
        const response = await bankingGetDataMayaM2u(path, false);

        if (response && response.data && response.data.code === 0) {
            const { accountListings, maeAvailable } = response.data.result;

            if (accountListings && accountListings.length) {
                listOfNonMAEAccounts(accountListings, (listOfNonMAEAccounts) => {
                    if (listOfNonMAEAccounts.length > 0) {
                        dispatch({
                            type: UPDATE_ACCOUNT_LIST_AND_MAE_STATUS_ACTION,
                            accountListings,
                            maeAvailable,
                        });

                        if (isDraftNTB && callback) {
                            callback(accountListings);
                        }
                    }
                });
            }
        }
    } catch (error) {
        return showErrorToast({
            message: "We are unable to fetch a list of your accounts",
        });
    }
};

export const callETBInquiry = (naviagation, dispatch, productName, callback) => {
    const data = {
        idType: "",
        birthDate: "",
        preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
        icNo: "",
        productName,
    };
    dispatch(
        prePostQualPremier(PREMIER_PRE_POST_ETB, data, (result, userStatus, exception) => {
            callback(result, userStatus, exception);
        })
    );
};

export const handlePremierResumeFlow = (
    navigation,
    dispatch,
    identityDetailsReducer,
    entryReducer
) => {
    callPremierPrequalPostLogin(
        navigation,
        dispatch,
        identityDetailsReducer,
        entryReducer?.productName,
        (result, userStatus) => {
            if (result) {
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_PENDING);
                    },
                    getUpdatedStatusByEntryReducer()
                );
            }
        }
    );
};

export const handleZestResumeOnboarding = async (navigation, identityNumber) => {
    try {
        const response = await bankingGetDataMayaM2u(path, false);
        if (response && response.data && response.data.code === 0) {
            const { accountListings } = response.data.result;

            if (accountListings && accountListings.length) {
                navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                    screen: shouldGoToActivationPendingScreen(accountListings)
                        ? navigationConstant.ZEST_CASA_ACTIVATION_PENDING
                        : navigationConstant.ZEST_CASA_ACCOUNT_NOT_FOUND,
                    params: {
                        identityNumber,
                        accountListings,
                    },
                });
            }
        }
    } catch (e) {
        console.log(e);
    }
};

export const handlePremierETBFlow = (navigation, dispatch, masterDataReducer, entryReducer) => {
    const productName = entryReducer?.productName;
    callETBInquiry(navigation, dispatch, productName, (result, userStatus, exception) => {
        if (result) {
            if (isUnidentifiedUser(userStatus)) {
                return showErrorToast({
                    message: "We currently have not opened application for you.",
                });
            }

            if (isETBUser(userStatus, entryReducer)) {
                prefillDetailsForExistingUser(dispatch, masterDataReducer, result);
                callGetAccountsListService(false, dispatch, null, userStatus);
                if (isM2UOnlyUser(userStatus)) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: getUpdatedStatusByEntryReducer(),
                    });
                }
                navigateBasedOnProduct(navigation, entryReducer);
            }
        } else {
            if (exception) {
                const { statusCode } = exception;

                if (statusCode === "4774") {
                    showErrorToast({
                        message: ALREADY_HAVE_ACCOUNT_ERROR,
                    });
                } else if (statusCode === "6608") {
                    showErrorToast({
                        message: ZEST_08_ACC_TYPE_ERROR,
                    });
                    navigation.navigate(navigationConstant.MORE, {
                        screen: navigationConstant.APPLY_SCREEN,
                    });
                } else if (statusCode === "6610") {
                    navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                        isVisitBranchMode: true,
                    });
                } else {
                    dispatch({ type: PREMIER_CLEAR_ALL });
                    navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                        isVisitBranchMode: true,
                    });
                }
            }
        }
    });
};

function prefillDetailsForExistingUser(dispatch, masterDataReducer, result) {
    PersonalDetailsPrefiller(dispatch, masterDataReducer, result);
    EmployeeDetailsPrefiller(dispatch, masterDataReducer, result);
}

export async function handleCasaUserWithoutM2U(m2uStatus, navigation) {
    if (m2uStatus === CASA_STP_WITHOUT_M2U_USER) {
        navigation.navigate(navigationConstant.ON_BOARDING_MODULE, {
            screen: navigationConstant.ON_BOARDING_M2U_USERNAME,
            params: {
                filledUserDetails: {
                    userTypeSend: CASA_STP_DRAFT_USER,
                },
                screenName: navigationConstant.PREMIER_ACTIVATION_PENDING,
            },
        });
    }
}

export const handlePremierTapFlow = (dispatch, props) => {
    dispatch({ type: ZEST_CASA_CLEAR_ALL });
    props.clearDownTimeReducer();
    props.clearMasterDataReducer();
    dispatch({ type: PREPOSTQUAL_CLEAR });
    props.clearEntryReducer();
};

export const handleOnboardedUserActivation = (
    dispatch,
    navigation,
    accountListings,
    identityNumber
) => {
    const url = PREMIER_RESUME_CUSTOMER_INQUIRY_ETB;
    const body = {
        idType: MYKAD_CODE,
        birthDate: "",
        preOrPostFlag: PREMIER_PRE_QUAL_POST_LOGIN_FLAG,
        icNo: identityNumber,
    };
    callPreQualService(dispatch, navigation, url, body, async (result) => {
        if (result) {
            const { productName } = result;
            if (productName === "zesti" || productName === "m2uPremier") {
                dispatch(zestGetMasterData());
                try {
                    const response = await bankingGetDataMayaM2u(path, false);
                    if (response && response.data && response.data.code === 0) {
                        const { accountListings } = response.data.result;

                        if (accountListings && accountListings.length) {
                            handleOnboardedUser(
                                dispatch,
                                navigation,
                                accountListings,
                                identityNumber
                            );
                        }
                    }
                } catch (error) {
                    return showErrorToast({
                        message: ACCOUNT_LIST_NOT_FOUND_MESSAGE,
                    });
                }
            } else {
                dispatch(getMasterDataPremier());
                dispatch({ type: IS_CASA_STP_ACTION, isCASASTP: true });

                switch (productName) {
                    case PRODUCT_NAME_PM1: {
                        dispatch({ type: IS_PM1_ACTION, isPM1: true });
                        dispatch({ type: IS_PRODUCT_NAME_ACTION, productName: PM1_PRODUCT_NAME });
                        break;
                    }
                    case PRODUCT_NAME_PMA: {
                        dispatch({ type: IS_PMA_ACTION, isPMA: true });
                        dispatch({ type: IS_PRODUCT_NAME_ACTION, productName: PMA_PRODUCT_NAME });
                        break;
                    }
                    case PRODUCT_NAME_KAWANKU: {
                        dispatch({ type: IS_KAWANKU_SAVINGS_ACTION, isKawanku: true });
                        dispatch({
                            type: IS_PRODUCT_NAME_ACTION,
                            productName: KAWANKU_SAVINGS_PRODUCT_NAME,
                        });
                        break;
                    }
                    case PRODUCT_NAME_SAI: {
                        dispatch({ type: IS_KAWANKU_SAVINGS_I_ACTION, isKawankuSavingsI: true });
                        dispatch({
                            type: IS_PRODUCT_NAME_ACTION,
                            productName: KAWANKU_SAVINGSI_PRODUCT_NAME,
                        });
                        break;
                    }
                }

                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;

                if (code !== 0) return;
                callGetAccountsListService(
                    true,
                    dispatch,
                    () => {
                        navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                            screen: navigationConstant.PREMIER_ACTIVATION_PENDING,
                        });
                    },
                    CASA_STP_FULL_ETB_USER
                );
            }
        }
    });
};

async function callPreQualService(dispatch, navigation, extendedUrl, body, callback) {
    dispatch(
        prePostQualPremier(
            extendedUrl,
            body,
            (result, userStatus) => {
                const {
                    statusCode,
                    custStatus,
                    branchApprovalStatusCode,
                    m2uIndicator,
                    productName,
                    onboardingIndicatorCode,
                } = result;
                let updatedUserStatus = "";
                if (productName === "zesti" || productName === "m2uPremier") {
                    updatedUserStatus = zestIdentifyUserStatus(
                        custStatus,
                        branchApprovalStatusCode,
                        m2uIndicator
                    );
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: updatedUserStatus,
                    });
                    callback(result);
                    return;
                } else {
                    updatedUserStatus = identifyUserStatusPremier(
                        custStatus,
                        branchApprovalStatusCode,
                        m2uIndicator,
                        productName,
                        onboardingIndicatorCode
                    );
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: updatedUserStatus,
                    });
                }
                const statusCodes = ["4400", "6600", "3300"];

                if (
                    updatedUserStatus === CASA_STP_DRAFT_USER ||
                    updatedUserStatus === CASA_STP_WITHOUT_M2U_USER ||
                    updatedUserStatus === CASA_STP_DRAFT_USER ||
                    updatedUserStatus === CASA_STP_WITHOUT_M2U_USER
                ) {
                    callback(result);
                } else if (statusCodes.includes(statusCode)) {
                    navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                        screen: navigationConstant.PREMIER_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: true,
                        },
                    });
                } else {
                    navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                        screen: navigationConstant.PREMIER_ACCOUNT_NOT_FOUND,
                        params: {
                            isVisitBranchMode: false,
                        },
                    });
                }
            },
            true
        )
    );
}

/** Product specific conditions */
export const accountBasedOnModuleFlag = (productName, accountsList) => {
    if (!accountsList || accountsList.length === 0) return;
    if (productName === PM1_PRODUCT_NAME) {
        return accountsList.find((account) => account.group === "0DD");
    } else if (productName === PMA_PRODUCT_NAME) {
        return accountsList.find((account) => account.group === "0LD");
    } else if (productName === KAWANKU_SAVINGS_PRODUCT_NAME) {
        return accountsList.find((account) => account.group === "11S");
    } else if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME) {
        return accountsList.find((account) => account.group === "13S");
    } else {
        return accountsList.find((account) => account.group === "0HD" || account.type === "OH");
    }
};

export function getProductAccountType(reducer) {
    if (reducer.isPM1) {
        return PRODUCT_NAME_PM1;
    } else if (reducer.isPMA) {
        return PRODUCT_NAME_PMA;
    } else if (reducer.isKawanku) {
        return PRODUCT_NAME_KAWANKU;
    } else if (reducer.isKawankuSavingsI) {
        return PRODUCT_NAME_SAI;
    }
}

export function geAccountNameByEntryReducer(name) {
    if (name === PM1_PRODUCT_NAME) {
        return PM1;
    } else if (name === PMA_PRODUCT_NAME) {
        return PMA;
    } else if (name === KAWANKU_SAVINGS_PRODUCT_NAME) {
        return KAWANKU_SAVINGS_ACCOUNT_NAME;
    } else if (name === KAWANKU_SAVINGSI_PRODUCT_NAME) {
        return SAVINGS_ACCOUNT_I;
    }
}

export function getAnalyticProductName(productName) {
    switch (productName) {
        case CASA_STP_PRODUCTS[0]:
            return PRODUCT_NAME_PM1;

        case CASA_STP_PRODUCTS[1]:
            return PRODUCT_NAME_PMA;

        case CASA_STP_PRODUCTS[2]:
            return EVENT_KAWANKU;

        case CASA_STP_PRODUCTS[3]:
            return EVENT_SAVING_I;
    }
}

export function getMAEProductName(productName) {
    if (productName === PM1_PRODUCT_NAME || productName === PRODUCT_NAME_PM1) {
        return PM1_PRODUCT_NAME;
    } else if (productName === PMA_PRODUCT_NAME || productName === PRODUCT_NAME_PMA) {
        return PMA_PRODUCT_NAME;
    } else if (
        productName === KAWANKU_SAVINGS_PRODUCT_NAME ||
        productName === PRODUCT_NAME_KAWANKU
    ) {
        return KAWANKU_SAVINGS_PRODUCT_NAME;
    } else if (productName === KAWANKU_SAVINGSI_PRODUCT_NAME || productName === PRODUCT_NAME_SAI) {
        return KAWANKU_SAVINGSI_PRODUCT_NAME;
    }
}

//GA Events
export const getAnalyticScreenName = (entryReducer, screenName, userStatus = null) => {
    const analyticsProductCode = getAnalyticProductName(entryReducer);
    switch (screenName) {
        case navigationConstant.PREMIER_INTRO_SCREEN:
            return APPLY_INTRO_SCREEN(analyticsProductCode);
        case navigationConstant.PREMIER_PERSONAL_DETAILS:
            return APPLY_PERSONAL_DETAILS(analyticsProductCode);
        case navigationConstant.PREMIER_IDENTITY_DETAILS:
            return APPLY_IDENTITY_TYPE(analyticsProductCode);
        case navigationConstant.PREMIER_RESIDENTIAL_DETAILS:
            if (userStatus === CASA_STP_FULL_ETB_USER) {
                return APPLY_RESIDENTIAL_ETB_DETAILS(analyticsProductCode);
            }
            return APPLY_RESIDENTIAL_DETAILS(analyticsProductCode);
        case navigationConstant.PREMIER_EMPLOYMENT_DETAILS:
            return APPLY_EMPLOYMENT_DETAILS(analyticsProductCode);
        case navigationConstant.PREMIER_ACCOUNT_DETAILS:
            return APPLY_ACCOUNT_DETAILS(analyticsProductCode);
        case navigationConstant.PREMIER_ADDITIONAL_DETAILS:
            return APPLY_ADDITIONAL_DETAILS(analyticsProductCode);
        case navigationConstant.PREMIER_DECLARATION:
            return APPLY_DECLARATION_EVENT(analyticsProductCode);
        case navigationConstant.PREMIER_CONFIRMATION:
            return APPLY_CONFIRMATION_EVENT(analyticsProductCode);
        case navigationConstant.PREMIER_OTP_VERIFICATION:
            return APPLY_OTPVERIFICATION_SUCCESSFUL(analyticsProductCode);
        case navigationConstant.PREMIER_ACTIVATION_PENDING:
            return APPLY_ACTIVATE_PROCEEDTOACTIVATE(analyticsProductCode);
        case navigationConstant.PREMIER_ACTIVATION_CHOICE:
            return APPLY_ACTIVATED_START_EKYC(analyticsProductCode);
        case navigationConstant.PREMIER_ACTIVATE_ACCOUNT:
            return APPLY_ACTIVATED_TRANSFER_TO_ACTIVATES(analyticsProductCode);
        case navigationConstant.PREMIER_SELECT_CASA:
            return APPLY_SELECT_CASA_REVIEWDETAILS(analyticsProductCode);
        case navigationConstant.PREMIER_ACTIVATION_SUCCESS:
            return APPLY_ACTIVATED_OTPVERIFICATION_SUCCESSFUL(analyticsProductCode);
        case navigationConstant.PREMIER_ACTIVATION_FAILURE:
            return APPLY_ACTIVATED_OTPVERIFICATION_UNSUCCESSFUL(analyticsProductCode);
        case navigationConstant.PREMIER_PREFER_BRANCH:
            return APPLY_PREFER_BRANCH(analyticsProductCode);
    }
};

// Get Scene Code for EKYC
export const getSceneCode = (onBoardDetails2) => {
    if (onBoardDetails2?.isPM1) {
        return PRODUCT_NAME_PM1;
    } else if (onBoardDetails2?.isPMA) {
        return "PMAI";
    } else if (onBoardDetails2?.isKawanku) {
        return "KAWANKU";
    } else if (onBoardDetails2?.isKawankuSavingsI) {
        return "SAI";
    }
};

//S2U Fund Constant
export function getETBFundConst(entryReducer) {
    if (entryReducer.isPM1) {
        return casaFundConstant.FN_FUND_TRANSFER_PM1;
    } else if (entryReducer.isPMA) {
        return casaFundConstant.FN_FUND_TRANSFER_PMA;
    } else if (entryReducer.isKawanku) {
        return casaFundConstant.FN_FUND_TRANSFER_KAWANKU;
    } else if (entryReducer.isKawankuSavingsI) {
        return casaFundConstant.FN_FUND_TRANSFER_SAVINGSI;
    }
}
// S2U V4
export const checkS2UStatus = async (
    navigation,
    params,
    callback,
    extraData,
    transactionPayload
) => {
    try {
        const s2uInitResponse = await s2uSDKInit(extraData, transactionPayload);
        const timeStamp = s2uInitResponse?.timestamp || "";
        if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
            showErrorToast({
                message: s2uInitResponse.message,
            });
        } else {
            if (s2uInitResponse?.actionFlow === SMS_TAC) {
                //Tac Flow
                showS2UDownToast();
                callback(SMS_TAC);
            } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                    const redirect = {
                        succStack: extraData?.stack ?? navigationConstant.PREMIER_MODULE_STACK,
                        succScreen: extraData?.screen ?? navigationConstant.PREMIER_CONFIRMATION,
                    };
                    navigateToS2UReg(navigation, params, redirect);
                }
            } else {
                //S2U Pull Flow
                initS2UPull(s2uInitResponse, navigation, params, callback, timeStamp, extraData);
            }
        }
    } catch (err) {
        s2uSdkLogs(err, "Pay via S2U");
    }
};

//S2U V4
const initS2UPull = async (s2uInitResponse, navigate, params, callback, timeStamp, extraData) => {
    if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
        if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
            //S2U under cool down period
            navigateToS2UCooling(navigate);
        } else {
            const challengeRes = await initChallenge();
            if (challengeRes?.mapperData) {
                callback(S2U_PULL, challengeRes.mapperData, timeStamp);
            } else {
                showErrorToast({ message: challengeRes?.message });
            }
        }
    } else {
        //Redirect user to S2U registration flow
        const redirect = {
            succStack: extraData?.stack ?? navigationConstant.PREMIER_MODULE_STACK,
            succScreen: extraData?.screen ?? navigationConstant.PREMIER_CONFIRMATION,
        };
        navigateToS2UReg(navigate, params, redirect);
    }
};

const s2uSDKInit = async (extraData, transactionPayload) => {
    return await init(extraData?.fundConstant, transactionPayload);
};

export const s2uAcknowledgementScreen = (executePayload, transactionStatus, params, navigate) => {
    const entryStack = navigationConstant.MORE;
    const entryScreen = navigationConstant.APPLY_SCREEN;
    const entryPoint = {
        entryStack,
        entryScreen,
        params: {
            ...params,
        },
    };
    const ackDetails = {
        executePayload,
        transactionStatus,
        entryPoint,
        navigate,
    };

    if (executePayload?.executed) {
        const titleMessage = !transactionStatus ? params.title : AUTHORISATION_FAILED;
        ackDetails.titleMessage = titleMessage;
    }

    handleS2UAcknowledgementScreen(ackDetails);

    if (params.screenName) {
        GACasaSTP.onPremierOtpVerificationDebitCardUnsucc(params.screenName, "");
    }
};

export const s2uScreenNavigation = (
    navigation,
    dispatch,
    messageID,
    params,
    title,
    description,
    isDebitCardSuccess
) => {
    navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
        screen: navigationConstant.ZEST_CASA_FAILURE,
        params: {
            title,
            description,
            isDebitCardSuccess,
            referenceId: messageID,
            dateAndTime: params?.timeStamp,
            analyticScreenName: params?.analyticScreenName,
            onDoneButtonDidTap: () => {
                dispatch({ type: SELECT_CASA_CLEAR });
                dispatch({ type: GET_ACCOUNT_LIST_CLEAR });
                dispatch({ type: ZEST_CASA_CLEAR_ALL });
                navigation.navigate(navigationConstant.MORE, {
                    screen: navigationConstant.APPLY_SCREEN,
                });
            },
        },
    });
};
