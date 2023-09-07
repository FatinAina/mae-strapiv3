import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { EKYC_INIT } from "@screens/ZestCASA/helpers/AnalyticsEventConstants";

import {
    APPLY_SCREEN,
    CAPTURE_ID_SCREEN,
    MORE,
    ACCOUNTS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, BLACK } from "@constants/colors";
import {
    ENSURE_FACE_FITS_FRAME,
    ENSURE_MYKAD_PASSPORT_READABLE,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    FIND_PLACE_LIGHTING,
    ZEST_CASA_KYC_ENTRY_DESCRIPTION,
    EXTRACT_PERSONAL_INFO,
    NEXT_SMALL_CAPS,
} from "@constants/strings";

import Assets from "@assets";

class ApplyMAEScreen extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails || {},
            eKycParams: props.route?.params?.eKycParams || {},
            userName: props.route?.params?.eKycParams?.fullName || "",
        };
        console.log("ApplyMAEScreen:state----------", this.state);
        //TODO : Check the navigation from in both cases.
        //props.route.params?.eKycParams?.from
        const navigateFrom = props.route.params?.filledUserDetails?.onBoardDetails2?.from;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: EKYC_INIT,
        });
    }

    componentDidMount() {
        console.log("[ApplyMAEScreen] >> [componentDidMount]");
    }

    onBackTap = () => {
        console.log("[ApplyMAEScreen] >> [onBackTap]");
        this.props.navigation.goBack();
    };

    onCloseTap = () => {
        console.log("[ApplyMAEScreen] >> [onCloseTap]");
        const { eKycParams, filledUserDetails } = this.state;
        if (
            this.props?.route?.params?.eKycParams?.isPM1 ||
            this.props?.route?.params?.eKycParams?.isPMA ||
            this.props?.route?.params?.eKycParams?.isKawanku ||
            this.props?.route?.params?.eKycParams?.isKawankuSavingsI
        ) {
            this.props.navigation.navigate(MORE, {
                screen: ACCOUNTS_SCREEN,
            });
        } else {
            this.props.navigation.navigate(eKycParams?.entryStack || MORE, {
                screen: eKycParams?.entryScreen || APPLY_SCREEN,
                params: { ...filledUserDetails?.entryParams, ...eKycParams?.entryParams },
            });
        }
    };

    onContinueTap = () => {
        console.log("[ApplyMAEScreen] >> [moveToNext]");
        const { filledUserDetails, eKycParams } = this.state;
        this.props.navigation.navigate(CAPTURE_ID_SCREEN, {
            eKycParams,
            filledUserDetails,
        });
    };

    render() {
        const { userName } = this.state;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <View style={styles.viewContainer}>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        useSafeArea
                        header={
                            <HeaderLayout
                                headerLeftElement={<HeaderBackButton onPress={this.onBackTap} />}
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.formContainer}>
                                <View style={styles.applyImageView}>
                                    <Image
                                        accessible={true}
                                        testID="fetureImage"
                                        accessibilityLabel="fetureImage"
                                        style={styles.applyimage}
                                        resizeMode="contain"
                                        source={Assets.MAE_Selfie_Intro}
                                    />
                                </View>
                                <Typo
                                    lineHeight={21}
                                    textAlign="left"
                                    text={userName ? "Hi " + userName + "," : "Hi there,"}
                                    style={styles.textView}
                                />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={22}
                                    textAlign="left"
                                    text={ZEST_CASA_KYC_ENTRY_DESCRIPTION}
                                    style={styles.descView}
                                />
                                <View style={styles.fieldContainer}>
                                    <View style={styles.containerStyle}>
                                        <View style={styles.whiteBulletCls} />
                                        <Typo
                                            lineHeight={20}
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={EXTRACT_PERSONAL_INFO}
                                            style={styles.typoView}
                                        />
                                    </View>
                                    <View style={[styles.containerStyle, styles.typoContainerView]}>
                                        <View style={styles.whiteBulletCls} />
                                        <Typo
                                            lineHeight={20}
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={FIND_PLACE_LIGHTING}
                                            style={styles.typoView}
                                        />
                                    </View>
                                    <View style={[styles.containerStyle, styles.typoContainerView]}>
                                        <View style={styles.whiteBulletCls} />
                                        <Typo
                                            lineHeight={20}
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={ENSURE_MYKAD_PASSPORT_READABLE}
                                            style={styles.typoView}
                                        />
                                    </View>
                                    <View style={[styles.containerStyle, styles.typoContainerView]}>
                                        <View style={styles.whiteBulletCls} />
                                        <Typo
                                            lineHeight={20}
                                            letterSpacing={0}
                                            textAlign="left"
                                            text={ENSURE_FACE_FITS_FRAME}
                                            style={styles.typoView}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                        {/* Continue Button */}
                        <View style={styles.bottomBtnContCls}>
                            <LinearGradient
                                colors={["#efeff300", MEDIUM_GREY]}
                                style={styles.linearGradient}
                            />
                            <ActionButton
                                fullWidth
                                onPress={this.onContinueTap}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo fontWeight="600" lineHeight={18} text={NEXT_SMALL_CAPS} />
                                }
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

ApplyMAEScreen.propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            filledUserDetails: PropTypes.shape({
                onBoardDetails2: PropTypes.shape({
                    from: PropTypes.string,
                }),
            }),
            eKycParams: PropTypes.object,
        }),
    }),
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    textView: {
        marginTop: 24,
    },
    formContainer: {
        marginHorizontal: 36,
    },
    fieldContainer: {
        marginTop: 24,
    },
    typoView: {
        marginLeft: 10,
    },
    typoContainerView: {
        marginTop: 16,
    },
    descView: {
        marginTop: 8,
    },
    viewContainer: {
        flex: 1,
    },
    applyImageView: {
        marginTop: 36,
        width: "100%",
        alignItems: "center",
    },
    applyimage: {
        width: 61,
        height: 64,
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
    containerStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
    },
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 24,
        paddingVertical: 25,
    },
    linearGradient: {
        height: 30,
        left: 0,
        right: 0,
        top: -30,
        position: "absolute",
    },
});

export default ApplyMAEScreen;
