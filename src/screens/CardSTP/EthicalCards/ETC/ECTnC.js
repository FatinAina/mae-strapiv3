import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

import {
    STP_CARD_MODULE,
    EC_CONFIRMATION,
    SETTINGS_MODULE,
    MORE,
    APPLY_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { MEDIUM_GREY, YELLOW, BLACK } from "@constants/colors";
import {
    DECLARATION,
    TNC_ALLOW_PROCESS_PI,
    TNC_NOT_ALLOW_PROCESS_PI,
    PLSTP_AGREE_NOTE,
    PLSTP_AGREE,
    STP_TNC,
    PLSTP_PDS_BOLD,
    FATCA_DECLARATION,
    MAE_FATCA_ACT,
    PRIVACY_NOTICE,
} from "@constants/strings";
import {
    ETHICAL_CARDS_TNC_URL,
    ETHICAL_CARDS_TNC_PDS_URL,
    ETHICAL_CARDS_TNC_DECLARATION_URL,
    ETHICAL_CARDS_TNC_FATCA_URL,
    ETHICAL_CARDS_TNC_PRIVACY_NOTICE_URL,
} from "@constants/url";

import Assets from "@assets";

function ECTnC({ route, navigation }) {
    const [radioPNYesChecked, setRadioPNYesChecked] = useState(true);
    const [radioPNNoChecked, setRadioPNNoChecked] = useState(false);

    const onBackPress = () => {
        console.log("[ECTnC] >> [onBackPress]");

        navigation.canGoBack() && navigation.goBack();
    };

    function onCloseTap() {
        console.log("[ECTnC] >> [onCloseTap]");
        navigation.navigate(route?.params?.entryStack || MORE, {
            screen: route?.params?.entryScreen || APPLY_SCREEN,
            params: route?.params?.entryParams,
        });
    }

    function onRadioBtnPNTap(params) {
        console.log("[ECTnC] >> [onRadioBtnPNTap]");
        const radioBtnId = params.radioBtnId;
        if (radioBtnId === "Yes") {
            setRadioPNYesChecked(true);
            setRadioPNNoChecked(false);
        } else if (radioBtnId === "No") {
            setRadioPNYesChecked(false);
            setRadioPNNoChecked(true);
        }
    }

    function onLinkPress(linkType) {
        console.log("[ECTnC] >> [onLinkPress]" + linkType);
        const props = getPdfProps(linkType);

        if (props) {
            navigation.navigate(SETTINGS_MODULE, {
                screen: "PdfSetting",
                params: props,
            });
        }
    }

    function getPdfProps(linkType) {
        console.log("[ECTnC] >> [getPdfProps]" + linkType);
        switch (linkType) {
            case "TNC":
                return {
                    title: STP_TNC,
                    source: ETHICAL_CARDS_TNC_URL,
                };
            case "PDS":
                return {
                    title: PLSTP_PDS_BOLD,
                    source: ETHICAL_CARDS_TNC_PDS_URL,
                };
            case "DECLARATION":
                return {
                    title: FATCA_DECLARATION,
                    source: ETHICAL_CARDS_TNC_DECLARATION_URL,
                };
            case "FATCA":
                return {
                    title: MAE_FATCA_ACT,
                    source: ETHICAL_CARDS_TNC_FATCA_URL,
                };
            case "PN":
                return {
                    title: PRIVACY_NOTICE,
                    source: ETHICAL_CARDS_TNC_PRIVACY_NOTICE_URL,
                };

            default:
                return null;
        }
    }

    function onContinue() {
        console.log("[ECTnC] >> [onContinue]");
        const navParams = route?.params ?? {};
        const isTnNCAgree = radioPNYesChecked;

        /* Navigate to Confirmation screen */
        navigation.navigate(STP_CARD_MODULE, {
            screen: EC_CONFIRMATION,
            params: { ...navParams, isTnNCAgree },
        });
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackPress} />}
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    useSafeArea
                >
                    <>
                        <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                lineHeight={24}
                                text={DECLARATION}
                                textAlign="left"
                            />
                            {/* Tnc, PDS */}
                            <Typo
                                lineHeight={20}
                                letterSpacing={0}
                                textAlign="left"
                                style={[styles.termsText, styles.fieldViewCls]}
                            >
                                <Text>{`I have read and agree to be bound by the `}</Text>
                                <TypographyWithLink
                                    text="Terms and Conditions,"
                                    type="TNC"
                                    onPress={onLinkPress}
                                />
                                <Text>{` `}</Text>
                                <TypographyWithLink
                                    text="Product Disclosure Sheet(s)."
                                    type="PDS"
                                    onPress={onLinkPress}
                                />
                            </Typo>

                            {/* FATCA */}
                            <Typo
                                lineHeight={20}
                                letterSpacing={0}
                                textAlign="left"
                                style={[styles.termsText, styles.fieldViewCls]}
                            >
                                <Text>{`I have read and confirm that I do not meet the definition being a U.S. person and fall under any of the said indicias mentioned in the `}</Text>
                                <TypographyWithLink
                                    text="Foreign Account Tax Compliance Act (FATCA)."
                                    type="FATCA"
                                    onPress={onLinkPress}
                                />
                            </Typo>

                            {/* Declaration */}
                            <Typo
                                lineHeight={20}
                                letterSpacing={0}
                                textAlign="left"
                                style={[styles.termsText, styles.fieldViewCls]}
                            >
                                <Text>{`I confirmed that I am not a tax resident of any juridistions (other than Malaysia) and shall be governed by this `}</Text>
                                <TypographyWithLink
                                    text="Declaration and Common Reporting Standard Requirement."
                                    type="DECLARATION"
                                    onPress={onLinkPress}
                                />
                            </Typo>

                            {/* Privacy Notice */}
                            <Typo
                                lineHeight={20}
                                letterSpacing={0}
                                textAlign="left"
                                style={[styles.termsText, styles.fieldViewCls]}
                            >
                                <Text>{`I have read, agree and accept the terms of The Maybank Group `}</Text>
                                <TypographyWithLink
                                    text="Privacy Notice."
                                    type="PN"
                                    onPress={onLinkPress}
                                />
                                <Text>{` For marketing or products and services by Maybank Group/other entities reffered to in the Privacy Notice: `}</Text>
                            </Typo>

                            {/*Radio options */}
                            <View style={styles.groupContainer}>
                                <RadioButtonText
                                    btnId="Yes"
                                    onPress={onRadioBtnPNTap}
                                    isSelected={radioPNYesChecked === true}
                                    text={TNC_ALLOW_PROCESS_PI}
                                />

                                <SpaceFiller height={25} />

                                <RadioButtonText
                                    btnId="No"
                                    onPress={onRadioBtnPNTap}
                                    isSelected={radioPNNoChecked}
                                    text={TNC_NOT_ALLOW_PROCESS_PI}
                                />
                            </View>

                            {/* Agree */}
                            <Typo
                                lineHeight={20}
                                text={PLSTP_AGREE_NOTE}
                                textAlign="left"
                                style={styles.fieldViewCls}
                            />
                        </ScrollView>

                        {/* Bottom Container */}
                        <FixedActionContainer>
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                style={styles.countinueButton}
                                componentCenter={
                                    <Typo
                                        color={BLACK}
                                        lineHeight={18}
                                        fontWeight="600"
                                        text={PLSTP_AGREE}
                                    />
                                }
                                onPress={onContinue}
                            />
                        </FixedActionContainer>
                    </>
                </ScreenLayout>
            </ScreenContainer>
        </>
    );
}

const TypographyWithLink = ({ text, type, onPress }) => {
    const onLinkPress = () => {
        if (onPress) onPress(type);
    };

    return (
        <Typo
            lineHeight={20}
            fontWeight="600"
            textAlign="left"
            style={styles.textUnderline}
            text={text}
            onPress={onLinkPress}
        />
    );
};

TypographyWithLink.propTypes = {
    text: PropTypes.string,
    type: PropTypes.string,
    onPress: PropTypes.func,
};

function RadioButtonText({ btnId, onPress, isSelected, text }) {
    const onItemPress = () => {
        if (onPress) onPress({ radioBtnId: btnId });
    };

    return (
        <TouchableOpacity style={styles.radioContainer} onPress={onItemPress}>
            <Image
                style={styles.tickImage}
                source={isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked}
            />
            <Typo textAlign="left" lineHeight={18} text={text} style={styles.radioButtonText} />
        </TouchableOpacity>
    );
}

RadioButtonText.propTypes = {
    btnId: PropTypes.string,
    onPress: PropTypes.func,
    isSelected: PropTypes.bool,
    text: PropTypes.string,
};

ECTnC.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    fieldViewCls: {
        marginTop: 25,
    },
    groupContainer: {
        marginTop: 25,
    },
    radioContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },
    termsText: {
        flexWrap: "wrap",
        flex: 1,
    },
    textUnderline: {
        textDecorationLine: "underline",
    },
    tickImage: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    countinueButton: {
        marginTop: 15,
    },
});

export default ECTnC;
