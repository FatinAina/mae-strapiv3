import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import { EXISTING_MAE_DESC_ETB, EXISTING_MAE_HEADER } from "@constants/strings";

// import { getMobileSdkParams } from "@utils";
import { getDeviceRSAInformation } from "@utils/dataModel/utility";

import * as MAEOnboardController from "../Onboarding/MAEOnboardController";

class MAEGoToWallet extends Component {
    static propTypes = {
        getModel: PropTypes.func,
        updateModel: PropTypes.func,
    };
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
        };
    }

    componentDidMount() {
        console.log("[MAEGoToWallet] >> [componentDidMount]");
        if (this.props.route?.params?.username) {
            const { filledUserDetails } = this.state;
            const usernameDetails = {
                username: this.props.route.params.username,
                password: this.props.route.params?.pw,
            };
            filledUserDetails.usernameDetails = usernameDetails;
        }
    }

    enrollmentCall = async () => {
        const { updateModel } = this.props;
        const { filledUserDetails } = this.state;
        const { deviceInformation, deviceId } = this.props.getModel("device");
        // const mobileSDKData = getMobileSdkParams({ ...deviceInformation, deviceId });
        const mobileSDKData = getDeviceRSAInformation({
            ...deviceInformation,
            DeviceInfo,
            deviceId,
        });
        const response = await MAEOnboardController.enrollmentCall(
            filledUserDetails,
            mobileSDKData
        );
        if (response.message) {
            showErrorToast({
                message: response.message,
            });
        } else {
            const { access_token, refresh_token, cus_key, contact_number } = response.data;
            updateModel({
                auth: {
                    token: access_token,
                    refreshToken: refresh_token,
                    customerKey: cus_key,
                },
            });
            const { filledUserDetails } = this.state;
            filledUserDetails.authData = response.data;
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uCreatePin",
                params: {
                    username: filledUserDetails?.usernameDetails?.username,
                    pw: filledUserDetails?.usernameDetails?.password,
                    isMaeOnboarding: false,
                    phone: this.props.route?.params?.phone,
                    goToTopup: false,
                    authData: filledUserDetails?.authData,
                },
            });
        }
    };

    onCloseTap = () => {
        console.log("[MAEGoToWallet] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEGoToWallet] >> [onContinueTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate("Onboarding", {
            screen: "OnboardingM2uCreatePin",
            params: {
                username: filledUserDetails?.usernameDetails?.username,
                pw: filledUserDetails?.usernameDetails?.password,
                phone: this.props.route?.params?.phone,
            },
        });
    };

    render() {
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
                                headerRightElement={<HeaderCloseButton onPress={this.onCloseTap} />}
                            />
                        }
                    >
                        <ScrollView>
                            <View style={styles.fieldContainer}>
                                <Typo
                                    fontSize={14}
                                    lineHeight={23}
                                    fontWeight="600"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={EXISTING_MAE_HEADER}
                                />
                                <Typo
                                    fontSize={20}
                                    lineHeight={30}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={EXISTING_MAE_DESC_ETB}
                                />
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
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        text="Go To Wallet"
                                    />
                                }
                            />
                        </View>
                    </ScreenLayout>
                </View>
            </ScreenContainer>
        );
    }
}

const styles = StyleSheet.create({
    fieldContainer: {
        marginHorizontal: 36,
    },
    viewContainer: {
        flex: 1,
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

export default withModelContext(MAEGoToWallet);
