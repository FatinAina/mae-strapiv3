import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { navigatePDF, showPDFDoc } from "@screens/ASB/Financing/helpers/ASBHelpers";

import { ASB_GUARANTOR_SUCCESS, DASHBOARD, APPLY_LOANS } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { updateApiCEP } from "@services";
import { logEvent } from "@services/analytics";

import { GUARANTOR_DECLARATION_AGREE_ACTION } from "@redux/actions/ASBFinance/guarantorDeclarationAction";
import { asbSendNotification } from "@redux/services/ASBServices/asbSendNotification";

import { YELLOW, TRANSPARENT } from "@constants/colors";
import { DT_RECOM } from "@constants/data";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    TERMS_CONDITIONS,
    CONFIRM,
    CANCEL,
    NOTIFY_GUARANTOR,
    NOTIFY_GUARANTOR_DETAILS,
    PLSTP_TNC_NOTE_MM,
    ASB_GUARANTOR_TNC_DESC_1,
    ASB_GUARANTOR_DISCLOSURE,
    ASB_GUARANTOR_TNC_DESC_2,
    ASB_GUARANTOR_TNC_DESC_3,
    ASB_GUARANTOR_TNC_DESC_4,
    APPLY_ASBFINANCING_ADDGUARANTOR_DECLARATION,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    APPLY_ASBFINANCING_ADDGUARANTOR_NOTIFYGUARANTOR,
    TNC_COVENTIOANL,
    TNC_ISLAMIC,
} from "@constants/strings";
import { ASB_GUARANTOR_TNC_CONVENTIONAL_URL, ASB_GUARANTOR_TNC_ISLAMIC_URL } from "@constants/url";

const GuarantorDeclaration = ({ navigation }) => {
    // Hooks for dispatch reducer action
    const dispatch = useDispatch();
    const asbGuarantorGetDocumentReducer = useSelector(
        (state) => state.asbGuarantorGetDocumentReducer
    );
    const guarantorIdentityDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorIdentityDetailsReducer
    );
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const financeDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.financeDetailsReducer
    );
    const stpGrossIncome = resumeReducer?.stpDetails?.stpLoanAmount;
    const cPrInstallmentAmount =
        resumeReducer?.stpDetails?.cPrInstallmentAmount ??
        resumeReducer?.stpDetails?.stpMonthlyInstalment;
    const cPrInterestRate =
        resumeReducer?.stpDetails?.cPrInterestRate ?? resumeReducer?.stpDetails?.stpInterestRate;
    const cPrTotalGrossPremium =
        resumeReducer?.stpDetails?.cPrTotalGrossPremium ??
        resumeReducer?.stpDetails?.stpTotalGrossPremium;
    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;

    const [confirmPopup, setConfirmPopup] = useState(false);

    const documentListDLB = asbGuarantorGetDocumentReducer?.documentListDLB;
    const documentDataDLB = asbGuarantorGetDocumentReducer?.documentDataDLB;

    const eligibilityReducer = useSelector((state) => state.eligibilityReducer);

    const eligibilityDataNew =
        eligibilityReducer?.eligibilitData ?? resumeReducer?.stpDetails?.stpEligibilityResponse;

    console.log("resumeReducer==>", eligibilityDataNew);

    function onBackTap() {
        navigation.goBack();
    }

    function onClickClose() {
        navigation.navigate(DASHBOARD);
    }

    function onCancelPopup() {
        setConfirmPopup(false);
    }

    function onAgreeConfirm() {
        setConfirmPopup(true);
    }

    async function closeConfirmPopup() {
        setConfirmPopup(false);
        dispatch({ type: GUARANTOR_DECLARATION_AGREE_ACTION, agreeDeclaration: true });
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: APPLY_ASBFINANCING_ADDGUARANTOR_NOTIFYGUARANTOR,
        });

        const eligibilityData =
            eligibilityReducer?.eligibilitData ?? resumeReducer?.stpDetails?.stpEligibilityResponse;

        let eligibilityCheckOutcome;
        if (
            eligibilityData?.eligibilityCheckOutcome !== null ||
            eligibilityData?.eligibilityCheckOutcome !== undefined ||
            eligibilityData?.eligibilityCheckOutcome
        ) {
            eligibilityCheckOutcome = eligibilityData?.eligibilityCheckOutcome;
        } else {
            eligibilityCheckOutcome = JSON.parse(eligibilityData)?.eligibilityCheckOutcome;
        }
        let eligibilityResult = {};
        eligibilityCheckOutcome.map((data) => {
            eligibilityResult = data;
            if (data.dataType === DT_RECOM) {
                eligibilityResult = data;
            }
        });
        const body = {
            stpReferenceNo: stpReferenceNumber,
            guarantorEmail: guarantorIdentityDetailsReducer?.emailAddress,
            guarantorMobileNumber: guarantorIdentityDetailsReducer?.mobileNumberWithoutExtension,
            loanAmount: stpGrossIncome
                ? numeral(stpGrossIncome).format(",0.00")
                : numeral(eligibilityResult?.loanAmount).format(",0.00"),
            loanTenure: eligibilityResult?.minTenure,
            profitRate: `${numeral(cPrInterestRate).format(",0.00")}`,
            monthlyPayment: `${numeral(cPrInstallmentAmount).format(",0.00")}`,
            takaful: numeral(cPrTotalGrossPremium).format(",0.00"),
            guarantorName: guarantorIdentityDetailsReducer?.fullName,
        };

        const updateCEP = {
            screenNo: "17",
            stpReferenceNo: stpReferenceNumber,
        };

        const response = await updateApiCEP(updateCEP, false);
        const result = response?.data?.result;
        if (result) {
            dispatch(
                asbSendNotification(body, () => {
                    navigation.navigate(ASB_GUARANTOR_SUCCESS, {
                        onCloseTap: () => {
                            navigation.popToTop();
                            navigation.navigate(APPLY_LOANS);
                        },
                        onDoneTap: () => {
                            navigation.popToTop();
                            navigation.navigate(APPLY_LOANS);
                        },
                    });
                })
            );
        } else {
            console.warn("Something went wrong");
        }
    }

    function onTNCLinkDidTap() {
        const dataSend = {
            title: financeDetailsReducer.loanTypeIsConv ? TNC_COVENTIOANL : TNC_ISLAMIC,
            source: financeDetailsReducer.loanTypeIsConv
                ? ASB_GUARANTOR_TNC_CONVENTIONAL_URL
                : ASB_GUARANTOR_TNC_ISLAMIC_URL,
            headerColor: TRANSPARENT,
        };
        navigatePDF(navigation, dataSend);
    }

    function onDisclosureDidTap() {
        showPDFDoc(
            stpReferenceNumber,
            "DLB",
            dispatch,
            navigation,
            documentListDLB,
            documentDataDLB
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCING_ADDGUARANTOR_DECLARATION}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerRightElement={<HeaderCloseButton onPress={onClickClose} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={Style.formContainer}>
                                <View style={Style.contentContainer}>
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={DECLARATION}
                                    />
                                    <SpaceFiller height={24} />
                                    {buildTNCParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph(ASB_GUARANTOR_TNC_DESC_1)}
                                    <SpaceFiller height={24} />
                                    {buildDisclosureParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph(ASB_GUARANTOR_TNC_DESC_2)}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph(ASB_GUARANTOR_TNC_DESC_3)}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph(ASB_GUARANTOR_TNC_DESC_4)}
                                    <SpaceFiller height={24} />
                                </View>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={1}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={PLSTP_AGREE} />
                                    }
                                    onPress={onAgreeConfirm}
                                />
                            </View>
                        </FixedActionContainer>
                        <Popup
                            visible={confirmPopup}
                            title={NOTIFY_GUARANTOR}
                            description={NOTIFY_GUARANTOR_DETAILS}
                            onClose={onCancelPopup}
                            primaryAction={{
                                text: CONFIRM,
                                onPress: closeConfirmPopup,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: onCancelPopup,
                            }}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildTNCParagraph() {
        return (
            <Typo lineHeight={21} textAlign="left">
                {PLSTP_TNC_NOTE}
                <Typo
                    lineHeight={21}
                    fontWeight="600"
                    textAlign="left"
                    style={Style.underline}
                    text={TERMS_CONDITIONS}
                    onPress={onTNCLinkDidTap}
                />
                <Typo lineHeight={21} fontWeight="600" textAlign="left" text={" "} />

                <Typo lineHeight={21} textAlign="left" text={PLSTP_TNC_NOTE_MM} />
            </Typo>
        );
    }

    function buildPointParagraph(text) {
        return <Typo lineHeight={21} textAlign="left" text={text} />;
    }

    function buildDisclosureParagraph() {
        return (
            <Typo lineHeight={21} textAlign="left">
                {"• "}
                <Typo
                    lineHeight={21}
                    fontWeight="600"
                    textAlign="left"
                    style={Style.underline}
                    text={ASB_GUARANTOR_DISCLOSURE}
                    onPress={onDisclosureDidTap}
                />
            </Typo>
        );
    }
};

export const declarationPropTypes = (GuarantorDeclaration.propTypes = {
    navigation: PropTypes.object,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
    underline: {
        textDecorationLine: "underline",
    },
});

export default GuarantorDeclaration;
