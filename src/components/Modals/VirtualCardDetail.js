import { BlurView } from "@react-native-community/blur";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Modal } from "react-native";

import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import { BANKINGV2_MODULE, ACCOUNT_DETAILS_SCREEN } from "@navigation/navigationConstant";

import OtpModal from "@components/Modals/OtpModal";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { requestTAC, verifyOTPCardCVV } from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { WHITE, SEPARATOR, LIGHT_GREY, GRAY, TRANSPARENT } from "@constants/colors";
import { M2U, S2U_PUSH, S2U_PULL, SMS_TAC } from "@constants/data";
import {
    FN_VIEW_CARD_CVV,
    FN_VIEW_CARD_EXPIRY,
    TWO_FA_TYPE_SECURE2U_PULL,
    TWO_FA_TYPE_TAC,
} from "@constants/fundConstants";
import {
    CARD,
    CARD_DETAILS,
    CARD_NUMBER,
    COMMON_ERROR_MSG,
    CVV,
    EXPIRY_DATE,
    FOOTER_NOTE_VIEW_CARD_DETAILS,
} from "@constants/strings";

import { encryptData } from "@utils/dataModel";
import {
    init,
    initChallenge,
    s2uSdkLogs,
    handleS2UAcknowledgementScreen,
} from "@utils/dataModel/s2uSDKUtil";
import { maskAccount } from "@utils/dataModel/utility";
import { getCardNoLength } from "@utils/dataModel/utilityPartial.3";
import { formatCreditCardNo } from "@utils/dataModel/utilityPartial.6";

import Assets from "@assets";

const VirtualCardDetail = ({ showModal, onClose, data, navigation, maskedMobileNum, getModel }) => {
    const [mapperData, setMapperData] = useState({});
    const [showS2UModal, setShowS2UModal] = useState(false);
    const [showTACModal, setShowTACModal] = useState(false);
    const [token, setToken] = useState("");
    const [showViewCardDetail, setShowViewCardDetail] = useState(false);
    const [isS2UDown, setIsS2UDown] = useState(false);

    const [cardNo, setCardNo] = useState("");
    const [expiry, setExpiry] = useState(null);
    const [cvv, setCvv] = useState(null);
    const [actionType, setActionType] = useState(null);

    const cardCVVData = [
        { placeholder: CARD_NUMBER, value: "cardNo", displayValue: cardNo },
        { placeholder: EXPIRY_DATE, value: "EXPIRY", displayValue: expiry, maskedValue: "****" },
        { placeholder: CVV, value: "CVV", displayValue: cvv, maskedValue: "***" },
    ];

    useEffect(() => {
        if (showModal) {
            populateCardNo();
            setShowViewCardDetail(true);
        }
    }, [showModal]);

    const hideModal = () => {
        onClose();
        setShowViewCardDetail(false);
        setCvv(null);
        setExpiry(null);
    };

    const getEncryptedCardNo = async (cardNo) => {
        return await encryptData(cardNo);
    };

    const formatExpiry = (expiry) => {
        return expiry.slice(0, 2) + "/" + expiry.slice(2, 4);
    };

    const populateCardNo = () => {
        const length = data?.cardNo ? getCardNoLength(data.cardNo) : 0;
        const cardNo = data?.cardNo.substring(0, length);
        const formattedCardNo = formatCreditCardNo(cardNo);
        setCardNo(formattedCardNo);
    };

    const populateCVVData = (payload) => {
        if (actionType === "EXPIRY") {
            const expiryVal = payload?.expiry ? formatExpiry(payload?.expiry) : null;
            setExpiry(expiryVal);
        } else {
            const pinBlock = payload?.pinBlock ?? null;
            setCvv(pinBlock);
        }

        setShowViewCardDetail(true);
    };

    if (!showModal) return null;

    const handleS2uFlow = async (action) => {
        try {
            const params = {
                cardNo: await getEncryptedCardNo(data?.cardNo),
                cardHolderName: data?.cardHolderName,
                twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
                actionType: action,
            };

            const functionCode = action === "CVV" ? FN_VIEW_CARD_CVV : FN_VIEW_CARD_EXPIRY;
            const s2uInitResponse = await s2uSDKInit(functionCode, params);
            console.log("S2U SDK s2uInitResponse : ", s2uInitResponse.actionFlow);
            if (s2uInitResponse?.message || s2uInitResponse?.statusCode !== 0) {
                console.log("s2uInitResponse error : ", s2uInitResponse.message);
                hideModal();
                showErrorToast({
                    message: s2uInitResponse.message,
                });
            } else {
                if (s2uInitResponse?.actionFlow === SMS_TAC) {
                    //TAC Flow
                    const { isS2uV4ToastFlag } = getModel("misc");
                    setIsS2UDown(isS2uV4ToastFlag ?? false);
                    requestOTP();
                } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                    if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                        doS2uRegistration();
                    }
                } else if (s2uInitResponse?.actionFlow === S2U_PULL) {
                    initS2UPull(s2uInitResponse);
                }
            }
        } catch (error) {
            hideModal();
            s2uSdkLogs(error, "View Credit Card Detail");
        }
    };

    //S2U V4
    const initS2UPull = async (s2uInitResponse) => {
        console.log("initS2UPull", s2uInitResponse?.s2uRegistrationDetails?.isActive);
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigation?.navigate);
            } else {
                const challengeRes = await initChallenge();
                console.log("initChallenge RN Response :: ", challengeRes);
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                    hideModal();
                } else {
                    const mapperData = challengeRes?.mapperData;
                    mapperData.body.unshift({
                        key: CARD,
                        value: `${data?.cardHolderName}\n${maskAccount(data?.cardNo)}`,
                    });
                    setMapperData(mapperData);
                    setShowS2UModal(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            hideModal();
            doS2uRegistration();
        }
    };

    const s2uSDKInit = async (functionCode, params) => {
        return await init(functionCode, params);
    };

    const doS2uRegistration = () => {
        const params = {};
        const redirect = {
            succStack: BANKINGV2_MODULE,
            succScreen: ACCOUNT_DETAILS_SCREEN,
        };
        navigateToS2UReg(navigation.navigate, params, redirect);
    };

    const onS2uDone = async (response) => {
        // Close S2u popup
        onS2uClose();
        const { transactionStatus, executePayload } = response;
        if (executePayload?.executed && transactionStatus) {
            const statusCode = executePayload?.result?.statusCode;
            //Check for 0000 - STATUS_CODE_SUCCESS
            if (statusCode === STATUS_CODE_SUCCESS) {
                populateCVVData(executePayload?.result);
            } else {
                onClose();
                showErrorToast({ message: executePayload?.result?.statusDesc });
            }
        } else {
            onClose();
            handleError(response);
        }
    };

    const onS2uClose = () => {
        setShowS2UModal(false);
    };

    const handleError = (s2uResponse) => {
        const { executePayload } = s2uResponse;

        //handle for failure/rejected cases
        const entryStack = BANKINGV2_MODULE;
        const entryScreen = ACCOUNT_DETAILS_SCREEN;
        const entryPoint = {
            entryStack,
            entryScreen,
        };
        const ackDetails = {
            executePayload,
            transactionSuccess: false,
            entryPoint,
            navigate: navigation.navigate,
        };

        handleS2UAcknowledgementScreen(ackDetails);
    };

    const requestOTP = async (isResend = false, showOTPCb = () => {}) => {
        const params = {
            fundTransferType: "ETHICAL_CARD_CVV",
            cardNo: await getEncryptedCardNo(data?.cardNo),
        };

        try {
            const httpResp = await requestTAC(params, false, "2fa/v1/tac");
            const result = httpResp?.data ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

            if (statusCode !== "0") {
                showErrorToast({
                    message: statusDesc,
                });
                return;
            } else {
                const serverToken = result?.token ?? null;
                setToken(serverToken);
                setShowTACModal(true);
            }

            if (isResend) showOTPCb();
        } catch (error) {
            hideModal();
        }
    };

    const onOTPClose = () => {
        onClose();
        setShowTACModal(false);
        setToken("");
    };

    const onOTPDone = async (otp, otpModalErrorCb) => {
        setToken("");
        const params = {
            cardNo: await getEncryptedCardNo(data?.cardNo),
            tac: otp,
            twoFAType: TWO_FA_TYPE_TAC,
            actionType,
        };
        verifyViewCardOTP(params, otpModalErrorCb);
    };

    const onOTPResend = (showOTPCb) => {
        requestOTP(true, showOTPCb);
    };

    const verifyViewCardOTP = async (params, otpModalErrorCb) => {
        try {
            const httpResp = await verifyOTPCardCVV(params);
            const result = httpResp?.data ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

            if (statusCode === STATUS_CODE_SUCCESS) {
                setShowTACModal(false);
                populateCVVData(result);
            } else if (statusCode === "0A5" || statusCode === "00A5") {
                otpModalErrorCb(statusDesc);
            } else {
                showErrorToast({
                    message: statusDesc || COMMON_ERROR_MSG,
                });
                onClose();
            }
        } catch (error) {
            console.log("verifyViewCardOTP", error);
            onClose();
        }
    };

    const hideCardModal = () => {
        setShowViewCardDetail(false);
    };

    const retrieveData = (type) => {
        hideCardModal();
        setActionType(type);
        handleS2uFlow(type);
    };

    const renderDataList = ({ placeholder, value, displayValue, maskedValue }) => {
        return (
            <>
                <View style={styles.fieldMainContainer}>
                    <View style={styles.fieldRightContainer}>
                        <Typo text={placeholder} textAlign="left" lineHeight={18} />
                        <SpaceFiller height={10} />
                        <Typo
                            text={displayValue ?? maskedValue}
                            textAlign="left"
                            lineHeight={18}
                            fontWeight="600"
                        />
                    </View>

                    {displayValue ? (
                        <Image source={Assets.icShowEye} />
                    ) : (
                        <TouchableOpacity
                            onPress={() => {
                                retrieveData(value);
                            }}
                            style={styles.showHideIcon}
                        >
                            <Image source={Assets.icHideEye} />
                        </TouchableOpacity>
                    )}
                </View>
                <SpaceFiller height={15} />
                <SpaceFiller width="100%" height={1} backgroundColor={SEPARATOR} />
                <SpaceFiller height={15} />
            </>
        );
    };

    return (
        <>
            {showViewCardDetail && (
                <>
                    <BlurView style={styles.blur} blurType="dark" blurAmount={10} />

                    <Modal
                        visible={true}
                        transparent
                        hardwareAccelerated
                        onRequestClose={hideModal}
                        animationType="slide"
                    >
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.flexFull}
                            onPress={hideModal}
                        />

                        <View style={styles.dialogContainer}>
                            <View style={styles.dialogCloseContainer}>
                                <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
                                    <Image source={Assets.icCloseBlack} />
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Typo
                                    text={CARD_DETAILS}
                                    textAlign="left"
                                    fontSize={16}
                                    lineHeight={18}
                                    fontWeight="600"
                                />
                                <SpaceFiller height={30} />
                                {cardCVVData.map((item) => {
                                    return renderDataList(item);
                                })}
                                <SpaceFiller height={15} />
                                <Typo
                                    text={FOOTER_NOTE_VIEW_CARD_DETAILS}
                                    textAlign="left"
                                    fontSize={12}
                                    lineHeight={17}
                                    color={GRAY}
                                />
                            </View>
                        </View>
                    </Modal>
                </>
            )}
            {showS2UModal && (
                <Secure2uAuthenticationModal
                    token=""
                    onS2UDone={onS2uDone}
                    onS2uClose={onS2uClose}
                    s2uPollingData={mapperData}
                    transactionDetails={mapperData}
                    secure2uValidateData={mapperData}
                    nonTxnData={{ isNonTxn: true }}
                    s2uEnablement={true}
                    navigation={navigation}
                    extraParams={{
                        metadata: {
                            txnType: "VIEW_CARD_DETAIL",
                        },
                    }}
                />
            )}
            {/* OTP Modal */}
            {showTACModal && (
                <OtpModal
                    otpCode={token}
                    onOtpDonePress={onOTPDone}
                    onOtpClosePress={onOTPClose}
                    onResendOtpPress={onOTPResend}
                    mobileNumber={maskedMobileNum}
                    isS2UDown={isS2UDown}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    blur: {
        bottom: 0,
        elevation: 10,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
    },
    closeButton: {
        height: 20,
        width: 20,
    },
    dialogCloseContainer: {
        alignSelf: "flex-end",
        marginBottom: 10,
    },
    dialogContainer: {
        backgroundColor: WHITE,
        borderRadius: 20,
        width: "100%",
        padding: 30,
        height: "55%",
        bottom: -15,
    },
    flex: {
        flex: 1,
    },
    flexFull: {
        flex: 1,
        width: "100%",
    },
    overlayStyle: {
        backgroundColor: TRANSPARENT,
    },
    popupInner: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        position: "relative",
    },
    copyToastContainer: {
        backgroundColor: GRAY,
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingHorizontal: 24,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cancelToast: { height: 30, width: 30 },
    copyButton: {
        borderWidth: 1,
        borderRadius: 40,
        borderColor: LIGHT_GREY,
        paddingVertical: 8,
        flex: 1,
        alignSelf: "center",
    },
    fieldMainContainer: { flexDirection: "row" },
    fieldRightContainer: { flex: 3 },
    showHideIcon: { justifyContent: "center" },
});

VirtualCardDetail.propTypes = {
    showModal: PropTypes.bool,
    onClose: PropTypes.func,
    data: PropTypes.object,
    navigation: PropTypes.object,
    maskedMobileNum: PropTypes.string,
    getModel: PropTypes.func,
};

export default VirtualCardDetail;
