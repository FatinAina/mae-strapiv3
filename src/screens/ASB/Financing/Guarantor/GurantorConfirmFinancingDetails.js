import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";
import { navigateToS2UCooling, navigateToS2UReg } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Secure2uAuthenticationModal from "@components/Modals/Secure2uAuthenticationModal";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { logEvent } from "@services/analytics";

import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, SEPARATOR, WHITE } from "@constants/colors";
import { M2U, S2U_PUSH, SMS_TAC, DT_RECOM, GREEN, AMBER } from "@constants/data";
import {
    FN_ASB_GUARANTOR,
    FN_ASB_GUARANTOR_MULTITIER,
    TWO_FA_TYPE_SECURE2U_PULL,
} from "@constants/fundConstants";
import {
    AGREE_PROCEED,
    FA_FORM_COMPLETE,
    FA_SCREEN_NAME,
    FA_TRANSACTION_ID,
    FA_VIEW_SCREEN,
    YOUR_FINANCING,
    BY_PROCEED,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    CANCEL,
    LEAVE,
    CURRENCY,
    SMALL_YEARS,
    SUCC_STATUS,
    FAILED,
    FIRST_3_YEARS,
    NEXT_4_25_YEARS,
    ASB_FINANCING_GUARANTOR,
    TOTAL_FINANING_AMOUNT,
    GREAT_NEWS,
    YOU_MAY_VIEW,
    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_COMPLETED,
    APPLY_FAIL,
    APPLY_ASBFINANCINGGUARANTOR_FAIL,
    APPLICATION_FAILD,
    APPLICATION_FAILD_DEC,
    OKAY,
} from "@constants/strings";

import {
    init,
    initChallenge,
    handleS2UAcknowledgementScreen,
    showS2UDownToast,
} from "@utils/dataModel/s2uSDKUtil";
import { getShadow } from "@utils/dataModel/utilityPartial.2";

const GurantorConfirmFinancingDetails = ({ route, navigation }) => {
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );

    const dataStoreValidation = asbApplicationDetailsReducer?.dataStoreValidation;

    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const subTitle = dataStoreValidation?.subTitle;
    const headingTitle = dataStoreValidation?.headingTitle;
    const headingTitleValue = dataStoreValidation?.headingTitleValue;
    const bodyList = dataStoreValidation?.bodyList;
    const analyticScreenName = dataStoreValidation?.analyticScreenName;
    const needFormAnalytics = dataStoreValidation?.needFormAnalytics;
    const referenceId = dataStoreValidation?.referenceId;
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const isAdditionalDetails = route?.params?.isAdditionalDetails;

    const [showS2UScreen, setS2UScreen] = useState(false);
    const [mapperData, setMapperData] = useState({});
    const [functionalCode, setFunctionalCode] = useState("");
    const [eligibilityResponse, setEligibilityResponse] = useState({});
    const { getModel } = useModelController();
    const guarantorFatcaDeclarationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorFatcaDeclarationReducer
    );
    const { isUSPerson } = guarantorFatcaDeclarationReducer;
    const eligibilityData = asbApplicationDetailsReducer?.data?.stpEligibilityResponse;
    const overallValidationResult =
        asbGuarantorPrePostQualReducer?.eligibilityData?.overallValidationResult;
    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );
    const { mainApplicantName, resultAsbApplicationDetails, additionalDetails } =
        asbGuarantorPrePostQualReducer;
    const { isAcceptedDeclaration } = personalInformationReducer;
    const eligibilityCheckOutcome = JSON.parse(eligibilityData)?.eligibilityCheckOutcome;
    const [showPopupTimeout, setShowPopupTimeout] = useState(false);

    useEffect(() => {
        initValue();
        if (analyticScreenName) {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: analyticScreenName,
            });
            if (needFormAnalytics) {
                if (referenceId) {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                        [FA_TRANSACTION_ID]: referenceId,
                    });
                } else {
                    logEvent(FA_FORM_COMPLETE, {
                        [FA_SCREEN_NAME]: analyticScreenName,
                    });
                }
            }
        }
    }, [analyticScreenName, needFormAnalytics, referenceId]);

    const initValue = async () => {
        try {
            let eligibilityResult = {};
            eligibilityCheckOutcome.map((data) => {
                eligibilityResult = data;
                if (data.dataType === DT_RECOM) {
                    eligibilityResult = data;
                }
            });
            setEligibilityResponse(eligibilityResult);
            setFunctionalCode(
                eligibilityResult?.tierList.length === 1
                    ? FN_ASB_GUARANTOR
                    : FN_ASB_GUARANTOR_MULTITIER
            );
        } catch (e) {}
    };
    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    function onDoneTap() {
        updateApiCEP(() => {
            handleProceed();
            // navigation.navigate(navigationConstant.ASB_GUARANTOR_OTP_VERIFICATION);
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                    {successLayout()}
                    {buildActionButton()}
                </ScreenLayout>
                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
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
        </React.Fragment>
    );

    function onBackTap() {
        if (isAdditionalDetails) {
            navigation.navigate(navigationConstant.ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME);
        } else {
            navigation.navigate(navigationConstant.ASB_GUARANTOR_CONFIRMATION);
        }
    }

    function onCloseTap() {
        setShowPopupConfirm(true);
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function onPopupTimeoutClose() {
        setShowPopupTimeout(false);
    }

    async function handleTimeoutBtn() {
        setShowPopupTimeout(false);
    }

    async function handleLeaveBtn() {
        setShowPopupConfirm(false);
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    }

    function updateApiCEP(callback) {
        const body = {
            screenNo: "14",
            stpReferenceNo: stpReferenceNumber,
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    function closeS2UScreen() {
        setS2UScreen(false);
        navigation.navigate(navigationConstant.ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS);
    }
    async function handleProceed() {
        const transactionPayload = await getVerificationBody();

        const s2uInitResponse = await s2uSDKInit(transactionPayload);

        if (s2uInitResponse?.message || s2uInitResponse.statusCode !== 0) {
            showErrorToast({
                message: s2uInitResponse.message,
            });
        } else {
            if (s2uInitResponse?.actionFlow === SMS_TAC) {
                //Tac Flow
                showS2UDownToast();
                navigation.navigate(navigationConstant.ASB_GUARANTOR_OTP_VERIFICATION);
                // confirmNumber();
            } else if (s2uInitResponse?.actionFlow === S2U_PUSH) {
                //Show screen to register s2u in this device

                if (s2uInitResponse?.s2uRegistrationDetails?.app_id === M2U) {
                    navigateToS2URegistration(navigation.navigate);
                }
            } else {
                //S2U Pull Flow

                initS2UPull(s2uInitResponse);
            }
        }
    }

    //S2U V4
    async function initS2UPull(s2uInitResponse) {
        if (s2uInitResponse?.s2uRegistrationDetails?.isActive) {
            if (s2uInitResponse?.s2uRegistrationDetails?.isUnderCoolDown) {
                //S2U under cool down period
                navigateToS2UCooling(navigation.navigate);
            } else {
                const challengeRes = await initChallenge();
                if (challengeRes?.message) {
                    showErrorToast({ message: challengeRes?.message });
                } else {
                    setMapperData(challengeRes?.mapperData);
                    setS2UScreen(true);
                }
            }
        } else {
            //Redirect user to S2U registration flow
            navigateToS2URegistration(navigation.navigate);
        }
    }

    function navigateToS2URegistration(navigate) {
        const redirect = {
            succStack: navigationConstant.ASB_STACK,
            succScreen: navigationConstant.ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS,
        };

        navigateToS2UReg(navigate, route?.params, redirect, getModel);
    }

    async function s2uSDKInit(transactionPayload) {
        return await init(functionalCode, transactionPayload);
    }

    function onS2uDone(response) {
        // Close S2u popup
        closeS2UScreen();
        navigateToAcknowledgementScreen(response);
    }
    //S2U V4
    function navigateToAcknowledgementScreen(response) {
        const { transactionStatus, executePayload } = response;

        if (executePayload?.executed && transactionStatus) {
            //execute got success and it hit the final api call and now need to handle final call response
            proceedNextScreen(executePayload);
        } else {
            const entryPoint = {
                entryStack: navigationConstant.ASB_STACK,
                entryScreen: navigationConstant.ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS,
                params: { serviceResult: transactionStatus ? SUCC_STATUS : FAILED },
            };

            const ackDetails = {
                executePayload,
                transactionSuccess: transactionStatus,
                entryPoint,
                navigate: navigation.navigate,
            };
            handleS2UAcknowledgementScreen(ackDetails);
        }
    }

    function proceedNextScreen(response) {
        console.log(
            "proceedNextScreen :: ",
            isUSPerson,
            resultAsbApplicationDetails?.stpStaffFlag,
            overallValidationResult
        );
        if (response) {
            if (isUSPerson || resultAsbApplicationDetails?.stpStaffFlag) {
                navigation.navigate(navigationConstant.JOINT_APPLICANT, {
                    isGuarantor: true,
                    guarantorStpReferenceNumber: stpReferenceNumber,
                });
            } else {
                if (
                    (isUSPerson && overallValidationResult === GREEN) ||
                    (isUSPerson && overallValidationResult === AMBER) ||
                    (!isUSPerson && overallValidationResult === AMBER)
                ) {
                    navigation.navigate(navigationConstant.JOINT_APPLICANT, {
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
                        analyticScreenName: APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_COMPLETED,
                        referenceId: stpReferenceNumber,
                        needFormAnalytics: true,
                        onDoneTap: () => {
                            goBackHomeScreen(navigation);
                        },
                    };

                    navigation.navigate(navigationConstant.ASB_GUARANTOR_NOTIFY_MAIN_APPLICANT, {
                        dataSendNotification: dataSend,
                        triggered: true,
                    });
                }
            }
        } else {
            if (response.code === 504) {
                navigation.navigate(navigationConstant.ZEST_CASA_STACK, {
                    screen: navigationConstant.ZEST_CASA_FAILURE,
                    params: {
                        title: APPLY_FAIL,
                        dateAndTime: moment().format("DD MMM YYYY, HH:mm A"),
                        referenceId: response?.result?.requestMsgRefNo,
                        isDebitCardSuccess: false,
                        analyticScreenName: APPLY_ASBFINANCINGGUARANTOR_FAIL,
                        needFormAnalytics: true,
                        onDoneButtonDidTap: () => {
                            goBackHomeScreen(navigation);
                        },
                    },
                });
            } else if (response.code === 400) {
                // navigation.canGoBack() && navigation.goBack();
                showErrorToast({
                    message: "Invalid OTP",
                });
            } else if (response.code === 9999) {
                setShowPopupTimeout(true);
            } else {
                setShowPopupTimeout(true);
            }
        }
    }

    async function getVerificationBody() {
        let transPayload = {
            functionName: ASB_FINANCING_GUARANTOR,
            totalFinancingAmount: headingTitleValue,
            takaful: CURRENCY + numeral(eligibilityResponse?.totalGrossPremium).format(",0.00"),
            // application: requestBody,
            application: {
                stpId: stpReferenceNumber,
                branchName: additionalDetails?.stpBranch,
                siAccNo: additionalDetails?.stpAsbHolderNum,
                consentToUsePDPA: isAcceptedDeclaration,
                ethnic: additionalDetails?.stpRaceCode,
                countryOfOnboarding: "",
            },
            twoFAType: TWO_FA_TYPE_SECURE2U_PULL,
        };
        if (eligibilityResponse?.tierList?.length === 2) {
            transPayload = {
                ...transPayload,
                profitRate1: eligibilityResponse?.tierList[0]?.interestRate + "%" + FIRST_3_YEARS,
                monthlyRepayment1:
                    CURRENCY +
                    numeral(eligibilityResponse?.tierList[0]?.installmentAmount).format(",0.00") +
                    FIRST_3_YEARS,
                profitRate2:
                    eligibilityResponse?.tierList[1]?.interestRate +
                    "%" +
                    NEXT_4_25_YEARS +
                    eligibilityResponse?.tenure +
                    " " +
                    SMALL_YEARS,
                monthlyRepayment2:
                    CURRENCY +
                    numeral(eligibilityResponse?.tierList[1]?.installmentAmount).format(",0.00") +
                    NEXT_4_25_YEARS +
                    eligibilityResponse?.tenure +
                    " " +
                    SMALL_YEARS,
                recommendedTenure: eligibilityResponse?.tenure + " " + SMALL_YEARS,
            };
        } else {
            transPayload = {
                ...transPayload,
                tenure: eligibilityResponse?.tenure + " " + SMALL_YEARS,
                profitRate: eligibilityResponse?.tierList[0]?.interestRate + "%",
                monthlyRepayment:
                    CURRENCY +
                    numeral(eligibilityResponse?.tierList[0]?.installmentAmount).format(",0.00"),
            };
        }
        return transPayload;
    }

    function successLayout() {
        return (
            <React.Fragment>
                <ScreenContainer backgroundType="color">
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            />
                        }
                        paddingHorizontal={0}
                        paddingBottom={0}
                        paddingTop={0}
                        useSafeArea
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={styles.formContainer}>
                                    <View style={styles.contentContainer}>
                                        <View>
                                            {subTitle && (
                                                <Typo
                                                    fontSize={16}
                                                    fontWeight="600"
                                                    lineHeight={24}
                                                    textAlign="left"
                                                    text={YOUR_FINANCING}
                                                />
                                            )}

                                            <SpaceFiller height={24} />

                                            {buildGuarantorValidationForm()}

                                            <Typo
                                                lineHeight={22}
                                                textAlign="left"
                                                text={BY_PROCEED}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {showS2UScreen && (
                            //S2U V4
                            <Secure2uAuthenticationModal
                                token=""
                                onS2UDone={onS2uDone}
                                onS2uClose={closeS2UScreen}
                                s2uPollingData={mapperData}
                                transactionDetails={mapperData}
                                // secure2uValidateData={mapperData}
                                s2uEnablement={true}
                            />
                        )}
                    </ScreenLayout>
                </ScreenContainer>
            </React.Fragment>
        );
    }

    function buildGuarantorValidationForm() {
        return (
            <View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <View style={styles.shadow}>
                            <Spring style={styles.card} activeOpacity={0.9}>
                                <View style={styles.cardBody}>
                                    <SpaceFiller height={24} />
                                    <View style={styles.formContainerCard}>
                                        <View>
                                            <Typo lineHeight={18} text={headingTitle} />
                                            <SpaceFiller height={4} />
                                            <Typo
                                                fontSize={24}
                                                lineHeight={29}
                                                fontWeight="700"
                                                text={headingTitleValue}
                                            />
                                        </View>
                                    </View>
                                    <SpaceFiller height={8} />
                                    <View style={styles.recRow} />
                                    <SpaceFiller height={14} />
                                    {bodyList?.map((data, index) => {
                                        return (
                                            <View key={index}>
                                                {data?.isVisible &&
                                                    (!data?.isMutiTierVisible ||
                                                        !data?.divider) && (
                                                        <View style={styles.cardBodyRow}>
                                                            <View style={styles.cardBodyColL}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    textAlign="left"
                                                                    text={data.heading}
                                                                />
                                                            </View>
                                                            <View style={styles.cardBodyColR}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    fontWeight="600"
                                                                    textAlign="right"
                                                                    text={data.headingValue}
                                                                />
                                                            </View>
                                                        </View>
                                                    )}
                                                {data?.isMutiTierVisible && (
                                                    <View style={styles.cardBodyRow}>
                                                        <View style={styles.cardBodyColL}>
                                                            <Typo
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                                text={data.heading}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                                {data?.divider && (
                                                    <View>
                                                        <View style={styles.recRow} />
                                                        <SpaceFiller height={8} />
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </Spring>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    function buildActionButton() {
        return (
            <FixedActionContainer>
                <View style={styles.bottomBtnContCls}>
                    <View style={styles.footer}>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={AGREE_PROCEED} />
                            }
                            onPress={onDoneTap}
                        />
                    </View>
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (GurantorConfirmFinancingDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
});

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    card: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingBottom: 25,
        paddingVertical: 0,
        width: "100%",
    },
    cardBody: {
        paddingHorizontal: 16,
    },

    cardBodyColL: {
        width: "65%",
    },
    cardBodyColR: {
        width: "35%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    container: {
        flex: 1,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    formContainer: {
        marginBottom: 40,
        marginTop: 20,
    },
    formContainerCard: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    shadow: {
        ...getShadow({}),
    },
    contentContainer: {
        marginHorizontal: 24,
    },
});

export default GurantorConfirmFinancingDetails;
