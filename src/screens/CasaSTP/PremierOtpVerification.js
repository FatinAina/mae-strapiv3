import moment from "moment";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
    isDraftUser,
    isNTBUser,
    getAnalyticScreenName,
    s2uAcknowledgementScreen,
    s2uScreenNavigation,
    getAnalyticProductName,
} from "@screens/CasaSTP/helpers/CasaSTPHelpers";
import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";
import {
    fetchChipMasterData,
    get_pinBlockEncrypt,
} from "@screens/MAE/CardManagement/CardManagementController";
import { mobileNumberFormat } from "@screens/PLSTP/PLSTPController";
import {
    debitCardActivateFailedScreen,
    debitCardActivateSuccessScreen,
    debitCardFailedScreen,
    debitCardPinActivateFailedScreen,
    debitCardSuccessScreen,
} from "@screens/ZestCASA/helpers/ZestHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Popup from "@components/Popup";

import { useModelController } from "@context";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import { activateAccountCASA } from "@redux/services/CasaSTP/apiActivateAccountCASA";
import { createAccount } from "@redux/services/CasaSTP/apiCreateAccount";
import { requestVerifyOtp } from "@redux/services/CasaSTP/apiRequestVerifyOtp";
import { activateDebitCards } from "@redux/services/apiActivateDebitCards";
import { applyDebitCards } from "@redux/services/apiApplyDebitCards";
import { requestTACDebitCards } from "@redux/services/apiRequestTACDebitCards";
import { activateDebitCardBody, applyDebitCardBody } from "@redux/utilities/actionUtilities";

import {
    CASA_STP_NTB_USER,
    CASA_STP_DRAFT_USER,
    CASA_STP,
    CASA_STP_VERIFY,
    PREMIER_CLEAR_ALL,
    CASA_STP_DEBIT_CARD_NTB_USER,
    CASA_STP_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    CASA_STP_FULL_ETB_USER,
    CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT,
    CREATE_ACCOUNT_SCREEN_CREATE_ACCOUNT_FAILURE,
    APPLY_DEBIT_CARD_MBB_TACSERVICE_CODE,
    ACTIVATE_DEBIT_CARD_MBB_TACSERVICE_CODE,
} from "@constants/casaConfiguration";
import { PM1, PMA, KAWANKU_SAVINGS_ACCOUNT_NAME, SAVINGS_ACCOUNT_I } from "@constants/casaStrings";
import { MEDIUM_GREY } from "@constants/colors";
import {
    YES,
    NO,
    ACCOUNT_ACTIVATION_FAILURE_DESCRIPTION,
    ACCOUNT_ACTIVATION_FUND_TRANSFER_FAILURE,
    ACTIVATION_SUCCESSFUL,
    ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
    OKAY,
    APPLICATION_FAILED,
    APPLICATION_FAILED_DESC,
    OTP_TEXT,
    ONE_TIME_PASSWORD,
    FA_CONTACT_BANK,
    ENQ_CST_CARE,
    CALL_NOW,
    APPLY_FAIL,
} from "@constants/strings";
import {
    PRE_QUAL_POST_LOGIN_FLAG,
    PRE_QUAL_PRE_LOGIN_FLAG,
    PASSPORT_CODE,
    HIGH_RISK_CUSTOMER_CODE,
    FUNDS_TRANSFER_EXCEPTION,
    ZEST_DEBIT_CARD_USER,
    ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER,
    ZEST_DEBIT_CARD_NTB_USER,
} from "@constants/zestCasaConfiguration";

import { maskedMobileNumber } from "@utils";
import { contactBankcall } from "@utils/dataModel/utility";

import {
    APPLY_OTPVERIFICATION_SUCCESSFUL,
    APPLY_OTPVERIFICATION_UNSUCCESSFUL,
    APPLY_TRANSFER_FAILED,
} from "./helpers/AnalyticsEventConstants";

const PremierOtpVerification = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const createAccountReducer = useSelector((state) => state.createAccountReducer);
    const activateAccountReducer = useSelector((state) => state.activateAccountReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const debitCardResidentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardResidentialDetailsReducer
    );
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );
    const debitCardInquiryReducer = useSelector((state) => state.debitCardInquiryReducer);
    const debitCardPinReducer = useSelector((state) => state.zestCasaReducer.debitCardPinReducer);
    const { userStatus } = prePostQualReducer;
    const reducer =
        userStatus === CASA_STP_NTB_USER ? prePostQualReducer : draftUserAccountInquiryReducer;
    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );
    const debitCardSelectAccountReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardSelectAccountReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    // Hooks to access context data
    const { getModel } = useModelController();
    const { m2uPhoneNumber } = getModel("m2uDetails");
    const { identityType } = identityDetailsReducer;
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const [notMine, setNotMine] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [idNumber] = useState(
        createAccountReducer.idNo || activateAccountReducer?.idNo || prePostQualReducer.idNo || ""
    );
    const [mobileNumber] = useState(m2uPhoneNumber || prePostQualReducer.mobileNo || "");
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const { debitCardSelectAccountNumber } = debitCardSelectAccountReducer;
    const [isOTPErrorPopupVisible, setIsOTPErrorPopupVisible] = useState(false);
    const [showS2UScreen, setS2UScreen] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [timeStamp, setTimeStamp] = useState({});
    const { exceedLimitScreen } = getModel("isFromMaxTry") || false;
    const [isFromMaxTry] = useState(exceedLimitScreen);

    const init = useCallback(() => {
        //const mobileNumberWithoutPlusSymbol = mobileNumber.replace("+", "");
        const mobileNoFormat = mobileNumberFormat(mobileNumber);
        setMaskedMobileNumber(maskedMobileNumber(mobileNoFormat));
    }, [mobileNumber]);

    useEffect(() => {
        init();
        const { s2u, mapperData, timeStamp } = params;
        setMapperData(mapperData);
        setS2UScreen(s2u);
        setTimeStamp(timeStamp);
    }, [init]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleProceedOtp() {
        requestOTP();
    }

    async function requestOTP(isResend = false, showOTPCb = () => {}) {
        if (userStatus === ZEST_DEBIT_CARD_USER || userStatus === ZEST_DEBIT_CARD_NTB_USER) {
            const data = {
                Msg: {
                    MsgBody: {
                        MBB_TACServiceCode: APPLY_DEBIT_CARD_MBB_TACSERVICE_CODE,
                    },
                },
            };
            dispatch(
                requestTACDebitCards(data, (response, token) => {
                    setToken(token);
                    showOTPModal();
                    if (isResend) showOTPCb();
                })
            );
        } else if (
            userStatus === CASA_STP_DEBIT_CARD_ACTIVATE_ACCOUNT_USER ||
            userStatus === ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER
        ) {
            const lastFourDebitCardNumber = debitCardInquiryReducer?.debitCardNumber.slice(-4);
            const data = {
                Msg: {
                    MsgBody: {
                        MBB_TACServiceCode: ACTIVATE_DEBIT_CARD_MBB_TACSERVICE_CODE,
                        MBB_TACInfo1: lastFourDebitCardNumber,
                    },
                },
            };
            dispatch(
                requestTACDebitCards(data, (response, token) => {
                    setToken(token);
                    showOTPModal();
                    if (isResend) showOTPCb();
                })
            );
        } else {
            const isNTBOTPCall = !!(isNTBUser(userStatus) || isDraftUser(userStatus));
            const body = {
                mobileNo: mobileNumber,
                otp: "",
                idNo: idNumber || route?.params?.userAction?.idNumber?.displayValue,
                transactionType: CASA_STP,
                preOrPostFlag: isNTBOTPCall ? PRE_QUAL_PRE_LOGIN_FLAG : PRE_QUAL_POST_LOGIN_FLAG,
                productName: entryReducer?.productName,
            };
            dispatch(
                requestVerifyOtp(body, isNTBOTPCall, (status, response) => {
                    if (status) {
                        const serverToken = response?.token ?? null;
                        setToken(serverToken);
                        showOTPModal();
                        if (isResend) showOTPCb();
                    }
                })
            );
        }
    }

    function handleCloseNotMine() {
        setNotMine(false);
    }

    function handleNotMine() {
        setNotMine(true);
    }

    function handleCallHotline() {
        handleCloseNotMine();

        contactBankcall("1300886688");
    }

    function showOTPModal() {
        setShowOTP(true);
    }
    function hideOTPModal() {
        setShowOTP(false);
    }
    function onOTPDone(otp) {
        verifyOTPApi(otp);
    }

    async function verifyOTPApi(otp) {
        switch (userStatus) {
            case CASA_STP_NTB_USER:
            case CASA_STP_DEBIT_CARD_NTB_USER:
                callCreateAccountService(otp);
                break;

            case CASA_STP_DRAFT_USER:
                navigateBasedonUserStatus();
                break;

            case CASA_STP_FULL_ETB_USER:
                callActivateAccountService(otp, true);
                break;

            case ZEST_DEBIT_CARD_USER:
                applyDebitCard(otp, false);
                break;

            case ZEST_DEBIT_CARD_NTB_USER:
                applyDebitCard(otp, true);
                break;

            case ZEST_DEBIT_CARD_ACTIVATE_ACCOUNT_USER:
            case CASA_STP_DEBIT_CARD_ACTIVATE_ACCOUNT_USER:
                activateDebitCard(otp);
                break;

            default:
                break;
        }
    }

    function closeOTPModal() {
        setShowOTP(false);
    }
    function onOTPClose() {
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    function getProductAccountType() {
        if (entryReducer.isPM1) {
            return PM1;
        } else if (entryReducer.isPMA) {
            return PMA;
        } else if (entryReducer.isKawanku) {
            return KAWANKU_SAVINGS_ACCOUNT_NAME;
        } else if (entryReducer.isKawankuSavingsI) {
            return SAVINGS_ACCOUNT_I;
        }
    }

    const navigateBasedonUserStatus = () => {
        if (userStatus === CASA_STP_DRAFT_USER) {
            if (route?.params?.ekycDone) {
                navigation.navigate(navigationConstant.PREMIER_SELECT_FPX_BANK);
            } else {
                navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                    screen: navigationConstant.PREMIER_ACTIVATION_CHOICE,
                    params: {
                        filledUserDetails: route?.params?.filledUserDetails,
                    },
                });
            }
        }
    };

    function callCreateAccountService(otp) {
        dispatch(
            createAccount(accountEnrollmentBody(otp), (result, exception) => {
                if (result) {
                    const numOfWatchlistHits = result?.numOfWatchlistHits ?? null;
                    if (numOfWatchlistHits) Number(numOfWatchlistHits);
                    hideOTPModal();
                    navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                        screen: navigationConstant.PREMIER_SUCCESS_MYKAD,
                        params: {
                            filledUserDetails: {
                                entryScreen: navigationConstant.ACCOUNTS_SCREEN,
                                onBoardDetails: createAccountReducer.onBoardDetails,
                                onBoardDetails2: {
                                    ...createAccountReducer.onBoardDetails2,
                                    productName: entryReducer?.productName,
                                },
                                onBoardDetails3: createAccountReducer.onBoardDetails3,
                                onBoardDetails4: createAccountReducer.onBoardDetails4,
                                accountNumber: result?.acctNo,
                                pan: result?.accessNo,
                                bookAppointmentAtBranch:
                                    result.customerRiskRating === HIGH_RISK_CUSTOMER_CODE ||
                                    result.numOfWatchlistHits > 0 ||
                                    createAccountReducer.body?.idType === PASSPORT_CODE
                                        ? YES
                                        : NO,
                            },
                            isSuccessfulAccountActivation: true,
                            analyticScreenName: getCreateAccountAnalyticScreenName(),
                            needFormAnalytics: true,
                            identityType,
                        },
                    });
                } else {
                    hideOTPModal();
                    if (exception) {
                        if (exception?.statusCode === CREATE_ACCOUNT_SCREEN_CREATE_PARTY_TIMEOUT) {
                            setIsOTPErrorPopupVisible(true);
                        } else if (
                            exception?.statusCode === CREATE_ACCOUNT_SCREEN_CREATE_ACCOUNT_FAILURE
                        ) {
                            navigation.navigate(navigationConstant.PREMIER_ACCOUNT_NOT_FOUND, {
                                isVisitBranchMode: true,
                            });
                        }
                    }
                    return null;
                }
            })
        );
    }

    const accountEnrollmentBody = (otp) => {
        // Setting the data from the debit card residential to an object
        const residentialData = {
            debitCardAddress1: debitCardResidentialDetailsReducer?.addressLineOne,
            debitCardAddress2: debitCardResidentialDetailsReducer?.addressLineTwo,
            debitCardAddress3: debitCardResidentialDetailsReducer?.city,
            debitCardAddress4: debitCardResidentialDetailsReducer?.stateValue?.name,
            debitCardPostCode: debitCardResidentialDetailsReducer?.postalCode,
            debitCardType: selectDebitCardReducer?.debitCardValue?.obj?.plasticType?.toString(),
        };
        const customerName = createAccountReducer.body.customerName.substring(0, 40);
        const finalBodyStructure = {
            ...createAccountReducer.body,
            ...residentialData,
            customerName,
        };
        return {
            accountEnrolReq: {
                ...finalBodyStructure,
                productName: entryReducer?.productName,
                debitCard: !isFromMaxTry,
            },
            otpInput: JSON.stringify({
                mobileNo: mobileNumber,
                idNumber,
                otp,
                transactionType: CASA_STP_VERIFY,
                productName: entryReducer?.productName,
                preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
                idNo: idNumber,
            }),
        };
    };

    async function callActivateAccountService(otp, isEtbUser) {
        dispatch(
            activateAccountCASA(accountActivationCASABody(otp), (result, error) => {
                hideOTPModal();
                if (result) {
                    //Navigate to Success screen
                    navigation.navigate(navigationConstant.PREMIER_ACTIVATION_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: result.acctNo,
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        accountType: getProductAccountType(),
                        analyticScreenName: getActivateAccountAnalyticScreenName(true, isEtbUser),
                        onDoneButtonDidTap: () => {
                            clearUnusedReducers();
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        isEtbUser,
                        needFormAnalytics: true,
                    });
                } else {
                    if (error && error?.code === FUNDS_TRANSFER_EXCEPTION) {
                        //Navigate to error screen for funding
                        navigation.navigate(navigationConstant.PREMIER_ACTIVATION_FAILURE, {
                            title: ACCOUNT_ACTIVATION_FUND_TRANSFER_FAILURE,
                            referenceId: error?.formattedTransactionRefNumber,
                            dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                            analyticScreenName: getActivateAccountAnalyticScreenName(
                                false,
                                isEtbUser
                            ),
                            isDebitCardSuccess: false,
                            onDoneButtonDidTap: () => {
                                clearUnusedReducers();
                                navigation.popToTop();
                                navigation.goBack();
                            },
                            needFormAnalytics: true,
                        });
                    } else {
                        //Navigate to general transfer error screen
                        navigation.navigate(navigationConstant.PREMIER_MODULE_STACK, {
                            screen: navigationConstant.PREMIER_ACTIVATION_FAILURE,
                            params: {
                                title: ACCOUNT_ACTIVATION_FAILURE_DESCRIPTION,
                                referenceId: error?.formattedTransactionRefNumber,
                                dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                                analyticScreenName: getActivateAccountAnalyticScreenName(
                                    false,
                                    isEtbUser
                                ),
                                isDebitCardSuccess: false,
                                onDoneButtonDidTap: () => {
                                    clearUnusedReducers();
                                    navigation.popToTop();
                                    navigation.goBack();
                                },
                                needFormAnalytics: true,
                            },
                        });
                    }
                }
            })
        );
    }

    async function applyDebitCard(tac, isNTBFlow) {
        const accountNumberSend = isNTBFlow
            ? prePostQualReducer.acctNo
            : debitCardSelectAccountNumber;
        const applyDebitCardData = applyDebitCardBody(
            debitCardResidentialDetailsReducer,
            selectDebitCardReducer,
            tac,
            accountNumberSend
        );
        const data = {
            Msg: {
                MsgBody: applyDebitCardData,
            },
        };

        dispatch(
            applyDebitCards(data, (result, messageID) => {
                hideOTPModal();
                if (result) {
                    GACasaSTP.onPremierOtpVerificationSucc();
                    GACasaSTP.onPremierOtpVerificationDebitCardSucc(messageID);
                    debitCardSuccessScreen(navigation, dispatch, messageID);
                } else {
                    GACasaSTP.onPremierOtpVerificationFail();
                    GACasaSTP.onPremierOtpVerificationDebitCardFail(messageID);
                    debitCardFailedScreen(navigation, dispatch, reducer, messageID);
                }
            })
        );
    }

    async function activateDebitCard(tac) {
        const chipMasterData = await fetchChipMasterData(debitCardInquiryReducer?.debitCardNumber);
        const hsmTpk = chipMasterData?.hsmTpk ?? "";

        const pinBlock = get_pinBlockEncrypt(
            debitCardPinReducer?.enterPin,
            debitCardInquiryReducer?.debitCardNumber,
            hsmTpk,
            chipMasterData
        );

        const activateDebitCardData = activateDebitCardBody(
            tac,
            debitCardInquiryReducer?.debitCardNumber,
            pinBlock,
            hsmTpk,
            debitCardPinReducer?.debitCardLast8Digit
        );

        const data = {
            Msg: {
                MsgBody: activateDebitCardData,
            },
        };

        dispatch(
            activateDebitCards(data, (result, messageID, statusDesc, statusCode) => {
                hideOTPModal();
                if (result) {
                    debitCardActivateSuccessScreen(navigation, dispatch, messageID);
                } else if (statusCode === "2222") {
                    debitCardPinActivateFailedScreen(navigation, dispatch, messageID);
                } else {
                    debitCardActivateFailedScreen(navigation, dispatch, messageID);
                }
            })
        );
    }

    const accountActivationCASABody = (otp) => ({
        activateAccountReq: {
            ...activateAccountReducer.body,
            productName: entryReducer?.productName,
        },
        otpInput: JSON.stringify({
            mobileNo: mobileNumber,
            idNumber,
            otp,
            transactionType: CASA_STP_VERIFY,
            preOrPostFlag: PRE_QUAL_POST_LOGIN_FLAG,
            idNo: idNumber,
            productName: entryReducer?.productName,
        }),
    });

    function clearUnusedReducers() {
        dispatch({ type: PREMIER_CLEAR_ALL });
    }

    function onOTPErrorPopupOkayButtonDidTap() {
        //setIsOTPErrorPopupVisible(false);
        navigation.navigate(navigationConstant.PREMIER_IDENTITY_DETAILS);
    }

    function onOTPErrorPopupCloseButtonDidTap() {
        setIsOTPErrorPopupVisible(false);
    }

    const getCreateAccountAnalyticScreenName = () =>
        getAnalyticScreenName(
            entryReducer?.productName,
            navigationConstant.PREMIER_OTP_VERIFICATION,
            ""
        );

    function getActivateAccountAnalyticScreenName(isSuccess, isEtbUser) {
        const analyticsProductCode = getAnalyticProductName(entryReducer?.productName);
        if (isSuccess) {
            return APPLY_OTPVERIFICATION_SUCCESSFUL(analyticsProductCode);
        } else {
            return APPLY_OTPVERIFICATION_UNSUCCESSFUL(analyticsProductCode);
        }
    }

    function onS2uDone(response) {
        const { transactionStatus, executePayload } = response;
        closeS2UScreen();
        //handle  based on status code
        if (executePayload?.executed) {
            if (transactionStatus) {
                if (
                    parseInt(executePayload?.body?.result?.statusCode) ===
                    parseInt(FUNDS_TRANSFER_EXCEPTION)
                ) {
                    const analyticsProductCode = getAnalyticProductName(entryReducer?.productName);
                    params.analyticScreenName = APPLY_TRANSFER_FAILED(analyticsProductCode);
                    s2uScreenNavigation(
                        navigation,
                        dispatch,
                        null,
                        params,
                        ACCOUNT_ACTIVATION_FUND_TRANSFER_FAILURE,
                        null,
                        true
                    );
                } else {
                    navigation.navigate(navigationConstant.PREMIER_ACTIVATION_SUCCESS, {
                        title: ACTIVATION_SUCCESSFUL,
                        description: ZEST_CASA_ACCOUNT_ACTIVATE_CONGRATULATIONS,
                        isSuccessfulAccountActivation: true,
                        accountNumber: executePayload?.body?.result?.acctNo,
                        dateAndTime: timeStamp,
                        accountType: getProductAccountType(),
                        analyticScreenName: getActivateAccountAnalyticScreenName(true, true),
                        onDoneButtonDidTap: () => {
                            clearUnusedReducers();
                            navigation.popToTop();
                            navigation.goBack();
                        },
                        needFormAnalytics: true,
                        isEtbUser: true,
                    });
                }
            } else {
                //Transaction Failed
                checkTransaction(executePayload, transactionStatus);
            }
        } else {
            //S2U V4 handle RSA
            s2uAcknowledgementScreen(
                executePayload,
                transactionStatus,
                params,
                props.navigation.navigate
            );
        }
    }

    function closeS2UScreen() {
        setS2UScreen(false);
        navigation.canGoBack() && navigation.goBack();
    }

    const checkTransaction = async (error, transactionSuccess) => {
        params.title = APPLY_FAIL;
        params.screenName = getActivateAccountAnalyticScreenName(false, true);
        GACasaSTP.onPremierOtpVerificationUnsucc(getActivateAccountAnalyticScreenName(false, true));
        s2uAcknowledgementScreen(error, transactionSuccess, params, props.navigation.navigate);
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={20}
                neverForceInset={["bottom"]}
                useSafeArea
                scrollable
                header={
                    <HeaderLayout headerLeftElement={<HeaderBackButton onPress={handleBack} />} />
                }
            >
                {!showS2UScreen && (
                    <ConfirmNumberScreen
                        reqType={OTP_TEXT}
                        otpText={ONE_TIME_PASSWORD}
                        mobileNumber={maskedMobileNo}
                        btnText="Confirm"
                        subBtnText="Not Mine"
                        onConfirmBtnPress={handleProceedOtp}
                        onNotMeBtnPress={handleNotMine}
                    />
                )}
            </ScreenLayout>
            <Popup
                visible={notMine}
                onClose={handleCloseNotMine}
                title={FA_CONTACT_BANK}
                description={ENQ_CST_CARE}
                primaryAction={{
                    text: CALL_NOW,
                    onPress: handleCallHotline,
                }}
            />
            {/* OTP Modal */}
            {showOTP && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNo}
                    hideLoader={true}
                    isTAC={
                        !!(userStatus !== CASA_STP_NTB_USER && userStatus !== CASA_STP_DRAFT_USER)
                    }
                />
            )}

            {showS2UScreen && (
                //S2U V4
                <Secure2uAuthenticationModal
                    token=""
                    onS2UDone={onS2uDone}
                    onS2uClose={closeS2UScreen}
                    s2uPollingData={mapperData}
                    transactionDetails={mapperData}
                    secure2uValidateData={mapperData}
                    s2uEnablement={true}
                />
            )}

            {isOTPErrorPopupVisible && (
                <Popup
                    visible={isOTPErrorPopupVisible}
                    onClose={onOTPErrorPopupCloseButtonDidTap}
                    title={APPLICATION_FAILED}
                    description={APPLICATION_FAILED_DESC}
                    primaryAction={{
                        text: OKAY,
                        onPress: onOTPErrorPopupOkayButtonDidTap,
                    }}
                />
            )}
        </ScreenContainer>
    );
};

PremierOtpVerification.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    params: PropTypes.object,
};

export default PremierOtpVerification;
