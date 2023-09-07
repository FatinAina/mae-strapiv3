import React from "react";
import { Image, StyleSheet, View, ScrollView, Platform, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { getAnalyticScreenName, getSceneCode } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import {
    PREMIER_MODULE_STACK,
    MORE,
    PREMIER_ACTIVATE_ACCOUNT,
    PREMIER_ACTIVATION_CHOICE,
    PREMIER_PERSONAL_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import { PREMIER_CLEAR_ALL } from "@constants/casaConfiguration";
import {
    CASA_ZOLOS_MAX_TRY_HEADER,
    CASA_ZOLOS_MAX_TRY_SUB_HEADER,
    CASA_ZOLOS_MAX_TRY_PARA_HEADER,
    CASA_ZOLOS_MAX_TRY_PARA_FIRST,
} from "@constants/casaStrings";
import { BLACK, ROYAL_BLUE } from "@constants/colors";
import {
    ZEST_CASA_ACTIVATE_ACCOUNT_TITLE,
    ZEST_CASA_ACTIVATION_CHOICE_REQUIREMENTS,
    ZEST_CASA_MAKE_TRANSFER,
    ACTIVATE_NOW,
    DOITLATER_READY,
    OKAY,
    ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION_ACTIVATE,
} from "@constants/strings";

import Assets from "@assets";

import { entryPropTypes } from "./PremierIntroScreen";
import { EKYC_MAX_RETRY } from "./helpers/AnalyticsEventConstants";

const PremierActivationChoice = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};
    const { filledUserDetails, isFromCaptureDocument } = params;
    const dispatch = useDispatch();
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    function onCloseTap() {
        console.log("[PremierActivationChoice] >> [onCloseTap]");
        dispatch({ type: PREMIER_CLEAR_ALL });
        navigation.navigate(MORE);
    }

    function onActivateNowButtonDidTap() {
        console.log("[PremierActivationChoice] >> [onActivateNowButtonDidTap]");
        if (filledUserDetails) {
            const {
                onBoardDetails,
                onBoardDetails2,
                entryStack,
                entryScreen,
                entryParams,
                pan,
                accountNumber,
            } = filledUserDetails;
            GACasaSTP.onActivateNowButtonDidTap(analyticScreenName);
            const eKycParams = {
                selectedIDType: onBoardDetails2?.selectedIDType,
                entryStack,
                entryScreen,
                entryParams,
                from: onBoardDetails2?.from,
                idNo: onBoardDetails2?.idNo,
                fullName: onBoardDetails?.fullName,
                pan,
                accountNumber,
                reqType: "E01",
                isNameCheck: false,
                sceneCode: getSceneCode(onBoardDetails2),
                isPM1: entryReducer.isPM1,
                isPMA: entryReducer.isPMA,
                isKawanku: entryReducer?.isKawanku,
                isKawankuSavingsI: entryReducer?.isKawankuSavingsI,
            };
            navigation.navigate(PREMIER_MODULE_STACK, {
                screen: !isFromCaptureDocument
                    ? PREMIER_ACTIVATE_ACCOUNT
                    : PREMIER_PERSONAL_DETAILS,
                params: { filledUserDetails, eKycParams, isFromMaxTry: isFromCaptureDocument },
            });
        }
    }
    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_ACTIVATION_CHOICE,
        ""
    );

    function onLaterTap() {
        GACasaSTP.onClickMaybeLater(analyticScreenName);
        navigation.navigate(MORE);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            analyticScreenName={!isFromCaptureDocument ? analyticScreenName : EKYC_MAX_RETRY}
        >
            <ScreenLayout
                header={
                    <HeaderLayout headerRightElement={<HeaderCloseButton onPress={onCloseTap} />} />
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
                        <View style={Style.formContainer}>
                            <View style={Style.applyImageView}>
                                <Image
                                    style={Style.applyImage}
                                    resizeMode="contain"
                                    source={Assets.MAE_Bank_User}
                                />
                            </View>
                            <SpaceFiller height={24} />
                            <View style={Style.contentContainer}>
                                <Typo
                                    lineHeight={21}
                                    textAlign="left"
                                    text={
                                        !isFromCaptureDocument
                                            ? ZEST_CASA_ACTIVATE_ACCOUNT_TITLE
                                            : CASA_ZOLOS_MAX_TRY_HEADER
                                    }
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={
                                        !isFromCaptureDocument
                                            ? ZEST_CASA_ACTIVATION_CHOICE_DESCRIPTION_ACTIVATE
                                            : CASA_ZOLOS_MAX_TRY_SUB_HEADER
                                    }
                                />
                                <SpaceFiller height={24} />
                                <Typo
                                    fontSize={16}
                                    lineHeight={22}
                                    textAlign="left"
                                    text={
                                        !isFromCaptureDocument
                                            ? ZEST_CASA_ACTIVATION_CHOICE_REQUIREMENTS
                                            : CASA_ZOLOS_MAX_TRY_PARA_HEADER
                                    }
                                />
                            </View>
                        </View>
                        <View style={Style.pealHourRow}>
                            <View style={Style.bulletDot} />
                            <View style={Style.listItemRow}>
                                <Typo
                                    lineHeight={22}
                                    textAlign="left"
                                    text={
                                        !isFromCaptureDocument
                                            ? ZEST_CASA_MAKE_TRANSFER
                                            : CASA_ZOLOS_MAX_TRY_PARA_FIRST
                                    }
                                />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <View style={Style.buttonContainer}>
                            <ActionButton
                                fullWidth
                                componentCenter={
                                    <Typo
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={!isFromCaptureDocument ? ACTIVATE_NOW : OKAY}
                                    />
                                }
                                onPress={onActivateNowButtonDidTap}
                            />
                        </View>
                    </View>
                </FixedActionContainer>
                {!isFromCaptureDocument ? (
                    <FixedActionContainer>
                        <View style={Style.bottomBtnContCls}>
                            <TouchableOpacity onPress={onLaterTap} activeOpacity={0.8}>
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
                ) : null}
            </ScreenLayout>
        </ScreenContainer>
    );
};

export const activationChoicePropTypes = (PremierActivationChoice.propTypes = {
    ...entryPropTypes,
});

const Style = StyleSheet.create({
    applyImage: {
        height: 64,
        width: 61,
    },

    applyImageView: {
        alignItems: "center",
        marginTop: 36,
        width: "100%",
    },

    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    bulletDot: {
        backgroundColor: BLACK,
        borderRadius: 8 / 2,
        height: 8,
        marginRight: 8,
        width: 8,
    },

    buttonContainer: {
        flexDirection: "column",
        width: "100%",
        marginBottom: Platform.OS === "ios" ? 20 : null,
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 16,
    },

    listItemRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        alignSelf: "flex-start",
        flexDirection: "column",
        justifyContent: "flex-start",
        marginTop: -6,
    },

    pealHourRow: {
        alignContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 10,
        width: "100%",
        paddingLeft: 24,
        paddingRight: 48,
    },
});

export default withModelContext(PremierActivationChoice);
