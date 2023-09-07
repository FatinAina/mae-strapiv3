import PropTypes from "prop-types";
import React, { Component } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { APPLY_ACCOUNT_SCREEN } from "@screens/CasaSTP/helpers/AnalyticsEventConstants";
import {
    checkServerOperationTime,
    getApplyMAECardNavParams,
} from "@screens/MAE/CardManagement/CardManagementController";
import {
    getBannerImage,
    resumeFlow,
    getResumeData,
    getCounterOfferData,
    plstpInqCheck,
} from "@screens/PLSTP/PLSTPController";
import { getMasterData, getMDMData } from "@screens/Property/Common/PropertyController";
import {
    isAgeEligible,
    getEligibilityBasicNavParams,
} from "@screens/Property/Eligibility/CEController";

import {
    BANKINGV2_MODULE,
    APPLY_CARD_INTRO,
    FIXED_DEPOSIT_STACK,
    STP_PRODUCT_APPLY_SCREEN,
    PLSTP_COUNTER_OFFER,
    PLSTP_LANDING_PAGE,
    MAE_ACC_DASHBOARD,
    PROPERTY_DASHBOARD,
    CE_DECLARATION,
    ZEST_CASA_SELECT_DEBIT_CARD,
    ZEST_CASA_STACK,
    CE_PROPERTY_NAME,
    ON_BOARDING_M2U_USERNAME,
    ON_BOARDING_MODULE,
    DASHBOARD,
    APPROVEDFINANCEDETAILS,
    ASB_STACK,
    APPLY_LOANS,
    PENDING_GAURANTOR_APPROVAL,
    ZAKAT_SERVICES_STACK,
    ZAKAT_SERVICES_ENTRY,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ProductApplyItem from "@components/Cards/ProductApplyItem";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EntryPointCard from "@components/EntryPointCard";
import Popup from "@components/Popup";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController, withModelContext } from "@context";

import {
    maeCustomerInfo,
    invokeL2,
    invokeL3,
    getAllProducts,
    bankingGetDataMayaM2u,
    cardsInquiry,
    cardsResume,
    cardsInquiryGET,
    applicationDetailsGetApi,
    checkDownTime,
    checkzakatCutOffTimeAPI,
} from "@services";
import { logEvent } from "@services/analytics";
import {
    applyCC,
    applyMAECard,
    applySuppCard,
    resumeCardApplication,
} from "@services/analytics/analyticsSTPCreditcardAndSuppCard";
import { applyFixedDeposit } from "@services/analytics/analyticsSTPeFD";

import { ASB_PREPOSTQUAL_CLEAR } from "@redux/actions/ASBServices/prePostQualAction";
import debitCardInquiryProps from "@redux/connectors/services/debitCardInquiryConnector";
import downTimeServiceProps from "@redux/connectors/services/downTimeConnector";
import draftUserInqueryProps from "@redux/connectors/services/draftUserInquiryConnector";
import masterDataServiceProps from "@redux/connectors/services/masterDataConnector";
import prePostQualServiceProps from "@redux/connectors/services/prePostQualConnector";
import { getMasterData as masterData } from "@redux/services/ASBServices/apiMasterData";

import {
    CASA_STP_SERVICE_TITLE,
    CASA_SERVICE_TYPES,
    CASA_STP_DESC,
    CASA_STP_TITLE,
    CASA_STP_PRODUCTS,
} from "@constants/casaStrings";
import { PREMIER_ACCOUNT_STATUS_INQUIRY } from "@constants/casaUrl";
import { MEDIUM_GREY } from "@constants/colors";
import {
    COMMON_ERROR_MSG,
    FA_SCREEN_NAME,
    FA_TAB_NAME,
    FA_VIEW_SCREEN,
    FA_SELECT_ACTION,
    FA_ACTION_NAME,
    ZEST_TILE_DESCRIPTION,
    ACTIVATE_YOUR_ACCOUNT,
    PROPERTY_MDM_ERR,
    PROPERTY_AGE_ERR,
    PROPERTY_NATIONALITY_ERR,
    FA_FORM_PROCEED,
    APP_RESUME_EXPIRED,
    ZEST,
    DEBIT_CARD_CHECK_ERROR,
    DEBIT_CARD_CHECK_LOGIN_ERROR,
    WELCOME_BACK_RESUME,
    WELCOME_BACK_RESUME_DESC,
    OKAY,
    SUCC_STATUS,
    NOT_ELIGIBLE_FOR_ZAKAT,
    ZAKAT_NO_ISLAMICACCT_TO_SELECT,
    MAE_ACC_NAME,
} from "@constants/strings";
import {
    CARDS_URL,
    CARD_NTB_URL,
    ETIQA_URL,
    LOAN_NTB_URL,
    LOAN_RESUME_URL,
    LOAN_URL,
    TAKAFUL_URL,
    CARD_SUPP_URL,
    ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD,
    ASB_NTB_URL,
    TRIPTAKAFUL_URL,
    TRIP_URL,
} from "@constants/url";

import Assets from "@assets";

import { nominateGuarantor, onClickOkay } from "../ASB/Financing/helpers/ASBHelpers";
import AccountsScreen from "./AccountsScreen";

const checkDownTimeSwitch = async () => {
    const response = await checkDownTime(true);
    return response;
};

const gotoZakatOnBoardingPage = async (navigate) => {
    logEvent(FA_SELECT_ACTION, {
        [FA_SCREEN_NAME]: "Apply",
        [FA_TAB_NAME]: "Services",
        [FA_ACTION_NAME]: "Auto Debit for Zakat",
    });

    navigate(ZAKAT_SERVICES_STACK, {
        screen: ZAKAT_SERVICES_ENTRY,
    });
};

const fetchAllAccounts = async (navigate) => {
    try {
        const response = await bankingGetDataMayaM2u("/summary?type=A", true);
        if (response?.data) {
            const accounts = response?.data?.result?.accountListings ?? [];
            if (accounts) {
                const isJointAccAvailable = accounts.every((item) => item.jointAccount);
                if (!isJointAccAvailable) {
                    await gotoZakatOnBoardingPage(navigate);
                } else {
                    showErrorToast({
                        message: NOT_ELIGIBLE_FOR_ZAKAT,
                    });
                }
            } else {
                showInfoToast({ message: ZAKAT_NO_ISLAMICACCT_TO_SELECT });
            }
        }
    } catch (error) {
        showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
        return null;
    }
};

const CardsTab = ({ onCardPressed }) => {
    return (
        <ScrollView>
            <View key="CardsTab-1" style={styles.margins}>
                <ProductApplyItem
                    productType="Card"
                    bgImage={Assets.applyCardBg}
                    text={{
                        header: "Find the right credit\ncard for you",
                        button: "Apply Now",
                        button2: "Resume",
                    }}
                    onCardPressed={onCardPressed.cc}
                    onCardPressedSecondary={onCardPressed.ccResume}
                    cardType="MEDIUM"
                />
            </View>

            <View key="CardsTab-3" style={styles.margins}>
                <ProductApplyItem
                    productType="Card"
                    bgImage={Assets.applyMaeCardbgNoText}
                    text={{
                        header: "Tap here to apply\nfor a MAE card",
                        button: "Apply Now",
                    }}
                    onCardPressed={onCardPressed.mae}
                    cardType="MEDIUM"
                />
            </View>
            <View key="CardsTab-4" style={styles.margins}>
                <ProductApplyItem
                    productType="Card"
                    bgImage={Assets.applySuppCardBg}
                    text={{ header: "Apply for supplementary\ncards", button: "Apply Now" }}
                    onCardPressed={onCardPressed.cc}
                    cardType="MEDIUM"
                />
            </View>
        </ScrollView>
    );
};

CardsTab.propTypes = {
    onCardPressed: PropTypes.object,
    allowResume: PropTypes.bool,
};

const FixedDepositsTab = ({ onCardPressed }) => (
    <View style={styles.fixedDepositContainer}>
        <EntryPointCard
            id={1}
            name="Make a Placement"
            description="Make a fixed deposit placement. Grow your savings with attractive rates."
            icon={Assets.payCard}
            onPress={onCardPressed}
        />
    </View>
);

FixedDepositsTab.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
};

const InsuranceTab = ({ onCardPressed }) => (
    <View style={styles.fixedDepositContainer}>
        <EntryPointCard
            id={2}
            name="Motor Insurance"
            description="Renew your insurance and enjoy instant rebate!"
            icon={Assets.iconMotorInsurance}
            onPress={onCardPressed}
        />
    </View>
);

InsuranceTab.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
};

const StpCardsTab = ({ onCardPressed, showSupplementary }) => {
    const { getModel } = useModelController();
    const { isZestApplyDebitCardEnable } = getModel("zestModule");

    return (
        <ScrollView key="CardsTabScrollView">
            <View style={styles.margins}>
                <Typo
                    style={styles.sectionHeader}
                    fontSize={16}
                    lineHeight={15}
                    fontWeight="600"
                    textAlign="left"
                    text="New Application"
                />
            </View>
            <View style={styles.margins}>
                <ProductApplyItem
                    productType="Card"
                    bgImage={Assets.stpApplyMaeCard}
                    text={{
                        header: "MAE card",
                        subHeader: "Enjoy great benefits when\nyou spend with the MAE\ncard.",
                    }}
                    onCardPressed={onCardPressed.mae}
                    cardType="MEDIUM"
                />
            </View>
            <View style={styles.margins}>
                <ProductApplyItem
                    productType="Card"
                    bgImage={Assets.stpApplyCc}
                    text={{
                        header: "Credit Cards",
                        subHeader: "Apply for a card that\nbenefits you and your\nlifestyle.",
                    }}
                    onCardPressed={onCardPressed.cc}
                    cardType="MEDIUM"
                />
            </View>
            {showSupplementary && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Card"
                        bgImage={Assets.stpApplySuppCard}
                        text={{
                            header: "Supplementary cards",
                            subHeader: "Share your card benefits\nwith your loved ones.",
                        }}
                        onCardPressed={onCardPressed.ccSupp}
                        cardType="MEDIUM"
                    />
                </View>
            )}
            {isZestApplyDebitCardEnable && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Card"
                        bgImage={Assets.zestApplyDc}
                        text={{
                            header: "Debit Card",
                            subHeader:
                                "Get the best Maybank\ndebit card that benefits\nyou and your lifestyle.",
                        }}
                        onCardPressed={onCardPressed.dc}
                        cardType="MEDIUM"
                    />
                </View>
            )}

            <View style={styles.margins}>
                <Typo
                    style={styles.sectionHeader}
                    fontSize={16}
                    lineHeight={15}
                    fontWeight="600"
                    textAlign="left"
                    text="Resume Application"
                />
            </View>
            <View style={styles.margins}>
                <ProductApplyItem
                    productType="Card"
                    bgImage={Assets.stpApplyCcResume}
                    text={{
                        header: "Continue your card\napplication here",
                    }}
                    onCardPressed={onCardPressed.ccResume}
                    cardType="MEDIUM"
                />
            </View>
        </ScrollView>
    );
};

const resumeTitle = () => {
    return (
        <View style={styles.margins}>
            <Typo
                style={styles.sectionHeader}
                fontSize={16}
                lineHeight={15}
                fontWeight="600"
                textAlign="left"
                text="Resume Application"
            />
        </View>
    );
};

const applicationStatusTitle = () => {
    return (
        <View style={styles.margins}>
            <Typo
                style={styles.sectionHeader}
                fontSize={16}
                lineHeight={15}
                fontWeight="600"
                textAlign="left"
                text="Application Status"
            />
        </View>
    );
};

const StpLoansTab = ({
    onCardPressed,
    showCard,
    type,
    showPropertyEntryPoint,
    showASBResumeCard,
    showASBPendingAcceptanceCard,
    showPendingGuarantorApprovalCard,
    showGuarantorCard,
    checkGuarantorCardStatus,
}) => {
    const { getModel } = useModelController();
    const { isMainApplicantFlagEnable, isGuarantorFlagEnable } = getModel("asbStpModule");
    return (
        <ScrollView key="LoansTab_ScrollView">
            <View style={styles.margins}>
                <Typo
                    style={styles.sectionHeader}
                    fontSize={16}
                    lineHeight={15}
                    fontWeight="600"
                    textAlign="left"
                    text="New Application"
                />
            </View>
            {showCard && (type === "Apply" || type === "TurnedOff") && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Loan"
                        text={{
                            header: "Personal Loan / \nFinancing-i",
                            subHeader: "Get extra cash anytime,\nanywhere!",
                        }}
                        bgImage={Assets.stpApplyPLoan}
                        onCardPressed={onCardPressed.loan}
                        cardType="MEDIUM"
                    />
                </View>
            )}
            {!showASBPendingAcceptanceCard && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Loan"
                        text={{
                            header: "ASB Financing-i",
                            subHeader:
                                "Enjoy flexible financing\ntenure with competitive\nreturns.",
                        }}
                        bgImage={Assets.stpApplyAsbLoan}
                        onCardPressed={onCardPressed.asb}
                        cardType="MEDIUM"
                    />
                </View>
            )}

            {showPropertyEntryPoint && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Property"
                        text={{
                            header: "Home Loan / \nFinancing-i",
                            subHeader: "Quick property financing\napplication at your\nfingertips!",
                        }}
                        bgImage={Assets.stpApplyMortgage}
                        onCardPressed={onCardPressed.property}
                        cardType="MEDIUM"
                    />
                </View>
            )}
            {(isMainApplicantFlagEnable && (showASBResumeCard || showASBPendingAcceptanceCard)) ||
            (showCard && ["Resume", "CounterOffer", "TurnedOff"].includes(type)) ||
            !isMainApplicantFlagEnable ||
            (isGuarantorFlagEnable && showGuarantorCard)
                ? !showPendingGuarantorApprovalCard
                    ? resumeTitle()
                    : null
                : null}

            {showCard && (type === "Resume" || type === "CounterOffer" || type === "TurnedOff") && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Card"
                        bgImage={
                            type === "Resume"
                                ? Assets.stpApplyPlResume
                                : Assets.stpApplyPlCounterOffer
                        }
                        text={{
                            header:
                                type === "Resume" || type === "TurnedOff"
                                    ? "Continue your\nPersonal Loan /\nFinancing-i\napplication here"
                                    : "View and accept your\nPersonal Loan /\nFinancing-i offer",
                        }}
                        onCardPressed={onCardPressed.loanResume}
                        cardType="MEDIUM"
                    />
                </View>
            )}
            {(isMainApplicantFlagEnable && showASBResumeCard) || !isMainApplicantFlagEnable
                ? !showPendingGuarantorApprovalCard && (
                      <View style={styles.margins}>
                          <ProductApplyItem
                              productType="Loan"
                              text={{
                                  header: "Continue your ASB\nFinancing application\nhere",
                              }}
                              bgImage={Assets.stpApplyAsbResume}
                              onCardPressed={onCardPressed.asbResume}
                              cardType="MEDIUM"
                          />
                      </View>
                  )
                : null}

            {isMainApplicantFlagEnable && showASBPendingAcceptanceCard ? (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Loan"
                        text={{
                            header: "ASB Financing-i \npending acceptance \nof the offer",
                        }}
                        bgImage={Assets.stpApplyAsbResume}
                        onCardPressed={onCardPressed.asbPendingAcceptance}
                        cardType="MEDIUM"
                    />
                </View>
            ) : null}

            {isGuarantorFlagEnable && showGuarantorCard && (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Loan"
                        text={{
                            header: "Continue your ASB\nFinancing/-i Guarantor \napplication here",
                        }}
                        bgImage={Assets.stpApplyAsbResume}
                        onCardPressed={onCardPressed.onGuarantorCardPress}
                        cardType="MEDIUM"
                    />
                </View>
            )}
            {showPendingGuarantorApprovalCard && (
                <>
                    {applicationStatusTitle()}
                    <View style={styles.margins}>
                        <ProductApplyItem
                            productType="Card"
                            bgImage={Assets.stpApplyPLoan}
                            text={{
                                header: "Pending Guarantor \nApproval",
                            }}
                            onCardPressed={onCardPressed.onPendingGuarantorApprovalPress}
                            cardType="MEDIUM"
                        />
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const StpFixedDepositsTab = ({ onCardPressed }) => (
    <ScrollView key="InsuranceTab_ScrollView">
        <View style={styles.margins}>
            <Typo
                style={styles.sectionHeader}
                fontSize={16}
                lineHeight={15}
                fontWeight="600"
                textAlign="left"
                text="New Application"
            />
        </View>
        <View style={styles.margins}>
            <ProductApplyItem
                productType="Card"
                bgImage={Assets.stpApplyFd}
                text={{
                    header: "Fixed Deposit Account",
                    subHeader: "Grow your savings with\nattractive rates.",
                }}
                onCardPressed={onCardPressed}
                cardType="MEDIUM"
            />
        </View>
    </ScrollView>
);

const StpInsuranceTab = ({ insuraceList, onCardPressed }) => (
    <ScrollView key="InsuranceTab_ScrollView">
        <View style={styles.margins}>
            <Typo
                style={styles.sectionHeader}
                fontSize={16}
                lineHeight={15}
                fontWeight="600"
                textAlign="left"
                text="New Application"
            />
        </View>
        {insuraceList?.map((item, index) => {
            return (
                <View style={styles.margins}>
                    <ProductApplyItem
                        productType="Loan"
                        text={{
                            header: item.serviceTitle,
                            subHeader: item.description,
                            subHeaderWidth: item.width,
                        }}
                        bgImage={item.bgImage}
                        onCardPressed={
                            item.onPress === "etiqa"
                                ? onCardPressed.etiqa
                                : item.onPress === "takaful"
                                ? onCardPressed.takaful
                                : item.onPress === "tripTakaful"
                                ? onCardPressed.tripTakaful
                                : onCardPressed.trip
                        }
                        cardType="MEDIUM"
                    />
                </View>
            );
        })}
    </ScrollView>
);

const StpServicesTab = ({ onCardPressed }) => (
    <ScrollView key="InsuranceTab_ScrollView">
        <View style={styles.margins}>
            <Typo
                style={styles.sectionHeader}
                fontSize={16}
                lineHeight={15}
                fontWeight="600"
                textAlign="left"
                text="New Application"
            />
        </View>

        <View style={styles.margins}>
            <ProductApplyItem
                productType="Services"
                text={{
                    header: "Auto Debit for Zakat\nSimpanan & Pelaburan",
                    subHeader: "Automate your zakat\npayments every year.",
                }}
                bgImage={Assets.stpApplyZakat}
                onCardPressed={onCardPressed}
                cardType="MEDIUM"
            />
        </View>
    </ScrollView>
);

StpCardsTab.propTypes = {
    onCardPressed: PropTypes.object,
    showSupplementary: PropTypes.bool,
};
StpLoansTab.propTypes = {
    onCardPressed: PropTypes.object,
    showCard: PropTypes.bool,
    type: PropTypes.string,
    showPropertyEntryPoint: PropTypes.bool,
    showASBResumeCard: PropTypes.bool,
    showASBPendingAcceptanceCard: PropTypes.bool,
    showPendingGuarantorApprovalCard: PropTypes.bool,
    showGuarantorCard: PropTypes.bool,
    checkGuarantorCardStatus: PropTypes.string,
};

StpLoansTab.defaultProps = {
    showCard: false,
    showASBResumeCard: false,
    showASBPendingAcceptanceCard: false,
    showPendingGuarantorApprovalCard: false,
    type: "Apply",
};

StpFixedDepositsTab.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
};
StpInsuranceTab.propTypes = {
    onCardPressed: PropTypes.object,
};

StpServicesTab.propTypes = {
    onCardPressed: PropTypes.object,
};

class ApplyDashboardTab extends Component {
    state = {
        activeTabIndex: this.props.route?.params?.index ?? 0,
        showFDTab: this.props.getModel("fixedDeposit").showFDPlacementEntryPoint ?? false,
        showLoanCard: this.props.route?.params?.showLoanCard ?? false,
        showASBResumeCardCheck: false,
        showASBPendingAcceptanceCardCheck: false,
        showPendingGuarantorApprovalCheck: false,
        stpType: "TurnedOff",
        plstpResumeResult: null,
        isPlstpEnable: true,
        showLoader: false,
        isNotificationResume: this.props.route?.params?.isNotificationResume ?? false,
        isNotificationResumeGuarantor:
            this.props.route?.params?.isNotificationResumeGuarantor ?? false,
        isGuarantorNotEligible: this.props.route?.params?.isGuarantorNotEligible ?? false,
        isGuarantorDeclined: this.props.route?.params?.isGuarantorDeclined ?? false,
        isGuarantorAccepted: this.props.route?.params?.isGuarantorAccepted ?? false,
        resumeFromLoginGuarantor: this.props.route?.params?.resumeFromLoginGuarantor ?? false,
        productList: this.getProductList(),
        insuraceList: this.getInsuranceList(),
        activateProductList: this.getActivateProductList(),
        showSupplementaryOption: false,
        showPopup: false,
        showPopupGuarantorResume: false,
        showGuarantorCard: false,
        guarantorData: null,
        checkGuarantorCardStatus: null,
    };

    getInsuranceList() {
        let insuraceList = [
            {
                serviceTitle: "Motor Insurance",
                bgImage: Assets.stpApplyEtiqa,
                description: "Get a comprehensive\ncoverage when you\nrenew with us here.",
                url: ETIQA_URL,
                onPress: "etiqa",
            },
            {
                serviceTitle: "Motor Takaful",
                bgImage: Assets.stpApplyMotorTakaful,
                description: "Renew your insurance\nwith a comprehensive\nshariah-compliant\nplan.",
                url: TAKAFUL_URL,
                onPress: "takaful",
            },
            {
                serviceTitle: "TripCare 360 Takaful",
                bgImage: Assets.stpApplyTripcareTakaful,
                width: "45%",
                description:
                    "Get Shariah-\ncompliant coverage for travel delays, lost bags and more.",
                url: TRIPTAKAFUL_URL,
                onPress: "tripTakaful",
            },
            {
                serviceTitle: "TripCare 360",
                bgImage: Assets.stpApplyTripcare,
                width: "45%",
                description:
                    "Get protection for \ntravel troubles like \ndelays, lost bags and more.",
                url: TRIP_URL,
                onPress: "trip",
            },
        ];
        return insuraceList;
    }

    getProductList() {
        const { isZestiEnable } = this.props.getModel("zestModule");
        const { isPM1Enable, isPMAEnable, isKawankuEnable, isSavingsIEnable } =
            this.props.getModel("casaModule");

        let productList = [
            {
                serviceTitle: MAE_ACC_NAME,
                bgImage: Assets.stpApplyMaeAcc,
                icon: Assets.maeIcon,
                description: "Open a spending account\nwithout going to the\nbranch!",
                serviceType: "MAE",
            },
            {
                serviceTitle: CASA_STP_SERVICE_TITLE[3],
                bgImage: Assets.kawankuSavingsIApplyTile,
                description: CASA_STP_DESC[3],
                serviceType: CASA_SERVICE_TYPES[3],
                params: {
                    isKawankuSavingsI: true,
                    productTile: CASA_STP_TITLE[3],
                    productName: CASA_STP_PRODUCTS[3],
                    eventName: APPLY_ACCOUNT_SCREEN(CASA_STP_SERVICE_TITLE[3]),
                },
            },
            {
                serviceTitle: ZEST,
                bgImage: Assets.zestApplyCard,
                description: ZEST_TILE_DESCRIPTION,
                serviceType: "ZEST",
            },
            {
                serviceTitle: CASA_STP_SERVICE_TITLE[1],
                bgImage: Assets.premierMudharabahApplyTile,
                description: CASA_STP_DESC[1],
                serviceType: CASA_SERVICE_TYPES[1],
                params: {
                    isPMA: true,
                    productTile: CASA_STP_TITLE[1],
                    productName: CASA_STP_PRODUCTS[1],
                    eventName: APPLY_ACCOUNT_SCREEN(CASA_STP_SERVICE_TITLE[1]),
                },
            },
            {
                serviceTitle: CASA_STP_SERVICE_TITLE[2],
                bgImage: Assets.kawankuSavingsApplyTile,
                description: CASA_STP_DESC[2],
                serviceType: CASA_SERVICE_TYPES[2],
                params: {
                    isKawanku: true,
                    productTile: CASA_STP_TITLE[2],
                    productName: CASA_STP_PRODUCTS[2],
                    eventName: APPLY_ACCOUNT_SCREEN(CASA_STP_SERVICE_TITLE[2]),
                },
            },
            {
                serviceTitle: "Maybank2u.Premier\nAccount",
                bgImage: Assets.m2uPremierApplyTile,
                icon: Assets.m2uPremierIcon,
                description: "Enjoy a full-fledged\ncurrent account services.",
                serviceType: "M2UP",
            },
            {
                serviceTitle: CASA_STP_SERVICE_TITLE[0],
                bgImage: Assets.premier1ApplyTile,
                description: CASA_STP_DESC[0],
                serviceType: CASA_SERVICE_TYPES[0],
                params: {
                    isPM1: true,
                    productTile: CASA_STP_TITLE[0],
                    productName: CASA_STP_PRODUCTS[0],
                    eventName: APPLY_ACCOUNT_SCREEN(CASA_STP_SERVICE_TITLE[0]),
                },
            },
        ];

        if (!isZestiEnable) {
            productList = productList.filter((value) => value?.serviceType !== "ZEST");
        }
        if (!isPM1Enable) {
            productList = productList.filter(
                (value) => value?.serviceType !== CASA_SERVICE_TYPES[0]
            );
        }

        if (!isPMAEnable) {
            productList = productList.filter(
                (value) => value?.serviceType !== CASA_SERVICE_TYPES[1]
            );
        }

        if (!isKawankuEnable) {
            productList = productList.filter(
                (value) => value?.serviceType !== CASA_SERVICE_TYPES[2]
            );
        }

        if (!isSavingsIEnable) {
            productList = productList.filter(
                (value) => value?.serviceType !== CASA_SERVICE_TYPES[3]
            );
        }

        return productList;
    }

    getActivateProductList() {
        const { isResumeZestOrM2UActivateEnable } = this.props.getModel("zestModule");
        let activateProductList = [
            {
                serviceTitle: ACTIVATE_YOUR_ACCOUNT,
                bgImage: Assets.zestCASAActivateTile,
                serviceType: "CasaActivate",
            },
        ];
        if (!isResumeZestOrM2UActivateEnable) {
            activateProductList = activateProductList.filter(
                (value) => value?.serviceType !== "CasaActivate"
            );
        }

        return activateProductList;
    }

    tabs = [
        { acctTypeName: "Accounts" },
        { acctTypeName: "Cards" },
        { acctTypeName: "Fixed Deposit" },
        { acctTypeName: "Loan/Financing" },
        { acctTypeName: "Insurance" },
        { acctTypeName: "Services" },
    ];

    componentDidMount = () => {
        // By default, log "Accounts" tab when this screen mounts (when tab selected)
        if (this.state.activeTabIndex === 0) {
            this._analyticsLogCurrentTab(0);
        }

        this._unsubscribeFocusListener = this.props.navigation.addListener("focus", () => {
            this._updateTabPosition();
            this._resetNavParams();
        });

        this._controlFDPlacementEntryPointVisibility();
        this.props.navigation.addListener("focus", this.onScreenFocus);

        if (
            this.state.isNotificationResume ||
            this.state.isGuarantorNotEligible ||
            this.state.isGuarantorDeclined ||
            this.state.isGuarantorAccepted
        ) {
            this._handleAsbLCardResumePressed();
        }
    };

    onScreenFocus = () => {
        const { showFDTab } = this.state;
        const tabIndex = showFDTab ? this.state.activeTabIndex : this.state.activeTabIndex + 1;
        if (this.tabs[tabIndex]?.acctTypeName === "Loan/Financing") {
            this.loanStatusCheck();
        }
        const { isOnboard } = this.props.getModel("user");
        if (isOnboard && tabIndex === 2 && this.tabs[tabIndex]?.acctTypeName === "Cards") {
            const debitCardInquiryData = {
                Msg: {
                    MsgBody: {},
                },
            };
            this.props.debitCardInquiry(debitCardInquiryData);
        }
    };

    getProductList = () => {
        getAllProducts(true)
            .then((response) => {
                const result = response.data.result;
                const productlist = result?.productList;

                if (productlist && productlist instanceof Array && productlist.length) {
                    this.setState({
                        productList: [
                            // ...productlist,
                            {
                                serviceTitle: "MAE Account",
                                bgImage: Assets.stpApplyMaeAcc,
                                icon: Assets.maeIcon,
                                description:
                                    "Open a spending account\nwithout going to the\nbranch!",
                                serviceType: "MAE",
                            },
                            {
                                serviceTitle: "Maybank2u.Premier\nAccount",
                                bgImage: Assets.stpApplyM2uPremier,
                                icon: Assets.m2uPremierIcon,
                                description: "Enjoy a full-fledged current\naccount services.",
                                serviceType: "M2UP",
                            },
                        ],
                    });
                } else {
                    showErrorToast({
                        message: COMMON_ERROR_MSG,
                    });
                }
            })
            .catch((error) => {
                showErrorToast({
                    message: COMMON_ERROR_MSG,
                });
            });
    };

    _controlFDPlacementEntryPointVisibility = () => {
        const { showFDPlacementEntryPoint } = this.props.getModel("fixedDeposit");
        this.setState({
            showFDTab: showFDPlacementEntryPoint,
        });
    };

    _resetNavParams = () => {
        this.props.navigation.setParams({
            index: null,
            screen: null,
        });
    };

    _updateTabPosition = () => {
        const index = this.props.route?.params?.index ?? -1;

        if (index >= 0) {
            this._setTabIndex(index);
            this._resetNavParams();

            // Log to analytics of correct tab shown
            this._analyticsLogCurrentTab(index);
        }
    };

    _setTabIndex = (index) =>
        this.setState({
            activeTabIndex: index,
        });

    handleTabChange = (index) => {
        this.setState({ activeTabIndex: index });
        this._analyticsLogCurrentTab(index);

        const { showFDTab } = this.state;
        const tabIndex = showFDTab ? index : index + 1;
        const { isOnboard } = this.props.getModel("user");
        if (this.tabs[tabIndex]?.acctTypeName === "Loan/Financing") {
            this.loanStatusCheck();
        }

        if (isOnboard && this.tabs[index]?.acctTypeName === "Cards") {
            const debitCardInquiryData = {
                Msg: {
                    MsgBody: {},
                },
            };
            this.props.debitCardInquiry(debitCardInquiryData);
        }
    };

    loanStatusCheck = async () => {
        const { isOnboard } = this.props.getModel("user");

        if (isOnboard) {
            const body = {
                msgBody: {
                    logonInfo: "Y",
                },
            };
            this.props.actionMasterData();
            const checkResumeApplication = await applicationDetailsGetApi(body, true);

            const applicationDetailsResult = checkResumeApplication?.data?.result;
            const stpApp = applicationDetailsResult?.msgBody?.stpApp;
            const stpRoleType = stpApp?.stpRoleType;
            const mainApplicantName =
                applicationDetailsResult?.msgBody?.additionalDetails?.stpCustomerName;
            const stpReferenceNo = stpApp?.stpReferenceNo;
            const stpReferenceMAainApplicantNo =
                applicationDetailsResult?.msgBody?.additionalDetails?.stpReferenceNo;
            const stpStatusDesc = stpApp?.stpStatusDesc;
            const idNumber = stpApp?.stpIdno;
            const checkGuarantorCardStatus =
                applicationDetailsResult?.msgBody?.additionalDetails?.stpScreenResume;

            if (stpRoleType === "G") {
                this.setState({
                    showGuarantorCard: true,
                    guarantorData: {
                        mainApplicantName,
                        stpReferenceNo,
                        stpStatusDesc,
                        idNumber,
                        checkResumeApplication,
                        stpReferenceMAainApplicantNo,
                    },
                    checkGuarantorCardStatus,
                });

                if (
                    this.state.isNotificationResumeGuarantor ||
                    this.state.resumeFromLoginGuarantor
                ) {
                    this._handleGuarantorCardPressed();
                }
            } else {
                this.setState({
                    showGuarantorCard: false,
                });
            }

            if (stpRoleType !== "G") {
                if (applicationDetailsResult?.msgHeader?.responseStatus === "SUCCESS") {
                    this.setState({
                        showASBResumeCardCheck: true,
                    });
                }
                if (applicationDetailsResult?.msgBody?.inquiryDetails) {
                    this.setState({
                        showASBPendingAcceptanceCardCheck: true,
                        showASBResumeCardCheck: false,
                    });
                }
            }
            if (stpApp?.stpScreenResume === "G_PENDING") {
                this.setState({
                    showPendingGuarantorApprovalCheck: true,
                });
            } else {
                this.setState({
                    showPendingGuarantorApprovalCheck: false,
                });
            }
        } else {
            if (this.state.isNotificationResumeGuarantor || this.state.resumeFromLoginGuarantor) {
                this._handleGuarantorCardPressed();
            }
            this.setState({
                showLoanCard: true,
            });
            return;
        }

        const response = await plstpInqCheck();
        if (response?.data?.code === 200) {
            const result = response?.data?.result;

            const stpType = await getBannerImage(result);
            this.setState({
                stpType,
                showLoanCard: true,
                plstpResumeResult: result,
            });
        } else {
            this.setState({
                showLoanCard: true,
            });
        }
    };

    _analyticsLogCurrentTab = (index) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply",
            [FA_TAB_NAME]: this.tabs[index].acctTypeName,
        });
    };

    onBackTap = () => {
        this.props.navigation.goBack();
    };

    onApplyMAECardPress = async () => {
        applyMAECard.onApplyMaeCard();

        const { getModel } = this.props;
        const { isPostPassword } = getModel("auth");
        const { isOnboard } = getModel("user");

        // Check if user MAYA onboarded
        if (!isOnboard) {
            showErrorToast({
                duration: 8000,
                message: `Sorry, you need to have ${MAE_ACC_NAME} before you can apply for card. Please apply for ${MAE_ACC_NAME} under ACCOUNTS and try again. If you already have a MAE account, please login and try again.`,
            });
            return;
        }

        // Check Operation time
        const operationTime = await checkServerOperationTime("maePhysicalCard").catch(
            (error) => {}
        );
        const statusCode = operationTime?.statusCode ?? "";
        const statusDesc = operationTime?.statusDesc ?? COMMON_ERROR_MSG;
        const trinityFlag = operationTime?.trinityFlag ?? "";
        if (statusCode !== "0000") {
            showErrorToast({
                message: statusDesc,
            });
            return;
        }

        // MAE Customer Info call
        const urlParams = "?countryCode=MY&checkMaeAcctBalance=true";
        const httpResp = await maeCustomerInfo(urlParams, true).catch((error) => {});

        const maeCustomerInfoData = httpResp?.data?.result ?? null;
        if (!maeCustomerInfoData) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
            return;
        }
        const cardStatus = maeCustomerInfoData?.debitInq?.cardStatus ?? null;
        const cardNextAction = maeCustomerInfoData?.debitInq?.cardNextAction ?? null;
        const userMaeAcct = maeCustomerInfoData?.userMaeAcct ?? null;

        // Check if user has a MAE account
        if (!userMaeAcct) {
            showErrorToast({
                message: `Sorry, you need to have ${MAE_ACC_NAME} before you can apply for card. Please apply for ${MAE_ACC_NAME} under ACCOUNTS and try again.`,
            });
            return;
        }

        // Eligible to apply. Initiate apply MAE card flow.
        if (cardStatus === "000" && cardNextAction === "001") {
            // L3 call to invoke login page
            if (!isPostPassword) {
                const httpResp = await invokeL3(true).catch((error) => {});
                const code = httpResp?.data?.code ?? null;
                if (code !== 0) return;
            }

            this.initApplyMAECard(maeCustomerInfoData, trinityFlag);
            return;
        }

        // Already applied, application in progress.
        if (cardStatus === "000" && cardNextAction === "002") {
            showErrorToast({
                message:
                    "Sorry, you have already applied for a MAE card. Your card application is in progress.",
            });
            return;
        }

        // Already applied, pending activation.
        if (cardStatus === "000" && cardNextAction === "003") {
            showErrorToast({
                message: "Sorry, you have already applied for a MAE card.",
            });
            return;
        }

        // Invalid card details
        if (cardStatus === null || cardNextAction === null) {
            showErrorToast({
                message: "Failed to retrieve MAE card details. Please try again later.",
            });
            return;
        }

        // Eventually, you have a card msg
        showErrorToast({
            message: "Sorry, you already have a MAE card.",
        });
    };

    initApplyMAECard = async (maeCustomerInfoData, trinityFlag) => {
        const navParams = getApplyMAECardNavParams(maeCustomerInfoData, trinityFlag);
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: APPLY_CARD_INTRO,
            params: {
                ...navParams,
                entryPoint: "APPLY_CARDS",
            },
        });
    };

    onApplyDebitCardPress = async () => {
        // Check if user MAYA onboarded
        this.props.checkDownTimePremier(ZEST_CASA_CHECK_DOWNTIME_DEBIT_CARD, (result) => {
            if (result.statusCode === "0000") {
                this.onApplyDebitCardLoginCheck();
            }
        });
    };

    onApplyDebitCardLoginCheck = async () => {
        const { getModel } = this.props;
        const { isOnboard } = getModel("user");
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;

            if (code != 0) return;

            if (this.props.debtCardNxtAct === "001" || this.props.debtCardNxtAct === "") {
                this.props.clearALLZestReducer();
                this.props.clearPrePostReducer();
                this.props.darftUserClearAll();
                const accountInquiryBody = {};
                this.props.draftUserInqueryPremier(
                    PREMIER_ACCOUNT_STATUS_INQUIRY,
                    accountInquiryBody,
                    (data, message, custStatus) => {
                        if (custStatus === "Y") {
                            this.props.updateUserStatus(null);
                            this.props.getMasterDataPremier();
                            this.props.navigation.navigate(ZEST_CASA_STACK, {
                                screen: ZEST_CASA_SELECT_DEBIT_CARD,
                            });
                        } else {
                            showErrorToast({
                                message: DEBIT_CARD_CHECK_ERROR,
                            });
                        }
                    }
                );
            } else {
                showErrorToast({
                    message: DEBIT_CARD_CHECK_ERROR,
                });
            }
        } else {
            showErrorToast({
                message: DEBIT_CARD_CHECK_LOGIN_ERROR,
            });
            return;
        }
    };

    onResumeLoanPress = () => {
        this.onApplyLoanPress("Resume");
    };

    onApplyLoanPress = async (from) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: "Apply",
            [FA_TAB_NAME]: "Laon/Financing",
            [FA_ACTION_NAME]: "Apply Personal Loan/Financing-i",
        });
        const { plstpResumeResult, stpType } = this.state;
        const { getModel } = this.props;
        const { isOnboard } = getModel("user");
        if (!isOnboard || stpType === "TurnedOff") {
            this.navigateToStpPage(
                "Apply Loan",
                from === "Resume" ? LOAN_RESUME_URL : LOAN_NTB_URL
            );
            return;
        }
        if (plstpResumeResult?.stpRefNo) {
            this.setState({ showLoader: true });
            const httpResp = await invokeL3(true).catch((error) => {});
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return;

            if (plstpResumeResult.statusCode === "01") {
                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: "Apply",
                    [FA_TAB_NAME]: "Loan/Financing",
                    [FA_ACTION_NAME]: "Resume",
                });
                const response = await getResumeData();
                if (response?.data?.code === 200) {
                    const result = response?.data?.result || {};
                    this.resumeFlow(plstpResumeResult, result);
                } else {
                    this.setState({ showLoader: false });
                }
            } else if (plstpResumeResult.statusCode === "10") {
                logEvent(FA_SELECT_ACTION, {
                    [FA_SCREEN_NAME]: "Apply",
                    [FA_TAB_NAME]: "Loan/Financing",
                    [FA_ACTION_NAME]: "Counter Offer",
                });
                const data = { stpRefNo: plstpResumeResult?.stpRefNo };
                const response = await getCounterOfferData(data);
                if (response?.data?.code === 200) {
                    const result = response?.data?.result || {};
                    const initData = {
                        finalCarlosResponse: result?.carlosResponse,
                        counterOfferDecision: result?.counterOfferDecision,
                        stpRefNum: plstpResumeResult?.stpRefNo,
                        loanType: result?.loanType,
                    };
                    this.props.navigation.navigate(BANKINGV2_MODULE, {
                        screen: PLSTP_COUNTER_OFFER,
                        params: {
                            initParams: initData,
                        },
                    });
                } else {
                    this.setState({ showLoader: false });
                }
            } else {
                this.setState({ showLoader: false });
            }
        } else {
            logEvent(FA_SELECT_ACTION, {
                [FA_SCREEN_NAME]: "Apply",
                [FA_TAB_NAME]: "Loan/Financing",
                [FA_ACTION_NAME]: "Apply",
            });
            this.props.navigation.navigate(BANKINGV2_MODULE, {
                screen: PLSTP_LANDING_PAGE,
                params: {
                    entryStack: "More",
                    entryScreen: "Apply",
                },
            });
            applyCC.onPressApplyCC();
        }
    };

    resumeFlow = async (plstpResumeResult, resumeData) => {
        const { screenName, initData, s2uData } = await resumeFlow(
            plstpResumeResult,
            resumeData,
            this.props.getModel,
            this.props.updateModel
        );

        const { fullName } = this.props.getModel("user");
        this.setState({ showLoader: false });
        this.props.navigation.navigate(BANKINGV2_MODULE, {
            screen: screenName,
            params: {
                entryStack: "More",
                entryScreen: "Apply",
                initParams: initData,
                s2uData,
                fullName,
            },
        });
    };

    _handleFDCardPressed = () => {
        const {
            getModel,
            navigation: { navigate },
        } = this.props;
        const { isOnboard } = getModel("user");
        if (!isOnboard) {
            navigate("Onboarding");
            return;
        }
        applyFixedDeposit.onSelectfixedDeposit();

        navigate(FIXED_DEPOSIT_STACK, {
            screen: "FDEntryPointValidationScreen",
            params: {
                fdEntryPointModule: "More",
                fdEntryPointScreen: "Apply",
            },
        });
    };

    _handleServicesCardPressed = async () => {
        this.setState({
            isServicesLoading: true
        });
        const {
            navigation: { navigate },
        } = this.props;

        const { isOnboard } = this.props.getModel("user");

        if (!isOnboard) {
            navigate("Onboarding", {
                screen: "OnboardingStart",
            });
        } else {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;

            if (code !== 0) return;

            if (code === 0) {
                try {
                    const response = await checkzakatCutOffTimeAPI();
                    const { status, message } = response?.data ?? {};
                    if (status.toUpperCase() === SUCC_STATUS.toUpperCase()) {
                        await fetchAllAccounts(navigate);
                    } else {
                        showInfoToast({
                            message,
                        });
                    }
                } catch (error) {
                    this.setState({
                        isServicesLoading: false
                    });
                    showErrorToast({ message: error?.message ?? COMMON_ERROR_MSG });
                }
            }
        }
    };

    _handleAsbLCardPressed = async () => {
        const { isMainApplicantFlagEnable } = this.props.getModel("asbStpModule");

        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply",
            [FA_TAB_NAME]: "Loan/Financing",
            [FA_ACTION_NAME]: "Apply ASB Financing-i",
        });
        const { getModel } = this.props;
        const { isOnboard } = getModel("user");

        if (!isMainApplicantFlagEnable || !isOnboard) {
            this.navigateToStpPage("Apply Loans", ASB_NTB_URL);
        } else {
            const response = await checkDownTimeSwitch(true);
            const {
                navigation: { navigate },
            } = this.props;
            if (
                response &&
                response.data &&
                response.data.result &&
                response.data.result.statusCode == "0000"
            ) {
                navigate(ASB_STACK, {
                    screen: APPLY_LOANS,
                });
            } else {
                showErrorToast({
                    message: response.data.result.statusDesc,
                });
                navigate(DASHBOARD);
            }
        }
    };

    _handleAsbLCardResumePressed = async () => {
        logEvent(FA_SELECT_ACTION, {
            [FA_SCREEN_NAME]: "Apply",
            [FA_TAB_NAME]: "Loan/Financing",
            [FA_ACTION_NAME]: "Resume ASB Financing ",
        });
        this.setState({
            isNotificationResume: false,
        });
        const { getModel } = this.props;
        const userDetails = getModel("user");
        const { isMainApplicantFlagEnable } = getModel("asbStpModule");
        const { isOnboard } = userDetails;

        if (!isMainApplicantFlagEnable || !isOnboard) {
            this.navigateToStpPage("Resume Application", ASB_NTB_URL + "&isResume=true");
        } else {
            const response = await checkDownTimeSwitch(true);
            const {
                navigation: { navigate },
            } = this.props;
            if (isOnboard) {
                const httpResp = await invokeL3(true);
                const result = httpResp.data;
                const { code } = result;
                if (code !== 0) return;
                if (
                    response &&
                    response.data &&
                    response.data.result &&
                    response.data.result.statusCode === "0000"
                ) {
                    this.checkIsAppExpired();
                } else {
                    showErrorToast({
                        message: response.data.result.statusDesc,
                    });
                    navigate(DASHBOARD);
                }
            } else {
                this.props.navigation.navigate(ON_BOARDING_MODULE, {
                    screen: ON_BOARDING_M2U_USERNAME,
                    params: {
                        screenName: "Apply",
                    },
                });
            }
        }
    };

    _handleAsbLCardPendingAcceptancePressed = async () => {
        const { getModel } = this.props;
        const userDetails = getModel("user");
        const { isOnboard } = userDetails;
        const response = await checkDownTimeSwitch(true);
        const {
            navigation: { navigate },
        } = this.props;
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code != 0) return;
            if (
                response &&
                response.data &&
                response.data.result &&
                response.data.result.statusCode == "0000"
            ) {
                navigate(ASB_STACK, {
                    screen: APPROVEDFINANCEDETAILS,
                });
            } else {
                showErrorToast({
                    message: response.data.result.statusDesc,
                });
                navigate(DASHBOARD);
            }
        } else {
            this.props.navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_M2U_USERNAME,
                params: {
                    screenName: "Apply",
                },
            });
        }
    };

    _handlePLCardPressed = () => {
        this.navigateToStpPage("Apply Loans", LOAN_URL);
    };

    _handlePLCardResumePressed = () => {
        this.navigateToStpPage("Resume Application", LOAN_RESUME_URL);
    };

    _handleOnApplyCardPressed = async () => {
        const {
            navigation: { navigate },
            getModel,
        } = this.props;
        const { isOnboard } = getModel("user");
        const { ccEnable } = this.props.getModel("cardsStp");
        if (!ccEnable) {
            this.navigateToStpPage("Apply Cards", CARDS_URL);
            return;
        }
        // ETB password Flow L3 call to invoke login page
        if (isOnboard) {
            const request = await this.requestL3();
            if (!request) return;
        }
        resumeCardApplication.onPressResumeCardApplication();
        const param = {
            idType: "",
            icNo: "",
            birthDt: "",
            displayIdType: "",
            preOrPostFlag: isOnboard ? "postLogin" : "preLogin",
        };
        const url = isOnboard
            ? "loan/v1/cardStp/stpCustInqInfo"
            : "loan/ntb/v1/cardStp/stpCardMasterData";
        try {
            const httpResp = await cardsInquiry(param, url, isOnboard);
            const result = httpResp?.data?.result ?? null;
            if (result) {
                const { statusCode, statusDesc } = result;
                if (statusCode === "0000") {
                    /* if (isOnboard && staffInd && staffInd !== "N") {
                        showInfoToast({
                            message:
                                "We are sorry this service is not applicable for Maybank employee.",
                        });
                        return;
                    }

                    } */
                    applyCC.onPressApplyCC();

                    navigate("STPCardModule", {
                        screen: "CardsLanding",
                        params: {
                            serverData: result,
                            postLogin: isOnboard,
                            isResume: false,
                            entryStack: "More",
                            entryScreen: "Apply",
                        },
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    requestL3 = async () => {
        try {
            const response = await invokeL3(true);
            if (response && response.status === 200) return response;
            return null;
        } catch (error) {
            return null;
        }
    };

    _handleOnApplyCardResumePressed = async () => {
        const {
            navigation: { navigate },
            getModel,
        } = this.props;
        const { isOnboard } = getModel("user");
        const { ccEnable } = this.props.getModel("cardsStp");
        if (!ccEnable) {
            this.navigateToStpPage("Resume Application", CARD_NTB_URL + "&type=resume");
            return;
        }

        // ETB password Flow L3 call to invoke login page
        if (isOnboard) {
            const request = await this.requestL3();
            if (!request) return;
        }

        if (isOnboard) {
            // ETB Flow
            this._cardResumeETBApi(isOnboard);
        } else {
            // NTB Flow
            navigate("STPCardModule", {
                screen: "CardsIdResume",
                params: { postLogin: isOnboard, entryStack: "More", entryScreen: "Apply" },
            });
        }
    };

    _cardResumeETBApi = async (isOnboard) => {
        const {
            navigation: { navigate },
        } = this.props;
        const param = {
            idType: "",
            icNo: "",
            birthDt: "",
            displayIdType: "",
            preOrPostFlag: isOnboard ? "postLogin" : "preLogin",
        };
        const url = isOnboard
            ? "loan/v1/cardStp/getResumeData"
            : "loan/ntb/v1/cardStp/getResumeData";
        try {
            const httpResp = await cardsResume(param, url, isOnboard);
            const result = httpResp?.data?.result ?? null;
            if (result) {
                const { statusCode, statusDesc, completeSaveData } = result;
                if (statusCode === "0000") {
                    if (completeSaveData && completeSaveData.length <= 0) {
                        showErrorToast({
                            message: "Sorry, no resume application available.",
                        });
                        return;
                    }
                    navigate("STPCardModule", {
                        screen: "CardsResumeLanding",
                        params: {
                            postLogin: isOnboard,
                            serverData: {},
                            resumeData: result,
                            entryStack: "More",
                            entryScreen: "Apply",
                        },
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    _handleOnApplyCardSuppPressed = async () => {
        const {
            navigation: { navigate },
            getModel,
        } = this.props;
        const { isOnboard } = getModel("user");
        const { ccSuppEnable } = getModel("cardsStp");
        if (!ccSuppEnable) {
            this.navigateToStpPage("Apply Cards", CARD_SUPP_URL);
            return;
        }

        // ETB password Flow L3 call to invoke login page
        if (!isOnboard) {
            navigate("Onboarding");
            return;
        } else {
            const request = await this.requestL3();
            if (!request) return;
        }
        const url = "loan/v1/supp-card/suppCardEligibilityCheck";
        try {
            const httpResp = await cardsInquiryGET("", url, isOnboard);
            const result = httpResp?.data?.result ?? null;
            if (result) {
                const { statusCode, statusDesc } = result;
                if (statusCode === "0000") {
                    applySuppCard.onPressApplySuppCard();
                    navigate("STPSuppModule", {
                        screen: "CardSuppDetails",
                        params: {
                            serverData: result,
                            postLogin: isOnboard,
                            entryStack: "More",
                            entryScreen: "Apply",
                        },
                    });
                } else {
                    showErrorToast({
                        message: statusDesc || COMMON_ERROR_MSG,
                    });
                }
            }
        } catch (e) {
            showErrorToast({
                message: COMMON_ERROR_MSG,
            });
        }
    };

    _onInsurancePress = () => {
        this.navigateToStpPage("Apply Insurance", ETIQA_URL); // INS_NTB_URL
    };

    _onTakafulPress = () => {
        this.navigateToStpPage("Apply Insurance", TAKAFUL_URL);
    };
    _onTripTakafulPress = () => {
        this.navigateToStpPage("Apply Insurance", TRIPTAKAFUL_URL);
    };
    _onTripPress = () => {
        this.navigateToStpPage("Apply Insurance", TRIP_URL);
    };

    navigateToStpPage = (headerText, url) => {
        const {
            navigation: { navigate },
        } = this.props;

        navigate(BANKINGV2_MODULE, {
            screen: STP_PRODUCT_APPLY_SCREEN,
            params: { headerText, url },
        });
    };

    checkIfNtbCustomer = () => {
        const { getModel } = this.props;
        const { isPostLogin } = getModel("auth");
        const { isOnboard, isNTB } = getModel("user");
        return isNTB || !(isPostLogin && isOnboard);
    };

    _fetchCardData = (tabIndex) => {
        if (this.tabs[tabIndex].acctTypeName === "Cards") {
            const subUrl = "/summary";
            const params = "?type=C";
            bankingGetDataMayaM2u(subUrl + params, true)
                .then((response) => {
                    const { result } = response.data;
                    if (result != null) {
                        const { accountListings, jointAccAvailable } = result;
                        const eligibleCardsForSupplementary = accountListings.filter((cCard) => {
                            return cCard.primary === true;
                        });
                        if (eligibleCardsForSupplementary.length > 0) {
                            this.setState({ showSupplementaryOption: true });
                        }
                    } else {
                        return;
                    }
                })
                .catch((error) => {
                    return;
                });
        }
        return;
    };

    _handlePropertyCardPressed = async () => {
        const { isOnboard } = this.props.getModel("user");
        const { navigation } = this.props;

        if (!isOnboard) {
            navigation.navigate("Onboarding", {
                screen: PROPERTY_DASHBOARD,
            });
        } else {
            const { isConsentGiven } = this.props.getModel("property");

            const { isPostLogin, isPostPassword } = this.props.getModel("auth");
            if (!isPostPassword && !isPostLogin) {
                // L2 call to invoke login page
                const httpResp = await invokeL2(true).catch((error) => {});
                const code = httpResp?.data?.code ?? null;
                if (code != 0) return;
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

            // Age Eligibility Check
            const { isEligible, age } = await isAgeEligible(mdmData?.dob);
            if (!isEligible) {
                showInfoToast({
                    message: PROPERTY_AGE_ERR,
                });
                return;
            }

            // Nationality/PRIC Check
            const citizenship = mdmData?.citizenship ?? "";
            const idType = mdmData?.idType ?? "";
            if (citizenship !== "MYS" && idType !== "PRIC") {
                showInfoToast({
                    message: PROPERTY_NATIONALITY_ERR,
                });
                return;
            }

            const basicNavParams = getEligibilityBasicNavParams({
                masterData,
                mdmData,
                age,
                latitude: "",
                longitude: "",
            });

            navigation.navigate(BANKINGV2_MODULE, {
                screen: isConsentGiven ? CE_PROPERTY_NAME : CE_DECLARATION,
                params: {
                    ...basicNavParams,
                    from: MAE_ACC_DASHBOARD,
                    flow: "applyMortgage", // for GA logging different flow, reuse screen.
                },
            });

            logEvent(FA_FORM_PROCEED, {
                [FA_SCREEN_NAME]: "Apply",
                [FA_TAB_NAME]: "Loan/Financing",
            });
        }
    };

    onGuarantorResumePopupOpen = async () => {
        const { isOnboard } = this.props.getModel("user");
        if (isOnboard) {
            const httpResp = await invokeL3(true);
            const result = httpResp.data;
            const { code } = result;
            if (code !== 0) return;
        }
        this.setState({
            showPopupGuarantorResume: true,
        });
    };

    onPendingGuarantorApprovalPress = () => {
        const {
            navigation: { navigate },
        } = this.props;
        navigate(ASB_STACK, {
            screen: PENDING_GAURANTOR_APPROVAL,
        });
    };

    _handleGuarantorCardPressed = () => {
        this.setState({
            showPopupGuarantorResume: false,
            isNotificationResumeGuarantor: false,
            resumeFromLoginGuarantor: false,
        });
        nominateGuarantor(
            this.props,
            this.state.guarantorData?.stpReferenceNo,
            this.state.guarantorData?.mainApplicantName,
            this.state.guarantorData?.idNumber,
            this.state.guarantorData?.checkResumeApplication,
            this.state.guarantorData?.stpReferenceMAainApplicantNo,
            this.state.guarantorData?.stpStatusDesc
        );
    };

    onPopupClose = () => {
        this.setState({
            showPopup: false,
        });
    };

    onPopupGuarantorResumeClose = () => {
        this.setState({
            showPopupGuarantorResume: false,
        });
    };

    onClickOkay = async () => {
        this.setState({
            showPopup: false,
        });
        onClickOkay(this.props, true);
    };

    checkIsAppExpired = async () => {
        try {
            const data = {
                idNumber: this.props.prePostQualReducer && this.props.prePostQualReducer.idNo,
            };

            const body = {
                msgBody: {
                    logonInfo: "Y",
                },
            };
            const response = await applicationDetailsGetApi(body, true);
            const stpScreenResume = response?.data?.result?.msgBody?.stpApp?.stpScreenResume;
            const stpReferenceNo = response?.data?.result?.msgBody?.stpApp?.stpReferenceNo;
            const {
                navigation: { navigate },
            } = this.props;
            if (response?.data?.result?.msgHeader?.responseStatus === "ERROR") {
                showInfoToast({
                    message: APP_RESUME_EXPIRED,
                });
            } else {
                if (
                    this.state.isGuarantorNotEligible ||
                    this.state.isGuarantorDeclined ||
                    this.state.isGuarantorAccepted
                ) {
                    onClickOkay(
                        this.props,
                        true,
                        null,
                        this.state.isGuarantorNotEligible,
                        this.state.isGuarantorDeclined,
                        this.isGuarantorAccepted
                    );
                    this.setState({
                        isGuarantorNotEligible: false,
                        isGuarantorDeclined: false,
                        isGuarantorAccepted: false,
                    });
                } else {
                    this.setState({
                        showPopup: true,
                    });
                }
            }
        } catch (error) {}
    };

    render() {
        const {
            activeTabIndex,
            showFDTab,
            productList,
            activateProductList,
            showSupplementaryOption,
            showLoanCard,
            stpType,
            showLoader,
            showASBPendingAcceptanceCardCheck,
            showPendingGuarantorApprovalCheck,
            showASBResumeCardCheck,
            showGuarantorCard,
            checkGuarantorCardStatus,
        } = this.state;
        const { navigation } = this.props;
        const { propertyMetadata } = this.props.getModel("misc");
        const propertyIcon = propertyMetadata?.showMayaHome ?? false;

        const { showZakatService } = this.props.getModel("zakatService");

        return (
            <ScreenContainer
                backgroundType="color"
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoader}
            >
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    neverForceInset={["bottom"]}
                    useSafeArea
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} text="Apply" />
                            }
                        />
                    }
                >
                    {activeTabIndex >= 0 && (
                        <TabView
                            defaultTabIndex={activeTabIndex}
                            titles={[
                                "Accounts",
                                "Cards",
                                ...(showFDTab ? ["Fixed Deposits"] : []),
                                "Loan/Financing",
                                "Insurance",
                                ...(showZakatService ? ["Services"] : []),
                            ]}
                            onTabChange={this.handleTabChange}
                            scrollToEnd={false}
                            screens={[
                                <AccountsScreen
                                    navigation={navigation}
                                    productList={productList}
                                    activateProductList={activateProductList}
                                />,
                                <StpCardsTab
                                    onCardPressed={{
                                        mae: this.onApplyMAECardPress,
                                        cc: this._handleOnApplyCardPressed,
                                        dc: this.onApplyDebitCardPress,
                                        ccResume: this._handleOnApplyCardResumePressed,
                                        ccSupp: this._handleOnApplyCardSuppPressed,
                                    }}
                                    showSupplementary={true}
                                />,
                                ...(showFDTab
                                    ? [
                                          <StpFixedDepositsTab
                                              onCardPressed={this._handleFDCardPressed}
                                          />,
                                      ]
                                    : []),

                                <StpLoansTab
                                    key={!showFDTab ? "3" : "4"}
                                    onCardPressed={{
                                        loan: this.onApplyLoanPress,
                                        // instantloan: this.onApplyLoanPress,
                                        loanResume: this.onResumeLoanPress,
                                        asb: this._handleAsbLCardPressed,
                                        asbResume: this._handleAsbLCardResumePressed, // hide resume card
                                        asbPendingAcceptance:
                                            this._handleAsbLCardPendingAcceptancePressed,
                                        property: this._handlePropertyCardPressed,
                                        onGuarantorCardPress: this.onGuarantorResumePopupOpen,
                                        onPendingGuarantorApprovalPress:
                                            this.onPendingGuarantorApprovalPress,
                                    }}
                                    showCard={showLoanCard}
                                    type={stpType}
                                    showPropertyEntryPoint={propertyIcon}
                                    showASBResumeCard={showASBResumeCardCheck} // hide resume card
                                    showASBPendingAcceptanceCard={showASBPendingAcceptanceCardCheck}
                                    showPendingGuarantorApprovalCard={
                                        showPendingGuarantorApprovalCheck
                                    }
                                    showGuarantorCard={showGuarantorCard}
                                    checkGuarantorCardStatus={checkGuarantorCardStatus}
                                />,
                                <StpInsuranceTab
                                    key={!showFDTab ? "4" : "5"}
                                    insuraceList={this.state.insuraceList}
                                    onCardPressed={{
                                        etiqa: this._onInsurancePress,
                                        takaful: this._onTakafulPress,
                                        tripTakaful: this._onTripTakafulPress,
                                        trip: this._onTripPress,
                                    }}
                                    />,
                                    ...(showZakatService
                                        ? [
                                              <StpServicesTab
                                                  key={!showFDTab ? "5" : "6"}
                                                  onCardPressed={this._handleServicesCardPressed}
                                              />,
                                          ]
                                        : []),
                                ]}
                            />
                        )}
                        <Popup
                            visible={this.state.showPopup}
                            onClose={this.onPopupClose}
                            title="Welcome Back! 👋"
                            description="Let’s pick up where you have left off!"
                            primaryAction={{
                                text: "Okay",
                                onPress: this.onClickOkay,
                            }}
                        />
                        <Popup
                            visible={this.state.showPopupGuarantorResume}
                            onClose={this.onPopupGuarantorResumeClose}
                            title={WELCOME_BACK_RESUME}
                            description={WELCOME_BACK_RESUME_DESC}
                            primaryAction={{
                                text: OKAY,
                                onPress: this._handleGuarantorCardPressed,
                            }}
                        />
                    </ScreenLayout>
                </ScreenContainer>
        );
    }
}

ApplyDashboardTab.propTypes = {
    getModel: PropTypes.func,
    navigation: PropTypes.object,
    route: PropTypes.object,
    prePostQualReducer: PropTypes.object,
    // State
    debtCardNxtAct: PropTypes.string,
    hasDebitCard: PropTypes.bool,
    custStatus: PropTypes.string,
    // Dispatch
    debitCardInquiry: PropTypes.func,
    draftUserInqueryPremier: PropTypes.func,
    getMasterDataPremier: PropTypes.func,
    darftUserClearAll: PropTypes.func,
    clearPrePostReducer: PropTypes.func,
    clearALLZestReducer: PropTypes.func,
    updateUserStatus: PropTypes.func,
    checkDownTime: PropTypes.func,
    checkDownTimePremier: PropTypes.func,
};

const mapStateToProps = function (state) {
    const { prePostQualReducer } = state.asbServicesReducer;

    return {
        prePostQualReducer,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actionMasterData: (callback) => dispatch(masterData(callback)),
        resumeAction: (stpData, loanInformation) =>
            dispatch({
                type: "RESUME_SUCCESS",
                data: stpData,
                loanInformation,
            }),
        ASB_PREPOSTQUAL_CLEAR: () =>
            dispatch({
                type: ASB_PREPOSTQUAL_CLEAR,
            }),
    };
};

const styles = StyleSheet.create({
    fixedDepositContainer: { flex: 1, paddingTop: 12 },
    margins: { marginHorizontal: 24, marginTop: 12 },
    sectionHeader: { height: 20 },
});

export default withModelContext(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(
        downTimeServiceProps(
            prePostQualServiceProps(
                masterDataServiceProps(
                    draftUserInqueryProps(debitCardInquiryProps(ApplyDashboardTab))
                )
            )
        )
    )
);
