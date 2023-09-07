import PropTypes from "prop-types";
import React, { Component, Fragment } from "react";
import { Text, View, ScrollView, Platform, Linking } from "react-native";
import Permissions from "react-native-permissions";

import ScreenLayout from "@layouts/ScreenLayout";

import { SetupNow, HeaderPageIndicator, ErrorMessage } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";

import { withModelContext } from "@context";

import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import { navigateToUserDashboard } from "@utils/dataModel/utilityDashboard";

import Styles from "@styles/Wallet/WalletScreen";
import commonStyle from "@styles/main";

import Assets from "@assets";

class QRCamerDenyScreen extends Component {
    static navigationOptions = { title: "", header: null };

    static propTypes = {
        navigation: PropTypes.object,
        getModel: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            data: "",
            error: false,
        };
    }
    componentDidMount() {}

    componentWillUnmount() {
        //removeAndroidBackButtonHandler();
    }

    closePress() {
        navigateToUserDashboard(this.props.navigation, this.props.getModel);
    }

    errorPress() {
        this.setState({ error: false });
    }

    async enablePress() {
        if (Platform.OS == "ios") {
            Linking.canOpenURL("app-settings:")
                .then((supported) => {
                    if (!supported) {
                        console.log("Can't handle settings url");
                        this.setState({ error: true });
                    } else {
                        console.log(" handle settings url");

                        return Linking.openURL("app-settings:");
                    }
                })
                .catch((err) => console.error("An error occurred", err));
        } else {
            let permissionResult = await Permissions.request("camera").then((response) => {
                console.log("R", response);
                return response;
            });

            if (permissionResult == "denied" || permissionResult == "undetermined") {
            } else if (permissionResult == "restricted") {
                this.setState({ error: true });
            } else {
                navigateToUserDashboard(this.props.navigation, this.props.getModel);
            }
        }
    }

    render() {
        return (
            //<View style={[commonStyle.childContainer, commonStyle.greyBackgroundColor]}>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <>
                    <ScreenLayout
                        paddingBottom={0}
                        paddingTop={0}
                        paddingHorizontal={0}
                        // header={
                        //     <HeaderLayout
                        //         headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                        //     />
                        // }
                        useSafeArea
                    >
                        <HeaderPageIndicator
                            showBack={false}
                            showClose={true}
                            showIndicator={false}
                            showTitle={false}
                            showBackIndicator={false}
                            pageTitle={""}
                            numberOfPages={1}
                            currentPage={1}
                            navigation={this.props.navigation}
                            testID={"header"}
                            accessibilityLabel={"header"}
                            noPop={true}
                            noClose={true}
                            onClosePress={this.closePress}
                            onBackPress={() => {}}
                        />
                        <ScrollView>
                            <View style={Styles.addedTitleContainer}>
                                <Text
                                    style={[Styles.addedTitle, commonStyle.font]}
                                    accessible={true}
                                    testID={"txtLoyaltyRewards"}
                                    accessibilityLabel={"txtLoyaltyRewards"}
                                >
                                    QRPay
                                </Text>
                            </View>
                            <View style={Styles.addedDescriptionContainer}>
                                <Text
                                    style={[Styles.addedDescription, commonStyle.font]}
                                    accessible={true}
                                    testID={"txtLoyaltyRewards"}
                                    accessibilityLabel={"txtLoyaltyRewards"}
                                >
                                    Required camera permission
                                </Text>
                            </View>
                            <View style={[Styles.addedSetupTop, { marginTop: 60 }]}>
                                <SetupNow
                                    isBigIcon={true}
                                    text="Enable Camera"
                                    url={Assets.yellowCamera}
                                    onPress={this.enablePress}
                                />
                            </View>
                            {/* {ModelClass.QR_DATA.fromWallet === true ? (
                                <View style={Styles.addedSetupDown}>
                                    <SetupNow
                                        isBigIcon={true}
                                        text={Strings.BACK_TO_WALLET}
                                        url={require("@assets/icons/ic_yellow_wallet.png")}
                                        onPress={this.backPress()}
                                    />
                                </View>
                            ) : null} */}

                            {this.state.error == true && (
                                <Fragment>
                                    <ErrorMessage
                                        onClose={() => {
                                            this.setState({ error: false });
                                        }}
                                        title={Strings.APP_NAME_ALERTS}
                                        description={
                                            "Please go to mobile settings and enable camera"
                                        }
                                        showOk={true}
                                        onOkPress={this.errorPress}
                                    />
                                </Fragment>
                            )}
                        </ScrollView>
                        {/* </View> */}
                    </ScreenLayout>
                </>
            </ScreenContainer>
        );
    }
}

export default withModelContext(QRCamerDenyScreen);
