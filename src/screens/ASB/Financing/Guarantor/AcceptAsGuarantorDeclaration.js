import moment from "moment";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
    goBackHomeScreen,
    navigatePDF,
    showPDFDoc,
} from "@screens/ASB/Financing/helpers/ASBHelpers";
import { updateDataOnReducerBaseOnApplicationDetails } from "@screens/ASB/Financing/helpers/CustomerDetailsPrefiller";

import {
    ASB_GUARANTOR_PERSONAL_INFORMATION,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS,
    ASB_GUARANTOR_FATCA_DECLARATION,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import {
    GUARANTOR_DECLARATION,
    GUARANTOR_DECLARATION_AGREE_TO_EXCUTE,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { YELLOW, DISABLED, TRANSPARENT } from "@constants/colors";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    PLSTP_PDS_BOLD,
    PLSTP_TNC_NOTE_MM,
    PLSTP_AGREE_NOTE,
    GUARANTOR_TNC_PG2,
    ASB_NON_OF_SPOUSE,
    GUARANTOR_TNC_PG4,
    TERMS_CONDITIONS,
    LEAVE,
    CONFIRM,
    KINDLY_CONFIRM,
    KINDLY_CONFIRM_DETAILS,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    LEAVE_DES,
    CANCEL,
    PRIVACY_STATEMENT,
    ASB_PRIVACY_AGREE,
    ASB_ALLOW_PROCESS,
    PLSTP_NOT_ALLOW_PROCESS,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_TERMSANDCONDITIONS,
    ASB_GUARANTOR_DISCLOSURE,
    GUARANTOR_TNC_PG5,
    LETTER_OF_GUARANTEE,
    GUARANTOR_TNC_PG6,
    AGREE_TO_EXECUTE,
    NO_AGGREE_TO_EXCUTE,
    ASB_NATIVE,
    LEAVE_APPLICATION_GA,
    D_MMMM_YYYY,
    DD_MM_YYYY,
} from "@constants/strings";
import {
    GUARANTOR_PDS_ISLAMIC,
    GUARANTOR_PDS_CONVENTIAL,
    GUARANTOR_TNC_ISLAMIC,
    GUARANTOR_TNC_CONVENTIAL,
    GUARANTOR_PDPA,
} from "@constants/url";

const AcceptAsGuarantorDeclaration = ({ navigation }) => {
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);

    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );

    const asbGuarantorGetDocumentReducer = useSelector(
        (state) => state.asbGuarantorGetDocumentReducer
    );

    const documentListDLB = asbGuarantorGetDocumentReducer?.documentListDLB;
    const documentDataDLB = asbGuarantorGetDocumentReducer?.documentDataDLB;

    const { isAcceptedDeclaration, isAgreeToExecute } = personalInformationReducer;

    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const additionalDetails = asbGuarantorPrePostQualReducer?.additionalDetails;
    const mainStpReferenceNo =
        asbGuarantorPrePostQualReducer?.data?.mainSTPReferenceNo ??
        additionalDetails?.stpReferenceNo;
    const { eligibilityCheckOutcomeData, lastUpdatedDate, resultAsbApplicationDetails } =
        asbGuarantorPrePostQualReducer;
    const dispatch = useDispatch();
    const [cancelPopup, setCancelPopup] = useState(false);
    const [confirmPopup, setConfirmPopup] = useState(false);

    function onBackTap() {
        navigation.navigate(ASB_GUARANTOR_FATCA_DECLARATION);
    }

    function onCloseTap() {
        setCancelPopup(true);
    }

    function onAgreeRadioButtonDidTap() {
        dispatch({ type: GUARANTOR_DECLARATION, isAcceptedDeclaration: "Y" });
    }

    function onDisagreeRadioButtonDidTap() {
        dispatch({ type: GUARANTOR_DECLARATION, isAcceptedDeclaration: "N" });
    }

    function onAgreeRadioButtonExecuteDidTap() {
        dispatch({ type: GUARANTOR_DECLARATION_AGREE_TO_EXCUTE, isAgreeToExecute: "Y" });
    }

    function onDisagreeRadioButtonExecuteDidTap() {
        dispatch({ type: GUARANTOR_DECLARATION_AGREE_TO_EXCUTE, isAgreeToExecute: "N" });
    }

    const onCancelPopupLeave = async () => {
        setConfirmPopup(false);
        setCancelPopup(false);
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: LEAVE_APPLICATION_GA,
        });
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    };

    function onCancelPopup() {
        setConfirmPopup(false);
        setCancelPopup(false);
    }

    const closeConfirmPopup = async () => {
        setConfirmPopup(false);
        updateApiCEP(() => {
            let isEmployeeDataMissing = false;

            if (
                !resultAsbApplicationDetails?.stpMaritalStatusDesc ||
                !resultAsbApplicationDetails?.stpEducationDesc ||
                (resultAsbApplicationDetails?.stpRaceDesc === ASB_NATIVE &&
                    !resultAsbApplicationDetails?.stpEthnicCode) ||
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
                navigation.navigate(ASB_GUARANTOR_PERSONAL_INFORMATION, {
                    isEmployeeDataMissing,
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
                    masterDataReducer,
                    eligibilityCheckOutcomeData,
                    dispatch,
                    navigation,
                    false,
                    false,
                    additionalDetails
                );
                navigation.navigate(ASB_GUARANTOR_EMPLOYMENT_DETAILS, {
                    currentSteps: 1,
                    totalSteps: 2,
                });
            } else {
                updateDataOnReducerBaseOnApplicationDetails(
                    resultAsbApplicationDetails,
                    masterDataReducer?.data,
                    eligibilityCheckOutcomeData,
                    dispatch,
                    navigation,
                    true,
                    true,
                    additionalDetails
                );
            }
        });
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "8",
            stpReferenceNo: stpReferenceNumber,
            declarePdpa: isAcceptedDeclaration,
            executeLetterOfGuarantee: isAgreeToExecute,
        };
        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    function onAgreeConfirm() {
        setConfirmPopup(true);
    }

    function onTNCLinkDidTap() {
        const dataSend = {
            title: "",
            source:
                additionalDetails?.stpTypeOfLoan === "I"
                    ? GUARANTOR_TNC_ISLAMIC
                    : GUARANTOR_TNC_CONVENTIAL,
            headerColor: TRANSPARENT,
        };
        navigatePDF(navigation, dataSend);
    }

    function onPDSLinkDidTap() {
        const dataSend = {
            title: "",
            source:
                additionalDetails?.stpTypeOfLoan === "I"
                    ? GUARANTOR_PDS_ISLAMIC
                    : GUARANTOR_PDS_CONVENTIAL,
            headerColor: TRANSPARENT,
        };
        navigatePDF(navigation, dataSend);
    }

    function onPrivacyLinkDidTap() {
        const dataSend = {
            title: "",
            source: GUARANTOR_PDPA,
            headerColor: TRANSPARENT,
        };
        navigatePDF(navigation, dataSend);
    }

    function onDisclosureDidTap() {
        showPDFDoc(
            mainStpReferenceNo,
            "DLB",
            dispatch,
            navigation,
            documentListDLB,
            documentDataDLB
        );
    }

    function onLetterOfGuaranteeDidTap() {
        showPDFDoc(
            mainStpReferenceNo,
            "LG",
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
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_TERMSANDCONDITIONS}
            >
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
                                    {buildPointParagraph(GUARANTOR_TNC_PG2)}
                                    <SpaceFiller height={24} />
                                    {buildDisclosureParagraph()}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph(ASB_NON_OF_SPOUSE)}
                                    <SpaceFiller height={24} />
                                    {buildPointParagraph(GUARANTOR_TNC_PG4)}
                                    <SpaceFiller height={24} />
                                    {buildPrivacyParagraph()}
                                    <SpaceFiller height={16} />
                                    {buildRadioButtonGroupView()}
                                    <SpaceFiller height={24} />
                                    {buildLetterOfGuaranteearagraph()}
                                    <SpaceFiller height={24} />
                                    {buildProductAndServicesParagraph()}
                                    <SpaceFiller height={24} />
                                </View>
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    disabled={!(isAgreeToExecute && isAcceptedDeclaration)}
                                    backgroundColor={
                                        isAgreeToExecute && isAcceptedDeclaration
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={PLSTP_AGREE} />
                                    }
                                    onPress={onAgreeConfirm}
                                />
                            </View>
                        </FixedActionContainer>
                        <Popup
                            visible={cancelPopup}
                            title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                            description={LEAVE_DES}
                            onClose={onCancelPopup}
                            primaryAction={{
                                text: LEAVE,
                                onPress: onCancelPopupLeave,
                            }}
                            secondaryAction={{
                                text: CANCEL,
                                onPress: onCancelPopup,
                            }}
                        />
                        <Popup
                            visible={confirmPopup}
                            title={KINDLY_CONFIRM}
                            description={
                                KINDLY_CONFIRM_DETAILS +
                                moment(lastUpdatedDate, DD_MM_YYYY).format(D_MMMM_YYYY) +
                                "."
                            }
                            onClose={onCancelPopup}
                            primaryAction={{
                                text: CONFIRM,
                                onPress: closeConfirmPopup,
                            }}
                            secondaryAction={{
                                text: LEAVE,
                                onPress: onCancelPopupLeave,
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
                    text={TERMS_CONDITIONS + ","}
                    onPress={onTNCLinkDidTap}
                />
                <Typo lineHeight={21} fontWeight="600" textAlign="left" text={" "} />

                <Typo
                    lineHeight={21}
                    fontWeight="600"
                    textAlign="left"
                    style={Style.underline}
                    text={PLSTP_PDS_BOLD}
                    onPress={onPDSLinkDidTap}
                />

                <Typo lineHeight={21} textAlign="left" text={PLSTP_TNC_NOTE_MM} />
            </Typo>
        );
    }

    function buildPrivacyParagraph() {
        return (
            <Typo lineHeight={21} textAlign="left">
                {ASB_PRIVACY_AGREE + " "}
                <Typo
                    lineHeight={21}
                    fontWeight="600"
                    textAlign="left"
                    style={Style.underline}
                    text={`${PRIVACY_STATEMENT}`}
                    onPress={onPrivacyLinkDidTap}
                />
            </Typo>
        );
    }

    function buildRadioButtonGroupView() {
        return (
            <React.Fragment>
                <View style={Style.radioOption}>
                    <RadioButton
                        style={Style.viewContainer}
                        isSelected={isAcceptedDeclaration === "Y"}
                        onRadioButtonPressed={onAgreeRadioButtonDidTap}
                        fontSize={14}
                        fontWeight="400"
                    />
                    <Typo
                        lineHeight={21}
                        textAlign="left"
                        text={`${ASB_ALLOW_PROCESS}`}
                        onPress={onAgreeRadioButtonDidTap}
                    />
                </View>
                <SpaceFiller height={15} />
                <View style={Style.radioOption}>
                    <RadioButton
                        style={Style.viewContainer}
                        isSelected={isAcceptedDeclaration === "N"}
                        onRadioButtonPressed={onDisagreeRadioButtonDidTap}
                        fontSize={14}
                        fontWeight="400"
                    />
                    <Typo
                        lineHeight={21}
                        textAlign="left"
                        text={`${PLSTP_NOT_ALLOW_PROCESS}`}
                        onPress={onDisagreeRadioButtonDidTap}
                    />
                </View>
            </React.Fragment>
        );
    }

    function buildPointParagraph(text) {
        return <Typo lineHeight={21} textAlign="left" text={text} />;
    }

    function buildDisclosureParagraph() {
        return (
            <Typo fontSize={14} lineHeight={21} textAlign="left">
                {"• "}
                <Typo
                    fontSize={14}
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

    function buildLetterOfGuaranteearagraph() {
        return (
            <React.Fragment>
                <Typo fontSize={14} lineHeight={21} textAlign="left">
                    {GUARANTOR_TNC_PG5}
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        fontWeight="600"
                        textAlign="left"
                        style={Style.underline}
                        text={LETTER_OF_GUARANTEE}
                        onPress={onLetterOfGuaranteeDidTap}
                    />
                    {GUARANTOR_TNC_PG6}
                </Typo>

                <SpaceFiller height={15} />
                <View style={Style.radioOption}>
                    <RadioButton
                        isSelected={isAgreeToExecute === "Y"}
                        onRadioButtonPressed={onAgreeRadioButtonExecuteDidTap}
                        fontSize={14}
                        fontWeight="400"
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        textAlign="left"
                        text={`${AGREE_TO_EXECUTE}`}
                        onPress={onAgreeRadioButtonExecuteDidTap}
                    />
                </View>
                <SpaceFiller height={15} />
                <View style={Style.radioOption}>
                    <RadioButton
                        isSelected={isAgreeToExecute === "N"}
                        onRadioButtonPressed={onDisagreeRadioButtonExecuteDidTap}
                        fontSize={14}
                        fontWeight="400"
                    />
                    <Typo
                        fontSize={14}
                        lineHeight={21}
                        textAlign="left"
                        text={`${NO_AGGREE_TO_EXCUTE}`}
                        onPress={onDisagreeRadioButtonExecuteDidTap}
                    />
                </View>
            </React.Fragment>
        );
    }

    function buildProductAndServicesParagraph() {
        return <Typo fontSize={14} lineHeight={21} textAlign="left" text={PLSTP_AGREE_NOTE} />;
    }
};

AcceptAsGuarantorDeclaration.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export const declarationPropTypes = (AcceptAsGuarantorDeclaration.propTypes = {
    // State
    isAgreeToBeContacted: PropTypes.string,
    privacyPolicy: PropTypes.string,
    fatcaStateDeclaration: PropTypes.string,
    termsAndConditions: PropTypes.string,
    isDeclarationContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updateAgreeToBeContacted: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearDeclarationReducer: PropTypes.func,
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
    radioOption: {
        alignItems: "flex-start",
        flexDirection: "row",
        paddingRight: 25,
    },
    underline: {
        textDecorationLine: "underline",
    },
    viewContainer: {
        top: 5,
    },
});

export default AcceptAsGuarantorDeclaration;
