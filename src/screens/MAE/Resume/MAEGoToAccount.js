import PropTypes from "prop-types";
import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { withModelContext } from "@context";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import {
    EXISTING_MAE_DESC_NTB,
    EXISTING_MAE_DESC_ETB,
    EXISTING_MAE_HEADER,
} from "@constants/strings";

class MAEGoToAccount extends Component {
    static navigationOptions = ({ navigation: { navigate } }) => ({
        title: "",
        header: null,
    });
    static propTypes = {
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            filledUserDetails: props.route?.params?.filledUserDetails,
            desc: "",
            btnText: "",
            isOnboard: false,
        };
    }

    componentDidMount() {
        console.log("[MAEGoToAccount] >> [componentDidMount]");
        const { isOnboard } = this.props.getModel("user");
        let desc = EXISTING_MAE_DESC_NTB;
        let btnText = "Continue";
        if (isOnboard) {
            desc = EXISTING_MAE_DESC_ETB;
            btnText = "Go To Account";
        }
        this.setState({
            desc,
            isOnboard,
            btnText,
        });
    }

    onCloseTap = () => {
        console.log("[MAEGoToAccount] >> [onCloseTap]");
        const { filledUserDetails } = this.state;
        this.props.navigation.navigate(filledUserDetails?.entryStack || "More", {
            screen: filledUserDetails?.entryScreen || "Apply",
            params: filledUserDetails?.entryParams,
        });
    };

    onContinueTap = () => {
        console.log("[MAEGoToAccount] >> [onContinueTap]");
        // const {filledUserDetails} = this.state;
        if (this.state.isOnboard) {
            this.props.navigation.navigate("TabNavigator", {
                screen: "Tab",
                params: {
                    screen: "Maybank2u",
                },
            });
        } else {
            this.props.navigation.navigate("Onboarding", {
                screen: "OnboardingM2uUsername",
            });
        }
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
                                    style={styles.description}
                                    lineHeight={30}
                                    fontWeight="300"
                                    letterSpacing={0}
                                    textAlign="left"
                                    text={this.state.desc}
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
                                        text={this.state.btnText}
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
    description: {
        marginTop: 12,
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

export default withModelContext(MAEGoToAccount);
