import PropTypes from "prop-types";
import React, { Component } from "react";
import { ImageBackground, View, StyleSheet } from "react-native";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { BulletText } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW, MEDIUM_GREY, BLACK } from "@constants/colors";
import * as Strings from "@constants/strings";

import { navigateToHomeDashboard } from "@utils/dataModel/utilityDashboard";

import Assets from "@assets";

import * as TopupController from "./TopupController";

class TopUpIntro extends Component {
    static propTypes = {
        navigation: PropTypes.object,
        route: PropTypes.object,
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    onContinueButtonPress = () => {
        console.log("[TopUpIntro] >> [onContinueButtonPress]");
        TopupController.callMergeFPXPanList(this.props.route.params);
    };

    onCloseTap = () => {
        console.log("[TopUpIntro] >> [onCloseTap]");

        navigateToHomeDashboard(this.props.navigation, { refresh: true });
    };

    render() {
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        header={
                            <HeaderLayout
                                headerCenterElement={
                                    <Typo
                                        text="Top up"
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={18}
                                    />
                                }
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                        useSafeArea
                        neverForceInset={["bottom"]}
                        paddingHorizontal={24}
                    >
                        <React.Fragment>
                            <View style={styles.formContainer}>
                                {/* Top Up Intro Image */}
                                <View style={styles.topupIntroLogoCls}>
                                    <ImageBackground
                                        resizeMode="cover"
                                        style={{ width: 67, height: 95 }}
                                        source={Assets.maeTopupIntroIcon}
                                    />
                                </View>

                                {/* Header */}
                                <Typo
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={18}
                                    color={BLACK}
                                    fontWeight="600"
                                    text={Strings.TOPUP_INTRO_HEADER}
                                    style={styles.topupIntroHeaderCls}
                                />

                                {/* Desc */}
                                <Typo
                                    textAlign="left"
                                    fontSize={14}
                                    lineHeight={18}
                                    color={BLACK}
                                    fontWeight="600"
                                    text={Strings.TOPUP_INTRO_DESC}
                                    style={styles.topupIntroDescCls}
                                />

                                {/* Bullet Texts */}
                                <BulletText
                                    label={Strings.CDM_LABEL}
                                    paramContainerCls={styles.topUpIntroBulletTextContCls}
                                />
                                <BulletText
                                    label={Strings.OB_LABEL}
                                    paramContainerCls={styles.topUpIntroBulletTextContCls}
                                />
                                <BulletText
                                    label={Strings.DC_LABEL}
                                    paramContainerCls={styles.topUpIntroBulletTextContCls}
                                />
                            </View>
                            {/* Confirm Button */}
                            <View style={styles.footerContainer}>
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    backgroundColor={YELLOW}
                                    borderRadius={24}
                                    componentCenter={
                                        <Typo
                                            fontSize={14}
                                            fontWeight="600"
                                            lineHeight={18}
                                            text="Continue"
                                        />
                                    }
                                    onPress={this.onContinueButtonPress}
                                />
                            </View>
                        </React.Fragment>
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

export default withModelContext(TopUpIntro);

const styles = StyleSheet.create({
    formContainer: {
        marginHorizontal: 36,
    },
    topupIntroLogoCls: {
        width: "100%",
        alignItems: "center",
        marginBottom: 17,
    },
    topupIntroHeaderCls: {
        marginTop: 24,
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 14,
        lineHeight: 23,
        fontStyle: "normal",
        fontWeight: "600",
        letterSpacing: 0,
    },
    topupIntroDescCls: {
        marginTop: 10,
        marginBottom: 20,
        color: "#000000",
        fontFamily: "montserrat",
        fontSize: 20,
        lineHeight: 30,
        fontStyle: "normal",
        fontWeight: "300",
        letterSpacing: 0,
    },
    topUpIntroBulletTextContCls: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 12,
        width: "100%",
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
});
