/* eslint-disable sonarjs/cognitive-complexity */
import { logEvent } from "@services/analytics";

import { STATUS_PASS, STATUS_SOFT_FAIL, STATUS_HARD_FAIL, DT_NOTELG } from "@constants/data";
import {
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    FA_TRANSACTION_ID,
    FA_FORM_ERROR,
    FA_FORM_COMPLETE,
    FA_FORM_PROCEED,
    FA_FIELD_INFORMATION,
    FA_OPEN_MENU,
    FA_SELECT_MENU,
    FA_APPLY_FILTER,
    FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS,
    JA_PROPERTY_DETAILS,
    FA_OPEN_MAP,
    FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA,
    FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA,
    FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA,
    FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA,
    FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE,
    FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA,
    FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA,
    FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE,
    FA_REMOVE_JOINT_APPLICANT,
    FA_PROPERTY_JACEJA_ACCEPTED_INVITATION,
    REMOVE_JOINT_TITLE,
    FA_PROPERTY_JA_NOT_ELIGIBLE,
    VIEW_OTHER_PROPERTIES,
    FA_PROPERTY_JACEJA_REJECTED_INVITATION,
    ADD_JOINT_APPLICANT,
    ADD_NEW_JOINT_APPLICANT,
    REQ_ASSISTANCE_TEXT,
    APPLY_LOAN_TEXT,
    PROCEED_WITH_APPLICATION,
} from "@constants/strings";

export const FAProperty = {
    onScreen(applicationId, screenName) {
        if (applicationId === "") {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: applicationId ?? "",
            });
        }
    },
    onScreenFailed(applicationId, screenName) {
        logEvent(FA_FORM_ERROR, {
            [FA_SCREEN_NAME]: screenName,
            [FA_TRANSACTION_ID]: applicationId ?? "",
        });
    },
    onScreenSuccess(applicationId, screenName) {
        if (applicationId === "") {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_FORM_COMPLETE, {
                [FA_SCREEN_NAME]: screenName,
                [FA_TRANSACTION_ID]: applicationId ?? "",
            });
        }
    },
    onTenurePress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onDownPaymentPress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onApplyNowBtnPress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onViewOtherPropertiesPress(screenName, actionName) {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName ?? "",
        });
    },
    onPressRequestForAssistance(screenName, actionName, applicationId) {
        if (applicationId === "") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
                [FA_TRANSACTION_ID]: applicationId,
            });
        }
    },
    onPressAddJointApplicant(screenName, actionName, applicationId) {
        if (applicationId === "") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName ?? "",
                [FA_TRANSACTION_ID]: applicationId,
            });
        }
    },
    onPressSelectAction(screenName, actionName, applicationId) {
        if (applicationId === "") {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName,
            });
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName,
                [FA_TRANSACTION_ID]: applicationId,
            });
        }
    },
    onPressViewScreen(screenName, actionName) {
        if (actionName === "") {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_VIEW_SCREEN, {
                [FA_SCREEN_NAME]: screenName,
                [FA_ACTION_NAME]: actionName,
            });
        }
    },
    onPressFormProceed(screenName, fieldInformation) {
        if (fieldInformation === "") {
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: screenName,
            });
        } else {
            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: screenName,
                [FA_FIELD_INFORMATION]: fieldInformation,
            });
        }
    },
    onPressOpenMenu(screenName) {
        logEvent(FA_OPEN_MENU, {
            [FA_SCREEN_NAME]: screenName,
        });
    },
    onPressSelectMenu(screenName, actionName) {
        logEvent(FA_SELECT_MENU, {
            [FA_SCREEN_NAME]: screenName,
            [FA_ACTION_NAME]: actionName,
        });
    },
    onPressBookmarkIcon(eventName, screenName, fieldInformation) {
        logEvent(eventName, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: fieldInformation,
        });
    },
    onPressApplyFilter(screenName, fieldInformation, fieldInformation2, fieldInformation3) {
        logEvent(FA_APPLY_FILTER, {
            [FA_SCREEN_NAME]: screenName,
            [FA_FIELD_INFORMATION]: fieldInformation,
            field_information2: fieldInformation2,
            field_information3: fieldInformation3,
        });
    },

    getScreenName(currentScreenName, status) {
        let screenName;
        if (currentScreenName === "MA_VIEW") {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA
                    : status === STATUS_HARD_FAIL
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
        } else if (currentScreenName === "REMOVED_VIEW") {
            screenName = FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
        } else {
            screenName =
                status === STATUS_PASS
                    ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA
                    : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
        }
        return screenName;
    },

    getFAScreenView(status, data) {
        switch (status) {
            case STATUS_PASS: {
                if (data?.currentScreenName === "MA_VIEW") {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA;
                } else if (data?.currentScreenName === "REMOVED_VIEW") {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                } else {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA;
                }
            }
            case STATUS_SOFT_FAIL: {
                if (data?.currentScreenName === "MA_VIEW") {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA;
                } else if (data?.currentScreenName === "REMOVED_VIEW") {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE;
                } else {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
                }
            }
            case STATUS_HARD_FAIL: {
                if (data?.currentScreenName === "MA_VIEW") {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA;
                } else if (data?.currentScreenName === "REMOVED_VIEW") {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE;
                } else {
                    return FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA;
                }
            }
            default:
                return null;
        }
    },
};
export const FAPropertyDetails = {
    onPropertyDetailsScreenLoad(flow, from, propertyName, propertyId) {
        let screenName;
        if (flow === "applyMortgage") {
            screenName = FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS;
        } else if (from === JA_PROPERTY_DETAILS && propertyName) {
            screenName = `Property_JA_Request_${propertyName}_${propertyId}`;
        } else if (propertyName) {
            screenName = `Property_${propertyName}_${propertyId}`;
        }

        if (screenName) {
            FAProperty.onPressViewScreen(screenName);
        }
    },
    onPropertyDetialsLocationPress(from, propertyName, propertyId) {
        if (from === JA_PROPERTY_DETAILS) {
            const screenName = "Property_JA_Request_" + propertyName + "_" + propertyId;
            FAProperty.onPressSelectAction(screenName, FA_OPEN_MAP);
        } else {
            const screenName = "Property_" + propertyName + "_" + propertyId;
            FAProperty.onPressSelectAction(screenName, FA_OPEN_MAP);
        }
    },
    onPropertyDetailsShowMenu(from, propertyName, propertyId) {
        if (from === JA_PROPERTY_DETAILS) {
            const screenName = "Property_JA_Request_" + propertyName + "_" + propertyId;
            FAProperty.onPressOpenMenu(screenName);
        } else {
            const screenName = "Property_" + propertyName + "_" + propertyId;
            FAProperty.onPressOpenMenu(screenName);
        }
    },
    onPropertyDetailsPressBookmarkIcon(flow, from, eventName, propertyName, propertyId) {
        if (flow === "applyMortgage") {
            const fieldInformation = propertyName + "_" + propertyId;
            FAProperty.onPressBookmarkIcon(
                eventName,
                FA_PROPERTY_APPLYMORTGAGE_PROPERTYDETAILS,
                fieldInformation
            );
        } else if (from === JA_PROPERTY_DETAILS) {
            const screenName = "Property_JA_Request_" + propertyName + "_" + propertyId;
            const fieldInformation = propertyName;
            FAProperty.onPressBookmarkIcon(eventName, screenName, fieldInformation);
        } else {
            const screenName = "Property_" + propertyName + "_" + propertyId;
            const fieldInformation = propertyName + "_" + propertyId;
            FAProperty.onPressBookmarkIcon(eventName, screenName, fieldInformation);
        }
    },
};

export function getRemoveJAFAProperty(navParams, status) {
    FAProperty.onScreen("", FA_REMOVE_JOINT_APPLICANT);
    const screenName =
        status === STATUS_PASS
            ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_JA
            : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;

    if (navParams?.subModule === "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onPressSelectAction(FA_PROPERTY_JA_NOT_ELIGIBLE, REMOVE_JOINT_TITLE, "");
    } else if (navParams?.subModule !== "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onPressSelectAction(
            FA_PROPERTY_JACEJA_ACCEPTED_INVITATION,
            REMOVE_JOINT_TITLE,
            ""
        );
    } else {
        FAProperty.onPressSelectAction(screenName, REMOVE_JOINT_TITLE, "");
    }
}

export function getFAViewOtherProperties(data, mainEligDataType, screenName) {
    if (
        data?.subModule === "JA_ELIG_FAIL" &&
        data?.jaEligResult &&
        mainEligDataType !== DT_NOTELG
    ) {
        FAProperty.onApplyNowBtnPress(FA_PROPERTY_JA_NOT_ELIGIBLE, VIEW_OTHER_PROPERTIES);
    } else if (data?.declinedFromJa) {
        FAProperty.onApplyNowBtnPress(
            FA_PROPERTY_JACEJA_REJECTED_INVITATION,
            VIEW_OTHER_PROPERTIES
        );
    } else {
        FAProperty.onApplyNowBtnPress(screenName, VIEW_OTHER_PROPERTIES);
    }
}

export function getFAOnDownPaymentPress(navParams) {
    const currentScreenName = navParams?.currentScreenName;

    const screenName =
        currentScreenName === "MA_VIEW"
            ? FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA
            : FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA;
    if (navParams?.subModule === "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onDownPaymentPress(FA_PROPERTY_JA_NOT_ELIGIBLE, "Downpayment");
    } else {
        FAProperty.onDownPaymentPress(screenName, "Downpayment");
    }
}

export function getFAOnPressJA(status, data) {
    const screenName = FAProperty.getFAScreenView(status, data);
    const mainEligDataType = data?.isMainEligDataType ?? data?.dataType;
    if (
        data?.subModule === "JA_ELIG_FAIL" &&
        data?.jaEligResult &&
        mainEligDataType !== DT_NOTELG
    ) {
        FAProperty.onPressRequestForAssistance(
            FA_PROPERTY_JA_NOT_ELIGIBLE,
            ADD_JOINT_APPLICANT,
            ""
        );
    } else if (data?.declinedFromJa) {
        FAProperty.onPressRequestForAssistance(
            FA_PROPERTY_JACEJA_REJECTED_INVITATION,
            ADD_NEW_JOINT_APPLICANT,
            ""
        );
    } else {
        FAProperty.onPressRequestForAssistance(
            screenName,
            STATUS_HARD_FAIL ? ADD_NEW_JOINT_APPLICANT : ADD_JOINT_APPLICANT,
            data?.stpApplicationId
        );
    }
}

export function getFAOnPressRFA(status, data) {
    const screenName = FAProperty.getFAScreenView(status, data);
    const mainEligDataType = data?.isMainEligDataType ?? data?.dataType;
    if (
        data?.subModule === "JA_ELIG_FAIL" &&
        data?.jaEligResult &&
        mainEligDataType !== DT_NOTELG
    ) {
        FAProperty.onPressRequestForAssistance(
            FA_PROPERTY_JA_NOT_ELIGIBLE,
            REQ_ASSISTANCE_TEXT,
            ""
        );
    } else if (data?.declinedFromJa) {
        FAProperty.onPressRequestForAssistance(
            FA_PROPERTY_JACEJA_REJECTED_INVITATION,
            REQ_ASSISTANCE_TEXT,
            ""
        );
    } else {
        FAProperty.onPressRequestForAssistance(
            screenName,
            REQ_ASSISTANCE_TEXT,
            data?.stpApplicationId
        );
    }
}

export function getFACRScreenLoad(navParams, mainEligDataType, screenName) {
    if (
        navParams?.subModule === "JA_ELIG_FAIL" &&
        navParams?.jaEligResult &&
        mainEligDataType !== DT_NOTELG
    ) {
        FAProperty.onScreen(navParams?.stpApplicationId, FA_PROPERTY_JA_NOT_ELIGIBLE);
    } else if (navParams?.subModule !== "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onScreen("", FA_PROPERTY_JACEJA_ACCEPTED_INVITATION);
    } else if (navParams?.declinedFromJa) {
        FAProperty.onScreen("", FA_PROPERTY_JACEJA_REJECTED_INVITATION);
    } else {
        FAProperty.onScreen(navParams?.stpApplicationId, screenName);
    }

    if (
        screenName === FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_MA ||
        screenName === FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_MA
    ) {
        FAProperty.onScreenFailed(navParams?.stpApplicationId, screenName);
    }

    if (
        (!navParams?.jaEligResult && screenName === FA_PROPERTY_CHECK_ELIGIBILITY_SOFT_FAIL_JA) ||
        (navParams?.jaEligResult && screenName === FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_JA)
    ) {
        FAProperty.onScreenFailed(navParams?.stpApplicationId, screenName);
    } else if (
        navParams?.subModule === "JA_ELIG_FAIL" &&
        navParams?.jaEligResult &&
        mainEligDataType !== DT_NOTELG
    ) {
        FAProperty.onScreenSuccess(navParams?.stpApplicationId, FA_PROPERTY_JA_NOT_ELIGIBLE);
    }
    if (navParams?.subModule !== "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onScreenSuccess(
            navParams?.stpApplicationId,
            FA_PROPERTY_JACEJA_ACCEPTED_INVITATION
        );
    } else if (navParams?.declinedFromJa) {
        FAProperty.onScreenSuccess(
            navParams?.stpApplicationId,
            FA_PROPERTY_JACEJA_REJECTED_INVITATION
        );
    } else if (navParams?.eligibilityResult?.dataType === "Eligible") {
        FAProperty.onScreenSuccess(
            navParams?.stpApplicationId,
            !navParams?.isJointApplicantAdded ? FA_PROPERTY_CHECK_ELIGIBILITY_PASS_MA : screenName
        );
    } else if (screenName === FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE) {
        FAProperty.onScreenSuccess(
            navParams?.stpApplicationId,
            FA_PROPERTY_CHECK_ELIGIBILITY_PASS_REMOVE
        );
    }

    if (screenName === FA_PROPERTY_CHECK_ELIGIBILITY_HARD_FAIL_REMOVE) {
        FAProperty.onScreenFailed(navParams?.stpApplicationId, screenName);
    }
}

export function getFAonProceedWithApplication(navParams, status) {
    const currentScreenName = navParams?.currentScreenName;
    const screenName = FAProperty.getScreenName(currentScreenName, status);
    if (navParams?.subModule === "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onApplyNowBtnPress(FA_PROPERTY_JA_NOT_ELIGIBLE, APPLY_LOAN_TEXT);
    } else if (navParams?.subModule !== "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onApplyNowBtnPress(FA_PROPERTY_JACEJA_ACCEPTED_INVITATION, APPLY_LOAN_TEXT);
    } else {
        FAProperty.onPressSelectAction(
            screenName,
            currentScreenName === "REMOVED_VIEW" ? PROCEED_WITH_APPLICATION : APPLY_LOAN_TEXT,
            navParams?.stpApplicationId
        );
    }
}

export function getFAApplyNow(navParams, status) {
    const currentScreenName = navParams?.currentScreenName;
    const screenName = FAProperty.getScreenName(currentScreenName, status);
    if (navParams?.subModule === "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onApplyNowBtnPress(FA_PROPERTY_JA_NOT_ELIGIBLE, APPLY_LOAN_TEXT);
    } else if (navParams?.subModule !== "JA_ELIG_FAIL" && navParams?.jaEligResult) {
        FAProperty.onApplyNowBtnPress(FA_PROPERTY_JACEJA_ACCEPTED_INVITATION, APPLY_LOAN_TEXT);
    } else {
        FAProperty.onPressSelectAction(screenName, APPLY_LOAN_TEXT, navParams?.stpApplicationId);
    }
}
