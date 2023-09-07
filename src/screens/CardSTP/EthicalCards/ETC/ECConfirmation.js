import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";
import SummaryContainer from "@screens/Property/Common/SummaryContainer";

import {
    STP_CARD_MODULE,
    MORE,
    APPLY_SCREEN,
    EC_STATUS,
    EC_CONFIRMATION,
    EC_PERSONAL_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { makeETCSubmission, makeETCRequestTAC, makeETCStatusInquiry } from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { MEDIUM_GREY, BLACK, DARK_GREY } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC } from "@constants/data";
import {
    FN_ETHICAL_CARDS_APPLICATION,
    TWO_FA_TYPE_TAC,
    TWO_FA_TYPE_SECURE2U_PULL,
} from "@constants/fundConstants";
import {
    NAME_ON_CARD,
    EMAIL_LBL,
    MOBNUM_LBL,
    MONTHLY_GROSS_INCOME_TITLE,
    OTHER_MONTHLY_COMMITMENTS_TITLE,
    MAILING_ADDRESS,
    PLSTP_POSTCODE,
    PLSTP_CITY,
    ETHICAL_CARD_TITLE,
    REFERENCE_ID,
    DATE_AND_TIME,
    PLEASE_CONFIRM_DETAILS,
    PERSONAL_DETAILS_TEXT,
    DELIVERY_DETAILS,
    ETHICAL_CARD_NOTE,
    COMMON_ERROR_MSG,
    CREDITCARD_APPLICATION_FAIL,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import {
    init,
    initChallenge,
    s2uSdkLogs,
    handleS2UAcknowledgementScreen,
} from "@utils/dataModel/s2uSDKUtil";
import { formatMobileNumbers } from "@utils/dataModel/utility";

function ECConfirmation({ route, navigation }) {
    const safeAreaInsets = useSafeArea();

    const [personalData, setPersonalData] = useState([]);
    const [deliveryData, setDeliveryData] = useState([]);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const [mobileNum, setMobileNum] = useState("");

    //S2U V4
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [isS2UDown, setIsS2UDown] = useState(false);
    const nonTxnData = { isNonTxn: true };

    //const [detailsArray, setDetailsArray] = useState([]);

    // Hooks to access context data
    const { getModel } = useModelController();

    useEffect(() => {
        initDetails();
    }, []);

    const initDetails = useCallback(() => {
        console.log("[ECConfirmation] >> [initDetails]");

        // Populate details
        setDetails();
    }, [route, navigation]);

    const onBackPress = () => {
        console.log("[ECConfirmation] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    };

    function onCloseTap() {
        console.log("[ECConfirmation] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || MORE, {
            screen: route?.params?.entryScreen || APPLY_SCREEN,
            params: route?.params?.entryParams,
        });
    }

    function setDetails() {
        console.log("[ECConfirmation] >> [setDetails]");

        // Call methods to populate details
        setPersonalDetails();
        setDeliveryDetails();

        const { m2uPhoneNumber } = getModel("m2uDetails");

        setMaskedMobileNumber(maskedMobileNumber(m2uPhoneNumber));
        setMobileNum(m2uPhoneNumber);
    }

    function setPersonalDetails() {
        console.log("[ECConfirmation] >> [setPersonalDetails]");

        const navParams = route?.params ?? {};
        const nameOnCard = navParams?.nameOnCard ?? "";
        const email = navParams?.email ?? "";
        const mobilePrefix = navParams?.mobilePrefix ?? "";
        const mobileNumberSuffix = navParams?.mobileNumber ?? "";
        const mobileNumber = `${mobilePrefix} ${mobileNumberSuffix}`;
        const mothlyGrossIncome = navParams?.monthlyGrossIncome ?? "";
        const othermonthlyCommitment = navParams?.otherCommitments ?? "";
        //const requestForPhysicalCard = navParams?.requestForPhysicalCard === "Y" ?? "";

        setPersonalData([
            {
                label: NAME_ON_CARD,
                value: nameOnCard,
            },
            {
                label: EMAIL_LBL,
                value: email,
            },
            {
                label: MOBNUM_LBL,
                value: formatMobileNumbers(mobileNumber),
            },
            {
                label: MONTHLY_GROSS_INCOME_TITLE,
                value: `RM ${numeral(mothlyGrossIncome).format("0,0.00")}`,
            },
            {
                label: OTHER_MONTHLY_COMMITMENTS_TITLE,
                value: `RM ${numeral(othermonthlyCommitment).format("0,0.00")}`,
            },
        ]);
        /*
            {
                label: REQUEST_FOR_PHYSICAL_CARD_TITLE,
                value: requestForPhysicalCard === "Y" ? `Yes` : `No`,
            }, */
    }

    function setDeliveryDetails() {
        console.log("[ECConfirmation] >> [setDeliveryDetails]");

        const navParams = route?.params ?? {};
        const address1 = navParams?.address1 ?? "";
        const address2 = navParams?.address2 ?? "";
        const address3 = navParams?.address3 ?? "";
        const mailingAddress =
            navParams?.mailingAddress ??
            `${address1}
             ${address2}
             ${address3}`;
        const postCode = navParams?.postCode ?? "";
        const city = navParams?.city ?? "";

        setDeliveryData([
            {
                label: MAILING_ADDRESS,
                value: mailingAddress,
            },
            {
                label: PLSTP_POSTCODE,
                value: postCode,
            },
            {
                label: PLSTP_CITY,
                value: city,
            },
        ]);
    }

    async function onContinue() {
        console.log("[ECConfirmation] >> [onContinue]");
        const navParams = route?.params ?? {};
        const mbosRefNo = navParams?.mbosRefNo ?? "";

        const nameOnCard = navParams?.nameOnCard ?? "";
        const email = navParams?.email ?? "";
        const mobilePrefix = navParams?.mobilePrefix ?? "";
        const mobileNumberSuffix = navParams?.mobileNumber ?? "";
        const mobileNumber = `${mobilePrefix}${mobileNumberSuffix}`;
        const monthlyGrossIncome = navParams?.monthlyGrossIncome ?? "";
        const otherCommitments = navParams?.otherCommitments ?? "";
        const address = navParams?.address1 ?? "";
        const address2 = navParams?.address2 ?? "";
        const address3 = navParams?.address3 ?? "";
        const city = navParams?.city ?? "";
        const postCode = navParams?.postCode ?? "";

        //Make api request
        const params = {
            channelType: "mae",
            mbosRefNo,
            nameOnCard,
            email,
            mobileNumber,
            monthlyGrossIncome,
            otherCommitments,
            address,
            address2,
            address3,
            city,
            postCode,
        };

        try {
            const httpResp = await makeETCSubmission(params);
            const result = httpResp?.result ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
            const status = result?.status ?? "";
            const isSuccess = result?.isSuccess ?? false;
            const dateTime = result?.dateTime ?? "";
            const referenceNo = result?.referenceNo ?? "";

            if (statusCode === STATUS_CODE_SUCCESS) {
                if (isSuccess) {
                    //requestOTP();
                    initiateS2USdk();
                } else {
                    // Navigate to Status Screen
                    navigation.navigate(STP_CARD_MODULE, {
                        screen: EC_STATUS,
                        params: { ...navParams, status, dateTime, referenceNo },
                    });
                }
            } else {
                // Show error message
                showErrorToast({ message: statusDesc });
            }
        } catch (error) {
            const errorMsg = error?.message || error?.result?.statusDesc || COMMON_ERROR_MSG;
            showErrorToast({ message: errorMsg });
            console.log("[ECConfirmation][onContinue] >> Exception: ", error);
        }
    }

    function showOTPModal() {
        console.log("[ECConfirmation] >> [showOTPModal]");
        setShowOTP(true);
    }

    async function onOTPDone(otp) {
        console.log("[ECConfirmation] >> [onOTPDone]");
        onOTPClose();

        const navParams = route?.params ?? {};
        const mbosRefNo = navParams?.mbosRefNo ?? "";

        //Make api request
        const params = {
            mbosRefNo,
            transactionType: "CARD_STP_VERIFY",
            otp,
            preOrPostFlag: "postlogin",
            channelType: "mae",
            twoFAType: TWO_FA_TYPE_TAC,
        };
        makeStatusEnquiry(params);
    }

    const makeStatusEnquiry = async (requestParams) => {
        console.log("[ECConfirmation] >> [makeStatusEnquiry]");
        try {
            const httpResp = await makeETCStatusInquiry(requestParams);
            const result = httpResp?.result ?? {};
            navigateToNextScreen(result);
        } catch (error) {
            const errorMsg = error?.message || error?.result?.statusDesc || COMMON_ERROR_MSG;
            showErrorToast({ message: errorMsg });
            navigateToNextScreen({});
            console.log("[ECConfirmation][makeStatusEnquiry] >> Exception: ", error);
        }
    };

    const navigateToNextScreen = (result) => {
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
        const status = result?.status ?? "";
        const isSuccess = result?.isSuccess ?? "";
        const dateTime = result?.dateTime ?? "";
        const referenceNo = result?.referenceNo ?? "";
        const cardNumberList = result?.cardNumberList ?? "";

        const navParams = route?.params ?? {};
        const mbosRefNo = navParams?.mbosRefNo ?? "";

        if (statusCode === STATUS_CODE_SUCCESS) {
            //s2u and tac success
            if (isSuccess) {
                // Navigate to Status Screen
                navigation.navigate(STP_CARD_MODULE, {
                    screen: EC_STATUS,
                    params: { ...navParams, status, dateTime, cardNumberList, referenceNo },
                });
            } else {
                navigateToFailStatusPage(mbosRefNo, dateTime);
            }
        } else {
            // Show error message
            navigateToFailStatusPage(mbosRefNo, dateTime);
            showErrorToast({ message: statusDesc });
        }
    };

    const navigateToFailStatusPage = (refnumber, date) => {
        console.log("[ECConfirmation] >> [navigateToFailStatusPage]");

        navigation.navigate(STP_CARD_MODULE, {
            screen: "CardsFail",
            params: {
                ...route.params,
                isSuccess: false,
                headerTxt: CREDITCARD_APPLICATION_FAIL,
                isSubMessage: false,
                errorMessage: "",
                detailsData: [
                    {
                        title: REFERENCE_ID,
                        value: refnumber,
                    },
                    {
                        title: DATE_AND_TIME,
                        value: date,
                    },
                ],
            },
        });
    };

    function closeOTPModal() {
        console.log("[ECConfirmation] >> [closeOTPModal]");
        setShowOTP(false);
        setToken(null);
    }
    function onOTPClose() {
        console.log("[ECConfirmation] >> [onOTPClose]");
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        console.log("[ECConfirmation] >> [onOTPResend]");
        requestOTP(true, showOTPCb);
    }

    const requestOTP = useCallback(
        async (
            isResend = false,
            showOTPCb = () => {
                /*need to add*/
            }
        ) => {
            console.log("[ECConfirmation] >> [requestOTP]");

            const params = {
                mobileNo: mobileNum,
                transactionType: "CARD_STP",
                otp: "",
                preOrPostFlag: "postlogin",
                channelType: "mae",
            };

            try {
                const httpResp = await makeETCRequestTAC(params);
                const result = httpResp?.result ?? {};
                const statusCode = result?.statusCode ?? null;
                const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

                if (statusCode !== STATUS_CODE_SUCCESS) {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                    return;
                }

                const serverToken = result?.token ?? null;
                // Update token and show OTP modal
                setToken(serverToken);
                showOTPModal();
                if (isResend) showOTPCb();
            } catch (error) {
                const errorMsg = error?.message || error?.result?.statusDesc || COMMON_ERROR_MSG;
                showErrorToast({ message: errorMsg });
                console.log("[ECConfirmation][onContinue] >> Exception: ", error);
            }
        },
        []
    );

    const makeETCStatusInquiryFailCall = async () => {
        //Make the final api call in case of s2u reject/expired/cooling
        const navParams = route?.params ?? {};
        const mbosRefNo = navParams?.mbosRefNo ?? "";
        const params = {
            mbosRefNo,
            transactionType: "CARD_STP_VERIFY",
            otp: "",
            preOrPostFlag: "postlogin",
            channelType: "mae",
            twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
            s2uStatus: false,
        };
        await makeETCStatusInquiry(params);
    };

    //S2U V4 START

    const s2uSDKInit = async () => {
        const navParams = route?.params ?? {};

        const transactionPayload = {
            mobileNo: mobileNum,
            transactionType: "ETHICAL_CARD_REQ",
            otp: "",
            cardName: navParams?.cardName,
            mbosRefNo: navParams?.mbosRefNo ?? "",
            twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
            preOrPostFlag: "postlogin",
            channelType: "mae",
        };
        delete transactionPayload.mobileSDKData;
        return await init(FN_ETHICAL_CARDS_APPLICATION, transactionPayload);
    };

    const initiateS2USdk = async () => {
        console.log("[ECConfirmation] >> [initiateS2USdk]");
        try {
            const s2uInitResponse = await s2uSDKInit();
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse);
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //Tac Flow
                    const { isS2uV4ToastFlag } = getModel("misc");
                    setIsS2UDown(isS2uV4ToastFlag ?? false);
                    requestOTP();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration();
                    }
                } else {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            console.log(error, "Ethical Cards initiateS2USdk");
            s2uSdkLogs(error, "Ethical Cards");
        }
    };

    const initS2UPull = async (s2uInitResponse) => {
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigation?.navigate);
                makeETCStatusInquiryFailCall();
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            doS2uRegistration();
        }
    };

    const doS2uRegistration = () => {
        const redirect = {
            succStack: STP_CARD_MODULE,
            succScreen: EC_CONFIRMATION,
        };

        navigateToS2UReg(navigation.navigate, route?.params, redirect);
    };

    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    const onS2uDone = async (response) => {
        console.log("[ECConfirmation] >> [onS2uDone]");
        // Close S2u popup
        onS2uClose();
        handleExecuteResponse(response);
    };

    const handleExecuteResponse = async (response) => {
        console.log("[ECConfirmation] >> [handleExecuteResponse] response:", response);
        try {
            const { transactionStatus, executePayload } = response;

            if (executePayload?.executed && transactionStatus) {
                const result = executePayload?.body?.result ?? executePayload?.result;

                //navigate to next screen
                navigateToNextScreen(result);
            } else {
                handleError(response);
                makeETCStatusInquiryFailCall();
            }
        } catch (error) {
            console.log("[ECConfirmation][prepareStatusEnquiryCall] >> Exception: ", error);
        }
    };

    const handleError = (s2uResponse) => {
        const { executePayload } = s2uResponse;

        //handle for failure/rejected cases
        const entryStack = route?.params?.entryStack || MORE;
        const entryScreen = route?.params?.entryScreen || APPLY_SCREEN;
        const entryPoint = {
            entryStack,
            entryScreen,
            params: {
                ...route?.params?.entryParams,
            },
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: false,
            entryPoint,
            navigate: navigation.navigate,
        };

        handleS2UAcknowledgementScreen(ackDetails);
    };

    const onPersonalDetailsEdit = () => {
        navigation.navigate(STP_CARD_MODULE, {
            screen: EC_PERSONAL_DETAILS,
            params: {
                ...route.params,
            },
        });
    };

    //S2U V4

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={24}
                    useSafeArea
                >
                    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.horizontalMargin}>
                            <Typo lineHeight={18} text={ETHICAL_CARD_TITLE} textAlign="left" />
                            <Typo
                                lineHeight={22}
                                text={PLEASE_CONFIRM_DETAILS}
                                textAlign="left"
                                style={styles.fieldViewCls}
                                fontWeight="600"
                            />
                        </View>
                        <SummaryContainer
                            headerText={PERSONAL_DETAILS_TEXT}
                            data={personalData}
                            sectionEdit={true}
                            editPress={onPersonalDetailsEdit}
                            style={styles.summaryContCls}
                        />
                        <SummaryContainer
                            headerText={DELIVERY_DETAILS}
                            data={deliveryData}
                            sectionEdit={false}
                            style={styles.summaryContCls}
                        />
                        <Typo
                            lineHeight={16}
                            fontSize={12}
                            letterSpacing={0}
                            textAlign="left"
                            style={[styles.noteViewCls, styles.horizontalMargin]}
                        >
                            <Text style={styles.noteHeadingCls}>{`Note: `}</Text>
                            <Text>{ETHICAL_CARD_NOTE}</Text>
                        </Typo>

                        {/* Bottom  button container */}
                        <View
                            style={[
                                styles.horizontalMargin,
                                styles.bottomBtnContCls(safeAreaInsets.bottom),
                            ]}
                        >
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        lineHeight={18}
                                        fontWeight="600"
                                        text="Confirm & Submit"
                                    />
                                }
                                onPress={onContinue}
                            />
                        </View>
                    </ScrollView>
                </ScreenLayout>

                {/* OTP Modal */}
                {showOTP && (
                    <OtpModal
                        otpCode={token}
                        onOtpDonePress={onOTPDone}
                        onOtpClosePress={onOTPClose}
                        onResendOtpPress={onOTPResend}
                        mobileNumber={maskedMobileNo}
                        isS2UDown={isS2UDown}
                    />
                )}
                {showS2UModal && (
                    <Secure2uAuthenticationModal
                        token=""
                        onS2UDone={onS2uDone}
                        onS2uClose={onS2uClose}
                        s2uPollingData={mapperData}
                        transactionDetails={mapperData}
                        secure2uValidateData={mapperData}
                        nonTxnData={nonTxnData}
                        s2uEnablement={true}
                        navigation={navigation}
                        extraParams={{
                            metadata: {
                                txnType: "MAE_CRD_ETHICAL",
                            },
                        }}
                    />
                )}
            </ScreenContainer>
        </>
    );
}

ECConfirmation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    summaryContCls: {
        marginBottom: 0,
    },
    horizontalMargin: {
        paddingHorizontal: 24,
    },
    bottomSpacer: {
        marginTop: 60,
    },

    fieldViewCls: {
        marginTop: 8,
    },

    noteViewCls: {
        marginTop: 24,
        color: DARK_GREY,
    },

    noteHeadingCls: {
        fontWeight: "700",
    },

    headerText: {
        paddingTop: 8,
    },

    radioButtonText: { flexWrap: "wrap", flex: 1 },

    radioContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    tickImage: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    bottomBtnContCls: (paddingBottomVal) => ({
        marginVertical: 30,
        paddingBottom: paddingBottomVal,
    }),
});

export default ECConfirmation;
