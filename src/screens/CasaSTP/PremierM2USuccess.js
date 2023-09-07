import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector } from "react-redux";

import { getAnalyticProductName } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import {
    PREMIER_INITIAL_DEPOSIT,
    PREMIER_VISIT_BRANCH,
    M2U_PREMIER_ONBOARDING_SUCCESS,
    PREMIER_M2U_ID_PASSPORT,
} from "@constants/casaStrings";
import { BLACK } from "@constants/colors";
import { DONE } from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PremierIntroScreen";

const PremierM2USuccess = ({ route }) => {
    const onDoneButtonDidTap = route?.params?.onDoneButtonDidTap;
    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const accountActivationAmount = masterDataReducer?.pm1ActivationAmountNTB;
    const kawankuamoutActivateAmount = masterDataReducer?.kawanKuActivationAmountNTB;
    const analyticScreenName = route?.params?.analyticScreenName || "";
    const needFormAnalytics = route?.params?.needFormAnalytics;
    const referenceId = route?.params?.referenceId;

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
        console.log("[PremierM2USuccess] >> [init]");

        if (needFormAnalytics && analyticScreenName) {
            if (referenceId) {
                GACasaSTP.onPremierActivationWithRef(analyticScreenName, referenceId);
            } else {
                const accountName = getAnalyticProductName(entryReducer?.productName);
                GACasaSTP.onPremierSuccWithoutRef(analyticScreenName, accountName);
            }
        }
    };

    function productActivateAmount() {
        if (entryReducer.isPM1 || entryReducer.isPMA) {
            return accountActivationAmount;
        } else if (entryReducer.isKawanku || entryReducer.isKawankuSavingsI) {
            return kawankuamoutActivateAmount;
        }
    }

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
                                source={Assets.onboardingM2UAccountSuccessBg}
                                style={Style.backgroundImage}
                                useNativeDriver
                            />
                            <SpaceFiller height={50} />
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
                        fontWeight="600"
                        lineHeight={18}
                        textAlign="left"
                        text={PREMIER_M2U_ID_PASSPORT}
                    />
                    <SpaceFiller height={20} />
                    {/* MAE Acc Created Label */}
                    <Typo
                        fontSize={16}
                        lineHeight={20}
                        textAlign="left"
                        text={M2U_PREMIER_ONBOARDING_SUCCESS}
                    />
                    <SpaceFiller height={12} />
                    <Text style={Style.listNum}>1. {PREMIER_VISIT_BRANCH}</Text>
                    <Text style={Style.listNum}>
                        2. {PREMIER_INITIAL_DEPOSIT(productActivateAmount())}
                    </Text>
                    <SpaceFiller height={10} />
                </View>
            </View>
        );
    }

    function buildActionButton() {
        return (
            <FixedActionContainer>
                <View style={Style.bottomBtnContCls}>
                    <ActionButton
                        fullWidth
                        componentCenter={<Typo lineHeight={18} fontWeight="600" text={DONE} />}
                        onPress={onDoneButtonDidTap}
                    />
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (PremierM2USuccess.propTypes = {
    ...entryPropTypes,
    onDoneButtonDidTap: PropTypes.func,
});

const Style = StyleSheet.create({
    backgroundImage: {
        marginTop: 6,
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
        marginBottom: 60,
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
});

export default PremierM2USuccess;
