import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    MAE_MODULE_STACK,
    PREMIER_RESIDENTIAL_DETAILS,
    APPLY_MAE_SCREEN,
    PREMIER_MODULE_STACK,
    PREMIER_ACTIVATION_CHOICE,
    PREMIER_PERSONAL_DETAILS,
    PREMIER_ACTIVATE_ACCOUNT,
    MORE,
    ACCOUNTS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import suitabilityAssessmentProps from "@redux/connectors/ZestCASA/suitabilityAssessmentConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import {
    CASA_STP_NTB_USER,
    PREMIER_CLEAR_ALL,
    MYKAD_ID_TYPE,
    PASSPORT_ID_TYPE,
    CASA_STP_FULL_ETB_USER,
} from "@constants/casaConfiguration";
import { PMA_SAI_ALERT } from "@constants/casaStrings";
import { YELLOW, DISABLED, SEPARATOR_GRAY, DARK_GREY, LIGHT_ORANGE } from "@constants/colors";
import {
    PLEASE_SELECT,
    ZEST_CASA_SUITABILITY_ASSESSMENT,
    ZEST_CASA_ZEST_EXPLANATION,
    ZEST_CASA_FINANCIAL_OBJECTIVE,
    ZEST_CASA_SUITABILITY_QUESTION_ONE,
    ZEST_CASA_SUITABILITY_QUESTION_TWO,
    ZEST_CASA_SUITABILITY_QUESTION_THREE,
    ZEST_CASA_SUITABILITY_QUESTION_FOUR,
    ZEST_CASA_SUITABILITY_QUESTION_FIVE,
    YES,
    NO,
    DECLARATION,
    ZEST_CASA_ACKNOWLEDGE_INFORMATION,
    ZEST_CASA_UNDERSTOOD_FEATURES,
    STEP1OF6,
    DONE,
    CANCEL,
    NEXT_SMALL_CAPS,
} from "@constants/strings";

import { APPLY_PMA_SUITABILITY_ASSESMENT } from "./helpers/AnalyticsEventConstants";
import { getSceneCode, isNTBUser } from "./helpers/CasaSTPHelpers";

const PremierSuitabilityAssessment = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();
    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        financialObjectiveIndex,
        hasDealtWithSecurities,
        hasRelevantKnowledge,
        hasInvestmentExperience,
        hasUnderstoodInvestmentAccount,
        hasUnderstoodAccountTerms,
        isSuitabilityAssessmentContinueButtonEnabled,
    } = props;

    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    useEffect(() => {
        props.checkButtonEnabled();
        const assesmentValues = [
            props.hasDealtWithSecurities,
            props.hasInvestmentExperience,
            props.hasRelevantKnowledge,
            props.hasUnderstoodAccountTerms,
            props.hasUnderstoodInvestmentAccount,
        ];
        const financialObjectiveIndex = props.financialObjectiveIndex;
        setIsAlertVisible(false);
        if (assesmentValues.includes(false) || financialObjectiveIndex === 0) {
            setIsAlertVisible(true);
        }
    }, [
        financialObjectiveIndex,
        hasDealtWithSecurities,
        hasRelevantKnowledge,
        hasInvestmentExperience,
        hasUnderstoodInvestmentAccount,
        hasUnderstoodAccountTerms,
        isSuitabilityAssessmentContinueButtonEnabled,
    ]);

    const [isAlertVisible, setIsAlertVisible] = useState(false);

    function onCloseTap() {
        // Clear all data from Premier reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        const { userStatus } = prePostQualReducer;
        if (isSuitabilityAssessmentContinueButtonEnabled) {
            const { isEKYCDone } = getModel("isEKYCDone");
            const eKycParams = {
                selectedIDType:
                    identityDetailsReducer.identityType === 1 ? MYKAD_ID_TYPE : PASSPORT_ID_TYPE,
                entryStack: MORE,
                entryScreen: ACCOUNTS_SCREEN,
                navigateToNextStack: PREMIER_MODULE_STACK,
                navigateToNextScreen:
                    !isEKYCDone && !isNTBUser(userStatus)
                        ? PREMIER_ACTIVATE_ACCOUNT
                        : PREMIER_PERSONAL_DETAILS,
                exceedLimitScreen: PREMIER_ACTIVATION_CHOICE,
                entryParams: { from: "eKYC" },
                from: userStatus,
                idNo: props?.identityNumber
                    ? props?.identityNumber
                    : identityDetailsReducer?.identityNumber,
                fullName: "",
                passportCountry: "",
                passportCountryCode: "",
                reqType: "E01",
                isNameCheck: false,
                sceneCode: getSceneCode(entryReducer),
                isPM1: entryReducer.isPM1,
                isPMA: entryReducer.isPMA,
                isKawanku: entryReducer.isKawanku,
                isKawankuSavingsI: entryReducer.isKawankuSavingsI,
            };
            if (identityDetailsReducer.identityType === 1 && userStatus === CASA_STP_NTB_USER) {
                navigation.navigate(MAE_MODULE_STACK, {
                    screen: APPLY_MAE_SCREEN,
                    params: {
                        eKycParams,
                    },
                });
            } else if (
                identityDetailsReducer.identityType !== 1 &&
                userStatus !== CASA_STP_FULL_ETB_USER
            ) {
                navigation.navigate(PREMIER_PERSONAL_DETAILS);
            } else {
                navigation.navigate(PREMIER_RESIDENTIAL_DETAILS);
            }
        }
    }

    function onBackTap() {
        navigation.goBack();
    }

    function handleInfoPopup() {
        setIsPopupVisible(!isPopupVisible);
    }

    function onFinancialObjectiveDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: financialObjectiveIndex,
            filterType: "",
            data: props.financialObjective,
        });
    }

    function scrollPickerOnPressDone(data, index) {
        setIsAlertVisible(false);
        props.updateFinancialObjective(index, data);
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    return (
        <ScreenContainer
            backgroundType="color"
            analyticScreenName={APPLY_PMA_SUITABILITY_ASSESMENT}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={15}
                                text={STEP1OF6}
                                color={DARK_GREY}
                            />
                        }
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
                        {buildHeader()}
                        {buildForm()}
                        <SpaceFiller height={24} />
                        {alertContent()}
                        <SpaceFiller height={24} />
                        {buildDeclarationSection()}
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={
                                props.isSuitabilityAssessmentContinueButtonEnabled ? 1 : 0.5
                            }
                            backgroundColor={
                                props.isSuitabilityAssessmentContinueButtonEnabled
                                    ? YELLOW
                                    : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={NEXT_SMALL_CAPS} />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <Popup
                visible={isPopupVisible}
                title={ZEST_CASA_SUITABILITY_ASSESSMENT}
                description={ZEST_CASA_ZEST_EXPLANATION}
                onClose={handleInfoPopup}
            />
            <ScrollPickerView
                showMenu={scrollPicker.isDisplay}
                list={scrollPicker.data}
                selectedIndex={scrollPicker.selectedIndex}
                onRightButtonPress={scrollPickerOnPressDone}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
        </ScreenContainer>
    );

    function buildHeader() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.headerContainer}>
                    <Typo
                        lineHeight={21}
                        textAlign="left"
                        text={ZEST_CASA_SUITABILITY_ASSESSMENT}
                    />
                    <TouchableOpacity onPress={handleInfoPopup}>
                        <Image
                            source={require("@assets/Fitness/info_black.png")}
                            style={Style.infoImage}
                        />
                    </TouchableOpacity>
                </View>
                <SpaceFiller height={4} />
                <Typo
                    fontWeight="600"
                    lineHeight={21}
                    textAlign="left"
                    text="Premier Mudharabah Account-i is an account where its profit is tied to the performance of the underlying assets"
                />
            </View>
        );
    }

    function buildForm() {
        return (
            <View style={Style.contentContainer}>
                <TitleAndDropdownPill
                    title={ZEST_CASA_FINANCIAL_OBJECTIVE}
                    titleFontWeight="400"
                    dropdownTitle={props?.financialObjectiveValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onFinancialObjectiveDropdownPillDidTap}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={21} textAlign="left" text={ZEST_CASA_SUITABILITY_QUESTION_ONE} />
                {buildRadioButtonGroupView(hasDealtWithSecurities, props.updateSecuritiesAnswer)}
                <SpaceFiller height={24} />
                <Typo lineHeight={21} textAlign="left" text={ZEST_CASA_SUITABILITY_QUESTION_TWO} />
                {buildRadioButtonGroupView(
                    hasRelevantKnowledge,
                    props.updateRelevantKnowledgeAnswer
                )}
                <SpaceFiller height={24} />
                <Typo
                    lineHeight={21}
                    textAlign="left"
                    text={ZEST_CASA_SUITABILITY_QUESTION_THREE}
                />
                {buildRadioButtonGroupView(
                    hasInvestmentExperience,
                    props.updateInvestmentExperienceAnswer
                )}
                <SpaceFiller height={24} />
                <Typo lineHeight={21} textAlign="left" text={ZEST_CASA_SUITABILITY_QUESTION_FOUR} />
                {buildRadioButtonGroupView(
                    hasUnderstoodInvestmentAccount,
                    props.updateUnderstandInvestmentAccountAnswer
                )}
                <SpaceFiller height={24} />
                <Typo lineHeight={21} textAlign="left" text={ZEST_CASA_SUITABILITY_QUESTION_FIVE} />
                {buildRadioButtonGroupView(
                    hasUnderstoodAccountTerms,
                    props.updateUnderstandAccountTermsAnswer
                )}
            </View>
        );
    }

    function buildDeclarationSection() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.separator} />
                <SpaceFiller height={24} />
                <Typo
                    fontWeight="600"
                    lineHeight={21}
                    textAlign="left"
                    text={`${DECLARATION}:`}
                    color={DARK_GREY}
                />
                <SpaceFiller height={8} />
                <Typo
                    lineHeight={21}
                    textAlign="left"
                    text={`1. ${ZEST_CASA_UNDERSTOOD_FEATURES}`}
                    color={DARK_GREY}
                />
                <SpaceFiller height={8} />
                <Typo
                    lineHeight={21}
                    textAlign="left"
                    color={DARK_GREY}
                    text={`2. ${ZEST_CASA_ACKNOWLEDGE_INFORMATION}`}
                />
                <SpaceFiller height={40} />
            </View>
        );
    }

    function flexObject(value) {
        return {
            flex: value,
        };
    }

    function alertContent() {
        return (
            isAlertVisible && (
                <View style={Style.alertContentWrapper}>
                    <View style={flexObject(0.07)}>
                        <Image
                            source={require("@assets/icons/warning16.png")}
                            style={Style.infoImageWarning}
                        />
                    </View>
                    <View style={flexObject(0.93)}>
                        <Typo
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={16}
                            textAlign="left"
                            text={PMA_SAI_ALERT}
                        />
                    </View>
                </View>
            )
        );
    }
};

function buildRadioButtonGroupView(answer, dispatch) {
    return (
        <>
            <View style={Style.radioContentContainer}>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={() => dispatch(true)}
                    >
                        {answer === true ? <RadioChecked checkType="color" /> : <RadioUnchecked />}

                        <View style={Style.radioButtonTitle}>
                            <Typo fontWeight="600" lineHeight={20} textAlign="left" text={YES} />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={() => dispatch(false)}
                    >
                        {answer === false ? <RadioChecked checkType="color" /> : <RadioUnchecked />}

                        <View style={Style.radioButtonTitle}>
                            <Typo fontWeight="600" lineHeight={20} textAlign="left" text={NO} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

PremierSuitabilityAssessment.propTypes = {
    ...downTimeServicePropTypes,
    ...masterDataServicePropTypes,

    // State
    financialObjectiveIndex: PropTypes.number,
    financialObjectiveValue: PropTypes.object,
    hasDealtWithSecurities: PropTypes.bool,
    hasRelevantKnowledge: PropTypes.bool,
    hasInvestmentExperience: PropTypes.bool,
    hasUnderstoodInvestmentAccount: PropTypes.bool,
    hasUnderstoodAccountTerms: PropTypes.bool,
    isSuitabilityAssessmentContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updateFinancialObjective: PropTypes.func,
    updateSecuritiesAnswer: PropTypes.func,
    updateRelevantKnowledgeAnswer: PropTypes.func,
    updateInvestmentExperienceAnswer: PropTypes.func,
    updateUnderstandInvestmentAccountAnswer: PropTypes.func,
    updateUnderstandAccountTermsAnswer: PropTypes.func,
    checkButtonEnable: PropTypes.func,
    clearSuitabilityAssessmentReducer: PropTypes.func,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    headerContainer: {
        alignItems: "center",
        flexDirection: "row",
    },

    infoImageWarning: {
        height: 14,
        width: 16,
        marginTop: 1,
    },

    radioButtonContainer: {
        flexDirection: "row",
        marginRight: 40,
        marginTop: 16,
    },

    radioButtonTitle: {
        marginLeft: 12,
    },

    radioCheckContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    radioContentContainer: {
        flexDirection: "row",
    },

    separator: {
        backgroundColor: SEPARATOR_GRAY,
        height: 1,
        width: "100%",
    },

    alertContentWrapper: {
        flex: 1,
        flexDirection: "row",
        marginHorizontal: 24,
        padding: 12,
        backgroundColor: LIGHT_ORANGE,
        borderRadius: 8,
    },
    infoImage: {
        height: 16,
        width: 16,
        marginLeft: 5,
        marginTop: 0.8,
    },
});

export default downTimeServiceProps(
    masterDataServiceProps(entryProps(suitabilityAssessmentProps(PremierSuitabilityAssessment)))
);
