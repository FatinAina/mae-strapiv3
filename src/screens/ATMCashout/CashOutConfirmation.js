import AsyncStorage from "@react-native-community/async-storage";
import { isEmpty, isNull } from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Platform } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { checkAtmOnboarding, getMobileInfo, invokeL2, invokeL3 } from "@services";

import {
    MEDIUM_GREY,
    DARK_GREY,
    BLACK,
    YELLOW,
    DISABLED,
    BLUE,
    DISABLED_TEXT,
} from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import { FN_ATM_CASHOUT } from "@constants/fundConstants";
import {
    COMMON_ERROR_MSG,
    SECURE2U_IS_UNAVAILABLE,
    ATM_QR,
    FA_SETTINGS_ATMCASHOUT_INTRODUCTION,
    ATMCASHOUT,
    SMARTPHONE_ATMCASHOUT,
    SECURITY_ATMCASHOUT,
    HOW_DOES_IT_WORK_ATMCASHOUT,
    CONFIRMATION_ATMCASHOUT,
    TERMS_CONDITIONS,
    CONFIRM,
    ATM_CASHOUT_UNSUCCESS,
} from "@constants/strings";

import { responsive } from "@utils";
import { handleGoToATMCashOutArticle } from "@utils/atmCashoutUtil";
//S2U V4
import {
    handleS2UAcknowledgementScreen,
    init,
    initChallenge,
    s2uSdkLogs,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
//S2U V4 END
import { checks2UFlow } from "@utils/dataModel/utility";
import { convertMayaMobileFormat } from "@utils/dataModel/utilityPartial.4";
import { errorCodeMap } from "@utils/errorMap";
import { ErrorLogger } from "@utils/logs";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);

CloseButton.propTypes = {
    onPress: PropTypes.func,
};

const S2UFlowEnum = Object.freeze({
    s2u: "S2U",
    s2uReg: "S2UReg",
    tac: "TAC",
});

const nonTxnData = { isNonTxn: true };

const CashOutConfirmation = ({ getModel, updateModel, navigation, route }) => {
    const [state, setState] = useState({
        pressed: false,
        showLoader: true,
        secure2uValidateData: {},
        isOnboardCompleted: null,
        isBlocked: false,
        blockMsg: "",
        showS2UModal: false,
        mapperData: {},
    });

    useEffect(() => {
        console.log("[CashoutConfirmation][componentDidMount]");
        initATM();
        _checkS2UStatus();
        const unsubscribeFocusListener = navigation.addListener("focus", handleOnfocus);

        return () => {
            unsubscribeFocusListener();
        };
    }, []);

    const navigateToSuccScreen = () => {
        AsyncStorage.setItem("isAtmEnabled", "true");
        updateModel({
            atm: {
                isOnboarded: true,
                isEnabled: true,
                lastQrString: "",
            },
        });
        navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
            screen: navigationConstant.ATM_CASHOUT_STATUS,
            params: { ...route?.params },
        });
    };

    const handleError = (executePayload) => {
        if (executePayload.code === 423) {
            // Display RSA Account Locked executePayload Message
            console.log("RSA Lock");
            const serverDate = executePayload?.payload?.serverDate || "";
            navigation.navigate(navigationConstant.ONE_TAP_AUTH_MODULE, {
                screen: "Locked",
                params: {
                    reason: executePayload?.rsaResponse?.statusDescription ?? "N/A",
                    loggedOutDateTime: serverDate,
                    lockedOutDateTime: serverDate,
                },
            });
        } else if (executePayload.code === 422) {
            // Display RSA Account Locked executePayload Message
            console.log("RSA Deny");
            navigation.navigate(navigationConstant.COMMON_MODULE, {
                screen: navigationConstant.RSA_DENY_SCREEN,
                params: {
                    statusDescription: executePayload?.rsaResponse?.statusDescription ?? "N/A",
                    additionalStatusDescription: executePayload?.rsaResponse?.statusDescription
                        ? ""
                        : executePayload?.rsaResponse?.additionalStatusDescription ?? "",
                    serverDate: executePayload?.rsaResponse?.serverDate ?? "N/A",
                    nextParams: {
                        screen: navigationConstant.DASHBOARD,
                        params: { refresh: false },
                    },
                    nextModule: navigationConstant.TAB_NAVIGATOR,
                    nextScreen: "Tab",
                },
            });
        } else {
            const entryStack = route?.params?.routeFrom
                ? navigationConstant.DASHBOARD
                : navigationConstant.SETTINGS;
            const entryScreen = !route?.params?.routeFrom && navigationConstant.PROFILE_MODULE;
            const entryPoint = {
                entryStack,
                entryScreen,
                params: {
                    ...route.params,
                },
            };
            const ackDetails = {
                executePayload,
                transactionSuccess: false,
                entryPoint,
                navigate: navigation.navigate,
            };
            if (executePayload?.executed) {
                ackDetails.titleMessage = ATM_CASHOUT_UNSUCCESS;
            }
            handleS2UAcknowledgementScreen(ackDetails);
        }
    };

    const onS2uDone = (response) => {
        const { transactionStatus, executePayload } = response;
        // Close S2u popup
        onS2uClose();
        //handle  based on status code
        if (transactionStatus) {
            navigateToSuccScreen();
        } else {
            //S2U V4 handle RSA transaction Failed
            handleError(executePayload);
        }
    };

    const s2uSDKInit = async (phNo) => {
        const transactionPayload = {
            requestType: "QRCLW_001",
            mobileNo: phNo,
            preOrPostFlag: "prelogin",
        };
        return await init(FN_ATM_CASHOUT, transactionPayload);
    };

    const onS2uClose = () => {
        setState((prevState) => ({ ...prevState, showS2UModal: false }));
    };

    const navToTacFlow = (mobileNum) => {
        navigation.navigate(navigationConstant.ATM_CASHOUT_STACK, {
            screen: navigationConstant.ATM_OTP_NUMBER,
            params: {
                ...route.params,
                flow: "ATM",
                mobileNum,
            },
        });
    };

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigation.navigate);
            } else {
                const challengeRes = await initChallenge();
                console.log("initChallenge RN Response :: ", challengeRes);
                if (challengeRes?.message) {
                    console.log("challenge init request failed");
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setState((prevState) => ({
                        ...prevState,
                        mapperData: challengeRes?.mapperData,
                        showS2UModal: true,
                    }));
                }
            }
        } else {
            //Redirect user to S2U registration flow
            navigateToS2URegistration(navigation.navigate);
        }
    };

    const initiateS2USdk = async (phNo) => {
        try {
            const s2uInitResponse = await s2uSDKInit(phNo);
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    showS2UDownToast();
                    navToTacFlow(phNo);
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        navigateToS2URegistration(navigation.navigate);
                    }
                } else {
                    //S2U Pull Flow
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (err) {
            console.log(err, "CashOutConfirmation");
            s2uSdkLogs(err, "ATM Cashout");
        }
    };

    const handleOnfocus = () => {
        if (route?.params?.flow === "ATM") {
            checkAtmOnboardingStatus();
        }
        if (route?.params?.isS2URegistrationAttempted) {
            _handlePostS2URegistration();
        } else {
            checkAtmOnboardingStatus();
        }
    };

    const _requestL2Permission = async (isL3) => {
        try {
            const response = isL3 ? await invokeL3(isL3) : await invokeL2(false);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            ErrorLogger(error);
            return null;
        }
    };

    const checkAtmOnboardingStatus = async () => {
        try {
            const response = await checkAtmOnboarding();
            const { code, result } = response && response.data;
            if (code === 200) {
                setState((prevState) => ({ ...prevState, isBlocked: false }));
                if (result?.status === "PENDING") {
                    showInfoToast({ message: SECURITY_ATMCASHOUT });
                }
                setState((prevState) => ({
                    ...prevState,
                    isOnboardCompleted: result?.status === "ACTIVE",
                    showLoader: false,
                }));
                return;
            }
        } catch (e) {
            goBack();
            const exObj = errorCodeMap(e);
            if (exObj?.message) {
                setState((prevState) => ({
                    ...prevState,
                    isBlocked: true,
                    blockMsg: exObj?.message,
                }));
                showErrorToast({ message: exObj?.message ?? COMMON_ERROR_MSG });
            }
        } finally {
            setState((prevState) => ({ ...prevState, showLoader: false }));
        }
    };

    const initATM = async () => {
        console.tron.log("[CashOutConfirmation] >> init ");
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            const request = await _requestL2Permission(true);
            if (!request) {
                navigation.goBack();
            }
        }
    };

    const _closeCashOutConfirmation = () => {
        navigation.goBack();
        // NavigationService.navigate("Dashboard", { screen: DASHBOARD });
    };

    const _checkS2UStatus = async () => {
        try {
            //passing new paramerter updateModel for s2u interops
            const { flow, secure2uValidateData } = await checks2UFlow(46, getModel, updateModel);
            if (flow === S2UFlowEnum.s2uReg) {
                navigation.setParams({ isS2URegistrationAttempted: true });
                navigateToS2URegistration(navigation.navigate);
                setState((prevState) => ({ ...prevState, secure2uValidateData }));
            } else if (flow === S2UFlowEnum.tac) {
                setState((prevState) => ({
                    ...prevState,
                    secure2uValidateData,
                    showLoader: false,
                }));
                showInfoToast({
                    message: SECURE2U_IS_UNAVAILABLE,
                });
                goBack();
            } else if (flow === navigationConstant.SECURE2U_COOLING) {
                goBack();
                navigateToS2UCooling(navigation.navigate);
            } else {
                checkAtmOnboardingStatus();
                setState((prevState) => ({ ...prevState, secure2uValidateData }));
            }
        } catch (ex) {
            console.log("[CashOutConfirmation] >> [ex]", ex);
            const { error } = ex;
            setState((prevState) => ({ ...prevState, showLoader: false }));
            if (error?.status === "nonetwork") {
                goBack();
            } else {
                goBack();
                showErrorToast({ message: COMMON_ERROR_MSG });
            }
        }
    };

    const navigateToS2URegistration = (navigate) => {
        const redirect = {
            succStack: navigationConstant.ATM_CASHOUT_STACK,
            succScreen: navigationConstant.ATM_CASHOUT_CONFIRMATION,
        };
        navigateToS2UReg(navigate, route.params, redirect);
    };

    const _handlePostS2URegistration = async () => {
        //passing new paramerter updateModel for s2u interops
        const { flow } = await checks2UFlow(46, getModel, updateModel);
        const {
            route: {
                params: { isS2URegistrationAttempted, routeFrom },
            },
            navigation: { setParams, goBack },
        } = navigation;

        if (flow === S2UFlowEnum.s2uReg && isS2URegistrationAttempted) {
            setParams({ isS2URegistrationAttempted: false });
            if (!routeFrom || routeFrom !== ATM_QR) {
                goBack();
            }
            return;
        }
        checkAtmOnboardingStatus();
    };

    const goBack = () => {
        console.tron.log("[CASHOUT CONFIRMATION] >> [goBack]");
        if (route?.params?.routeFrom === "Dashboard") {
            navigation.navigate(navigationConstant.TAB_NAVIGATOR, {
                screen: navigationConstant.TAB,
                params: {
                    screen: navigationConstant.DASHBOARD,
                    params: { refresh: false },
                },
            });
            return;
        }
        navigation.goBack();
    };

    const _onPressTncLink = () => {
        const params = {
            file: "https://www.maybank2u.com.my/iwov-resources/pdf/personal/digital_banking/atm-cashout-tnc.pdf",
            share: false,
            type: "url",
            title: "Terms & Conditions",
            pdfType: "shareReceipt",
        };
        navigation.navigate(navigationConstant.COMMON_MODULE, {
            screen: navigationConstant.PDF_VIEW,
            params: { params },
        });
    };

    const _radioChecked = () => {
        if (!state.isBlocked) {
            setState((prevState) => ({ ...prevState, pressed: !state.pressed }));
        } else {
            showErrorToast({ message: state.blockMsg });
        }
    };

    const handleConfirm = async () => {
        try {
            const httpResp = await getMobileInfo();
            const mobileNo = String(httpResp?.data?.result) ?? null;
            if (mobileNo) {
                const { isOverseasMobileNoEnabled } = getModel("misc");
                const formattedMobileNum = convertMayaMobileFormat(mobileNo);
                const mobileNum = isOverseasMobileNoEnabled ? mobileNo : formattedMobileNum;
                initiateS2USdk(mobileNum);
            }
        } catch (ex) {
            console.log("[CashOutConfirmation] >> [ex]", ex);
            const { error } = ex;
            if (error?.status === "nonetwork") {
                goBack();
            } else {
                goBack();
                showErrorToast({ message: COMMON_ERROR_MSG });
            }
        }
    };

    if (isNull(state.isOnboardCompleted) && isEmpty(state.secure2uValidateData)) {
        return <ScreenLoader showLoader={true} />;
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            showLoaderModal={state.showLoader}
            analyticScreenName={FA_SETTINGS_ATMCASHOUT_INTRODUCTION}
            style={styles.screenContainer}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={goBack} />}
                        headerCenterElement={
                            <Typo
                                text={ATMCASHOUT}
                                fontWeight="600"
                                fontSize={18}
                                lineHeight={19}
                            />
                        }
                        headerRightElement={
                            <HeaderCloseButton onPress={_closeCashOutConfirmation} />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
                style={styles.screenContainer}
            >
                <View style={styles.layout}>
                    <View>
                        <Typo
                            text={SMARTPHONE_ATMCASHOUT}
                            fontSize={16}
                            fontWeight="400"
                            lineHeight={24}
                            style={styles.alignLeftTypo} // Add this style for left alignment
                        />
                        <Typo
                            text="Note: "
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={18}
                            style={styles.note}
                            color={DARK_GREY}
                        />
                        <Typo
                            text={SECURITY_ATMCASHOUT}
                            fontSize={12}
                            fontWeight="400"
                            lineHeight={18}
                            color={DARK_GREY}
                            style={styles.alignLeftTypo} // Add this style for left alignment
                        />
                    </View>
                </View>
                <View style={styles.btnContainer}>
                    <View>
                        <Typo
                            text={HOW_DOES_IT_WORK_ATMCASHOUT}
                            fontSize={14}
                            fontWeight="600"
                            lineHeight={18}
                            textAlign="left"
                            style={styles.work(state.showLoader)}
                            color={BLUE}
                            onPressText={() => handleGoToATMCashOutArticle(navigation)}
                        />
                    </View>
                    <View style={styles.tncContainer}>
                        <View>
                            <RadioButton
                                isSelected={state.pressed}
                                onRadioButtonPressed={_radioChecked}
                            />
                        </View>
                        <>
                            <Image source={Images.atmCashOutBg} style={styles.bgImg} />
                            <View style={styles.confirm}>
                                <Typo textAlign="left">
                                    <Typo
                                        text={CONFIRMATION_ATMCASHOUT}
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={20}
                                        textAlign="left"
                                        color={BLACK}
                                    />
                                    <Typo
                                        text={TERMS_CONDITIONS}
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={20}
                                        textAlign="left"
                                        color={BLACK}
                                        style={styles.tncText}
                                        onPressText={_onPressTncLink}
                                    />
                                </Typo>
                            </View>
                        </>
                    </View>
                    <View style={styles.btn}>
                        <ActionButton
                            fullWidth
                            disabled={!state.pressed || state.isBlocked}
                            // isLoading={loading}
                            borderRadius={25}
                            onPress={handleConfirm}
                            backgroundColor={!state.pressed ? DISABLED : YELLOW}
                            componentCenter={
                                <Typo
                                    text={CONFIRM}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={!state.pressed ? DISABLED_TEXT : BLACK}
                                />
                            }
                        />
                    </View>
                </View>
                <View style={styles.bgContainer} />
                {state.showS2UModal && (
                    //S2U V4
                    <Secure2uAuthenticationModal
                        token=""
                        onS2UDone={onS2uDone}
                        onS2uClose={onS2uClose}
                        s2uPollingData={state.mapperData}
                        transactionDetails={state.mapperData}
                        secure2uValidateData={state.mapperData}
                        nonTxnData={nonTxnData}
                        s2uEnablement={true}
                        extraParams={{
                            metadata: {
                                txnType: "ATM_CASHOUT",
                            },
                        }}
                    />
                )}
            </ScreenLayout>
        </ScreenContainer>
    );
};

CashOutConfirmation.propTypes = {
    getModel: PropTypes.func,
    updateModel: PropTypes.func,
    navigation: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
};

const bgImgMarginTop =
    Platform.OS === "ios" ? -responsive.heightPercentage(41) : -responsive.heightPercentage(47);

const styles = StyleSheet.create({
    screenContainer: { flex: 1 },
    bgContainer: {
        zIndex: -1,
    },
    bgImg: {
        marginLeft: -responsive.widthPercentage(7),
        marginTop: bgImgMarginTop,
        position: "absolute",
        width: responsive.widthPercentage(100),
        zIndex: -1,
    },
    btn: { marginHorizontal: "5%", width: "90%" },
    btnContainer: {
        bottom: 40,
        position: "absolute",
        width: "100%",
    },
    closeButton: {
        height: 44,
        justifyContent: "center",
        width: 44,
    },
    closeButtonIcon: {
        height: 17,
        width: 17,
    },
    confirm: {
        width: "100%",
    },
    layout: {
        paddingHorizontal: 25,
    },
    work: (showLoader) => ({
        zIndex: showLoader ? 0 : 1,
        marginLeft: responsive.widthPercentage(5),
        marginBottom: responsive.heightPercentage(12),
    }),
    note: { marginTop: 20, textAlign: "left" },
    alignLeftTypo: {
        textAlign: "left",
    },
    tncContainer: {
        bottom: 80,
        flexDirection: "row",
        lineHeight: 20,
        marginHorizontal: 25,
        marginTop: 32,
        position: "absolute",
        width: "80%",
    },
    tncText: {
        textDecorationLine: "underline",
    },
});

export default withModelContext(CashOutConfirmation);
