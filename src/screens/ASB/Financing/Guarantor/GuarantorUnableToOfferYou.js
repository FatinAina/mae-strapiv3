import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView, Platform, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { FADE_GREY } from "@constants/colors";
import { DONE, GUARANTOR_HARD_FAIL_HEADING, GUARANTOR_HARD_FAIL_DESC } from "@constants/strings";

import Assets from "@assets";

const GuarantorUnableToOfferYou = ({ route }) => {
    const title = route?.params?.title;
    const subTitle = route?.params?.subTitle;
    const onDoneTap = route?.params?.onDoneTap;

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
    const windowHeight = Dimensions.get("window").height;
    // Get 10% of entire window's height
    const partialWindowHeight = Math.round(windowHeight * 0.4);

    return (
        <React.Fragment>
            <ScreenContainer backgroundType="color">
                <Animatable.Image
                    animation={animateFadeInUp}
                    delay={500}
                    duration={500}
                    source={Assets.Illustration}
                    style={Style.backgroundImage}
                    useNativeDriver
                />

                <ScreenLayout paddingHorizontal={0} paddingBottom={0} paddingTop={0} useSafeArea>
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View>
                                    <SpaceFiller height={partialWindowHeight} />
                                    {buildSuccessfulView()}
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildSuccessfulView() {
        return (
            <View style={Style.contentContainer}>
                <View style={Style.formContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={28}
                        textAlign="left"
                        text={title ?? GUARANTOR_HARD_FAIL_HEADING}
                    />
                    <SpaceFiller height={16} />
                    <Typo
                        lineHeight={18}
                        textAlign="left"
                        text={subTitle ?? GUARANTOR_HARD_FAIL_DESC}
                        color={FADE_GREY}
                    />
                    <SpaceFiller height={25} />
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
                        onPress={onDoneTap}
                    />
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (GuarantorUnableToOfferYou.propTypes = {
    route: PropTypes.object,
});

const Style = StyleSheet.create({
    backgroundImage: {
        position: "absolute",
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
        marginBottom: 40,
    },
});

export default GuarantorUnableToOfferYou;
