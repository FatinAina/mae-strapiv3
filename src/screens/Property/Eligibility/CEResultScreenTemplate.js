/* eslint-disable sonarjs/cognitive-complexity */

/* eslint-disable react/prop-types */

/* eslint-disable react/react-in-jsx-scope */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useRef } from "react";
import {
    Dimensions,
    View,
    ScrollView,
    Platform,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    BANKINGV2_MODULE,
    CE_ADD_JA_DETAILS,
    CE_PF_NUMBER,
    CE_PROPERTY_LIST,
    CE_RESULT,
    CONNECT_SALES_REP,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import ScreenLayout from "@components/Layouts/ScreenLayout";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import {
    FAProperty,
    getFAViewOtherProperties,
    getFAOnDownPaymentPress,
    getFAOnPressJA,
    getFAOnPressRFA,
} from "@services/analytics/analyticsProperty";

import { WHITE, BLACK, IRISBLUE, YELLOW, MEDIUM_GREY } from "@constants/colors";
import {
    STATUS_PASS,
    STATUS_SOFT_FAIL,
    STATUS_HARD_FAIL,
    AMBER,
    ELIGIBILTY_STATUS_ELIGIBLE,
} from "@constants/data";
import {
    PROCEED_WITH_APPLICATION,
    REMOVE_JOINT_TITLE,
    FA_VIEW_APPLICATION,
    APPLYSUCCPOPUP_TITLE,
    APPLY_SUCCESS_POPUP_SUBTITLE,
    APPLYSUCCPOPUP_DESC,
    OKAY,
    GOT_IT,
    REMOVE,
    CANCEL,
    SAVE,
    DONT_SAVE,
    EXIT_POPUP_DESC,
    EXIT_JA_POPUP_TITLE,
    EXIT_POPUP_TITLE,
    REMOVE_JOINT_DESCRIPTION,
    PROPERTY_MDM_ERR,
    FA_PROPERTY_JA_NOT_ELIGIBLE,
    REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE,
    REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC,
    COMMON_ERROR_MSG,
    FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA,
    FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA,
    TENURE,
    FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utility";

import Assets from "@assets";

import { getMDMData, getMasterData, useResetNavigation } from "../Common/PropertyController";
import { checkEligibility, checkJAEligibility, saveEligibilityInput } from "./CEController";
import { getFormData } from "./CERFormController";
import CEResultApplicantTemplate from "./CEResultApplicantTemplate";
import DownpaymentOverlay from "./DownpaymentOverlay";
import OfferDisclaimerPopup from "./OfferDisclaimerPopup";
import TenureOverlay from "./TenureOverlay";

const screenHeight = Dimensions.get("window").height;
const imageHeight = Math.max((screenHeight * 40) / 100, 350);

const imgAnimFadeInUp = {
    0: {
        opacity: 0,
        translateY: 40,
    },
    1: {
        opacity: 1,
        translateY: 0,
    },
};

function CEResultScreenTemplate({
    state,
    onApplyLoan,
    status,
    navParams,
    onOpenRemoveJointApplicantPopup,
    onViewOfferDisclaimer,
    eligibilityStatus,
    onMainApplyLoan,
    onScroll,
    onViewApplicationPress,
    loading,
    onCloseRemoveJointApplicantPopup,
    removeJointApplicantOnClick,
    onPressOkApplySuccessPopup,
    setLoading,
    saveEligibilityResult,
    navigation,
    dispatch,
    populateData,
}) {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef();
    const [resetToDiscover, resetToApplication] = useResetNavigation(navigation);

    const onPressAddJointApplicant = async () => {
        console.log("[CEResult] >> [onPressAddJointApplicant]");
        setLoading(true);

        const data = navParams ?? {};
        const propertyDetails = data?.propertyDetails ?? "";
        data.isMainEligDataType = data?.eligibilityResult?.dataType;
        data.loanAmount = data?.origLoanAmount ? data?.origLoanAmount : data?.loanAmount;
        data.downPaymentAmount = data?.origDownPaymentAmount
            ? data?.origDownPaymentAmount
            : data?.downPaymentAmount;
        data.tenure = data?.origTenure ? data?.origTenure : data?.tenure;
        data.maEligibilityResult = data?.eligibilityResult;

        // save CE result
        await saveEligibilityResult();

        let masterData = data?.masterData ?? {};
        let mdmData = data?.mdmData ?? {};

        //if masterData is not available then get the data
        if (Object.keys(masterData).length === 0) {
            // Prefetch required data
            masterData = await getMasterData(false);
            mdmData = await getMDMData(false);

            // Show error if failed to fetch MDM data
            if (!mdmData) {
                showErrorToast({
                    message: PROPERTY_MDM_ERR,
                });
                setLoading(false);
                return;
            }
        }

        // navigate to Add Joint Applicant details screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_DETAILS,
            params: {
                propertyDetails,
                syncId: data?.syncId,
                ...data,
                masterData,
                mdmData,
            },
        });
        setLoading(false);

        getFAOnPressJA(status, data);
    };

    const onPressRequestForAssistance = () => {
        console.log("[CEResult] >> [onPressRequestForAssistance]");
        try {
            // If request already raised successfully, then show success popup
            if (state.isAssistanceRequested) {
                dispatch({
                    actionType: "SET_POPUP_TITLE_DESC",
                    payload: {
                        popupTitle: REQ_ASSITANCE_POPUP_SUBSEQUENT_TITLE,
                        popupDesc: REQ_ASSITANCE_POPUP_SUBSEQUENT_DESC,
                    },
                });
                dispatch({
                    actionType: "SHOW_REQ_ASSIST_SUCCESS_POPUP",
                    payload: true,
                });
                return;
            }

            const propertyDetails = navParams?.propertyDetails ?? "";

            // navigate to Request Assistance screen
            navigation.navigate(BANKINGV2_MODULE, {
                screen: CONNECT_SALES_REP,
                params: {
                    propertyDetails,
                    syncId: navParams?.syncId,
                    ...navParams,
                    from: CE_RESULT,
                },
            });
        } catch (error) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            console.log("[CEResult] >> [onPressRequestForAssistance]", error);
        }
        const data = navParams ?? {};
        getFAOnPressRFA(status, data);
    };

    const onTenurePress = () => {
        console.log("[CEResult] >> [onTenurePress]");
        const currentScreenName = navParams?.currentScreenName;

        dispatch({
            actionType: "SHOW_TENURE_OVERLAY",
            payload: true,
        });

        const screenName =
            currentScreenName === "MA_VIEW"
                ? FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA
                : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;

        if (navParams?.subModule === "JA_ELIG_FAIL" && navParams?.jaEligResult) {
            FAProperty.onTenurePress(FA_PROPERTY_JA_NOT_ELIGIBLE, "Period");
        } else {
            FAProperty.onTenurePress(screenName, TENURE);
        }
    };

    const onDownpaymentPress = () => {
        console.log("[CEResult] >> [onDownpaymentPress]");

        // Set Overlay Keypad data
        dispatch({
            actionType: "SET_DOWNPAY_OVERLAY_VALUE",
            payload: {
                keypad: Number((state.downpayment * 100).toFixed(2)).toString(),
                display: numeral(state.downpayment).format("0,0.00"),
            },
        });

        // Show overlay
        dispatch({
            actionType: "SHOW_DOWNPAYMENT_OVERLAY",
            payload: true,
        });
        getFAOnDownPaymentPress(navParams);
    };

    const onTenureOverlayDone = (value) => {
        console.log("[CEResult] >> [onTenureOverlayDone]");

        onTenureOverlayClose();

        // Update Tenure value
        dispatch({
            actionType: "SET_TENURE",
            payload: {
                tenure: value,
                tenureFormatted: `${value} years`,
            },
        });

        const data = navParams ?? {};
        data.loanTenure = String(value);
        data.origTenure = String(value);
        data.tenure = String(value);
        if (state.isJointApplicantAdded) {
            callJointEligibilityAPIForRecalculation();
        } else {
            callEligibilityAPIForRecalculation();
        }
    };

    const onTenureOverlayClose = () => {
        console.log("[CEResult] >> [onTenureOverlayClose]");

        dispatch({
            actionType: "SHOW_TENURE_OVERLAY",
            payload: false,
        });
    };

    const onDownpaymentOverlayDone = (value) => {
        console.log("[CEResult] >> [onDownpaymentOverlayDone]");

        const newValue = !value ? "" : parseFloat((value / 100).toFixed(2));
        const propertyPrice = parseFloat(state.propertyPrice);
        const recommendedDownpayment = parseFloat(state.recommendedDownpayment);
        const halfPropertyPrice = parseFloat((propertyPrice / 2).toFixed(2));
        const isValid = newValue >= recommendedDownpayment && newValue <= halfPropertyPrice;
        const recommendedDownpaymentFormatted = numeral(recommendedDownpayment).format("0,0.00");

        if (isValid) {
            dispatch({
                actionType: "SET_DOWNPAYMENT",
                payload: {
                    downpayment: newValue,
                    downpaymentFormatted: !isNaN(newValue)
                        ? `RM ${numeral(newValue).format("0,0.00")}`
                        : null,
                    downpaymentOverlayIsValid: true,
                    downpaymentOverlayErrorMsg: "",
                },
            });

            onDownpaymentOverlayClose();

            const data = navParams ?? {};

            const propertyPrice = parseFloat(data.propertyPrice);
            const downPaymentAmount = parseFloat(newValue);
            const loanAmount = propertyPrice - downPaymentAmount;

            data.loanAmount = parseFloat(loanAmount).toFixed(2);
            data.origLoanAmount = parseFloat(loanAmount).toFixed(2);
            data.downPaymentAmount = parseFloat(downPaymentAmount).toFixed(2);

            if (downPaymentAmount && propertyPrice) {
                const downPaymentPercent = (downPaymentAmount / propertyPrice) * 100;
                data.downPaymentPercent = parseFloat(downPaymentPercent).toFixed(2);
            }
            if (state.isJointApplicantAdded) {
                callJointEligibilityAPIForRecalculation();
            } else {
                callEligibilityAPIForRecalculation();
            }
        } else {
            dispatch({
                actionType: "SET_DOWNPAYMENT",
                payload: {
                    downpaymentOverlayIsValid: false,
                    downpaymentOverlayErrorMsg: `Enter a value above RM${recommendedDownpaymentFormatted} or within 50% of the property price`,
                },
            });
        }
    };

    const onDownpaymentOverlayClose = () => {
        console.log("[CEResult] >> [onDownpaymentOverlayClose]");

        // Hide overlay
        dispatch({
            actionType: "SHOW_DOWNPAYMENT_OVERLAY",
            payload: false,
        });

        // Reset value
        dispatch({
            actionType: "RESET_DOWNPAY_OVERLAY_VALUE",
            payload: false,
        });
    };

    const onDownpaymentChange = (value) => {
        console.log("[CEResult] >> [onDownpaymentChange]");

        if (!value) {
            dispatch({
                actionType: "RESET_DOWNPAY_OVERLAY_VALUE",
                payload: false,
            });
            return;
        }

        const num = parseInt(value);
        if (num > 0) {
            const decimal = num / 100;

            dispatch({
                actionType: "SET_DOWNPAY_OVERLAY_VALUE",
                payload: {
                    keypad: String(num),
                    display: numeral(decimal).format("0,0.00"),
                },
            });
        }
    };

    async function callEligibilityAPIForRecalculation() {
        console.log("[CEResult] >> [callEligibilityAPIForRecalculation]");
        setLoading(true);
        const data = navParams ?? {};
        const resumeFlow = data?.resumeFlow ?? false;

        // Retrieve form data
        const formData = getFormData(data); //CE_COMMITMENTS screen

        //save
        await saveEligibilityInput(
            {
                screenName: CE_PF_NUMBER,
                formData,
                navParams,
                saveData: resumeFlow ? "Y" : "N",
            },
            false
        );

        const mdmData = await getMDMData(false);

        const params = {
            ...data,
            applicationStpRefNo: data?.stpApplicationId ?? "",
        };

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus, baseRateLabel } =
            await checkEligibility(
                {
                    ...params,
                    mdmData,
                },
                false
            );

        if (!success) {
            setLoading(false);
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
            return;
        }

        data.eligibilityResult = eligibilityResult;
        data.stpApplicationId = stpId;
        data.eligibilityStatus = overallStatus;
        data.baseRateLabel = baseRateLabel;

        //update UI
        populateData(data);

        setLoading(false);

        scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }

    async function callJointEligibilityAPIForRecalculation() {
        console.log("[CEResult] >> [callEligibilityAPIForRecalculation]");
        setLoading(true);
        const data = navParams ?? {};

        // Retrieve form data
        const formData = getFormData(data); //CE_COMMITMENTS screen
        const response = await saveEligibilityInput(
            {
                screenName: CE_PF_NUMBER,
                formData,
                navParams,
            },
            false
        );

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus } =
            await checkJAEligibility(
                {
                    ...data,
                    applicationStpRefNo: response?.stpId,
                },
                false
            );

        if (!success) {
            setLoading(false);
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
            return;
        }

        data.eligibilityResult = eligibilityResult;
        data.stpApplicationId = stpId;
        data.eligibilityStatus = overallStatus;
        data.jaDataType = null;
        data.jaLoanAmount = null;

        //update UI
        populateData(data);

        setLoading(false);

        scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }

    const onPressViewOtherProperties = () => {
        console.log("[CEResult] >> [onPressViewOtherProperties]");

        // only soft fail and fail will reached here

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_PROPERTY_LIST,
            params: {
                latitude: navParams?.latitude ?? "",
                longitude: navParams?.longitude ?? "",
                recommended_property_amount: state.propertyPrice,
            },
        });
        const data = navParams ?? {};
        const screenName = FAProperty.getFAScreenView(status, data);
        const mainEligDataType = data?.isMainEligDataType ?? data?.dataType;
        getFAViewOtherProperties(data, mainEligDataType, screenName);
    };

    const closeExitPopup = () => {
        console.log("[CEResult] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_EXIT_POPUP",
            payload: false,
        });
    };

    const closeOfferDiscPopup = () => {
        console.log("[CEResult] >> [closeOfferDiscPopup]");

        dispatch({
            actionType: "SHOW_OFFER_DISC_POPUP",
            payload: false,
        });
    };

    const closeReqAssistSuccessPopup = () => {
        console.log("[CEResult] >> [closeReqAssistSuccessPopup]");

        dispatch({
            actionType: "SHOW_REQ_ASSIST_SUCCESS_POPUP",
            payload: false,
        });
    };

    const closeApplySuccessPopup = () => {
        console.log("[CEResult] >> [closeApplySuccessPopup]");

        // Close popup
        dispatch({
            actionType: "SHOW_APPLY_SUCCESS_POPUP",
            payload: false,
        });
    };

    async function onExitPopupSave() {
        console.log("[CEResult] >> [onExitPopupSave]");

        // Hide popup
        if (!state.isAssistanceRequested) {
            closeExitPopup();
        }

        // Save Data in DB before exiting the flow
        const { success, errorMessage } = await saveEligibilityResult();

        if (success) {
            resetToApplication();
        } else {
            showErrorToast({
                message: errorMessage || COMMON_ERROR_MSG,
            });
        }

        FAProperty.onPressSelectAction(FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS, SAVE, "");
    }

    const onExitPopupDontSave = () => {
        console.log("[CEResult] >> [onExitPopupDontSave]");

        // Hide popup
        closeExitPopup();

        resetToDiscover();
        FAProperty.onPressSelectAction(FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS, DONT_SAVE, "");
    };

    function onCloseTap() {
        console.log("[CEResult] >> [onCloseTap]");
        const isEditFlow = navParams?.isEditFlow ?? false;
        if (isEditFlow || state.hideSaveProgressPopup || state.isJointApplicantAdded) {
            // If its from edit eligibility flow dont show popup
            // Navigate back to application screen
            resetToApplication();
        } else {
            if (state.isAssistanceRequested) {
                onExitPopupSave();
            } else {
                dispatch({
                    actionType: "SHOW_EXIT_POPUP",
                    payload: true,
                });
            }

            FAProperty.onPressViewScreen(FA_PROPERTY_CHECKELIGIBILITY_SAVEPROGRESS, "");
        }
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={<View />}
                    useSafeArea
                    neverForceInset={["top"]}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        ref={scrollRef}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    >
                        {/* Top Image Component */}
                        {/*Joint Applicant header image for Pass,Fail,SoftFail*/}
                        <View style={Style.imageContainer(imageHeight)}>
                            {(eligibilityStatus === AMBER ||
                                eligibilityStatus === ELIGIBILTY_STATUS_ELIGIBLE) &&
                            state.isJointApplicantAdded 
                            ? (
                                <>
                                    <Animatable.Image
                                        animation={imgAnimFadeInUp}
                                        delay={500}
                                        duration={500}
                                        source={
                                            status === STATUS_PASS
                                                ? Assets.eligibilitySuccess
                                                : status === STATUS_SOFT_FAIL &&
                                                  !navParams?.jaEligResult
                                                ? Assets.eligibilitySoftFail
                                                : navParams?.jaEligResult &&
                                                  status === STATUS_SOFT_FAIL &&
                                                  navParams?.subModule !== "JA_ELIG_FAIL"
                                                ? Assets.eligibilitySuccess
                                                : Assets.eligibilityJHardFailL
                                        }
                                        style={Style.imageCls}
                                        resizeMode="cover"
                                        useNativeDriver
                                    />
                                </>
                            ) 
                            : (
                                <>
                                    <Animatable.Image
                                        animation={imgAnimFadeInUp}
                                        delay={500}
                                        duration={500}
                                        source={
                                            status === STATUS_PASS && !navParams?.declinedFromJa
                                                ? Assets.eligibilitySuccess
                                                : !state.isJARemoved && !navParams?.declinedFromJa
                                                ? Assets.eligibilitySoftFail
                                                : Assets.eligibilityJHardFailL
                                        }
                                        style={Style.imageCls}
                                        resizeMode="cover"
                                        useNativeDriver
                                    />
                                </>
                            )}
                            {/* Toolbar container for Close Icon */}
                            <View style={Style.toolbarContainer(insets.top)}>
                                <View style={Style.closeBtnCont}>
                                    <HeaderCloseButton onPress={onCloseTap} />
                                </View>
                            </View>
                        </View>
                        <View
                            style={
                                (!state.isJAButtonEnabled || !state.isRFASwitchEnabled) &&
                                Style.bottomMargin
                            }
                        >
                            {/*Applicant template screen*/}
                            <CEResultApplicantTemplate
                                state={state}
                                onPressViewOtherProperties={onPressViewOtherProperties}
                                onApplyLoan={onApplyLoan}
                                onPressAddJointApplicant={onPressAddJointApplicant}
                                onPressRequestForAssistance={onPressRequestForAssistance}
                                onTenurePress={onTenurePress}
                                onDownpaymentPress={onDownpaymentPress}
                                status={status}
                                navParams={navParams}
                                onOpenRemoveJointApplicantPopup={onOpenRemoveJointApplicantPopup}
                                onViewOfferDisclaimer={onViewOfferDisclaimer}
                                eligibilityStatus={eligibilityStatus}
                                onMainApplyLoan={onMainApplyLoan}
                                JointApplicantDetail={JointApplicantDetail}
                                AddPromoRow={AddPromoRow}
                            ></CEResultApplicantTemplate>
                        </View>
                    </ScrollView>
                    {/* navigat to Application details screen*/}
                    {/*Applicable for Joint Applicant Only*/}
                    {status !== STATUS_HARD_FAIL &&
                    status !== STATUS_SOFT_FAIL &&
                    status !== STATUS_PASS &&
                    eligibilityStatus === AMBER &&
                    state.isJointApplicantAdded 
                    ? (
                        <View style={Style.horizontalMargin}>
                            <FixedActionContainer>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            color={BLACK}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={FA_VIEW_APPLICATION}
                                        />
                                    }
                                    style={Style.viewOtherBtn}
                                    onPress={onViewApplicationPress}
                                />
                            </FixedActionContainer>
                        </View>
                    ) 
                    : (
                        <></>
                    )}
                    {/* floating btn for proceed with application */}
                    {state.isApplyButtonFloating && status !== STATUS_HARD_FAIL && (
                        <FixedActionContainer>
                            <ActionButton
                                fullWidth
                                backgroundColor={YELLOW}
                                style={Style.applyBtn}
                                componentCenter={
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={18}
                                        text={PROCEED_WITH_APPLICATION}
                                    />
                                }
                                onPress={
                                    state.isJointApplicantAdded ? onMainApplyLoan : onApplyLoan
                                }
                            />
                        </FixedActionContainer>
                    )}
                </ScreenLayout>
            </ScreenContainer>
            {/* Tenure Overlay */}
            <TenureOverlay
                visible={state.showTenureOverlay}
                onDone={onTenureOverlayDone}
                onClose={onTenureOverlayClose}
                minValue={state.tenureMin}
                maxValue={state.tenureMax}
                value={state.tenure}
            />

            {/* Downpayment Overlay */}
            <DownpaymentOverlay
                visible={state.showDownpaymentOverlay}
                onDone={onDownpaymentOverlayDone}
                onClose={onDownpaymentOverlayClose}
                onChange={onDownpaymentChange}
                keypadValue={state.downpaymentOverlayKeypad}
                displayValue={state.downpaymentOverlayDisplay}
                isValid={state.downpaymentOverlayIsValid}
                errorMessage={state.downpaymentOverlayErrorMsg}
            />

            {/* Exit confirmation popup */}
            <Popup
                visible={state.showExitPopup}
                title={state.isJointApplicantAdded ? EXIT_JA_POPUP_TITLE : EXIT_POPUP_TITLE}
                description={EXIT_POPUP_DESC}
                onClose={closeExitPopup}
                primaryAction={{
                    text: SAVE,
                    onPress: onExitPopupSave,
                }}
                secondaryAction={{
                    text: DONT_SAVE,
                    onPress: onExitPopupDontSave,
                }}
            />

            {/* Remove Joint Applicant Popup*/}
            <Popup
                visible={state.removeJointApplicant}
                onClose={onCloseRemoveJointApplicantPopup}
                title={REMOVE_JOINT_TITLE}
                description={REMOVE_JOINT_DESCRIPTION}
                primaryAction={{
                    text: REMOVE,
                    onPress: removeJointApplicantOnClick,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: onCloseRemoveJointApplicantPopup,
                }}
            />

            {/* Offer Disclaimer popup */}
            <OfferDisclaimerPopup
                visible={state.showOfferDiscPopup}
                onClose={closeOfferDiscPopup}
            />

            {/* Req Assistance Success popup */}
            <Popup
                visible={state.showReqAssistSuccessPopup}
                title={state.popupTitle}
                description={state.popupDesc}
                onClose={closeReqAssistSuccessPopup}
                primaryAction={{
                    text: GOT_IT,
                    onPress: closeReqAssistSuccessPopup,
                }}
            />

            {/* Apply Loan Success popup */}
            <Popup
                visible={state.showApplySuccessPopup}
                title={APPLYSUCCPOPUP_TITLE}
                description={`${APPLY_SUCCESS_POPUP_SUBTITLE}\n\n${APPLYSUCCPOPUP_DESC}`}
                onClose={closeApplySuccessPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: onPressOkApplySuccessPopup,
                }}
            />
        </>
    );
}

export default CEResultScreenTemplate;

function AddPromoRow({ onPress }) {
    return (
        <TouchableOpacity style={Style.addPromoContainer} onPress={onPress}>
            <View style={Style.addPromoInnerCont}>
                <Image
                    source={Assets.addPromoIcon}
                    style={Style.promoTagIcon}
                    resizeMode="contain"
                />

                <Typo textAlign="left" fontWeight="600" lineHeight={18} text="Add promo" />
            </View>

            <Image source={Assets.ic_Plus} style={Style.promoRowArrowIcon} resizeMode="contain" />
        </TouchableOpacity>
    );
}

AddPromoRow.propTypes = {
    onPress: PropTypes.func,
};

function JointApplicantDetail({ jointApplicantInfo, removeOpenJointApplicant }) {
    const applicantName = jointApplicantInfo?.customerName ?? "";
    const profileImage = jointApplicantInfo?.profilePicBase64
        ? `data:jpeg;base64,${jointApplicantInfo?.profilePicBase64}`
        : null;
    return (
        <View
            style={[
                Platform.OS === "ios" ? Style.shadow : {},
                Style.jointApplicantHeader,
                Style.jointApplicanthorizontalMargin,
            ]}
        >
            <View style={Style.jointApplicantRow}>
                {/* Profile Logo */}

                <Image
                    source={profileImage ? { uri: profileImage } : Assets.emptyProfile}
                    style={Style.profileLogo}
                />
                {/* Joint Applicant Name */}
                <View style={Style.jointApplicantTile}>
                    <Typo
                        lineHeight={17}
                        textAlign="left"
                        text={applicantName}
                        style={Style.jointApplicantName}
                    />
                    <Typo
                        lineHeight={18}
                        fontWeight="600"
                        text={REMOVE_JOINT_TITLE}
                        style={Style.jointApplicantStyle}
                        onPressText={removeOpenJointApplicant}
                    />
                </View>
            </View>
        </View>
    );
}

JointApplicantDetail.propTypes = {
    jointApplicantInfo: PropTypes.object,
    removeOpenJointApplicant: PropTypes.func,
};

const Style = StyleSheet.create({
    addPromoContainer: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        height: 56,
        justifyContent: "space-between",
        marginBottom: 25,
        marginHorizontal: 24,
        marginTop: 6,
        padding: 18,
    },
    addPromoInnerCont: {
        flexDirection: "row",
    },
    applyBtn: {
        marginBottom: 24.1,
    },

    bottomMargin: {
        marginBottom: 30,
    },

    closeBtnCont: {
        alignItems: "center",
        height: 45,
        justifyContent: "center",
        width: 45,
    },

    horizontalMargin: {
        marginHorizontal: 24,
        marginTop: 15,
    },
    imageCls: {
        height: "100%",
        width: "100%",
    },

    imageContainer: (imageHeight) => ({
        alignItems: "center",
        height: imageHeight,
    }),

    jointApplicantHeader: {
        marginLeft: 40,
        marginTop: 5,
    },

    jointApplicantName: {
        marginBottom: 5,
        paddingLeft: 0,
    },

    jointApplicantRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 25,
        width: "100%",
    },

    jointApplicantStyle: {
        fontSize: 14,
        marginBottom: 15,
        marginTop: 5,
        textDecorationColor: BLACK,
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
    },

    jointApplicantTile: {
        marginLeft: 10,
    },

    jointApplicanthorizontalMargin: {
        marginHorizontal: 10,
    },

    profileLogo: {
        backgroundColor: IRISBLUE,
        borderColor: WHITE,
        borderRadius: 150 / 2,
        borderWidth: 2,
        height: 48,
        width: 48,
    },
    promoRowArrowIcon: {
        height: 24,
        marginLeft: 10,
        width: 24,
    },
    promoTagIcon: {
        height: 21,
        marginRight: 10,
        width: 21,
    },
    shadow: {
        ...getShadow({
            elevation: 8,
        }),
    },
    toolbarContainer: (safeAreaInsetTop) => ({
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        width: "100%",
        zIndex: 1,
        top: 0,
        position: "absolute",
        paddingTop: safeAreaInsetTop,
        height: 70 + safeAreaInsetTop,
    }),
    viewOtherBtn: {
        marginBottom: 16,
    },
});
