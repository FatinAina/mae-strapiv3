/* eslint-disable sonarjs/cognitive-complexity */

/* eslint-disable no-use-before-define */

/* eslint-disable react/jsx-no-bind */

/* eslint-disable radix */
import { useFocusEffect } from "@react-navigation/native";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useReducer, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import RNSafetyNet from "react-native-safety-net";

import {
    BANKINGV2_MODULE,
    LA_ELIGIBILITY_CONFIRM,
    CE_RESULT,
    CE_ADD_JA_NOTIFY_RESULT,
    APPLICATION_DETAILS,
    CE_PF_NUMBER,
} from "@navigation/navigationConstant";

import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import {
    saveResultData,
    invokeL3,
    pushNotificationToInviteJA,
    removeJointApplicant,
    getGroupChat,
} from "@services";
import {
    FAProperty,
    getRemoveJAFAProperty,
    getFACRScreenLoad,
    getFAonProceedWithApplication,
    getFAApplyNow,
} from "@services/analytics/analyticsProperty";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import {
    PROP_LA_INPUT,
    STATUS_PASS,
    STATUS_SOFT_FAIL,
    STATUS_HARD_FAIL,
    AMBER,
    DT_NOTELG,
} from "@constants/data";
import {
    COMMON_ERROR_MSG,
    PROPERTY_MDM_ERR,
    REQ_ASSITANCE_POPUP_TITLE,
    REQ_ASSITANCE_POPUP_DESC,
    FA_PROPERTY_JA_BAU_APPLICATION,
    STILL_APPLY_FOR_LOAN_FINC,
    OUT_OF_AFFORDABILITY_RANGE,
    NOT_SATISFIED,
    JA_REJECT_INVIATATION,
    DESIRED_FIN_OUTOF_AFFORD_RANGE_INC_PERIOD,
    DESIRED_FIN_OUTOF_AFFORD_RANGE,
    WHAT_WE_CAN_OFFER,
    REGRET_TO_INFORM_OUTOF_AFFORD_RANGE_REAPPY,
    REGRET_TO_INFORM_OUTOF_AFFORD_RANGE,
    ADDED_JA_NOTELIGIBLE_RFA_REAPPLY,
    ADDED_JA_NOTELIGIBLE,
    RFA_SALE_REP_PROVIED_ADDITIONAL_DETAILS,
    REMOVED_JOINT_APPLICANT,
    UPDATED_OFFER,
    EXISTING_OFFER,
    DECLINED_JOINT_APPLICANT,
    ELIGIBLE_FOR_FINANCING,
    CONGRATULATION,
    TOGETHER_WITH_JOINT_APPLICANT,
    CAN_OFFER,
    VIEW_OFFER_CONDITIONS,
    ACCEPTED_INVITATION,
    TOGETHER_ELIGIBLE_FOR_FINANCING,
    INCREASED_HOME_FINANCING,
    HIGHER_HOME_FINANCING,
    HELPED_HIGHER_HOME_FINANCING,
    NOT_ELIGIBLE_FOR_HOME_FINANCING,
    NOMINATE_ANOTHER_JOINT_APPLICANT,
    NOT_QUALIFY_HOME_FINANCING,
    ANOTHER_JOINT_APPLICANT,
    ELIGIBLE_FOR_THIS_FINANCING,
    FINANCING_PERIOD,
    STANDARD_BASE_RATE,
    RECM_FINANCING_PERIOD,
    FA_PROPERTY_JACEJA_REJECTED_INVITATION
} from "@constants/strings";

import {
    fetchApplicationDetails,
    fetchGetApplicants,
    prequalCheckAPI,
} from "../Application/LAController";
import {
    useResetNavigation,
    getMasterData,
    getMDMData,
    fetchCCRISReport,
    getEncValue,
    fetchJACCRISReport,
} from "../Common/PropertyController";
import { isAgeEligible, saveEligibilityInput, checkEligibility } from "./CEController";
import {
    getEligibilityRequestParams,
    getResultScreenParams,
    getTenure,
    getDownpayment,
    getResultStatus,
    getFormData,
    getPropertyPrice,
    getInterestRate,
} from "./CERFormController";
import CEResultScreenTemplate from "./CEResultScreenTemplate";
// Initial state object
const initialState = {
    // UI Labels
    headerText: ELIGIBLE_FOR_THIS_FINANCING,
    subText1: "",
    subText2: null, //"Here's our offer:",
    tenureLabel: FINANCING_PERIOD,
    otherOptionText: NOT_SATISFIED,
    propertyName: null,
    isEditFlow: false,

    // Tenure Overlay
    showTenureOverlay: false,
    tenureMin: 5,
    tenureMax: 35,

    // Downpayment Overlay
    showDownpaymentOverlay: false,
    downpaymentOverlayKeypad: 0,
    downpaymentOverlayDisplay: "",
    downpaymentOverlayIsValid: true,
    downpaymentOverlayErrorMsg: "",

    // Loan Details
    loanAmount: "",
    loanAmountFormatted: "",
    interestRate: "",
    interestRateFormatted: "",
    spreadRate: "",
    spreadRateFormatted: null,
    baseRate: "",
    baseRateFormatted: null,
    tenure: "",
    tenureFormatted: "",
    tenureEditable: false,
    monthlyInstalment: "",
    monthlyInstalmentFormatted: "",
    propertyPrice: "",
    propertyPriceFormatted: "",
    downpayment: "",
    downpaymentFormatted: "",
    downpaymentEditable: false,
    downpaymentInfoNote: null,
    recommendedDownpayment: "",
    publicSectorNameFinance: false,

    // Others
    showExitPopup: false,
    showOfferDiscPopup: false,
    showApplySuccessPopup: false,
    hideSaveProgressPopup: false,
    status: STATUS_PASS, // PASS | SOFT_FAIL | HARD_FAIL

    // Request Assistance
    showSalesRepReqPopup: false,
    isAssistanceRequested: false,
    showReqAssistSuccessPopup: false,
    popupTitle: REQ_ASSITANCE_POPUP_TITLE,
    popupDesc: REQ_ASSITANCE_POPUP_DESC,

    // Result response data
    dataType: null,
    disableScreenshot: false,

    loading: true,
    isJointApplicantAdded: false,
    isJARemoved: false,

    isMainApplicant: false,

    jointApplicantInfo: null,

    eligibilityStatus: "ELIGIBILTY_STATUS_AMBER",
    isMainEligDataType: null,
    isJAButtonEnabled: false,
    isRFASwitchEnabled: false,
    isApplyButtonFloating: true,
};

function reducer(state, action) {
    const { actionType, payload } = action;

    switch (actionType) {
        case "SET_HEADER_LABELS":
            return {
                ...state,
                headerText: payload?.headerText ?? state.headerText,
                subText1: payload?.subText1 ?? state.subText1,
                subText2: payload?.subText2 ?? state.subText2,
                otherOptionText: payload?.otherOptionText ?? state.otherOptionText,
            };
        case "SET_SUBTEXT1":
            //to update after re-calculation
            return {
                ...state,
                subText1: payload,
            };
        case "SET_SUBTEXT2":
            //to update after re-calculation
            return {
                ...state,
                subText2: payload,
            };
        case "SHOW_TENURE_OVERLAY":
            return {
                ...state,
                showTenureOverlay: payload,
            };
        case "SHOW_DOWNPAYMENT_OVERLAY":
            return {
                ...state,
                showDownpaymentOverlay: payload,
                downpaymentOverlayIsValid: true,
                downpaymentOverlayErrorMsg: "",
            };
        case "SET_DOWNPAY_OVERLAY_VALUE":
            return {
                ...state,
                downpaymentOverlayKeypad: payload?.keypad,
                downpaymentOverlayDisplay: payload?.display,
            };
        case "RESET_DOWNPAY_OVERLAY_VALUE":
            return {
                ...state,
                downpaymentOverlayKeypad: 0,
                downpaymentOverlayDisplay: "",
            };
        case "SET_DOWNPAY_TENURE_EDITABLE":
            return {
                ...state,
                downpaymentEditable: payload?.downpaymentEditable,
                tenureEditable: payload?.tenureEditable,
            };
        case "SHOW_EXIT_POPUP":
            return {
                ...state,
                showExitPopup: payload,
            };
        case "SHOW_OFFER_DISC_POPUP":
            return {
                ...state,
                showOfferDiscPopup: payload,
            };
        case "SHOW_APPLY_SUCCESS_POPUP":
            return {
                ...state,
                showApplySuccessPopup: payload,
            };
        case "SHOW_REQ_ASSIST_SUCCESS_POPUP":
            return {
                ...state,
                showReqAssistSuccessPopup: payload,
            };
        case "HIDE_SAVE_PROGRESS_POPUP":
            return {
                ...state,
                hideSaveProgressPopup: payload,
            };
        case "SET_DOWNPAYMENT":
        case "SET_TENURE":
        case "SET_LOAN_DETAILS":
        case "SET_APPLY_BUTTON_FLOATING":
            return {
                ...state,
                ...payload,
            };
        case "SET_STATUS":
            return {
                ...state,
                status: payload,
            };
        case "SET_IS_EDIT_FLOW":
            return {
                ...state,
                isEditFlow: payload,
            };
        case "DISABLE_SCREENSHOT":
            return {
                ...state,
                disableScreenshot: payload,
            };
        case "SET_POPUP_TITLE_DESC":
            return {
                ...state,
                popupTitle: payload?.popupTitle,
                popupDesc: payload?.popupDesc,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: payload,
            };
        case "SET_JOINT_APPLICANT_ADDED":
            return {
                ...state,
                isJointApplicantAdded: payload,
            };
        case "SET_JOINT_APPLICANT_REMOVED":
            return {
                ...state,
                isJARemoved: payload,
            };
        case "SET_MAIN_APPLICANT_ELIGBILITY_ADDED":
            return {
                ...state,
                isMainEligDataType: payload,
            };
        case "SET_MAIN_APPLICANT":
            return {
                ...state,
                isMainApplicant: payload,
            };
        case "SET_JOINT_APPLICANT_INFO":
            return {
                ...state,
                jointApplicantInfo: payload,
            };
        case "SET_ELIGIBILITY_STATUS":
            return {
                ...state,
                eligibilityStatus: payload,
            };
        case "SHOW_REMOVE_JOINT_APPLICANT_POPUP":
            return {
                ...state,
                removeJointApplicant: payload?.removeJointApplicant,
            };
        case "SET_JA_BUTTON_ENABLED":
            return {
                ...state,
                isJAButtonEnabled: payload,
            };
        case "SET_RFA_BUTTON_ENABLED":
            return {
                ...state,
                isRFASwitchEnabled: payload,
            };
        default:
            return { ...state };
    }
}

function CEResult({ route, navigation }) {
    const { getModel } = useModelController();
    const [resetToApplication] = useResetNavigation(navigation);
    const [state, dispatch] = useReducer(reducer, initialState);

    const { status, loading, disableScreenshot, isEditFlow, eligibilityStatus } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, [init]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.isAssistanceRequested) {
                init();
            }
        }, [init, route.params?.isAssistanceRequested])
    );

    useEffect(() => {
        // In case of edit eligibility from LA confirm - Save Data in DB
        async function saveResult() {
            if (isEditFlow) {
                await saveEligibilityResult();
            }
        }
        saveResult();
    }, [isEditFlow, saveEligibilityResult]);

    const init = useCallback(() => {
        console.log("[CEResult] >> [init]");

        const navParams = route?.params ?? {};
        // Call method to populate result screen data

        populateData(navParams);
    }, [populateData, route.params]);

    /* disabling screenshot option for Android */
    useFocusEffect(
        useCallback(() => {
            // Screenshot disabling - Android Specific
            if (Platform.OS === "android" && disableScreenshot) {
                try {
                    RNSafetyNet.screenshotDisable(true);
                } catch (error) {
                    console.log("[CEResult][screenshotDisable] >> Exception: ", error);
                }
                return () => {
                    try {
                        RNSafetyNet.screenshotDisable(false);
                    } catch (error) {
                        console.log("[CEResult][screenshotDisable] >> Exception: ", error);
                    }
                };
            }
        }, [disableScreenshot])
    );

    const populateData = useCallback(
        (navParams) => {
            console.log("[CEResult] >> [populateData]");
            const subTextLabel1 = DESIRED_FIN_OUTOF_AFFORD_RANGE_INC_PERIOD;
            const subTextLabel2 = DESIRED_FIN_OUTOF_AFFORD_RANGE;
            const subTextLabel3 = WHAT_WE_CAN_OFFER;
            const subTextLabel4 = REGRET_TO_INFORM_OUTOF_AFFORD_RANGE_REAPPY;
            const subTextLabel5 = REGRET_TO_INFORM_OUTOF_AFFORD_RANGE;
            const subTextLabel6 = ADDED_JA_NOTELIGIBLE_RFA_REAPPLY;
            const subTextLabel7 = ADDED_JA_NOTELIGIBLE;
            const subTextLabel8 = RFA_SALE_REP_PROVIED_ADDITIONAL_DETAILS;

            const salesRepRequest = navParams?.salesRepRequest === "Y";
            const propertyName = navParams?.propertyName;
            const customerName = (() => {
                const custSeparateName = navParams?.customerName?.toLowerCase().split(" ");
                if (custSeparateName) {
                    custSeparateName.forEach((item, index) => {
                        custSeparateName[index] = item.charAt(0).toUpperCase() + item.slice(1);
                    });
                    return custSeparateName.join(" ");
                }
                return "";
            })();
            // const tenureMaxValue = navParams?.tenureMaxValue;
            const mainEligDataType = navParams?.isMainEligDataType ?? navParams?.dataType;
            const isMainEligDataType = getResultStatus(mainEligDataType);
            const eligibilityResult = navParams?.eligibilityResult ?? {};
            const dataType = eligibilityResult?.dataType ?? null;
            const tempStatus = getResultStatus(
                navParams?.jaDataType ? navParams?.jaDataType : dataType
            );
            const loanAmount =
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult?.aipAmount
                    : eligibilityResult?.aipAmount;
            const monthlyInstalment =
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult?.installmentAmount
                    : eligibilityResult?.installmentAmount;
            const tempEligibilityStatus = navParams.eligibilityStatus;
            const isJointApplicantAdded = navParams?.isJointApplicantAdded;
            const isJARemoved = navParams?.isJARemoved;
            const savedPublicSectorNameFinance = eligibilityResult?.publicSectorNameFinance;
            const publicSectorNameFinance =
                savedPublicSectorNameFinance === true || savedPublicSectorNameFinance === "Y";

            const baseRateLabel = navParams?.baseRateLabel ?? STANDARD_BASE_RATE;

            const { propertyPrice, maxDownPayment } = getPropertyPrice(navParams);
            const { interestRate, spreadRate, baseRate } = getInterestRate(
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                    navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult
                    : eligibilityResult
            );
            const { resultTenure, tenureEditable, maxTenure, minTenure } = getTenure(
                navParams,
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                    navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult
                    : eligibilityResult,
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                    navParams?.isJointApplicantAdded
                    ? STATUS_SOFT_FAIL
                    : tempStatus
            );
            const {
                downpaymentEditable,
                recommendedDownpayment,
                resultDownpayment,
                downpaymentInfoNote,
            } = getDownpayment(
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                    navParams?.isJointApplicantAdded
                    ? STATUS_SOFT_FAIL
                    : tempStatus,
                navParams,
                navParams?.eligibilityResult?.dataType === DT_NOTELG &&
                    navParams?.isJointApplicantAdded
                    ? navParams?.maEligibilityResult
                    : eligibilityResult,
                tenureEditable,
                maxDownPayment
            );
            const requestAssistanceButtonStatus = navParams?.isRFAButtonEnabled;
            if (navParams?.isRFAButtonEnabled) {
                dispatch({
                    actionType: "SET_RFA_BUTTON_ENABLED",
                    payload: requestAssistanceButtonStatus,
                });
            }
            // Update screen status
            dispatch({
                actionType: "SET_STATUS",
                payload: tempStatus,
            });

            dispatch({
                actionType: "SET_ELIGIBILITY_STATUS",
                payload: tempEligibilityStatus,
            });

            // GA
                const screenName = !navParams?.declinedFromJa ? FAProperty.getFAScreenView(tempStatus, navParams) : FA_PROPERTY_JACEJA_REJECTED_INVITATION;
            
            // Set Header labels
            const headerText = customerName ? `Dear ${customerName},` : "Dear,";

            if (tempStatus === STATUS_SOFT_FAIL && !isJointApplicantAdded) {
                const subText1 =
                    tenureEditable && downpaymentEditable ? subTextLabel1 : subTextLabel2;

                // Set header and subtext values
                if (isJARemoved) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: REMOVED_JOINT_APPLICANT,
                            subText1: null,
                            subText2: null,
                            otherOptionText: UPDATED_OFFER,
                        },
                    });
                    dispatch({
                        actionType: "SET_SUBTEXT2",
                        payload: null,
                    });
                    dispatch({
                        actionType: "SET_SUBTEXT1",
                        payload: null,
                    });
                } else {
                    if (!navParams?.declinedFromJa) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1,
                                subText2: subTextLabel3,
                                otherOptionText: "",
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText: `${navParams?.JaHeaderMsg} ${DECLINED_JOINT_APPLICANT}`,
                                subText1: "",
                                subText2: null,
                                otherOptionText: EXISTING_OFFER,
                            },
                        });
                    }
                }
            } else if (tempStatus === STATUS_HARD_FAIL && !isJointApplicantAdded) {
                if (isJARemoved) {
                    if (!requestAssistanceButtonStatus) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: OUT_OF_AFFORDABILITY_RANGE,
                                subText2: STILL_APPLY_FOR_LOAN_FINC,
                                otherOptionText: null,
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: OUT_OF_AFFORDABILITY_RANGE,
                                subText2: subTextLabel8,
                                otherOptionText: null,
                            },
                        });
                    }
                } else {
                    if (!navParams?.declinedFromJa) {
                        // Set header and subtext values
                        if (!requestAssistanceButtonStatus) {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText,
                                    subText1: subTextLabel5,
                                    subText2: STILL_APPLY_FOR_LOAN_FINC,
                                    otherOptionText: NOT_SATISFIED,
                                },
                            });
                        } else {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText,
                                    subText1: subTextLabel4,
                                    subText2: null,
                                    otherOptionText: NOT_SATISFIED,
                                },
                            });
                        }
                    } else {
                        if (!requestAssistanceButtonStatus) {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText: `Dear ${navParams?.customerName},`,
                                    subText1: JA_REJECT_INVIATATION,
                                    subText2: null,
                                    otherOptionText: null,
                                },
                            });
                        } else {
                            dispatch({
                                actionType: "SET_HEADER_LABELS",
                                payload: {
                                    headerText: `Dear ${navParams?.customerName},`,
                                    subText1: JA_REJECT_INVIATATION,
                                    subText2: subTextLabel8,
                                    otherOptionText: null,
                                },
                            });
                        }
                    }
                }
            } else if (tempStatus === STATUS_PASS && !isJointApplicantAdded) {
                // status pass
                // Set header and subtext values
                if (!navParams?.declinedFromJa || isJARemoved) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: ELIGIBLE_FOR_FINANCING,
                            subText1: "",
                            subText2: null,
                            //otherOptionText: null,
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `${navParams?.JaHeaderMsg} ${DECLINED_JOINT_APPLICANT}`,
                            subText1: "",
                            subText2: null,
                            otherOptionText: EXISTING_OFFER,
                        },
                    });
                }

                dispatch({
                    actionType: "SET_SUBTEXT2",
                    payload: null,
                });
            } else if (tempStatus === STATUS_PASS && isJointApplicantAdded) {
                // status pass
                // Set header and subtext values
                if (!navParams?.jaEligResult) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: CONGRATULATION,
                            subText1: TOGETHER_WITH_JOINT_APPLICANT,
                            subText2: CAN_OFFER,
                            otherOptionText: VIEW_OFFER_CONDITIONS,
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `${navParams?.JaHeaderMsg} ${ACCEPTED_INVITATION}`,
                            subText1: TOGETHER_ELIGIBLE_FOR_FINANCING,
                            subText2: null,
                        },
                    });
                }
            } else if (tempStatus === STATUS_SOFT_FAIL && isJointApplicantAdded) {
                // status pass
                // Set header and subtext values

                if (!navParams?.jaEligResult) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText,
                            subText1: INCREASED_HOME_FINANCING,
                            subText2: CAN_OFFER,
                            otherOptionText: null,
                        },
                    });
                } else if (navParams?.jaEligResult && navParams?.subModule === "JA_ELIG_PASS") {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: `${navParams?.JaHeaderMsg} ${ACCEPTED_INVITATION}`,
                            subText1: `${
                                loanAmount > navParams?.jaLoanAmount
                                    ? HIGHER_HOME_FINANCING
                                    : loanAmount < navParams?.jaLoanAmount
                                    ? HELPED_HIGHER_HOME_FINANCING
                                    : TOGETHER_ELIGIBLE_FOR_FINANCING
                            }`,
                            subText2: null,
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: NOT_ELIGIBLE_FOR_HOME_FINANCING,
                            subText1: NOMINATE_ANOTHER_JOINT_APPLICANT,
                            subText2: EXISTING_OFFER,
                            otherOptionText: VIEW_OFFER_CONDITIONS,
                        },
                    });
                }
            } else if (
                isMainEligDataType === STATUS_SOFT_FAIL &&
                tempStatus === STATUS_HARD_FAIL &&
                isJointApplicantAdded &&
                tempEligibilityStatus === AMBER
            ) {
                // Set header and subtext values
                if (!navParams?.jaEligResult) {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: NOT_QUALIFY_HOME_FINANCING,
                            subText1: ANOTHER_JOINT_APPLICANT,
                            subText2: EXISTING_OFFER,
                            otherOptionText: VIEW_OFFER_CONDITIONS,
                        },
                    });
                } else {
                    dispatch({
                        actionType: "SET_HEADER_LABELS",
                        payload: {
                            headerText: NOT_ELIGIBLE_FOR_HOME_FINANCING,
                            subText1: NOMINATE_ANOTHER_JOINT_APPLICANT,
                            subText2: null,
                            otherOptionText: EXISTING_OFFER,
                        },
                    });
                }
            } else if (
                isMainEligDataType === STATUS_HARD_FAIL &&
                tempStatus === STATUS_HARD_FAIL &&
                isJointApplicantAdded &&
                tempEligibilityStatus === AMBER
            ) {
                if (!navParams?.jaEligResult) {
                    if (!requestAssistanceButtonStatus) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: subTextLabel7,
                                subText2: STILL_APPLY_FOR_LOAN_FINC,
                                otherOptionText: null,
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText,
                                subText1: subTextLabel6,
                                subText2: null,
                                otherOptionText: null,
                            },
                        });
                    }
                } else {
                    if (!requestAssistanceButtonStatus) {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText: `Dear ${navParams?.customerName},`,
                                subText1: subTextLabel7,
                                subText2: STILL_APPLY_FOR_LOAN_FINC,
                                otherOptionText: null,
                            },
                        });
                    } else {
                        dispatch({
                            actionType: "SET_HEADER_LABELS",
                            payload: {
                                headerText: `Dear ${navParams?.customerName},`,
                                subText1: subTextLabel7,
                                subText2: subTextLabel8,
                                otherOptionText: null,
                            },
                        });
                    }
                }
            }
            if (navParams?.isJointApplicantAdded) {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_ADDED",
                    payload: true,
                });
            } else {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_ADDED",
                    payload: false,
                });
            }

            if (navParams?.isJARemoved) {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_REMOVED",
                    payload: true,
                });
            }

            if (navParams?.isMainEligDataType ?? navParams?.dataType) {
                dispatch({
                    actionType: "SET_MAIN_APPLICANT_ELIGBILITY_ADDED",
                    payload: isMainEligDataType,
                });
            }

            if (navParams?.isMainApplicant) {
                dispatch({
                    actionType: "SET_MAIN_APPLICANT",
                    payload: true,
                });
            }

            if (navParams?.isJAButtonEnabled) {
                dispatch({
                    actionType: "SET_JA_BUTTON_ENABLED",
                    payload: true,
                });
            }

            //joint info
            const jointApplicantInfo = navParams?.jointApplicantDetails ?? null;

            // Set Joint info
            if (jointApplicantInfo) {
                dispatch({
                    actionType: "SET_JOINT_APPLICANT_INFO",
                    payload: jointApplicantInfo,
                });
            }
            const financeAmount = navParams?.jaLoanAmount ?? loanAmount;
            // Set Loan Details
            dispatch({
                actionType: "SET_LOAN_DETAILS",
                payload: {
                    // Others
                    dataType,
                    isAssistanceRequested: route.params?.isAssistanceRequested || salesRepRequest,

                    // Property
                    propertyName,
                    propertyPrice,
                    propertyPriceFormatted: !isNaN(propertyPrice)
                        ? `RM ${numeral(propertyPrice).format("0,0.00")}`
                        : null,

                    // Loan Amount
                    loanAmount,
                    loanAmountFormatted: !isNaN(financeAmount)
                        ? `RM ${numeral(financeAmount).format("0,0.00")}`
                        : null,

                    // Interest Rate
                    interestRate,
                    interestRateFormatted: !isNaN(interestRate) ? `${interestRate}% p.a` : "",
                    baseRate,
                    baseRateFormatted: !isNaN(baseRate) ? `${baseRateLabel}: ${baseRate}%` : "",
                    spreadRate,
                    spreadRateFormatted: !isNaN(spreadRate) ? `Spread: ${spreadRate}%` : "",

                    // Tenure
                    tenure: resultTenure,
                    tenureFormatted: !isNaN(resultTenure) ? `${resultTenure} years` : "",
                    tenureEditable,
                    tenureLabel: tenureEditable ? RECM_FINANCING_PERIOD : state.tenureLabel,
                    tenureMin:
                        minTenure !== null ? (isNaN(minTenure) ? 5 : parseInt(minTenure)) : 5,
                    tenureMax:
                        maxTenure !== null ? (isNaN(maxTenure) ? 35 : parseInt(maxTenure)) : 35,

                    // Monthly Instalment
                    monthlyInstalment,
                    monthlyInstalmentFormatted: !isNaN(monthlyInstalment)
                        ? `RM ${numeral(monthlyInstalment).format("0,0.00")}`
                        : null,

                    // Downpayment
                    downpayment: resultDownpayment,
                    downpaymentFormatted: !isNaN(resultDownpayment)
                        ? `RM ${numeral(resultDownpayment).format("0,0.00")}`
                        : null,
                    downpaymentEditable,
                    downpaymentInfoNote,
                    recommendedDownpayment,
                    publicSectorNameFinance,
                },
            });

            //disable screenshot
            dispatch({
                actionType: "DISABLE_SCREENSHOT",
                payload: Platform.OS === "android" && tempStatus !== STATUS_HARD_FAIL,
            });

            const isEditFlow = navParams?.isEditFlow ?? false;
            dispatch({
                actionType: "SET_IS_EDIT_FLOW",
                payload: isEditFlow,
            });

            // Analytics
            getFACRScreenLoad(navParams, mainEligDataType, screenName);

            setLoading(false);
        },
        [route.params?.isAssistanceRequested, state.tenureLabel]
    );

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
        getRemoveJAFAProperty(route?.params, status);
    };

    async function removeJointApplicantOnClick() {
        dispatch({
            actionType: "SHOW_REMOVE_JOINT_APPLICANT_POPUP",
            payload: {
                removeJointApplicant: false,
            },
        });
        setLoading(true);
        const navParams = route?.params ?? {};
        const syncId = navParams?.syncId;
        const propertyDetails = navParams?.propertyDetails ?? {};
        const propertyId = propertyDetails?.property_id;
        const stpId = navParams?.savedData?.stpApplicationId;
        const operatorId = navParams?.agentId;
        const encSyncId = await getEncValue(syncId);
        const httpResp = await removeJointApplicant({ syncId: encSyncId }, false);
        if (httpResp?.data?.result?.statusCode === STATUS_CODE_SUCCESS) {
            if (operatorId != null) {
                const params = {
                    propertyId,
                    stpId,
                    operatorId,
                    syncId: encSyncId,
                    groupChatIndicator: "REMOVE_MEMBER",
                };
                await getGroupChat(params, false).catch((error) => {
                    console.log(
                        "[ApplicationDetails][removeJointApplicantOnClick] >> Exception: ",
                        error
                    );
                });
            }

            callEligibilityAPIForRemove(encSyncId);
        } else {
            const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
            setLoading(false);
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    }

    async function callEligibilityAPIForRemove(encSyncId) {
        console.log("[CEResult] >> [callEligibilityAPIForRecalculation]");
        // setLoading(true);
        const navParams = route?.params ?? {};
        const resumeFlow = navParams?.resumeFlow ?? false;
        navParams.grossIncome = navParams?.grossIncomeMA ?? navParams?.grossIncome;
        // Retrieve form data
        const formData = getFormData(navParams); //CE_COMMITMENTS screen

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
        navParams.loanAmount = navParams?.origLoanAmount;
        navParams.tenure = navParams?.origTenure;
        navParams.downPaymentAmount =
            navParams?.origDownPaymentAmount ?? navParams?.downPaymentAmount;

        // console.log(navParams, "navPARemove");

        const params = {
            ...navParams,
            applicationStpRefNo: navParams?.stpApplicationId ?? "",
        };

        // Call API to check eligibility
        const { success, errorMessage, stpId, eligibilityResult, overallStatus } =
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
        const { mainApplicantDetails, jointApplicantDetails } = await fetchApplicants(encSyncId);
        const isJointApplicantAdded = false;
        const isMainApplicant = true;
        const isJARemoved = true;
        navParams.eligibilityResult = eligibilityResult;
        navParams.stpApplicationId = stpId;
        navParams.eligibilityStatus = overallStatus;
        navParams.jointApplicantDetails = jointApplicantDetails;
        navParams.mainApplicantDetails = mainApplicantDetails;
        navParams.isJointApplicantAdded = isJointApplicantAdded;
        navParams.isMainApplicant = isMainApplicant;
        navParams.isJARemoved = isJARemoved;
        navParams.isMainEligDataType = null;
        navParams.dataType = null;
        navParams.jaDataType = null;
        navParams.currentScreenName = "REMOVED_VIEW";

        //update UI
        populateData(navParams);

        setLoading(false);

        scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: true,
        });
    }

    async function fetchApplicants(encSyncId) {
        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }
        return {
            mainApplicantDetails,
            jointApplicantDetails,
            currentUser,
        };
    }

    // apply loan only for soft fail status and Amber
    async function onMainApplyLoan() {
        const navParams = route?.params ?? {};
        const syncId = String(navParams?.syncId);
        const encSyncId = await getEncValue(syncId);
        // const encStpId = await getEncValue(navParams?.stpId ?? "");
        // Request object
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const responseData = await fetchApplicationDetails(params, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }
        if (
            responseData?.savedData?.isAccepted &&
            responseData?.savedData?.jaStatus === "ELIGCOMP"
        ) {
            onApplyLoan();
            return;
        }
        getFAApplyNow(navParams, status);

        // Call api to send notification - MAE will send notification to Joint applicant
        const httpResp = await pushNotificationToInviteJA(params).catch((error) => {
            console.log("[CEResult][pushNotificationToInviteJA] >> Exception: ", error);
        });
        const result = httpResp?.data?.result ?? {};
        const statusCode = result?.statusCode ?? null;
        const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;

        if (statusCode !== STATUS_CODE_SUCCESS) {
            showErrorToast({ message: statusDesc });
            return;
        }

        const { success, errorMessage, mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        navParams.jointApplicantDetails = jointApplicantDetails;
        navParams.mainApplicantDetails = mainApplicantDetails;
        navParams.currentUser = currentUser;

        // Navigate to Joint Applicant notify screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: CE_ADD_JA_NOTIFY_RESULT,
            params: { ...navParams },
        });
    }

    async function onApplyLoan() {
        console.log("[CEResult] >> [onApplyLoan]");
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            const httpResp = await invokeL3(false).catch((error) => {
                console.log("[CEResult][invokeL3] >> Exception: ", error);
            });
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) {
                setLoading(false);
                return;
            }
        }
        // apply loan only for pass and soft fail status
        getFAonProceedWithApplication(route?.params, status);

        // Show apply success popup
        if (status === STATUS_PASS && state.loanAmount > 1000000) {
            dispatch({
                actionType: "SHOW_APPLY_SUCCESS_POPUP",
                payload: true,
            });
            FAProperty.onPressViewScreen(FA_PROPERTY_JA_BAU_APPLICATION, "");
            return;
        }

        setLoading(true);

        // Save Result in DB before proceeding
        await saveEligibilityResult();

        const encSyncId = await getEncValue(route?.params?.syncId);
        const isJointApplicantAdded = state.isJointApplicantAdded;

        // Call prequal API
        const prequalResponseObj = await prequalCheckAPI(encSyncId, isJointApplicantAdded);
        const eligibilityStatus = prequalResponseObj.status;
        const onboardingInd = prequalResponseObj.onboardingInd;
        //if onboardingInd is Y then start New AIP flow BAU
        if (eligibilityStatus === "AMBER" && onboardingInd !== "Y") {
            dispatch({
                actionType: "SHOW_APPLY_SUCCESS_POPUP",
                payload: true,
            });

            // Reset downpayment, tenure to non editable
            dispatch({
                actionType: "SET_DOWNPAY_TENURE_EDITABLE",
                payload: {
                    downpaymentEditable: false,
                    tenureEditable: false,
                },
            });
            FAProperty.onPressViewScreen(FA_PROPERTY_JA_BAU_APPLICATION, "");
            //if its BAU - dont show Save Progress popup on close press(onCloseTap)
            dispatch({
                actionType: "HIDE_SAVE_PROGRESS_POPUP",
                payload: true,
            });
            setLoading(false);
            return;
        }

        // L3 call to invoke password page

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
        const propertyId = navParams?.propertyDetails?.property_id ?? "";

        // Request object for CCRIS report
        const params = {
            propertyId,
            progressStatus: PROP_LA_INPUT,
            syncId: encSyncId,
        };
        const { success, errorMessage } = await fetchCCRISReport(params, false);
        if (!success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: errorMessage });
            return;
        }

        const responseData = await fetchGetApplicants(encSyncId, false);

        if (!responseData?.success) {
            setLoading(false);
            // Show error message
            showErrorToast({ message: responseData?.errorMessage });
            return;
        }

        if (responseData?.jointApplicantDetails !== null) {
            const { success, errorMessage } = await fetchJACCRISReport(params, false);
            if (!success) {
                setLoading(false);
                // Show error message
                showErrorToast({ message: errorMessage });
                return;
            }
        }

        const { age } = await isAgeEligible(mdmData?.dob);
        const resultDataParams = getResultScreenParams(state, navParams);

        //update downPaymentAmount with recommendedDownPayment
        if (route.params?.eligibilityResult?.recommendedDownPayment) {
            route.params.downPaymentAmount = route.params.eligibilityResult.recommendedDownPayment;
        }

        // Navigate to Eligibility confirm screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: LA_ELIGIBILITY_CONFIRM,
            params: {
                ...route.params,
                ...resultDataParams,
                masterData,
                mdmData,
                age,
                eligibilityStatus,
            },
        });

        //Added to avoid the flickering of the screen navigation
        setTimeout(() => {
            setLoading(false);
        }, 10);
    }

    async function onPressOkApplySuccessPopup() {
        console.log("[CEResult] >> [onPressOkApplySuccessPopup]");

        const syncId = route?.params?.syncId;
        const encSyncId = await getEncValue(syncId);
        const params = {
            syncId: encSyncId,
            stpId: "",
        };

        const { mainApplicantDetails, jointApplicantDetails, currentUser } =
            await fetchGetApplicants(encSyncId, false);

        const { propertyDetails, savedData, cancelReason } = await fetchApplicationDetails(
            params,
            false
        );

        // Close popup
        dispatch({
            actionType: "SHOW_APPLY_SUCCESS_POPUP",
            payload: false,
        });

        // Navigate back to application details screen
        navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLICATION_DETAILS,
            params: {
                savedData,
                propertyDetails,
                syncId,
                cancelReason,
                mainApplicantDetails,
                jointApplicantDetails,
                currentUser,
                from: CE_RESULT,
                reload: true,
            },
        });
    }

    const onViewOfferDisclaimer = () => {
        console.log("[CEResult] >> [onViewOfferDisclaimer]");

        dispatch({
            actionType: "SHOW_OFFER_DISC_POPUP",
            payload: true,
        });
    };

    const saveEligibilityResult = useCallback(async () => {
        console.log("[CEResult] >> [saveEligibilityResult]");
        const navParams = route?.params ?? {};

        // Construct request object
        const params = await getEligibilityRequestParams(navParams, state);

        // Call API to Save Input Data
        const httpResp = await saveResultData(params).catch((error) => {
            console.log("[CEResult][saveResultData] >> Exception: ", error);
        });
        const statusCode = httpResp?.data?.result?.statusCode ?? null;
        const statusDesc = httpResp?.data?.result?.statusDesc ?? null;
        const syncId = httpResp?.data?.result?.syncId ?? null;

        return {
            success: statusCode === STATUS_CODE_SUCCESS,
            errorMessage: statusDesc,
            syncId,
        };
    }, [state.isAssistanceRequested, route?.params]);

    function setLoading(loading) {
        dispatch({
            actionType: "SET_LOADING",
            payload: loading,
        });
    }
    const onViewApplicationPress = () => {
        resetToApplication();
    };

    const onScroll = ({ nativeEvent }) => {
        console.log("[CEResult] >> [onScroll]");

        const bottomSpaceHeight = 300;
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - bottomSpaceHeight;
        console.log("[CEResult] >> [onScroll]", nativeEvent);
        console.log("[CEResult] >> [onScroll] isCloseToBottom: " + isCloseToBottom);

        const floating = !isCloseToBottom;
        dispatch({
            actionType: "SET_APPLY_BUTTON_FLOATING",
            payload: {
                isApplyButtonFloating: floating,
            },
        });
    };
    return (
        <>
            <>
                <CEResultScreenTemplate
                    state={state}
                    onApplyLoan={onApplyLoan}
                    status={status}
                    navParams={route?.params}
                    onOpenRemoveJointApplicantPopup={onOpenRemoveJointApplicantPopup}
                    onViewOfferDisclaimer={onViewOfferDisclaimer}
                    eligibilityStatus={eligibilityStatus}
                    onMainApplyLoan={onMainApplyLoan}
                    onViewApplicationPress={onViewApplicationPress}
                    onScroll={onScroll}
                    loading={loading}
                    onCloseRemoveJointApplicantPopup={onCloseRemoveJointApplicantPopup}
                    removeJointApplicantOnClick={removeJointApplicantOnClick}
                    onPressOkApplySuccessPopup={onPressOkApplySuccessPopup}
                    setLoading={setLoading}
                    saveEligibilityResult={saveEligibilityResult}
                    navigation={navigation}
                    dispatch={dispatch}
                    populateData={populateData}
                ></CEResultScreenTemplate>
            </>
        </>
    );
}

CEResult.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default CEResult;
