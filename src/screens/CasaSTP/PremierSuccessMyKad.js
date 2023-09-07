import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import { getAnalyticProductName } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import {
    MYKAD_PREMIER_ONBOARDING_SUCCESS,
    ACC_SUCC_NEW_HEADING,
    ACC_SUCC_NEW_PARA1,
    ACC_SUCC_NEW_PARA2,
    ACC_SUCC_NEW_PARA3,
    ACC_SUCC_CREATE_BUTTON,
    PREMIER_SUCCESS_MESSAGE,
    PREMIER_INITIAL_DEPOSIT,
} from "@constants/casaStrings";
import { ACTIVATE_ACCOUNT } from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PremierIntroScreen";

const PremierSuccessMyKad = (props) => {
    const { getModel } = useModelController();
    const { navigation, route } = props;
    const { filledUserDetails, identityType } = route.params;
    const isSuccessfulAccountActivation = route?.params?.isSuccessfulAccountActivation;
    const analyticScreenName = route?.params?.analyticScreenName;
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const referenceId = route?.params?.referenceId;
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const accountActivationAmount = masterDataReducer?.pm1ActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB;
    const [debitCardFee, setDebitCardFee] = useState(false);
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

    useEffect(() => {
        const pageDesc = masterDataReducer.casaPageDescriptionValue;
        if (pageDesc !== null) {
            setDebitCardFee(pageDesc[5]?.display);
        }
    }, [masterDataReducer]);

    const init = async () => {
        if (analyticScreenName) {
            GACasaSTP.onPremierActivation(analyticScreenName);

            if (needFormAnalytics) {
                if (referenceId) {
                    GACasaSTP.onPremierOtpVerificationDebitCardUnsucc(
                        analyticScreenName,
                        referenceId
                    );
                } else {
                    const analyticsProductCode = getAnalyticProductName(entryReducer?.productName);
                    GACasaSTP.onPremierSuccWithoutRef(analyticScreenName, analyticsProductCode);
                }
            }
        }
    };
    function onApplyM2U() {
        console.log("[PremierSuccessMyKad] >> [applyNowM2U]");
        GACasaSTP.onPremierSuccessMyKad(analyticScreenName);
        navigation.navigate("MAEModuleStack", {
            screen: navigationConstant.MAE_M2U_USERNAME,
            params: { filledUserDetails },
        });
    }

    function productActivateAmount() {
        if (entryReducer.isPM1 || entryReducer.isPMA) {
            return accountActivationAmount;
        } else if (entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
            return kawankuamoutActivateAmount;
        }
    }

    function capitalizeWord() {
        const nameArray = ACC_SUCC_CREATE_BUTTON.split(" ");
        nameArray[2] = `${nameArray[2].substring(0, 1).toUpperCase()}${nameArray[2].substring(
            1,
            nameArray[2].length
        )}`;
        return nameArray.join(" ");
    }

    return (
        <ScreenContainer backgroundType="color">
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
                            <SpaceFiller height={10} />
                            {onBoardingSuccess()}
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                {buildActionButton()}
            </ScreenLayout>
        </ScreenContainer>
    );

    function onBoardingSuccess() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={17}
                        fontWeight="600"
                        lineHeight={21}
                        textAlign="left"
                        text={
                            identityType === 1 && !isFromMaxTry
                                ? ACC_SUCC_NEW_HEADING
                                : PREMIER_SUCCESS_MESSAGE
                        }
                    />
                    <SpaceFiller height={36} />
                    {/* MAE Acc Created Label */}
                    <Typo
                        fontSize={13}
                        fontWeight="600"
                        lineHeight={21}
                        textAlign="left"
                        text={MYKAD_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={12} />
                    <View style={Style.containerStyle}>
                        <View>
                            <Typo lineHeight={19} textAlign="left" text="1." />
                        </View>
                        <Typo
                            lineHeight={19}
                            textAlign="left"
                            text={
                                identityType === 1 && !isFromMaxTry
                                    ? ACC_SUCC_NEW_PARA1
                                    : ACC_SUCC_CREATE_BUTTON
                            }
                            style={Style.marginLeftForBullet}
                        />
                    </View>
                    <SpaceFiller height={12} />
                    <View style={Style.containerStyle}>
                        <Typo lineHeight={19} textAlign="left" text="2." />
                        <Typo
                            lineHeight={19}
                            textAlign="left"
                            text={identityType === 1 ? ACC_SUCC_NEW_PARA2 : ACTIVATE_ACCOUNT}
                            style={Style.marginLeftForBullet}
                        />
                    </View>
                    <SpaceFiller height={12} />
                    {!isFromMaxTry ? (
                        <View style={Style.containerStyle}>
                            <Typo lineHeight={19} textAlign="left" text="3." />
                            <Typo
                                lineHeight={19}
                                textAlign="left"
                                text={
                                    identityType === 1
                                        ? ACC_SUCC_NEW_PARA3(debitCardFee)
                                        : PREMIER_INITIAL_DEPOSIT(productActivateAmount())
                                }
                                style={Style.marginLeftForBullet}
                            />
                        </View>
                    ) : null}

                    <SpaceFiller height={10} />
                </View>
            </View>
        );
    }

    function buildActionButton() {
        if (isSuccessfulAccountActivation) {
            return (
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={capitalizeWord()} />
                            }
                            onPress={onApplyM2U}
                        />
                    </View>
                </FixedActionContainer>
            );
        }
    }
};

export const successPropTypes = (PremierSuccessMyKad.propTypes = {
    ...entryPropTypes,
    isSuccessfulAccountActivation: PropTypes.bool,
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

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 30,
    },
    containerStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
    },
    marginLeftForBullet: {
        marginLeft: 10,
    },
});

export default PremierSuccessMyKad;
