import numeral from "numeral";

import { updateDataOnReducerBaseOnApplicationDetails } from "@screens/ASB/Financing/helpers/CustomerDetailsPrefiller";
import { removeCommas } from "@screens/PLSTP/PLSTPController";

import {
    SETTINGS_MODULE,
    ASB_CONSENT,
    APPLICATION_FINANCE_DETAILS,
    CURRENT_LOCATION,
    BANK_OFFICER,
    SELECTACCOUNT,
    FATCADECLARATION,
    PERSONAL_INFORMATION,
    OCCUPATION_INFORMATION,
    OCCUPATION_INFORMATION2,
    ASB_DECLARATION,
    APPLICATIONCONFIRMATION,
    JOINT_APPLICANT,
    RECEIVED_DOCUMENT_SCREEN,
    APPROVEDFINANCEDETAILS,
    APPLICATIONCONFIRMAUTH,
    ADDITIONALDETAILSINCOME,
    ASB_STACK,
    ASB_GUARANTOR_VALIDATION,
    ASB_GUARANTOR_CONSENT,
    ASB_GUARANTOR_INCOME_DETAILS,
    ASB_GUARANTOR_VALIDATION_SUCCESS,
    ASB_GUARANTOR_FATCA_DECLARATION,
    ASB_ACCEPT_AS_GUARANTOR_DECLARATION,
    ASB_GUARANTOR_PERSONAL_INFORMATION,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS,
    ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME,
    ASB_GUARANTOR_UNABLE_TO_OFFER_YOU,
    ON_BOARDING_MODULE,
    ON_BOARDING_M2U_USERNAME,
    ASB_GUARANTOR_NOTIFICATION,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS_2,
    ELIGIBILITY_SOFT_FAIL,
    ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
    ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS,
    ASB_GUARANTOR_NOTIFY_MAIN_APPLICANT,
    COMMON_MODULE,
    PDF_VIEW,
} from "@navigation/navigationConstant";

import { invokeL3, applicationDetailsGetApi } from "@services";
import { logEvent } from "@services/analytics";

import { ELIGIBILITY_SUCCESS } from "@redux/actions/ASBFinance/eligibilityCheckAction";
import { FINANCE_DETAILS_LOAN_TYPE } from "@redux/actions/ASBFinance/financeDetailsAction";
import { resumeAction } from "@redux/actions/ASBFinance/resumeAction";
import {
    ASB_APPLICAION_DATA_STORE_NOTIFICATION,
    ASB_APPLICAION_DATA,
} from "@redux/actions/ASBServices/asbApplicationDetailsAction";
import { asbGuarantorGetDocument } from "@redux/services/ASBServices/asbGuarantorGetDocument";
import { asbGuarantorGetDocumentList } from "@redux/services/ASBServices/asbGuarantorGetDocumentList";

import { DT_ELG, GREEN } from "@constants/data";
import {
    FINANCING_DETAILS,
    GUARANTOR,
    NOMINATED_YOU,
    REVIEW_INFO,
    TOTAL_FINANING_AMOUNT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
    BECOME_A_GUARANTOR,
    FA_ACTION_NAME,
    CONGRATS_YOU_ARE_GUARANTOR,
    FINANCING_DETAILS_BELOW,
    GREAT_NEWS,
    YOU_MAY_VIEW,
    TENURE,
    FIRST,
    SMALL_YEARS,
    PROFIT_INTEREST,
    MONTHLY_PAYMENT,
    TAKAFUL_INSURANCE_FEE,
    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_COMPLETED,
    SUCCESS_STATUS,
} from "@constants/strings";
import { ASB_PRE_QUAL_URL } from "@constants/url";

export function navigatePDF(navigation, props) {
    navigation.navigate(SETTINGS_MODULE, {
        screen: "PdfSetting",
        params: props,
    });
}

export const addCommas = (number) => {
    if (!number) return number;
    let numStr = number.toString();
    numStr = numStr.replace(/,/g, "");
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(numStr)) numStr = numStr.replace(pattern, "$1,$2");
    return numStr;
};

export const getMaximunLength = (fieldIndex, currentFiledIndex) => {
    return fieldIndex === currentFiledIndex ? 9 : 12;
};

export const formatValue = (fieldIndex, currentFiledIndex, value) => {
    return fieldIndex === currentFiledIndex
        ? addCommas(value)
        : addCommas(value)
        ? numeral(value).format(",0.00")
        : "";
};

export const goBackHomeScreen = (navigation) => {
    navigation.navigate("More", {
        screen: "Apply",
        params: {
            index: 3,
        },
    });
};

export const onClickOkay = async (
    props,
    isApplyDashboard,
    dispatch,
    isGuarantorNotEligible,
    isGuarantorDeclined,
    isGuarantorAccepted
) => {
    if (isApplyDashboard) {
        props.actionMasterData();
    }
    try {
        const body = {
            msgBody: {
                logonInfo: "Y",
            },
        };
        const response = await applicationDetailsGetApi(body, true);
        if (response) {
            const responseData = response?.data?.result?.msgBody?.stpApp;

            const stpScreenResume = responseData?.stpScreenResume;
            const stpReferenceNo = responseData?.stpReferenceNo;
            const stpAssessmentId = responseData?.stpAssessmentId;
            const stpDeclarePdpa = responseData?.stpDeclarePdpa;
            if (response?.data?.message === SUCCESS_STATUS) {
                const stpData = response?.data?.result?.msgBody?.stpApp;
                const stpDataMsgHeader = response?.data?.result?.msgHeader;

                const loanInformation = {
                    stpId: stpData?.stpUserId,
                    downpayment: 0,
                    financingType: "C",
                    loanFinancingAmountRM: parseInt(removeCommas(stpData?.stpLoanAmount)),
                    loanTenure: parseInt(stpData?.stpTenure),
                };

                const stpEligibilityResponse = JSON.parse(
                    response?.data?.result?.msgBody?.stpApp?.stpEligibilityResponse
                );

                const guarantorResumeResponse =
                    response?.data?.result?.msgBody?.additionalDetails &&
                    JSON.stringify(response?.data?.result?.msgBody?.additionalDetails);
                const guarantorResumeData =
                    guarantorResumeResponse && JSON.parse(guarantorResumeResponse);

                const guarantorEligibilityResult =
                    guarantorResumeData?.stpEligibilityResponse &&
                    JSON.parse(guarantorResumeData?.stpEligibilityResponse);

                const guarantorEligibilityCheckOutcome =
                    guarantorEligibilityResult?.eligibilityCheckOutcome[0]?.dataType;

                const guarantorOverallValidationResult =
                    guarantorEligibilityResult?.overallValidationResult;

                const resumeResponse = JSON.stringify(response?.data?.result?.msgBody?.stpApp);
                const additionalDetailsGuarantor = JSON.stringify(
                    response?.data?.result?.msgBody?.additionalDetails
                );
                const eligibilityData = JSON.parse(responseData?.stpEligibilityResponse);
                const resumeData = JSON.parse(resumeResponse);
                // Dispatch
                if (isApplyDashboard) {
                    props.resumeAction(resumeData, loanInformation, eligibilityData);
                    props.updateFinancingDetail(stpData);
                } else {
                    dispatch(resumeAction(resumeData, loanInformation, eligibilityData));
                    dispatch({
                        type: FINANCE_DETAILS_LOAN_TYPE,
                        loanTypeIsConv: stpData?.stpTypeOfLoan !== "C",
                    });
                    dispatch({
                        type: "ADDITIONAL_DETAILS_SUCCESS",
                        data: additionalDetailsGuarantor,
                    });
                }
                if (isGuarantorAccepted) {
                    const guarantorName =
                        response?.data?.result?.msgBody?.additionalDetails?.stpCustomerName;
                    props.navigation.navigate(ASB_STACK, {
                        screen: ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
                        params: {
                            guarantorName,
                            additionalDetails: response?.data?.result?.msgBody?.additionalDetails,
                        },
                    });
                }

                if (
                    isGuarantorNotEligible ||
                    isGuarantorDeclined ||
                    stpScreenResume === "G_ELGFAILCUS"
                ) {
                    props.eligibilitySuccess(
                        eligibilityData,
                        loanInformation,
                        resumeData?.stpGrossIncome,
                        resumeData?.stpOtherCommitments
                    );
                    const guarantorName = response?.data?.result?.msgBody?.stpApp?.stpCustomerName;
                    const stpGuarantorName =
                        response?.data?.result?.msgBody?.stpApp?.stpGuarantorName;
                    props.navigation.navigate(ASB_STACK, {
                        screen: ELIGIBILITY_SOFT_FAIL,
                        params: {
                            data: eligibilityData,
                            loanInformation,
                            grassIncome: response?.data?.result?.msgBody?.stpApp?.stpGrossIncome,
                            totalMonthNonBank:
                                response?.data?.result?.msgBody?.stpApp?.stpOtherCommitments,
                            isGuarantorNotEligible: !!(
                                isGuarantorNotEligible || stpScreenResume === "G_ELGFAILCUS"
                            ),
                            isGuarantorDeclined,
                            guarantorName,
                            stpGuarantorName,
                            isGuarator: true,
                        },
                    });
                } else {
                    if (stpDeclarePdpa && stpScreenResume === "8" && stpAssessmentId === null) {
                        props.navigation.navigate(ASB_STACK, {
                            screen: APPLICATIONCONFIRMATION,
                            params: {
                                screenName: APPLICATIONCONFIRMATION,
                            },
                        });
                    } else if (stpScreenResume === null && stpReferenceNo) {
                        props.navigation.navigate(ASB_STACK, {
                            screen: ASB_CONSENT,
                            params: {
                                screenName: ASB_CONSENT,
                            },
                        });
                    }
                    if (responseData?.stpStatus) {
                        if (responseData.stpStatus === "NSTPAPPSUB") {
                            props.navigation.navigate(ASB_STACK, {
                                screen: JOINT_APPLICANT,
                            });
                            return;
                        } else if (responseData.stpStatus === "NSTPDOCUPL") {
                            props.navigation.navigate(ASB_STACK, {
                                screen: RECEIVED_DOCUMENT_SCREEN,
                                params: {
                                    screenName: RECEIVED_DOCUMENT_SCREEN,
                                },
                            });
                            return;
                        } else if (responseData.stpStatus === "NSTPFO") {
                            props.navigation.navigate(ASB_STACK, {
                                screen: APPROVEDFINANCEDETAILS,
                                params: {
                                    screenName: APPROVEDFINANCEDETAILS,
                                },
                            });
                            return;
                        }
                    }
                    switch (stpScreenResume) {
                        case "1":
                            props.navigation.navigate(ASB_STACK, {
                                screen: ASB_CONSENT,
                                params: {
                                    screenName: ASB_CONSENT,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "2":
                            props.navigation.navigate(ASB_STACK, {
                                screen: APPLICATION_FINANCE_DETAILS,
                                params: {
                                    screenName: APPLICATION_FINANCE_DETAILS,
                                    stpDetails: stpData,
                                    stpDataMsgHeader,
                                },
                            });
                            break;
                        case "3":
                            props.navigation.navigate(ASB_STACK, {
                                screen: CURRENT_LOCATION,
                                params: {
                                    screenName: CURRENT_LOCATION,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "4":
                            props.navigation.navigate(ASB_STACK, {
                                screen: BANK_OFFICER,
                                params: {
                                    screenName: BANK_OFFICER,
                                    stpDetails: stpData,
                                    loanInformation,
                                },
                            });
                            break;
                        case "5":
                            // code block
                            if (stpEligibilityResponse?.overallValidationResult === GREEN) {
                                props.navigation.navigate(ASB_STACK, {
                                    screen: BANK_OFFICER,
                                    params: {
                                        screenName: BANK_OFFICER,
                                        stpDetails: stpData,
                                        loanInformation,
                                    },
                                });
                            } else {
                                props.navigation.navigate(ASB_STACK, {
                                    screen: FATCADECLARATION,
                                    params: {
                                        screenName: FATCADECLARATION,
                                        stpDetails: stpData,
                                    },
                                });
                            }
                            break;
                        case "6":
                            props.navigation.navigate(ASB_STACK, {
                                screen: SELECTACCOUNT,
                                params: {
                                    screenName: SELECTACCOUNT,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "7":
                            props.navigation.navigate(ASB_STACK, {
                                screen: FATCADECLARATION,
                                params: {
                                    screenName: FATCADECLARATION,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "8":
                            props.navigation.navigate(ASB_STACK, {
                                screen: ASB_DECLARATION,
                                params: {
                                    screenName: ASB_DECLARATION,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "9":
                            props.navigation.navigate(ASB_STACK, {
                                screen: APPLICATIONCONFIRMATION,
                                params: {
                                    screenName: APPLICATIONCONFIRMATION,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "10":
                            props.navigation.navigate(ASB_STACK, {
                                screen: PERSONAL_INFORMATION,
                                params: {
                                    screenName: PERSONAL_INFORMATION,
                                    stpDetails: stpData,
                                },
                            });
                            break;

                        case "11":
                            props.navigation.navigate(ASB_STACK, {
                                screen: OCCUPATION_INFORMATION,
                                params: {
                                    screenName: OCCUPATION_INFORMATION,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "12":
                            props.navigation.navigate(ASB_STACK, {
                                screen: OCCUPATION_INFORMATION2,
                                params: {
                                    screenName: OCCUPATION_INFORMATION2,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "13":
                            props.navigation.navigate(ASB_STACK, {
                                screen: ADDITIONALDETAILSINCOME,
                                params: {
                                    screenName: ADDITIONALDETAILSINCOME,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "14":
                            props.navigation.navigate(ASB_STACK, {
                                screen: APPLICATIONCONFIRMAUTH,
                                params: {
                                    screenName: APPLICATIONCONFIRMAUTH,
                                    stpDetails: stpData,
                                },
                            });
                            break;
                        case "G_DECLINE":
                            if (isApplyDashboard) {
                                props.eligibilitySuccess(
                                    JSON.parse(resumeData?.stpEligibilityResponse),
                                    loanInformation,
                                    resumeData?.stpGrossIncome,
                                    resumeData?.stpOtherCommitments
                                );
                            } else {
                                dispatch({
                                    type: ELIGIBILITY_SUCCESS,
                                    data: resumeData?.stpEligibilityResponse,
                                    loanInformation,
                                    grassIncome: resumeData?.stpGrossIncome,
                                    totalMonthNonBank: resumeData?.stpOtherCommitments,
                                });
                            }
                            props.navigation.navigate(ASB_STACK, {
                                screen: ELIGIBILITY_SOFT_FAIL,
                                params: {
                                    data: resumeData?.stpEligibilityResponse,
                                    loanInformation,
                                    grassIncome: resumeData?.stpGrossIncome,
                                    totalMonthNonBank: resumeData?.stpOtherCommitments,
                                    isGuarantorNotEligible,
                                    isGuarantorDeclined: true,
                                },
                            });
                            break;

                        case "G_ACCEPT":
                            if (
                                guarantorOverallValidationResult === GREEN &&
                                response?.data?.result?.msgBody?.additionalDetails
                                    ?.stpIsUsaCitizen === "N"
                            ) {
                                if (guarantorEligibilityCheckOutcome === DT_ELG) {
                                    const guarantorName =
                                        response?.data?.result?.msgBody?.additionalDetails
                                            ?.stpCustomerName;
                                    const eligibilityCheckOutcome = JSON.parse(
                                        guarantorResumeData?.stpEligibilityResponse
                                    );
                                    props.navigation.navigate(ASB_STACK, {
                                        screen: ASB_GUARANTOR_APPROVEDFINANCEDETAILS,
                                        params: {
                                            guarantorName,
                                            guarantorResumeData: eligibilityCheckOutcome,
                                            additionalDetails:
                                                response?.data?.result?.msgBody?.additionalDetails,
                                        },
                                    });
                                } else {
                                    if (isApplyDashboard) {
                                        props.eligibilitySuccess(
                                            guarantorEligibilityResult,
                                            loanInformation,
                                            resumeData?.stpGrossIncome,
                                            resumeData?.stpOtherCommitments
                                        );
                                    } else {
                                        dispatch({
                                            type: ELIGIBILITY_SUCCESS,
                                            data: guarantorResumeData?.stpEligibilityResponse,
                                            loanInformation,
                                            grassIncome: resumeData?.stpGrossIncome,
                                            totalMonthNonBank: resumeData?.stpOtherCommitments,
                                        });
                                    }
                                    props.navigation.navigate(ASB_STACK, {
                                        screen: ELIGIBILITY_SOFT_FAIL,
                                        params: {
                                            data: guarantorResumeData?.stpEligibilityResponse,
                                            loanInformation,
                                            grassIncome: resumeData?.stpGrossIncome,
                                            totalMonthNonBank: resumeData?.stpOtherCommitments,
                                            isGuarantorNotEligible,
                                            isGuarantorDeclined,
                                            isGuarantorCounterOffer: true,
                                        },
                                    });
                                }
                            } else {
                                props.navigation.navigate(ASB_STACK, {
                                    screen: FATCADECLARATION,
                                    params: {
                                        screenName: FATCADECLARATION,
                                        stpDetails: stpData,
                                        isGuarantorCounterOffer: true,
                                    },
                                });
                            }
                            break;
                    }
                }
            } else if (stpScreenResume === null && stpReferenceNo) {
                props.navigation.navigate(ASB_STACK, {
                    screen: ASB_CONSENT,
                    params: {
                        screenName: ASB_CONSENT,
                    },
                });
            }
        }
    } catch (error) {}
};

const makeTireListBody = (additionalDetails) => {
    const tireListBody = [];
    tireListBody.push({
        heading: TENURE,
        headingValue: `${additionalDetails?.stpTenure} years`,
        isVisible: additionalDetails?.stpTenure,
    });

    if (additionalDetails.stpInterestRate2 && additionalDetails.stpMonthlyInstalment2) {
        tireListBody.push({
            heading: FIRST + " " + additionalDetails?.stpTier1Year + " " + SMALL_YEARS,
            isMutiTierVisible: true,
        });
    }

    tireListBody.push({
        heading: PROFIT_INTEREST,
        headingValue: `${numeral(additionalDetails?.stpInterestRate).format(",0.00")}%`,
        isVisible: additionalDetails?.stpInterestRate,
    });

    tireListBody.push({
        heading: MONTHLY_PAYMENT,
        headingValue: `RM ${numeral(additionalDetails?.stpMonthlyInstalment).format(",0.00")}`,
        isVisible: additionalDetails?.stpMonthlyInstalment,
    });
    tireListBody.push({
        divider: true,
    });
    if (additionalDetails.stpInterestRate2 && additionalDetails.stpMonthlyInstalment2) {
        const stpTier1Year = Number(additionalDetails?.stpTier1Year);
        const stpTier2Year = Number(additionalDetails?.stpTier2Year);
        tireListBody.push({
            heading: stpTier1Year + 1 + " - " + (stpTier2Year + stpTier1Year) + " years",
            isMutiTierVisible: true,
        });

        tireListBody.push({
            heading: PROFIT_INTEREST,
            headingValue: `${numeral(additionalDetails?.stpInterestRate2).format(",0.00")}%`,
            isVisible: additionalDetails?.stpInterestRate2,
        });

        tireListBody.push({
            heading: MONTHLY_PAYMENT,
            headingValue: `RM ${numeral(additionalDetails?.stpMonthlyInstalment2).format(",0.00")}`,
            isVisible: additionalDetails?.stpMonthlyInstalment2,
        });
        tireListBody.push({
            divider: true,
        });
    }

    tireListBody.push({
        heading: TAKAFUL_INSURANCE_FEE,
        headingValue: `RM ${numeral(additionalDetails?.stpTotalGrossPremium).format(",0.00")}`,
        isVisible: additionalDetails?.stpTotalGrossPremium,
    });
    return tireListBody;
};

export const nominateGuarantor = async (
    props,
    stpReferenceNo,
    mainApplicantName,
    idNumber,
    checkResumeApplication,
    stpReferenceMAainApplicantNo,
    stpStatusDesc
) => {
    const {
        navigation,
        applicationDeatils,
        updateID,
        getASBMasterData,
        clearASBRedcuer,
        getPrePostQualGuarantor,
    } = props;

    const { isOnboard } = props.getModel("user");

    clearASBRedcuer();

    if (isOnboard) {
        if (!stpStatusDesc) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code !== 0) return;
        }

        updateID(idNumber, mainApplicantName, stpReferenceMAainApplicantNo);
        getASBMasterData((masetDataResult) => {
            if (masetDataResult) {
                if (!stpStatusDesc) {
                    const body = {
                        msgBody: {
                            logonInfo: "Y",
                            isGuarantor: "Y",
                            stpReferenceNo,
                        },
                    };
                    getPrePostQualGuarantor(
                        ASB_PRE_QUAL_URL,
                        body,
                        (mdmData, responseASB) => {
                            if (responseASB) {
                                const stpReferenceNo = responseASB?.stpreferenceNo;
                                const idNumber = mdmData?.demographics?.ids[0]?.idNumber;
                                const bodyApplicationDetails = {
                                    stpReferenceNo,
                                    idNumber,
                                };
                                updateID(idNumber, mainApplicantName, stpReferenceMAainApplicantNo);
                                applicationDeatils(
                                    bodyApplicationDetails,
                                    (
                                        resultAsbApplicationDetails,
                                        bodyList,
                                        _,
                                        __,
                                        ___,
                                        ____,
                                        _____,
                                        ______,
                                        _______,
                                        dispatch,
                                        additionalDetails
                                    ) => {
                                        const userData = {
                                            stpReferenceNo: stpReferenceMAainApplicantNo,
                                        };
                                        const userDataDecline = {
                                            stpReferenceNo,
                                            guarantorEmail: resultAsbApplicationDetails?.stpEmail,
                                            guarantorMobileNumber:
                                                resultAsbApplicationDetails?.stpMobileContactNumber,
                                        };
                                        const tireListBody = makeTireListBody(additionalDetails);
                                        const dataSendNotification = {
                                            headingTitle: TOTAL_FINANING_AMOUNT,
                                            headingTitleValue: `RM ${numeral(
                                                additionalDetails?.stpLoanAmount
                                            ).format(",0.00")}`,
                                            bodyList: tireListBody,
                                            mainApplicantName,
                                            title: GUARANTOR,
                                            subTitle: NOMINATED_YOU(mainApplicantName),
                                            subTitle2: REVIEW_INFO,
                                            subTitle3: FINANCING_DETAILS,
                                            userDataDecline,
                                            onDoneTap: () => {
                                                logEvent(FA_VIEW_SCREEN, {
                                                    [FA_SCREEN_NAME]:
                                                        APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
                                                    [FA_ACTION_NAME]: BECOME_A_GUARANTOR,
                                                });
                                                navigation.navigate(ASB_STACK, {
                                                    screen: ASB_GUARANTOR_CONSENT,
                                                    params: {
                                                        userData,
                                                    },
                                                });
                                            },
                                        };
                                        dispatch({
                                            type: ASB_APPLICAION_DATA,
                                            guarantorDataStore: dataSendNotification,
                                        });
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_VALIDATION,
                                            params: dataSendNotification,
                                        });
                                    },
                                    null,
                                    masetDataResult,
                                    mainApplicantName,
                                    navigation
                                );
                            }
                        },
                        mainApplicantName,
                        false,
                        true
                    );
                } else {
                    const bodyApplicationDetails = {
                        stpReferenceNo,
                        idNumber,
                    };
                    applicationDeatils(
                        bodyApplicationDetails,
                        (
                            resultAsbApplicationDetails,
                            bodyList,
                            eligibilityCheckOutcomeData,
                            _,
                            __,
                            ___,
                            ____,
                            _____,
                            ______,
                            dispatch,
                            additionalDetails
                        ) => {
                            const userData = {
                                stpReferenceNo: stpReferenceMAainApplicantNo,
                            };

                            const userDataDecline = {
                                stpReferenceNo,
                                guarantorEmail: resultAsbApplicationDetails?.stpEmail,
                                guarantorMobileNumber:
                                    resultAsbApplicationDetails?.stpMobileContactNumber,
                            };
                            const tireListBody = makeTireListBody(additionalDetails);
                            const dataSendNotification = {
                                headingTitle: TOTAL_FINANING_AMOUNT,
                                headingTitleValue: `RM ${numeral(
                                    additionalDetails?.stpLoanAmount
                                ).format(",0.00")}`,
                                bodyList: tireListBody,
                                mainApplicantName,
                                title: GUARANTOR,
                                subTitle: NOMINATED_YOU(mainApplicantName),
                                subTitle2: REVIEW_INFO,
                                subTitle3: FINANCING_DETAILS,
                                userDataDecline,
                                onDoneTap: () => {
                                    logEvent(FA_VIEW_SCREEN, {
                                        [FA_SCREEN_NAME]: APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
                                        [FA_ACTION_NAME]: BECOME_A_GUARANTOR,
                                    });
                                    navigation.navigate(ASB_STACK, {
                                        screen: ASB_GUARANTOR_CONSENT,
                                        params: {
                                            userData,
                                        },
                                    });
                                },
                            };
                            dispatch({
                                type: ASB_APPLICAION_DATA,
                                guarantorDataStore: dataSendNotification,
                            });

                            const stpScreenResume = resultAsbApplicationDetails?.stpScreenResume;
                            const guarantorEligibility = JSON.parse(
                                resultAsbApplicationDetails?.stpEligibilityResponse
                            );
                            let resumeEligibilityCheckOutcomeData;
                            guarantorEligibility?.eligibilityCheckOutcome?.map((data) => {
                                resumeEligibilityCheckOutcomeData = data;
                                if (data.dataType === DT_ELG) {
                                    resumeEligibilityCheckOutcomeData = data;
                                }
                            });
                            const ListBody = [];
                            ListBody.push({
                                heading: TENURE,
                                headingValue: `${resumeEligibilityCheckOutcomeData?.tenure} years`,
                                isVisible: resumeEligibilityCheckOutcomeData?.tenure,
                            });

                            let yearCount = 0;
                            const tireList = resumeEligibilityCheckOutcomeData?.tierList;
                            tireList?.map((data, index) => {
                                yearCount += data?.year;

                                if (tireList?.length > 1) {
                                    ListBody.push({
                                        heading:
                                            tireList?.length === 1
                                                ? ""
                                                : data?.tier === 1
                                                ? `${FIRST}  ${data?.year} ${SMALL_YEARS}`
                                                : index !== tireList?.length - 1
                                                ? `${yearCount} ${SMALL_YEARS}`
                                                : `${index + 3} - ${yearCount} ${SMALL_YEARS}`,
                                        isMutiTierVisible: true,
                                    });
                                }

                                ListBody.push({
                                    heading: PROFIT_INTEREST,
                                    headingValue: `${numeral(data?.interestRate).format(",0.00")}%`,
                                    isVisible: data?.interestRate,
                                });
                                ListBody.push({
                                    heading: MONTHLY_PAYMENT,
                                    headingValue: `RM ${numeral(data?.installmentAmount).format(
                                        ",0.00"
                                    )}`,
                                    isVisible: data?.installmentAmount,
                                });

                                if (tireList?.length > 1) {
                                    ListBody.push({
                                        divider: true,
                                    });
                                }
                            });

                            ListBody.push({
                                heading: TAKAFUL_INSURANCE_FEE,
                                headingValue: `RM ${numeral(
                                    resumeEligibilityCheckOutcomeData?.totalGrossPremium
                                ).format(",0.00")}`,
                                isVisible: resumeEligibilityCheckOutcomeData?.totalGrossPremium,
                            });

                            const GDataSend = {
                                headingTitle: TOTAL_FINANING_AMOUNT,
                                headingTitleValue: `RM ${numeral(
                                    resumeEligibilityCheckOutcomeData?.loanAmount
                                ).format(",0.00")}`,
                                bodyList: ListBody,
                                mainApplicantName,
                                subTitle: GREAT_NEWS(mainApplicantName),
                                subTitle2: YOU_MAY_VIEW,
                                analyticScreenName:
                                    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_COMPLETED,
                                referenceId: stpReferenceNo,
                                needFormAnalytics: true,
                                onDoneTap: () => {
                                    goBackHomeScreen(navigation);
                                },
                            };
                            dispatch({
                                type: ASB_APPLICAION_DATA_STORE_NOTIFICATION,
                                dataStoreValidation: GDataSend,
                            });
                            if (resultAsbApplicationDetails?.stpStatus) {
                                if (resultAsbApplicationDetails.stpStatus === "NSTPAPPSUB") {
                                    props.navigation.navigate(ASB_STACK, {
                                        screen: JOINT_APPLICANT,
                                        params: {
                                            isGuarantor: true,
                                            guarantorStpReferenceNumber: stpReferenceNo,
                                        },
                                    });
                                    return;
                                } else if (resultAsbApplicationDetails.stpStatus === "NSTPDOCUPL") {
                                    navigation.navigate(ASB_STACK, {
                                        screen: RECEIVED_DOCUMENT_SCREEN,
                                        params: {
                                            screenName: RECEIVED_DOCUMENT_SCREEN,
                                            params: {
                                                isGuarantor: true,
                                            },
                                        },
                                    });
                                    return;
                                } else if (resultAsbApplicationDetails.stpStatus === "NSTPFODCLN") {
                                    props.navigation.navigate(ASB_STACK, {
                                        screen: ASB_GUARANTOR_UNABLE_TO_OFFER_YOU,
                                        params: {
                                            onDoneTap: () => {
                                                goBackHomeScreen(navigation);
                                            },
                                        },
                                    });
                                    return;
                                } else if (resultAsbApplicationDetails.stpStatus === "STPAPPSUB") {
                                    props.navigation.navigate(ASB_STACK, {
                                        screen: ASB_GUARANTOR_NOTIFY_MAIN_APPLICANT,
                                        params: { dataSendNotification: GDataSend },
                                    });
                                    return;
                                }
                            }
                            let isEmployeeDataMissing = false;

                            const dataStoreValidation = {
                                headingTitle: TOTAL_FINANING_AMOUNT,
                                headingTitleValue: `RM ${numeral(
                                    eligibilityCheckOutcomeData?.loanAmount
                                ).format(",0.00")}`,
                                bodyList,
                                mainApplicantName,
                                title: CONGRATS_YOU_ARE_GUARANTOR(mainApplicantName),
                                subTitle: FINANCING_DETAILS_BELOW,
                            };

                            if (stpScreenResume) {
                                switch (stpScreenResume) {
                                    case "3":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_INCOME_DETAILS,
                                            params: { currentSteps: 1, totalSteps: 4 },
                                        });
                                        break;

                                    case "2":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_VALIDATION_SUCCESS,
                                            params: {
                                                dataSendNotification: dataStoreValidation,
                                            },
                                        });
                                        break;
                                    case "7":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_FATCA_DECLARATION,
                                        });
                                        break;
                                    case "8":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_ACCEPT_AS_GUARANTOR_DECLARATION,
                                        });
                                        break;
                                    case "9":
                                        if (
                                            !resultAsbApplicationDetails?.stpMaritalStatusDesc ||
                                            !resultAsbApplicationDetails?.stpEducationDesc ||
                                            (resultAsbApplicationDetails?.stpPartyGroup ===
                                                "NATIVE" &&
                                                !resultAsbApplicationDetails?.stpRaceDesc) ||
                                            !resultAsbApplicationDetails?.stpMobileContactNumber ||
                                            !resultAsbApplicationDetails?.stpEmail ||
                                            !resultAsbApplicationDetails?.stpHomeCountry ||
                                            !resultAsbApplicationDetails?.stpHomeAddress1 ||
                                            !resultAsbApplicationDetails?.stpHomeAddress2 ||
                                            !resultAsbApplicationDetails?.stpHomePostcode ||
                                            !resultAsbApplicationDetails?.stpHomeCity ||
                                            !resultAsbApplicationDetails?.stpHomePostcode
                                        ) {
                                            if (
                                                !resultAsbApplicationDetails?.stpOccupationDesc ||
                                                !resultAsbApplicationDetails?.stpEmployerName ||
                                                !resultAsbApplicationDetails?.stpOccupationSectorDesc ||
                                                !resultAsbApplicationDetails?.stpEmploymentTypeDesc ||
                                                !resultAsbApplicationDetails?.stpHomeCountry ||
                                                !resultAsbApplicationDetails?.stpEmployerAddress1 ||
                                                !resultAsbApplicationDetails?.stpEmployerAddress2 ||
                                                !resultAsbApplicationDetails?.stpEmployerPostcode ||
                                                !resultAsbApplicationDetails?.stpEmployerStateDesc ||
                                                !resultAsbApplicationDetails?.stpEmployerCity ||
                                                !resultAsbApplicationDetails?.stpEmployerContactNumber
                                            ) {
                                                isEmployeeDataMissing = true;
                                            }

                                            navigation.navigate(ASB_STACK, {
                                                screen: ASB_GUARANTOR_PERSONAL_INFORMATION,
                                                params: {
                                                    isEmployeeDataMissing,
                                                },
                                            });
                                        } else if (
                                            !resultAsbApplicationDetails?.stpOccupationDesc ||
                                            !resultAsbApplicationDetails?.stpEmployerName ||
                                            !resultAsbApplicationDetails?.stpOccupationSectorDesc ||
                                            !resultAsbApplicationDetails?.stpEmploymentTypeDesc ||
                                            !resultAsbApplicationDetails?.stpHomeCountry ||
                                            !resultAsbApplicationDetails?.stpEmployerAddress1 ||
                                            !resultAsbApplicationDetails?.stpEmployerAddress2 ||
                                            !resultAsbApplicationDetails?.stpEmployerPostcode ||
                                            !resultAsbApplicationDetails?.stpEmployerStateDesc ||
                                            !resultAsbApplicationDetails?.stpEmployerCity ||
                                            !resultAsbApplicationDetails?.stpEmployerContactNumber
                                        ) {
                                            updateDataOnReducerBaseOnApplicationDetails(
                                                resultAsbApplicationDetails,
                                                masetDataResult,
                                                eligibilityCheckOutcomeData,
                                                dispatch,
                                                navigation,
                                                false,
                                                false,
                                                additionalDetails
                                            );

                                            navigation.navigate(ASB_STACK, {
                                                screen: ASB_GUARANTOR_EMPLOYMENT_DETAILS,
                                                params: {
                                                    currentSteps: 1,
                                                    totalSteps: 2,
                                                },
                                            });
                                        } else {
                                            updateDataOnReducerBaseOnApplicationDetails(
                                                resultAsbApplicationDetails,
                                                masetDataResult,
                                                eligibilityCheckOutcomeData,
                                                dispatch,
                                                navigation,
                                                true,
                                                true,
                                                additionalDetails
                                            );
                                        }
                                        break;

                                    case "10":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_PERSONAL_INFORMATION,
                                            params: { isEmployeeDataMissing: true },
                                        });
                                        break;
                                    case "11":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_EMPLOYMENT_DETAILS,
                                            params: {
                                                currentSteps: 1,
                                                totalSteps: 2,
                                            },
                                        });
                                        break;

                                    case "12":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_EMPLOYMENT_DETAILS_2,
                                            params: {
                                                currentSteps: 2,
                                                totalSteps: 2,
                                            },
                                        });
                                        break;
                                    case "13":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_ADDITIONAL_DETAILS_INCOME,
                                        });
                                        break;
                                    case "14":
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS,
                                            params: {
                                                dataSendNotification: GDataSend,
                                            },
                                        });
                                        break;

                                    default:
                                        navigation.navigate(ASB_STACK, {
                                            screen: ASB_GUARANTOR_VALIDATION,
                                            params: dataSendNotification,
                                        });
                                        break;
                                }
                            } else {
                                navigation.navigate(ASB_STACK, {
                                    screen: ASB_GUARANTOR_VALIDATION,
                                    params: dataSendNotification,
                                });
                            }
                        },
                        checkResumeApplication,
                        masetDataResult,
                        mainApplicantName,
                        navigation
                    );
                }
            }
        });
    } else {
        navigation.navigate(ON_BOARDING_MODULE, {
            screen: ON_BOARDING_M2U_USERNAME,
            params: {
                screenName: ASB_GUARANTOR_NOTIFICATION,
                filledUserDetails: {
                    stpReferenceNo,
                    mainApplicantName,
                },
            },
        });
    }
};

export const showPDFDoc = (
    stpReferenceNumber,
    docType,
    dispatch,
    navigation,
    documentList,
    documentData
) => {
    const dataReducer = {
        docType,
        data: {
            stpReferenceNo: stpReferenceNumber,
            docType,
        },
    };

    if (documentList) {
        let docID;
        documentList?.map((data) => {
            docID = data?.id;
        });

        if (documentData) {
            const content = documentData?.content;
            const params = {
                file: { base64: content },
                share: true,
                type: "base64",
                title: "",
                pdfType: "shareReceipt",
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEW,
                params: { params },
            });
        } else {
            const dataSend = {
                docType,
                docID,
            };
            dispatch(
                asbGuarantorGetDocument(dataSend, (data) => {
                    const content = data?.content;
                    const params = {
                        file: { base64: content },
                        share: true,
                        type: "base64",
                        title: "",
                        pdfType: "shareReceipt",
                    };

                    navigation.navigate(COMMON_MODULE, {
                        screen: PDF_VIEW,
                        params: { params },
                    });
                })
            );
        }
    } else {
        dispatch(
            asbGuarantorGetDocumentList(dataReducer, (data) => {
                let docID;
                data?.map((data) => {
                    docID = data?.id;
                });

                const dataSend = {
                    docType,
                    docID,
                };

                dispatch(
                    asbGuarantorGetDocument(dataSend, (data) => {
                        const content = data?.content;
                        const params = {
                            file: { base64: content },
                            share: true,
                            type: "base64",
                            title: "",
                            pdfType: "shareReceipt",
                        };

                        navigation.navigate(COMMON_MODULE, {
                            screen: PDF_VIEW,
                            params: { params },
                        });
                    })
                );
            })
        );
    }
};
