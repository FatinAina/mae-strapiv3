import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import { getAnalyticProductName } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import { MORE } from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import {
    ACTIVATION_SUCCESSFUL_CARD_SUCCESSFUL,
    ACTIVATION_SUCCESSFUL_CARD_UNSUCCESSFUL,
    M2U_PREMIER_ONBOARDING_SUCCESS,
    PREMIER_VISIT_BRANCH,
    PREMIER_INITIAL_DEPOSIT,
    PREMIER_M2U_ID,
    APPLICATION_SUBMITTED,
    MYKAD_PREMIER_ONBOARDING_SUCCESS,
    CASA_ZOLOS_MAX_TRY_PARA_FIRST,
    VISIT_BRANCH_TEXT,
} from "@constants/casaStrings";
import { FADE_GREY, YELLOW, ROYAL_BLUE, BLACK } from "@constants/colors";
import {
    ACTIVATION_SUCCESSFUL,
    DOITLATER_READY,
    DONE,
    DUMMY_AMT,
    DEBIT_CARD_FEE,
    CDD_ACCOUNT_NUMBER,
    DATE_AND_TIME,
    ACCCOUNT_TYPE,
    APPLY_DEBIT_CARD,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { updateWalletBalance } from "@utils/dataModel/utilityWallet";

import Assets from "@assets";

import { entryPropTypes } from "./PremierIntroScreen";

const PremierActivationSuccess = ({ route, navigation }) => {
    const { getModel, updateModel } = useModelController();
    const isSuccessfulAccountActivation = route?.params?.isSuccessfulAccountActivation;
    const isHighRiskUserResume = route?.params?.isHighRiskUserResume;
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    const onApplyDebitCardButtonDidTap = route?.params?.onApplyDebitCardButtonDidTap;
    const accountNumber = route?.params?.accountNumber;
    const accountType = route?.params?.accountType;
    const dateAndTime = route?.params?.dateAndTime;
    const analyticScreenName = route?.params?.analyticScreenName || "";
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const referenceId = route?.params?.referenceId;
    const isEtbUser = route?.params?.isEtbUser;
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const description = route?.params?.description;
    const debitCardStatusCode = route?.params?.debitCardStatusCode;
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const { exceedLimitScreen } = getModel("isFromMaxTry") || false;
    const [isFromMaxTry] = useState(exceedLimitScreen);

    const animateFadeInUp = {
        0: {
            opacity: 0,
            translateY: 10,
        },
        1: {
            opacity: 1,
            translateY: 0,
        },
    };

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[AccountActivationSuccess] >> [init]");
        if (needFormAnalytics && analyticScreenName) {
            if (referenceId) {
                GACasaSTP.onPremierOtpVerificationDebitCardUnsucc(analyticScreenName, referenceId);
            } else {
                const accountName = getAnalyticProductName(entryReducer?.productName);
                GACasaSTP.onPremierSuccWithoutRef(analyticScreenName, accountName);
            }
        }
        // [[UPDATE_BALANCE]] Update balance from response if transaction is success
        const { isUpdateBalanceEnabled } = getModel("wallet");

        if (isUpdateBalanceEnabled && isSuccessfulAccountActivation) {
            updateWalletBalance(updateModel);
        }
    };
    const getDescription = () =>
        debitCardStatusCode === "000"
            ? ACTIVATION_SUCCESSFUL_CARD_SUCCESSFUL
            : ACTIVATION_SUCCESSFUL_CARD_UNSUCCESSFUL;
    const applyDebitCard = () => debitCardStatusCode === "000";

    const donePressForMaxTry = () => {
        navigation.navigate(MORE);
    };

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                header={<View />}
                useSafeArea
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View>
                            <Animatable.Image
                                animation={animateFadeInUp}
                                delay={500}
                                duration={500}
                                source={Assets.onboardingSuccessBg}
                                style={Style.backgroundImage}
                                useNativeDriver
                            />
                            {isFromMaxTry
                                ? buildSuccessfulViewMaxTry()
                                : isHighRiskUserResume
                                ? buildSuccessfulViewResume()
                                : buildSuccessfulView()}
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                {buildActionButton()}
            </ScreenLayout>
        </ScreenContainer>
    );

    function buildSuccessfulViewResume() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo fontWeight="600" lineHeight={18} textAlign="left" text={PREMIER_M2U_ID} />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={16}
                        lineHeight={20}
                        textAlign="left"
                        text={M2U_PREMIER_ONBOARDING_SUCCESS}
                        color={FADE_GREY}
                    />
                    <SpaceFiller height={16} />
                    <Text style={Style.listNum}>1. {PREMIER_VISIT_BRANCH}</Text>
                    <Text style={Style.listNum}>2. {PREMIER_INITIAL_DEPOSIT(DUMMY_AMT)}</Text>
                </View>
            </View>
        );
    }

    function buildSuccessfulViewMaxTry() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontWeight="600"
                        lineHeight={17}
                        textAlign="left"
                        text={APPLICATION_SUBMITTED}
                    />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={16}
                        lineHeight={26}
                        textAlign="left"
                        text={
                            masterDataReducer.casaPageDescriptionValue.filter(
                                (ele) => ele.value === VISIT_BRANCH_TEXT
                            )[0].display
                        }
                    />
                    <SpaceFiller height={16} />
                    <Typo
                        fontWeight="600"
                        fontSize={12}
                        lineHeight={19}
                        textAlign="left"
                        text={MYKAD_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={8} />
                    <View style={Style.containerStyle}>
                        <View style={Style.whiteBulletCls} />
                        <Typo
                            lineHeight={21}
                            textAlign="left"
                            text={CASA_ZOLOS_MAX_TRY_PARA_FIRST}
                            style={Style.typoView}
                        />
                    </View>
                </View>
            </View>
        );
    }
    function buildSuccessfulView() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontWeight="600"
                        lineHeight={17}
                        textAlign="left"
                        text={ACTIVATION_SUCCESSFUL}
                    />
                    <SpaceFiller height={8} />
                    <Typo
                        fontSize={13}
                        lineHeight={18}
                        textAlign="left"
                        text={
                            debitCardStatusCode === null || isEtbUser
                                ? description
                                : getDescription()
                        }
                        color={FADE_GREY}
                    />
                    <SpaceFiller height={25} />
                    {accountType ? (
                        <View style={Style.rowedContainer}>
                            <View style={Style.descriptionBox}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={ACCCOUNT_TYPE}
                                />
                            </View>
                            <View style={Style.dataBox}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="right"
                                    text={accountType}
                                />
                            </View>
                        </View>
                    ) : null}
                    {accountType ? <SpaceFiller height={16} /> : null}
                    {accountNumber ? (
                        <View style={Style.rowedContainer}>
                            <View style={Style.descriptionBox}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={18}
                                    textAlign="left"
                                    text={CDD_ACCOUNT_NUMBER}
                                />
                            </View>
                            <View style={Style.dataBox}>
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="right"
                                    text={DataModel.spaceBetweenChar(accountNumber)}
                                />
                            </View>
                        </View>
                    ) : null}
                    {accountNumber ? <SpaceFiller height={16} /> : null}
                    {applyDebitCard() ? (
                        <>
                            <View style={Style.rowedContainer}>
                                <View style={Style.descriptionBox}>
                                    <Typo
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        text={DEBIT_CARD_FEE}
                                    />
                                </View>
                                <View style={Style.dataBox}>
                                    <Typo
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={18}
                                        textAlign="right"
                                        text={`RM ${masterDataReducer.debitCardApplicationAmount}`}
                                    />
                                </View>
                            </View>
                        </>
                    ) : null}
                    {applyDebitCard() ? <SpaceFiller height={16} /> : null}
                    <View style={Style.rowedContainer}>
                        <View style={Style.descriptionBox}>
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                textAlign="left"
                                text={DATE_AND_TIME}
                            />
                        </View>
                        <View style={Style.dataBox}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={18}
                                textAlign="right"
                                text={dateAndTime}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    function buildActionButton() {
        if (isSuccessfulAccountActivation || isFromMaxTry) {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            <SpaceFiller height={16} />

                            {debitCardStatusCode === null && onApplyDebitCardButtonDidTap ? (
                                <>
                                    <ActionButton
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        componentCenter={
                                            <Typo
                                                lineHeight={18}
                                                fontWeight="600"
                                                text={APPLY_DEBIT_CARD}
                                            />
                                        }
                                        onPress={onApplyDebitCardButtonDidTap}
                                    />
                                    <SpaceFiller height={16} />
                                    <View style={Style.bottomBtnContCls}>
                                        <TouchableOpacity
                                            onPress={onDoneButtonDidTap}
                                            activeOpacity={0.8}
                                        >
                                            <Typo
                                                color={ROYAL_BLUE}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={DOITLATER_READY}
                                                textAlign="left"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <ActionButton
                                        fullWidth
                                        backgroundColor={YELLOW}
                                        borderWidth={1}
                                        componentCenter={
                                            <Typo lineHeight={18} fontWeight="600" text={DONE} />
                                        }
                                        onPress={
                                            isFromMaxTry ? donePressForMaxTry : onDoneButtonDidTap
                                        }
                                    />
                                </>
                            )}
                        </View>
                    </View>
                </FixedActionContainer>
            );
        } else {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <TouchableOpacity onPress={onDoneButtonDidTap} activeOpacity={0.8}>
                            <Typo
                                color={ROYAL_BLUE}
                                fontWeight="600"
                                lineHeight={18}
                                text={DOITLATER_READY}
                                textAlign="left"
                            />
                        </TouchableOpacity>
                    </View>
                </FixedActionContainer>
            );
        }
    }
};

export const successPropTypes = (PremierActivationSuccess.propTypes = {
    ...entryPropTypes,
    isSuccessfulAccountActivation: PropTypes.bool,
    onDoneButtonDidTap: PropTypes.func,
    onApplyDebitCardButtonDidTap: PropTypes.func,
});

const Style = StyleSheet.create({
    backgroundImage: {
        width: "100%",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    buttonContainer: {
        flexDirection: "column",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
    listNum: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 14,
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: 20,
        marginTop: 8,
    },
    descriptionBox: {
        width: 153,
    },
    rowedContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dataBox: {
        width: 160,
    },
    containerStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
    },
    whiteBulletCls: {
        marginTop: 6.5,
        width: 6,
        height: 6,
        borderRadius: 6,
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: BLACK,
    },
    typoView: {
        marginLeft: 10,
    },
});

export default PremierActivationSuccess;
