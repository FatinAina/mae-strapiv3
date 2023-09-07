/* eslint-disable no-prototype-builtins */

/* eslint-disable sonarjs/cognitive-complexity */

/* eslint-disable react/jsx-no-bind */
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useState } from "react";
import Share from "react-native-share";

import {
    BANKINGV2_MODULE,
    PROPERTY_DASHBOARD,
    APPLICATION_DETAILS,
    PROPERTY_DETAILS,
    CE_RESULT,
    CE_ADD_JA_DETAILS,
    CE_UNIT_SELECTION,
    CE_PROPERTY_NAME,
    LA_ELIGIBILITY_CONFIRM,
    LA_CANCEL,
    LA_RESULT,
    APPLICATION_DOCUMENT,
    CHAT_WINDOW,
    JA_PERSONAL_INFO,
    JA_ACCEPTANCE,
    CE_PROPERTY_SEARCH_LIST,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Popup from "@components/Popup";
import { showErrorToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import { eligibilityCheck, getGroupChat, invokeL2, invokeL3, isExistingCustomer } from "@services";
import { FAProperty } from "@services/analytics/analyticsProperty";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import { MEDIUM_GREY, YELLOW, GREY, DARK_GREY, STATUS_GREEN, BLACK, RED } from "@constants/colors";
import {
    PROP_LA_INPUT,
    PROP_LA_RESULT,
    PROP_ELG_INPUT,
    PROP_ELG_RESULT,
    STG_DISBURSE,
    STG_LEGALDOC,
    STG_ACCEPTANCE,
    STG_LOANAPP,
    STG_ELIGIBILITY,
    INPROGRESS,
    WAPPROVE,
    APPROVE_CHECK,
    VIEW_PROPERTYS,
    CANCEL_REMOVE,
    DT_NOTELG,
} from "@constants/data";
import {
    PROPERTY_MDM_ERR,
    CONTINUE,
    APPLYSUCCPOPUP_TITLE,
    APPLYSUCCPOPUP_DESC,
    MONTHLY_INSTALMENT_INFO,
    COMMON_ERROR_MSG,
    CONFIRM,
    CANCEL,
    PROPERTY_APPLICATION_DETAILS,
    REMOVE_JOINT_TITLE,
    NO_NOTIFY_JOINTAPPLICANT_TITLE,
    NOTIFY_JOINT_APPLICANT_DESC,
    REMOVE_JOINT_DESCRIPTION,
    REMOVE,
    OKAY,
    PROPERTY_APPLICATION_DETAILS_TEXT,
    VIEW_PROPERTY,
    FA_MESSAGE_SALES,
    FA_REMOVE_JOINT_APPLICANT,
    FA_CALL_SALES_ASSISTANCE,
    JA_VIEW,
    MA_VIEW,
    HER,
    HIS,
    FIN_CONVENTIONAL,
    ELIGIBLE,
    RECOMENDATION,
    AMBER,
    PROCEED,
    APPLY_NOW,
    PROPERTY_FIANANCING_AMOUNT,
    PROPERTY_LOAN_AMOUNT,
    EFFECTIVE_PROFIT_RATE,
    EFFECTIVE_INTEREST_RATE,
    LOAN_BREAKDOWN,
    FINANCING_PERIOD,
    FINANCING_BREAKDOWN,
    LOAN_PERIOD,
    INSTALL_MAE_FROM_APP_STORE_TEXT,
    HAVE_INVITED_YOU_FOR_JA,
    MORTGAGE_APPLICATION_AT,
} from "@constants/strings";

import { contactBankcall } from "@utils/dataModel/utility";

import {
    BASE_RATE,
    CANCEL_APPLICATION,
    ELIGIBILITY_CHECKING,
    FINANCING_ACCEPTANCE,
    TOTAL_FINANING_AMOUNT,
    FINANCING_APPLICATION,
    FINANCING_DISBURSEMENT,
    LEGAL_DOCUMENTATION,
    LOAN_ACCEPTANCE,
    LOAN_APPLICATION,
    LOAN_DISBURSEMENT,
    REMOVE_ELIGIBILITY,
    TOTAL_LOAN_AMOUNT,
} from "../../../constants/strings";
import {
    getMasterData,
    getMDMData,
    fetchCCRISReport,
    getEncValue,
    getJAButtonEnabled,
    fetchRFASwitchStatus,
    getExistingData,
} from "../Common/PropertyController";
import { isAgeEligible, getEligibilityBasicNavParams } from "../Eligibility/CEController";
import { getJEligibilityBasicNavParams } from "../JointApplicant/JAController";
import ApplicationDetailsTemplateScreen from "./ApplicationDetailsTemplateScreen";
import {
    fetchGetApplicants,
    fetchUnlinkedMainApplicant,
    getDates,
    getStatusDetails,
    prequalCheckAPI,
    removeYourJointApplicant,
    getFormData,
    getEligiblityCEResultNavParams,
    adMassageEligibilityResult,
} from "./LAController";

// NOTE: DO NOT REMOVE BELOW CONSTANTS EVEN IF THEY ARE UNUSED. ADDED FOR INFORMATION PURPOSE.

// Possible "status" values
const ELIGEXP = "ELIGEXP"; // Eligibility check expired
const REMOVED = "Y"; // Removed the application
const CANCELLED = "CANCELLED"; // Cancelled the loan application
const LOANSUB = "LOANSUB"; // Loan submitted
const mainInfo = "J";
const jointInfo = "M";

// Financing Type values, either islamic or conventional

// Initial state object
const initialState = {
    // Common UI
    propertyName: "",
    unitTypeName: null,
    statusText: "",
    statusColor: STATUS_GREEN,
    showUnitNumber: false,
    unitNumber: "",
    stepperData: [],
    startDate: null,
    updatedDate: null,
    loanAmountLabel: PROPERTY_FIANANCING_AMOUNT,
    interestRateLabel: EFFECTIVE_PROFIT_RATE,
    tenureLabel: FINANCING_PERIOD,
    bankSellingPrice: "",

    // Common Functionality
    isResultStatus: false,
    progressStatus: null,
    isCancelled: false,
    isRemoved: false,
    isExpired: false,
    isJointApplicant: false,
    isMainApplicant: false,
    infoPopup: false,
    infoPopupTitle: "",
    infoPopupDesc: "",
    expiryDate: null,

    // Loan Details
    loanAmount: "-",
    interestRate: "-",
    interestRateSubText1: null,
    interestRateSubText2: null,
    tenure: "-",
    monthlyInstalment: "-",
    propertyPrice: "-",
    downpayment: "-",
    financingTypeTitle: "",
    financingPlanTitle: "",
    monthlyInfoNote: MONTHLY_INSTALMENT_INFO,
    breakDownLabel: LOAN_BREAKDOWN,
    totalLoanAmount: "-",
    propertyAmount: "-",
    otherRelatedExpenses: "-",
    fullDataEntryIndicator: false,
    publicSectorNameFinance: false,

    // Top Menu related
    showTopMenuIcon: true,
    showTopMenu: false,
    topMenuData: [],
    agentInfo: null,
    mainApplicantInfo: null,
    jointApplicantInfo: null,

    // Bottom CTA related
    ctaText: CONTINUE,
    showCTA: false,

    // Others
    reloadList: false,
    showApplySuccessPopup: false,
    loading: true,
    showLoanDetails: false,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_DETAILS":
        case "SET_INIT_DATA":
            return {
                ...state,
                ...payload,
            };
        case "SHOW_TOP_MENU":
            return {
                ...state,
                showTopMenu: payload,
            };
        case "SET_RELOAD_LIST":
            return {
                ...state,
                reloadList: payload,
            };
        case "SHOW_APPLY_SUCCESS_POPUP":
            return {
                ...state,
                showApplySuccessPopup: payload,
            };
        case "SHOW_INFO_POPUP":
            return {
                ...state,
                infoPopup: payload?.infoPopup,
                infoPopupTitle: payload?.infoPopupTitle,
                infoPopupDesc: payload?.infoPopupDesc,
            };
        case "SHOW_REMOVE_JOINT_APPLICANT_POPUP":
            return {
                ...state,
                removeJointApplicant: payload?.removeJointApplicant,
            };
        case "SHOW_REMIND_JOINT_APPLICANT_POPUP":
            return {
                ...state,
                remindJointApplicant: payload?.remindJointApplicant,
            };
        case "SET_AGENT_INFO":
            return {
                ...state,
                agentInfo: payload,
            };
        case "SET_MAIN_APPLICANT_INFO":
            return {
                ...state,
                mainApplicantInfo: payload,
            };
        case "SET_JOINT_APPLICANT_INFO":
            return {
                ...state,
                jointApplicantInfo: payload,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        default:
            return { ...state };
    }
}

function ApplicationDetails({ route, navigation }) {
    const { getModel } = useModelController();
    const [state, dispatch] = useReducer(reducer, initialState);
    const stpApplicationId = route?.params?.savedData?.stpApplicationId ?? "";
    const wolocStatus = route?.params?.savedData?.wolocStatus ?? false;
    const {
        progressStatus,
        showCTA,
        isCancelled,
        isRemoved,
        isExpired,
        isJointApplicant,
        isMainApplicant,
        showTopMenuIcon,
        agentInfo,
        mainApplicantInfo,
        jointApplicantInfo,
        propertyName,
        fullDataEntryIndicator,
        loading,
        showLoanDetails,
    } = state;
    const [currentStage, setCurrentStage] = useState("");
    useEffect(() => {
        init();
    }, []);

    // Navigation params change handler
    useEffect(() => {
        const reload = route?.params?.reload;
        if (reload) {
            // Reload UI state if navigation params have changed
            prepopulateData();

            // Reset reload param
            navigation.setParams({
                reload: null,
            });

            // Set reload list flag
            dispatch({
                actionType: "SET_RELOAD_LIST",
                payload: true,
            });
        }
    }, [route.params]);

    useEffect(() => {
        const screenName = PROPERTY_APPLICATION_DETAILS + stpApplicationId;
        FAProperty.onPressViewScreen(screenName);
    }, [stpApplicationId]);

    function init() {
        console.log("[ApplicationDetails] >> [init]");

        // Populate data on UI
        prepopulateData();
    }

    function onBackTap() {
        console.log("[ApplicationDetails] >> [onBackTap]");

        const from = route.params?.from;

        if (from !== LA_RESULT) {
            // Navigate to Property Dashboard page - Application tab
            navigation.navigate(BANKINGV2_MODULE, {
                screen: PROPERTY_DASHBOARD,
                params: {
                    activeTabIndex: 1,
                    reload: true,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    async function prepopulateData() {
        console.log("[ApplicationDetails] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const progressStatus = savedData?.progressStatus;
        const eligibilityStatus = savedData?.eligibilityStatus;
        const status = savedData?.status;
        const statusRemoved = savedData?.isRemoved;
        const updatedDateRaw = savedData?.updatedDate;
        const createdDateRaw = savedData?.createdDate;
        const statusOrder = savedData?.statusOrder;
        const isInActive =
            status === ELIGEXP ||
            status === CANCELLED ||
            statusRemoved === REMOVED ||
            statusOrder === 3;
        const isPropertyListed = savedData?.isPropertyListed;
        const isAccepted = savedData?.isAccepted;
        const isRemind = savedData?.isRemind;

        const { showCTA, ctaText } = await getCTADetails(
            status,
            progressStatus,
            eligibilityStatus,
            navParams?.jointApplicantDetails,
            navParams?.currentUser
        );
        const showLoanDetails = getStatusShow();

        // Header details
        const propertyName = savedData?.propertyName;
        const unitTypeName = savedData?.unitTypeName;
        const unitNumber = savedData?.unitNo;
        const financingType = savedData?.financingType ?? null;
        const { statusText, statusColor } = getStatusDetails(isInActive);
        const { startDate, updatedDate } = getDates(createdDateRaw, updatedDateRaw);
        // expiryDate = propertyDetails?.expiry_date;

        // Loan details
        const dataType = savedData?.dataType;
        const isResultStatus = dataType === ELIGIBLE || dataType === RECOMENDATION;
        const interestRate = savedData?.interestRate
            ? `${parseFloat(savedData.interestRate).toFixed(2)}% p.a`
            : "-";
        const baseRate = savedData?.baseRate
            ? `${parseFloat(savedData?.baseRate).toFixed(2)}%`
            : null;
        const spreadRate = savedData?.spreadRate
            ? `${parseFloat(savedData?.spreadRate).toFixed(2)}%`
            : null;
        const savedPublicSectorNameFinance = savedData?.publicSectorNameFinance;
        const publicSectorNameFinance =
            savedPublicSectorNameFinance === true || savedPublicSectorNameFinance === "Y";

        const loanAmountRaw = savedData?.loanAmountRaw;
        let loanAmount = loanAmountRaw ? `RM ${numeral(loanAmountRaw).format("0,0.00")}` : "-";

        const monthlyInstalmentRaw = savedData?.monthlyInstalmentRaw;
        const monthlyInstalment = monthlyInstalmentRaw
            ? `RM ${numeral(monthlyInstalmentRaw).format("0,0.00")}`
            : "-";

        const propertyPriceRaw = savedData?.propertyPriceRaw;
        const propertyPrice = propertyPriceRaw
            ? `RM ${numeral(propertyPriceRaw).format("0,0.00")}`
            : "-";

        const savedTenure = savedData?.tenure ? `${savedData.tenure} years` : "-";
        const recommendedTenure = savedData?.recommendedTenure
            ? `${savedData.recommendedTenure} years`
            : "-";
        const tenure = isResultStatus ? recommendedTenure : savedTenure;

        const savedDownpaymentRaw = savedData?.downPaymentAmountRaw;
        const savedDownpayment = savedDownpaymentRaw
            ? `RM ${numeral(savedDownpaymentRaw).format("0,0.00")}`
            : "-";

        const recommendedDownPaymentRaw = savedData?.recommendedDownpaymentRaw ?? "-";
        const recommendedDownPayment = recommendedDownPaymentRaw
            ? `RM ${numeral(recommendedDownPaymentRaw).format("0,0.00")}`
            : "-";

        const downpayment = isResultStatus ? recommendedDownPayment : savedDownpayment;
        const bankSellingPriceRaw = savedData?.bankSellingPrice ?? "";
        const bankSellingPrice = getBankSellingPrice(bankSellingPriceRaw);

        const financingTypeTitle = savedData?.financingTypeTitle ?? "";
        const financingPlanTitle = savedData?.financingPlanTitle ?? "";

        /* if full data entry is done at sales force */
        const fullDataEntryIndicator = savedData?.fullDataEntryIndicator ?? null;
        const totalLoanAmountRaw = savedData?.totalLoanAmount ?? null;
        const otherRelatedExpensesRaw = savedData?.otherRelatedExpenses ?? null;
        const totalLoanAmount = totalLoanAmountRaw
            ? `RM ${numeral(totalLoanAmountRaw).format("0,0.00")}`
            : "-";
        const otherRelatedExpenses = otherRelatedExpensesRaw
            ? `RM ${numeral(otherRelatedExpensesRaw).format("0,0.00")}`
            : "-";
        let loanAmountLabel = state.loanAmountLabel;
        let propertyAmount = state.propertyAmount;
        let breakDownLabel = state.breakDownLabel;
        let monthlyInfoNote = state.monthlyInfoNote;
        if (fullDataEntryIndicator === "Y") {
            loanAmountLabel =
                financingType === FIN_CONVENTIONAL ? TOTAL_LOAN_AMOUNT : TOTAL_FINANING_AMOUNT;
            breakDownLabel =
                financingType === FIN_CONVENTIONAL ? LOAN_BREAKDOWN : FINANCING_BREAKDOWN;
            monthlyInfoNote = null;
            propertyAmount = loanAmount;
            loanAmount = totalLoanAmount;
        } else {
            loanAmountLabel =
                financingType === FIN_CONVENTIONAL
                    ? PROPERTY_LOAN_AMOUNT
                    : PROPERTY_FIANANCING_AMOUNT;
        }
        const interestRateLabel =
            financingType === FIN_CONVENTIONAL ? EFFECTIVE_INTEREST_RATE : EFFECTIVE_PROFIT_RATE;
        const tenureLabel = financingType === FIN_CONVENTIONAL ? LOAN_PERIOD : FINANCING_PERIOD;

        // Get Top Menu data
        const menuData = getTopMenuData({
            status,
            statusRemoved,
            isPropertyListed,
            propertyDetails,
            progressStatus,
        });

        const baseRateLabel = savedData?.baseRateLabel ?? BASE_RATE;

        // Retrieve stepper data
        const stepperData = massageStepperData();

        //agent info
        const agentInfo = savedData?.agentInfo ?? null;

        //main info
        const mainApplicantInfo = navParams?.mainApplicantDetails ?? null;

        //joint info
        const jointApplicantInfo = navParams?.jointApplicantDetails ?? null;

        // Set Header Details
        dispatch({
            actionType: "SET_HEADER_DETAILS",
            payload: {
                propertyName,
                unitTypeName,
                showUnitNumber:
                    progressStatus === PROP_LA_INPUT ||
                    progressStatus === PROP_LA_RESULT ||
                    (progressStatus === PROP_ELG_RESULT && navParams?.currentUser === "J"),
                unitNumber,
                statusText,
                statusColor,
                startDate,
                updatedDate,
                loanAmountLabel,
                breakDownLabel,
                monthlyInfoNote,
                interestRateLabel,
                tenureLabel,
                isJointApplicant: mainInfo === navParams?.currentUser,
                isMainApplicant: jointInfo === navParams?.currentUser,
                isAccepted,
                isRemind,
            },
        });

        // Set Loan Details
        dispatch({
            actionType: "SET_INIT_DATA",
            payload: {
                // Loan Details
                loanAmount,
                interestRate,
                interestRateSubText1: baseRate ? `${baseRateLabel}: ${baseRate}` : null,
                interestRateSubText2: spreadRate ? `Spread: ${spreadRate}` : null,
                tenure,
                monthlyInstalment,
                propertyPrice,
                downpayment,
                bankSellingPrice,
                financingTypeTitle,
                financingPlanTitle,
                totalLoanAmount,
                propertyAmount,
                otherRelatedExpenses,
                fullDataEntryIndicator: fullDataEntryIndicator === "Y",
                publicSectorNameFinance,

                // Common
                isResultStatus,
                progressStatus,
                isCancelled: status === CANCELLED,
                isExpired: status === ELIGEXP,
                isRemoved: statusRemoved === REMOVED,

                // CTA related
                ctaText,
                showCTA: !isInActive && showCTA,
                showLoanDetails,

                // Top Menu related
                showTopMenuIcon: !!menuData && statusRemoved !== REMOVED,
                topMenuData: menuData,

                // Stepper
                stepperData,
            },
        });

        // Set Agent info
        if (agentInfo) {
            dispatch({
                actionType: "SET_AGENT_INFO",
                payload: agentInfo,
            });
        }

        // Set Main info
        if (mainApplicantInfo) {
            dispatch({
                actionType: "SET_MAIN_APPLICANT_INFO",
                payload: mainApplicantInfo,
            });
        }

        // Set Joint info
        if (jointApplicantInfo) {
            dispatch({
                actionType: "SET_JOINT_APPLICANT_INFO",
                payload: jointApplicantInfo,
            });
        }

        if (savedData?.isRemoved || savedData?.isCancelled) {
            const encSyncId = await getEncValue(navParams?.syncId);
            const { success, errorMessage, mainApplicantDetails, currentUser } =
                await fetchUnlinkedMainApplicant(encSyncId, true);

            if (success) {
                setLoading(false);
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }

            if (mainApplicantDetails) {
                dispatch({
                    actionType: "SET_MAIN_APPLICANT_INFO",
                    payload: mainApplicantDetails,
                });
            }

            // Set Header Details
            if (currentUser === "J") {
                dispatch({
                    actionType: "SET_HEADER_DETAILS",
                    payload: {
                        isJointApplicant: true,
                    },
                });
                dispatch({
                    actionType: "SET_HEADER_DETAILS",
                    payload: {
                        isMainApplicant: false,
                    },
                });
            }
        }

        setLoading(false);
    }

    async function getCTADetails(
        status,
        progressStatus,
        eligibilityStatus,
        jointApplicantInfo,
        currentUser
    ) {
        console.log("[ApplicationDetails] >> [getCTADetails]");

        let ctaText = CONTINUE;
        const isJointApplicant = currentUser === "J";
        let showCTA =
            (progressStatus === PROP_ELG_INPUT && jointApplicantInfo === null) ||
            (progressStatus === PROP_ELG_RESULT && status !== INPROGRESS) ||
            progressStatus === PROP_LA_INPUT;

        if (isJointApplicant) {
            showCTA = false;
        }

        if (status === INPROGRESS && jointApplicantInfo?.customerId && isJointApplicant) {
            showCTA = true;
        }

        //BAU CASE
        if (eligibilityStatus === AMBER && status === LOANSUB) {
            showCTA = false;
        }

        if ((isCancelled && wolocStatus) || (isExpired && wolocStatus)) {
            showCTA = false;
        }

        if (progressStatus === PROP_ELG_RESULT && jointApplicantInfo?.customerId) {
            ctaText = eligibilityStatus === AMBER ? PROCEED : APPLY_NOW;
        }
        return { showCTA, ctaText };
    }

    function getBankSellingPrice(bankSellingPriceRaw) {
        if (bankSellingPriceRaw) {
            return !isNaN(bankSellingPriceRaw)
                ? `RM ${numeral(bankSellingPriceRaw).format("0,0.00")}`
                : "";
        } else {
            return "";
        }
    }

    function getStatusShow() {
        const savedData = route?.params?.savedData ?? {};
        if (savedData?.dataType === DT_NOTELG) {
            const statusLogs = savedData?.statusLogs ?? [];
            const mapped = statusLogs.map((ele) => ele.status);
            return mapped.includes(APPROVE_CHECK) || mapped.includes(WAPPROVE);
        } else {
            return true;
        }
    }

    function getStatusData() {
        return (
            (progressStatus !== PROP_ELG_INPUT && showLoanDetails) ||
            (route?.params?.currentUserJA === "Y" &&
                isRemoved &&
                route?.params?.savedData?.dataType !== null)
        );
    }

    function massageStepperData() {
        console.log("[ApplicationDetails] >> [massageStepperData]");

        const savedData = route?.params?.savedData ?? {};
        const stageArray = savedData?.stage ?? [];
        const statusColor = (() => {
            if (savedData?.statusColor === "Y") return YELLOW;
            else if (savedData?.statusColor === "G") return STATUS_GREEN;
            else if (savedData?.statusColor === "R") return RED;
            else return GREY;
        })();
        const { currentStageIndex } = stageArray.reduce(
            (value, item, index) => {
                if (item?.isActiveStage === "Y") {
                    setCurrentStage(item?.stage);
                    return {
                        currentStageIndex: index,
                    };
                } else {
                    return { ...value };
                }
            },
            { currentStageIndex: null }
        );

        //const isLoanSubmissionDone = savedData?.status === LOANSUB;
        const financingType = savedData?.financingType ?? null;

        const defaultStepperObj = [
            {
                title: ELIGIBILITY_CHECKING,
                titleColor: DARK_GREY,
                description: null,
                stage: STG_ELIGIBILITY,
            },
            {
                title:
                    financingType === FIN_CONVENTIONAL ? LOAN_APPLICATION : FINANCING_APPLICATION,
                titleColor: DARK_GREY,
                description: null,
                stage: STG_LOANAPP,
            },
            {
                title: financingType === FIN_CONVENTIONAL ? LOAN_ACCEPTANCE : FINANCING_ACCEPTANCE,
                titleColor: DARK_GREY,
                description: null,
                stage: STG_ACCEPTANCE,
            },
            {
                title: LEGAL_DOCUMENTATION,
                titleColor: DARK_GREY,
                description: null,
                stage: STG_LEGALDOC,
            },
            {
                title:
                    financingType === FIN_CONVENTIONAL ? LOAN_DISBURSEMENT : FINANCING_DISBURSEMENT,
                titleColor: DARK_GREY,
                description: null,
                stage: STG_DISBURSE,
            },
        ];

        return defaultStepperObj.map((item, index) => {
            const titleColor = index <= currentStageIndex ? BLACK : item.titleColor;
            let color = item.color;
            let description;
            if (
                stageArray?.[index]?.stage === STG_ELIGIBILITY &&
                isMainApplicant &&
                jointApplicantInfo.customerId !== null
            ) {
                description = savedData?.statusMessage;
            } else {
                description = stageArray?.[index]?.stageDesc ?? null;
            }

            color = (() => {
                if (index < currentStageIndex) return STATUS_GREEN;
                else if (index === currentStageIndex) return statusColor;
                else return GREY;
            })();

            if (index > currentStageIndex) description = null;

            return {
                ...item,
                titleColor,
                color,
                description: description === "" ? null : description,
                number: String(index + 1),
                isLastItem: index === defaultStepperObj.length - 1,
            };
        });
    }

    function getTopMenuData({
        status,
        isPropertyListed,
        propertyDetails,
        progressStatus,
        statusRemoved,
    }) {
        console.log("[ApplicationDetails] >> [getTopMenuData]");

        const menuData = [];

        // Applicable only for listed properties.
        if (isPropertyListed === "Y" && propertyDetails) {
            menuData.push({
                menuLabel: VIEW_PROPERTY,
                menuParam: VIEW_PROPERTYS,
            });
        }
        // Applicable only for Active applications.
        if (
            status !== ELIGEXP &&
            status !== CANCELLED &&
            statusRemoved !== REMOVED &&
            route?.params?.currentUser !== "J"
        ) {
            menuData.push({
                menuLabel:
                    progressStatus === PROP_ELG_INPUT || progressStatus === PROP_ELG_RESULT
                        ? REMOVE_ELIGIBILITY
                        : CANCEL_APPLICATION,
                menuParam: CANCEL_REMOVE,
            });
        }

        return menuData.length ? menuData : null;
    }

    function showMenu() {
        console.log("[ApplicationDetails] >> [showMenu]");

        // Show Menu
        dispatch({
            actionType: "SHOW_TOP_MENU",
            payload: true,
        });

        FAProperty.onPressSelectMenu(PROPERTY_APPLICATION_DETAILS + stpApplicationId);
    }

    function closeTopMenu() {
        console.log("[ApplicationDetails] >> [closeTopMenu]");

        // Hide Menu
        dispatch({
            actionType: "SHOW_TOP_MENU",
            payload: false,
        });
    }

    function onTopMenuItemPress(param) {
        console.log("[ApplicationDetails] >> [onTopMenuItemPress]");

        // Hide menu
        closeTopMenu();

        // Need this delay as the popup is not opening instantly due to the TOP MENU being open
        setTimeout(() => {
            switch (param) {
                case "VIEW_PROPERTY":
                    onViewProperty();
                    break;
                case "CANCEL_REMOVE":
                    onCancelApplication();
                    break;
                default:
                    break;
            }
        }, 200);
    }

    async function onCancelApplication() {
        console.log("[ApplicationDetails] >> [onCancelApplication]");

        setLoading(true);

        // L3 call to invoke password page
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        const navParams = route?.params ?? {};
        const deleteRecord =
            progressStatus === PROP_ELG_INPUT || progressStatus === PROP_ELG_RESULT ? "Y" : "N";
        navigation.pop();
        // Navigate to Cancellation screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_CANCEL,
            params: {
                ...navParams,
                deleteRecord,
            },
        });

        setLoading(false);

        FAProperty.onPressSelectMenu(
            PROPERTY_APPLICATION_DETAILS_TEXT,
            state.topMenuData?.[1]?.menuLabel
        );
    }

    async function onViewProperty() {
        console.log("[ApplicationDetails] >> [onViewProperty]");
        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        // Navigate to Property details page
        navigation.navigate(BANKINGV2_MODULE, {
            screen: PROPERTY_DETAILS,
            params: {
                propertyDetail: propertyDetails,
                latitude,
                longitude,
                from: APPLICATION_DETAILS,
            },
        });

        FAProperty.onPressSelectMenu(PROPERTY_APPLICATION_DETAILS_TEXT, VIEW_PROPERTY);
    }

    async function onViewDocuments() {
        console.log("[ApplicationDetails] >> [onViewDocuments]");

        setLoading(true);

        // L3 call to invoke password page
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLICATION_DOCUMENT,
            navigation,
            params: {
                ...route.params,
            },
        });

        setLoading(false);

        FAProperty.onPressSelectAction(
            PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            VIEW_PROPERTY
        );
    }

    async function resumeLAInputFlow() {
        console.log("[ApplicationDetails] >> [resumeLAInputFlow]");

        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const syncId = navParams?.syncId ?? "";
        const encSyncId = await getEncValue(syncId);

        setLoading(true);

        const isJointApplicantAdded = !!jointApplicantInfo?.customerId;

        // Call prequal API
        const prequalResponseObj = await prequalCheckAPI(encSyncId, isJointApplicantAdded);
        const eligibilityStatus = prequalResponseObj.status;
        const onboardingInd = prequalResponseObj.onboardingInd;
        //if onboardingInd is Y then start New AIP flow BAU
        if (eligibilityStatus === AMBER && onboardingInd !== "Y") {
            setLoading(false);
            dispatch({
                actionType: "SHOW_APPLY_SUCCESS_POPUP",
                payload: true,
            });
            return;
        }

        // L3 call to invoke password page
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setLoading(false);
                return;
            }
        }

        // Prefetch required data
        let masterData = null;
        let mdmData = null;
        try {
            masterData = await getMasterData(false);
            mdmData = await getMDMData(false);
        } catch (error) {
            showErrorToast({ message: COMMON_ERROR_MSG });
            return;
        }

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            setLoading(false);
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }

        const propertyId = navParams?.propertyDetails?.property_id ?? "";

        // Request for CCRIS report
        const ccrisReqParams = {
            propertyId,
            progressStatus: PROP_LA_INPUT,
            syncId: encSyncId,
        };
        const { success, errorMessage } = await fetchCCRISReport(ccrisReqParams);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const { age } = await isAgeEligible(mdmData?.dob);
        const params = await getCEResultNavParams();

        // Navigate to Eligibility confirm screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_ELIGIBILITY_CONFIRM,
            params: {
                ...params,
                masterData,
                mdmData,
                age,
                eligibilityStatus,

                // Resume specific params
                resumeFlow: true,
                savedData,
            },
        });

        setLoading(false);
    }

    async function routeToResultScreen() {
        console.log("[ApplicationDetails] >> [routeToResultScreen]");
        const { successRes, result } = await getJAButtonEnabled(false);

        // Show error if failed to fetch MDM data
        if (!successRes) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }

        const { statusResp, response } = await fetchRFASwitchStatus(false);

        // Show error message
        if (!statusResp) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }

        // Construct Nav Params
        const params = await getCEResultNavParams();
        params.isJAButtonEnabled = result;
        params.isRFAButtonEnabled = response;

        // Navigate to Eligibility result screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_RESULT,
            params,
        });
    }

    async function routeToCEAddJADetails() {
        console.log("[ApplicationDetails] >> [routeToCEAddJADetails]");

        // Construct Nav Params
        // Prefetch required data
        const masterData = await getMasterData(false);
        const mdmData = await getMDMData(false);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }
        const navParams = route?.params ?? {};
        navParams.isMainEligDataType = navParams?.savedData?.dataType;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_DETAILS,
            params: {
                ...navParams,
                masterData,
                mdmData,
            },
        });
    }

    async function getCEResultNavParams() {
        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const savedData = navParams?.savedData ?? {};
        const { age } = await isAgeEligible(savedData?.dob);
        const baseRateLabel = savedData?.baseRateLabel ?? BASE_RATE;

        return {
            ...savedData,

            // Common
            latitude,
            longitude,
            propertyDetails,
            age,
            syncId: navParams?.syncId,
            baseRateLabel,
            jointApplicantDetails: jointApplicantInfo,
            mainApplicantDetails: mainApplicantInfo,
            isJointApplicantAdded: !!jointApplicantInfo?.customerId,
            isMainApplicant,
            isAccepted: savedData?.isAccepted,

            // Property Data
            propertyId: propertyDetails?.property_id ?? "",
            propertyName: state.propertyName,

            // Input Data
            propertyPrice: savedData?.propertyPriceRaw,
            origDownPaymentAmount: savedData?.downPaymentAmount,
            downPaymentAmount: savedData?.downPaymentAmountRaw,
            loanAmount: savedData?.loanAmountRaw,
            tenure: savedData?.tenure,
            spouseIncome: savedData?.spouseIncomeRaw,
            grossIncome: savedData?.grossIncomeRaw,
            housingLoan: savedData?.housingLoan,
            personalLoan: savedData?.personalLoanRaw,
            ccRepayments: savedData?.ccRepaymentsRaw,
            carLoan: savedData?.carLoanRaw,
            overdraft: savedData?.overdraft,
            nonBankCommitments: savedData?.nonBankCommitmentsRaw,

            // Result Data
            eligibilityResult: {
                dataType: savedData?.dataType,
                aipAmount: savedData?.loanAmountRaw,
                interestRate: savedData?.interestRate,
                tenure: savedData?.recommendedTenure,
                recommendedDownPayment: savedData?.recommendedDownpaymentRaw,
                installmentAmount: savedData?.monthlyInstalmentRaw,
                baseRate: savedData?.baseRate,
                spreadRate: savedData?.spreadRate,
                minTenure: savedData?.minTenure,
                maxTenure: savedData?.maxTenure,
                publicSectorNameFinance: savedData?.publicSectorNameFinance,
            },
            aipAmount: savedData?.loanAmountRaw,
            recommendedDownpayment: savedData?.recommendedDownpaymentRaw,
            installmentAmount: savedData?.monthlyInstalmentRaw,
            monthlyInstalment: savedData?.monthlyInstalmentRaw,
            stpApplicationId: savedData?.stpApplicationId,
            origLoanAmount: savedData?.origLoanAmount,
            origTenure: savedData?.origTenure,
            currentScreenName: jointApplicantInfo?.customerId ? JA_VIEW : MA_VIEW,
            agentId: agentInfo?.pf_id,
            salesRepRequest: savedData?.isReqAsst,
            isFirstTimeBuyHomeIndc: savedData?.isFirstTimeBuyHomeIndc ?? "",
        };
    }

    async function resumeCEInputFlow() {
        console.log("[ApplicationDetails] >> [resumeCEInputFlow]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const latitude = navParams?.latitude ?? "";
        const longitude = navParams?.longitude ?? "";
        const savedData = navParams?.savedData ?? {};
        const syncId = navParams?.syncId;

        // L2 call to invoke login page
        const { isPostLogin, isPostPassword } = getModel("auth");
        if (!isPostPassword && !isPostLogin) {
            try {
                const httpResp = await invokeL2(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            } catch (error) {
                return;
            }
        }

        // Prefetch required data
        const masterData = await getMasterData(true);
        const mdmData = await getMDMData(true);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }

        const { age } = await isAgeEligible(mdmData?.dob);
        const propertyName = propertyDetails?.property_name ?? "";
        const basicNavParams = getEligibilityBasicNavParams({
            propertyName,
            propertyDetails,
            masterData,
            mdmData,
            age,
            latitude,
            longitude,
        });

        const screenName =
            basicNavParams?.isPropertyListed === "Y"
                ? CE_UNIT_SELECTION
                : navParams?.propertyDetails != null
                ? CE_PROPERTY_NAME
                : CE_PROPERTY_SEARCH_LIST;

        navigation.navigate(BANKINGV2_MODULE, {
            screen: screenName,
            params: {
                // Original params
                ...basicNavParams,
                propertyName,
                // Resume specific params
                resumeFlow: true,
                savedData,
                syncId,
                from: APPLICATION_DETAILS,
            },
        });
    }

    async function resumeJAFlow() {
        console.log("[ApplicationDetails] >> [resumeJAFlow]");

        const propertyData = route?.params?.propertyDetails ?? {};
        const { JAAcceptance } = getModel("property");
        const latitude = route?.params?.latitude ?? "";
        const longitude = route?.params?.longitude ?? "";
        const saveData = route?.params?.savedData ?? {};
        const syncId = route?.params?.syncId;

        // L2 call to invoke login page
        const { isPostLogin, isPostPassword } = getModel("auth");
        if (!isPostPassword && !isPostLogin) {
            try {
                const httpResp = await invokeL2(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            } catch (error) {
                return;
            }
        }

        // Prefetch required data
        const masterData = await getMasterData(true);
        const mdmData = await getMDMData(true);

        // Show error if failed to fetch MDM data
        if (!mdmData) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            return;
        }
        const navParams = getJEligibilityBasicNavParams({
            masterData,
            mdmData,
            propertyData,
            saveData,
            latitude,
            longitude,
        });
        navigation.navigate(BANKINGV2_MODULE, {
            screen: JAAcceptance ? JA_PERSONAL_INFO : JA_ACCEPTANCE,
            params: {
                ...navParams,
                syncId,
            },
        });
    }

    function closeApplySuccessPopup() {
        console.log("[ApplicationDetails] >> [closeApplySuccessPopup]");

        // Close popup
        dispatch({
            actionType: "SHOW_APPLY_SUCCESS_POPUP",
            payload: false,
        });
    }

    async function onContinue() {
        console.log("[ApplicationDetails] >> [onContinue]");
        const { isPostPassword } = getModel("auth");
        const navParams = route?.params ?? {};
        const savedData = navParams?.savedData ?? {};
        const isActive = savedData?.isActive;
        if (!isPostPassword) {
            try {
                const httpResp = await invokeL3(false);
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            } catch (error) {
                return;
            }
        }
        switch (progressStatus) {
            case PROP_ELG_INPUT: {
                // Resume Check Eligibility input flow
                if (isJointApplicant) {
                    resumeJAFlow();
                } else {
                    resumeCEInputFlow();
                }
                break;
            }
            case PROP_ELG_RESULT:
                // Redirect user to Eligibility result screen
                if (isActive === "W") {
                    routeToCEAddJADetails();
                } else {
                    routeToResultScreen();
                }
                break;
            case PROP_LA_INPUT:
                // Resume Loan Application Input Flow
                resumeLAInputFlow();
                break;
            case PROP_LA_RESULT:
                // TODO: Redirect to Loan Application result screen
                break;
            default:
                break;
        }

        FAProperty.onPressSelectAction(
            PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            state.ctaText
        );
    }

    function onPressCall() {
        console.log("[ApplicationDetails] >> [onPressCall]");

        const mobileNo = agentInfo?.mobile_no ?? "";
        if (mobileNo) {
            contactBankcall(mobileNo);
        }

        FAProperty.onPressSelectAction(
            PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            FA_CALL_SALES_ASSISTANCE
        );
    }

    async function onPressMessage() {
        console.log("[ApplicationDetails] >> [onPressMessage]");

        const navParams = route?.params ?? {};
        const propertyDetails = navParams?.propertyDetails ?? {};
        const propertyId = propertyDetails?.property_id;
        const stpId = navParams?.savedData?.stpApplicationId;
        const operatorId = agentInfo?.pf_id;
        const syncId = navParams?.syncId;
        const encSyncId = await getEncValue(syncId);

        const params = {
            propertyId,
            stpId,
            operatorId,
            syncId: encSyncId,
            groupChatIndicator: "CREATE_CHAT",
        };

        const httpResp = await getGroupChat(params, false).catch((error) => {
            console.log("[ApplicationDetails][getGroupChat] >> Exception: ", error);
        });

        const result = httpResp?.data?.result ?? {};
        const url = result?.url + "?token=" + result?.token;

        const showGroupCoApplicant = isJointApplicant
            ? result?.mainCustomerName
            : navParams?.savedData?.isAccepted
            ? result?.jointCustomerName
            : "";

        navigation.navigate(BANKINGV2_MODULE, {
            screen: CHAT_WINDOW,
            params: {
                chatUrl: url,
                syncId,
                stpId,
                currentUser: route?.params?.currentUser,
                mainApplicantDetails: navParams?.mainApplicantDetails ?? null,
                jointApplicantDetails: navParams?.jointApplicantDetails ?? null,
                propertyName: propertyDetails?.property_name
                    ? propertyDetails?.property_name
                    : navParams?.savedData?.propertyName,
                salesPersonName: agentInfo?.name,
                salesPersonMobileNo: agentInfo?.mobile_no,
                propertyPrice:
                    navParams?.savedData?.propertyPrice ?? navParams?.savedData?.propertyPriceRaw,
                showGroupCoApplicant,
            },
        });

        FAProperty.onPressSelectAction(
            PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            FA_MESSAGE_SALES
        );
    }

    const onCloseInfoPopup = () => {
        console.log("[ApplicationDetails] >> [onCloseInfoPopup]");
        dispatch({
            actionType: "SHOW_INFO_POPUP",
            payload: {
                infoPopup: false,
                infoPopupTitle: "",
                infoPopupDesc: "",
            },
        });
    };

    const onCloseRemoveJointApplicantPopup = () => {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: false,
            },
        });
    };
    const onOpenRemoveJointApplicantPopup = () => {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: true,
            },
        });

        FAProperty.onPressViewScreen(FA_REMOVE_JOINT_APPLICANT);
    };

    const onOpenRemindJointApplicantPopup = () => {
        dispatch({
            actionType: "SHOW_REMIND_JOINT_APPLICANT_POPUP",
            payload: {
                remindJointApplicant: true,
            },
        });
    };
    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }

    async function removeJointApplicantOnClick() {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: false,
            },
        });

        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId;
        const encSyncId = await getEncValue(syncId);
        const propertyDetails = navParams?.propertyDetails ?? {};
        const operatorId = agentInfo?.pf_id;

        const params = {
            propertyId: propertyDetails?.property_id,
            stpId: navParams?.savedData?.stpApplicationId,
            operatorId: agentInfo?.pf_id,
            syncId: encSyncId,
            groupChatIndicator: "REMOVE_MEMBER",
        };

        try {
            const { success } = await removeYourJointApplicant({ syncId: encSyncId }, true);

            if (success) {
                if (operatorId != null) {
                    await getGroupChat(params, false).catch((error) => {
                        console.log(
                            "[ApplicationDetails][removeJointApplicantOnClick] >> Exception: ",
                            error
                        );
                    });
                }
                const mdmData = await getMDMData(true);
                const formData = await getFormData(navParams, mdmData);
                callEligibilityAPI(formData);
            }
        } catch (error) {
            showErrorToast({
                message: error.message,
            });
        }
        FAProperty.onPressSelectAction(
            PROPERTY_APPLICATION_DETAILS + stpApplicationId,
            REMOVE_JOINT_TITLE
        );
    }
    async function callEligibilityAPI(params) {
        console.log("[ApplicationDetails] >> [callEligibilityAPI]");
        const { successRes, result } = await getJAButtonEnabled(false);

        // Show error if failed to fetch MDM data
        if (!successRes) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }
        const { statusResp, response } = await fetchRFASwitchStatus(false);
        // Show error message
        if (!statusResp) {
            showErrorToast({
                message: PROPERTY_MDM_ERR,
            });
            setLoading(false);
            return;
        }
        // Call API to check eligibility

        const httpResp = await eligibilityCheck(params, true).catch((error) => {
            console.log("[ApplicationDetails][eligibilityCheck] >> Exception: ", error);
        });
        const statusCode = httpResp?.data?.result?.statusCode ?? null;
        const stpId = httpResp?.data?.result?.stpId ?? null;
        const overallStatus = httpResp?.data?.result?.overallStatus ?? null;
        const eligibilityResult = httpResp?.data?.result?.eligibilityResult ?? null;
        const massagedResult = adMassageEligibilityResult(eligibilityResult);
        const statusDesc = httpResp?.data?.result?.statusDesc ?? COMMON_ERROR_MSG;

        if (!statusCode === STATUS_CODE_SUCCESS) {
            setLoading(false);
            showErrorToast({
                message: statusDesc,
            });
            return;
        }
        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails } =
            await fetchGetApplicants(params.syncId, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const navParams = await getEligiblityCEResultNavParams(route.params, propertyName);
        navParams.isMainEligDataType = null;
        navParams.dataType = null;
        navParams.jaDataType = null;

        // Navigate to Eligibility result screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_RESULT,
            params: {
                ...navParams,
                stpApplicationId: stpId,
                eligibilityResult: massagedResult,
                eligibilityStatus: overallStatus,
                isEditFlow: null,
                editFlow: null,
                jointApplicantDetails,
                mainApplicantDetails,
                isJointApplicantAdded: false,
                isMainApplicant: true,
                isJARemoved: true,
                currentScreenName: "REMOVED_VIEW",
                isJAButtonEnabled: result,
                isRFAButtonEnabled: response,
            },
        });

        setLoading(false);
    }

    function closeNotifyJAPopup() {
        console.log("[ApplicationDetails] >> [closeExitPopup]");

        dispatch({
            actionType: "SHOW_REMIND_JOINT_APPLICANT_POPUP",
            payload: {
                remindJointApplicant: false,
            },
        });
    }
    async function onNotifyJAPopupConfirm() {
        console.log("[ApplicationDetails] >> [onNotifyJAPopupConfirm]");
        const checkExistingCustomer = await isExistingCustomer(
            {
                syncId: await getEncValue(route.params?.syncId),
                idNumber: state?.jointApplicantInfo?.customerId,
                mobileNo: "",
            },
            false
        );
        // close popup
        closeNotifyJAPopup();
        const navParams = route?.params;
        const masterData = await getMasterData(false);
        const mdmData = await getMDMData(false);
        const savedData = navParams?.savedData;
        const mdmTitle = savedData?.title ?? mdmData?.title;
        const mdmGender = savedData?.gender ?? mdmData?.gender;
        const gender = mdmGender === "F" ? HER : HIS;

        const titleSelect = getExistingData(mdmTitle, masterData?.title);
        const titleName = titleSelect.name.includes("/")
            ? titleSelect.name.substring(0, titleSelect.name.indexOf("/") - 0)
            : titleSelect.name;
        const mainApplicantName = state?.mainApplicantInfo?.customerName;

        const deepLinkUrl = checkExistingCustomer?.data?.result?.maeAppUrl;
        const propertyName = state.propertyName;
        if (!deepLinkUrl) return;

        const shareMsg = `${titleName} ${mainApplicantName} ${HAVE_INVITED_YOU_FOR_JA} ${gender} ${MORTGAGE_APPLICATION_AT} ${propertyName} ${INSTALL_MAE_FROM_APP_STORE_TEXT}`;
        const message = `${shareMsg}\n${deepLinkUrl}`;

        // Open native share window
        Share.open({
            message,
            subject: shareMsg,
        })
            .then(() => {
                console.log(
                    "[ApplicationDetails][onNotifyJAPopupConfirm] >> Link shared successfully."
                );
            })
            .catch((error) => {
                console.log("[ApplicationDetails][onNotifyJAPopupConfirm] >> Exception: ", error);
            });
    }
    function onNotifyJAPopupCancel() {
        console.log("[ApplicationDetails] >> [onNotifyJAPopupCancel]");

        // close popup
        closeNotifyJAPopup();
    }

    return (
        <>
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={loading}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={
                                showTopMenuIcon
? (
                                    <HeaderDotDotDotButton onPress={showMenu} />
                                )
: (
                                    <></>
                                )
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={20}
                    useSafeArea={showCTA}
                >
                    <>
                        <ApplicationDetailsTemplateScreen
                            state={state}
                            isCancelled={isCancelled}
                            isJointApplicant={isJointApplicant}
                            isMainApplicant={isMainApplicant}
                            wolocStatus={wolocStatus}
                            isExpired={isExpired}
                            progressStatus={progressStatus}
                            jointApplicantInfo={jointApplicantInfo}
                            params={route?.params}
                            isRemoved={isRemoved}
                            fullDataEntryIndicator={fullDataEntryIndicator}
                            dispatch={dispatch}
                            agentInfo={agentInfo}
                            currentStage={currentStage}
                            showCTA={showCTA}
                            onPressCall={onPressCall}
                            onPressMessage={onPressMessage}
                            onViewDocuments={onViewDocuments}
                            onOpenRemoveJointApplicantPopup={onOpenRemoveJointApplicantPopup}
                            onOpenRemindJointApplicantPopup={onOpenRemindJointApplicantPopup}
                            mainApplicantInfo={mainApplicantInfo}
                            onContinue={onContinue}
                            getStatusData={getStatusData}
                        />
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Top Menu */}
            {showTopMenuIcon && (
                <TopMenu
                    showTopMenu={state.showTopMenu}
                    onClose={closeTopMenu}
                    navigation={navigation}
                    menuArray={state.topMenuData}
                    onItemPress={onTopMenuItemPress}
                />
            )}

            {/* Apply Loan Success popup */}
            <Popup
                visible={state.showApplySuccessPopup}
                title={APPLYSUCCPOPUP_TITLE}
                description={APPLYSUCCPOPUP_DESC}
                onClose={closeApplySuccessPopup}
                primaryAction={{
                    text: OKAY,
                    onPress: closeApplySuccessPopup,
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

            {/* Info Popup */}
            <Popup
                visible={state.infoPopup}
                title={state.infoPopupTitle}
                description={state.infoPopupDesc}
                onClose={onCloseInfoPopup}
            />
            <Popup
                visible={state.remindJointApplicant}
                title={NO_NOTIFY_JOINTAPPLICANT_TITLE}
                description={NOTIFY_JOINT_APPLICANT_DESC}
                onClose={closeNotifyJAPopup}
                primaryAction={{
                    text: CONFIRM,
                    onPress: onNotifyJAPopupConfirm,
                }}
                secondaryAction={{
                    text: CANCEL,
                    onPress: onNotifyJAPopupCancel,
                }}
            />
        </>
    );
}

ApplicationDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default ApplicationDetails;
