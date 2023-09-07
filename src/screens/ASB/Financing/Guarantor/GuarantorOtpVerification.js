import moment from "moment/moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";
import ConfirmNumberScreen from "@screens/CommonScreens/ConfirmNumberScreen";

import {
    ASB_GUARANTOR_NOTIFY_MAIN_APPLICANT,
    JOINT_APPLICANT,
    ZEST_CASA_FAILURE,
    ZEST_CASA_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import OtpModal from "@components/Modals/OtpModal";
import Popup from "@components/Popup";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { asbGuarantorRequestOTP } from "@redux/services/ASBServices/asbGuarantorRequestOTP";
import { asbGuarantorSubmitOTP } from "@redux/services/ASBServices/asbGuarantorSubmitOTP";

import { MEDIUM_GREY } from "@constants/colors";
import { AMBER, GREEN } from "@constants/data";
import {
    GREAT_NEWS,
    YOU_MAY_VIEW,
    TOTAL_FINANING_AMOUNT,
    OKAY,
    APPLICATION_FAILD,
    APPLICATION_FAILD_DEC,
    FA_CONTACT_BANK,
    ENQ_CST_CARE,
    CALL_NOW,
    APPLY_FAIL,
    APPLY_ASBFINANCINGGUARANTOR_FAIL,
    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_COMPLETED,
    DATE_TIME_FORMAT_DISPLAY2,
} from "@constants/strings";

import { maskedMobileNumber } from "@utils";
import { contactBankcall } from "@utils/dataModel/utility";

const GuarantorOtpVerification = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );
    const guarantorFatcaDeclarationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorFatcaDeclarationReducer
    );
    const guarantorOTPReducer = useSelector(
        (state) => state.asbServicesReducer.guarantorOTPReducer
    );

    const { bodyList, dataStoreValidation } = asbApplicationDetailsReducer;

    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const idNumber = asbGuarantorPrePostQualReducer?.idNo;
    const overallValidationResult =
        asbGuarantorPrePostQualReducer?.eligibilityData?.overallValidationResult;
    const { mainApplicantName, resultAsbApplicationDetails } = asbGuarantorPrePostQualReducer;

    const { requestBody } = guarantorOTPReducer;
    const { isUSPerson } = guarantorFatcaDeclarationReducer;
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    // Hooks to access context data
    const { getModel } = useModelController();
    const { mobileNumber } = getModel("user");

    const [notMine, setNotMine] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [token, setToken] = useState(null);
    const [maskedMobileNo, setMaskedMobileNumber] = useState("");
    const [showPopupTimeout, setShowPopupTimeout] = useState(false);

    useEffect(() => {
        init();
    }, []);

    const init = useCallback(() => {
        const mobileNumberWithoutPlusSymbol = mobileNumber.replace("+", "");
        setMaskedMobileNumber(maskedMobileNumber(mobileNumberWithoutPlusSymbol));
    }, [mobileNumber]);

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleProceedOtp() {
        requestOTP();
    }

    async function requestOTP(isResend = false, showOTPCb = () => {}) {
        const body = {
            mobileNo: mobileNumber,
            idNo: idNumber,
            fundTransferType: "ASB_OTP_REQ",
            preOrPostFlag: "prelogin",
        };

        dispatch(
            asbGuarantorRequestOTP(body, (otp) => {
                setToken(otp);
                showOTPModal();
                if (isResend) showOTPCb();
            })
        );
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
        const body = {
            tac: {
                mobileNo: mobileNumber,
                idNo: idNumber,
                fundTransferType: "ASB_OTP_VERIFY",
                preOrPostFlag: "prelogin",
                tacNumber: otp,
            },
            application: requestBody,
        };
        dispatch(
            asbGuarantorSubmitOTP(body, (resultGuarantorSubmitOtp, errorCode) => {
                hideOTPModal();
                const refNumber = resultGuarantorSubmitOtp?.result?.requestMsgRefNo;
                if (resultGuarantorSubmitOtp && !errorCode) {
                    if (isUSPerson || resultAsbApplicationDetails?.stpStaffFlag) {
                        navigation.navigate(JOINT_APPLICANT, {
                            isGuarantor: true,
                            guarantorStpReferenceNumber: stpReferenceNumber,
                        });
                    } else {
                        if (
                            (isUSPerson && overallValidationResult === GREEN) ||
                            (isUSPerson && overallValidationResult === AMBER) ||
                            (!isUSPerson && overallValidationResult === AMBER)
                        ) {
                            navigation.navigate(JOINT_APPLICANT, {
                                isGuarantor: true,
                                guarantorStpReferenceNumber: stpReferenceNumber,
                            });
                        } else {
                            const dataSend = {
                                headingTitle: TOTAL_FINANING_AMOUNT,
                                headingTitleValue: `RM ${numeral(
                                    dataStoreValidation?.headingTitleValue
                                ).format(",0.00")}`,
                                bodyList,
                                mainApplicantName,
                                subTitle: GREAT_NEWS(mainApplicantName),
                                subTitle2: YOU_MAY_VIEW,
                                analyticScreenName:
                                    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_COMPLETED,
                                referenceId: stpReferenceNumber,
                                needFormAnalytics: true,
                                onDoneTap: () => {
                                    goBackHomeScreen(navigation);
                                },
                            };

                            navigation.navigate(ASB_GUARANTOR_NOTIFY_MAIN_APPLICANT, {
                                dataSendNotification: dataSend,
                                triggered: true,
                            });
                        }
                    }
                } else {
                    if (errorCode === 504) {
                        navigation.navigate(ZEST_CASA_STACK, {
                            screen: ZEST_CASA_FAILURE,
                            params: {
                                title: APPLY_FAIL,
                                dateAndTime: moment().format(DATE_TIME_FORMAT_DISPLAY2),
                                referenceId: refNumber,
                                isDebitCardSuccess: false,
                                analyticScreenName: APPLY_ASBFINANCINGGUARANTOR_FAIL,
                                needFormAnalytics: true,
                                onDoneButtonDidTap: () => {
                                    goBackHomeScreen(navigation);
                                },
                            },
                        });
                    } else if (errorCode === 400) {
                        // navigation.canGoBack() && navigation.goBack();
                        showErrorToast({
                            message: "Invalid OTP",
                        });
                    } else if (errorCode === 9999) {
                        setShowPopupTimeout(true);
                    } else {
                        setShowPopupTimeout(true);
                    }
                }
            })
        );
    }

    function closeOTPModal() {
        setShowOTP(false);
        setToken(null);
    }
    function onOTPClose() {
        closeOTPModal();
    }

    function onOTPResend(showOTPCb) {
        requestOTP(true, showOTPCb);
    }

    function onPopupTimeoutClose() {
        setShowPopupTimeout(false);
    }

    async function handleTimeoutBtn() {
        setShowPopupTimeout(false);
    }

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
                <ConfirmNumberScreen
                    reqType="OTP"
                    otpText="One Time Password"
                    mobileNumber={maskedMobileNo}
                    btnText="Confirm"
                    subBtnText="Not Mine"
                    onConfirmBtnPress={handleProceedOtp}
                    onNotMeBtnPress={handleNotMine}
                />
            </ScreenLayout>
            <Popup
                visible={notMine}
                onClose={handleCloseNotMine}
                title={FA_CONTACT_BANK}
                description={ENQ_CST_CARE}
                primaryAction={{
                    text: { CALL_NOW },
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
                />
            )}

            <Popup
                visible={showPopupTimeout}
                onClose={onPopupTimeoutClose}
                title={APPLICATION_FAILD}
                description={APPLICATION_FAILD_DEC}
                primaryAction={{
                    text: OKAY,
                    onPress: handleTimeoutBtn,
                }}
            />
        </ScreenContainer>
    );
};

export const otpVerification = (GuarantorOtpVerification.propTypes = {
    navigation: PropTypes.object,
});

export default GuarantorOtpVerification;
