import React, { Component } from "react";
import { View, Image, Text } from "react-native";

import { ButtonRound } from "@components/Common";

import { YELLOW } from "@constants/colors";

import commonStyle from "@styles/main";

class StatusCheckScreen extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = {
            loading: "",
            status: 0,
            message: "",
            amount: 0.0,
        };
    }
    // componentWillMount() {
    //     const { route } = this.props;
    //     this.setState({
    //         status: route.params?.status ?? 0,
    //         message: route.params?.message ?? "",
    //         amount: route.params?.amount ?? 0.0,
    //         primary: route.params?.primary ?? false,
    //         data: route.params?.data ?? {},
    //         screen: route.params?.screen ?? 1,
    //         qrState: route.params?.qrState ?? {},
    //     });
    // }

    componentDidMount() {
        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            const { route } = this.props;
            this.setState({
                status: route.params?.status ?? 0,
                message: route.params?.message ?? "",
                amount: route.params?.amount ?? 0.0,
                primary: route.params?.primary ?? false,
                data: route.params?.data ?? {},
                screen: route.params?.screen ?? 1,
                qrState: route.params?.qrState ?? {},
            });
        });
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    donePress = () => {
        this.props.navigation.navigate("QrStack", {
            screen: "QrMain",
            params: {
                primary: this.state.primary,
                data: this.state.data,
                screen: this.state.screen,
                qrState: this.state.qrState,
                resetState: true,
                validateAccount: false,
                refresh: false,
            },
        });
    };

    render() {
        return (
            <View
                style={{
                    backgroundColor: "#f8f5f3",
                    flex: 1,
                    width: "100%",
                }}
            >
                <View
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        marginTop: 50,
                    }}
                >
                    {this.state.status === 0 ? (
                        <Image
                            style={{
                                overflow: "hidden",
                                resizeMode: "contain",
                                width: 80,
                                height: 80,
                            }}
                            source={require("@assets/icons/ic_success.png")}
                            accessible={true}
                            testID={"imgSetup"}
                            accessibilityLabel={"imgSetup"}
                        />
                    ) : null}

                    {this.state.status === 1 ? (
                        <Image
                            style={{
                                overflow: "hidden",
                                resizeMode: "contain",
                                width: 80,
                                height: 80,
                            }}
                            source={require("@assets/icons/ic_pending.png")}
                            accessible={true}
                            testID={"imgSetup"}
                            accessibilityLabel={"imgSetup"}
                        />
                    ) : null}

                    {this.state.status === 2 ? (
                        <Image
                            style={{
                                overflow: "hidden",
                                resizeMode: "contain",
                                width: 80,
                                height: 80,
                            }}
                            source={require("@assets/icons/ic_failed.png")}
                            accessible={true}
                            testID={"imgSetup"}
                            accessibilityLabel={"imgSetup"}
                        />
                    ) : null}
                </View>

                <View
                    style={{
                        width: "90%",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        marginTop: 30,
                    }}
                >
                    <Text
                        style={[
                            {
                                fontWeight: "100",
                                fontSize: 20,
                                alignItems: "center",
                                textAlign: "center",
                            },
                            commonStyle.font,
                        ]}
                    >
                        {this.state.message}
                    </Text>
                </View>

                <View
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        marginTop: 30,
                    }}
                >
                    {this.state.status === 0 ? (
                        <Text
                            style={[
                                {
                                    color: "#000000",
                                    fontWeight: "700",
                                    fontSize: 20,
                                    alignItems: "center",
                                },
                                commonStyle.font,
                            ]}
                        >
                            {this.state.amount}
                        </Text>
                    ) : (
                        <Text />
                    )}
                </View>

                <View
                    style={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        marginTop: 220,
                    }}
                >
                    <ButtonRound
                        headerText="              Done             "
                        backgroundColor={YELLOW}
                        isCenter={true}
                        onPress={this.donePress}
                    />
                </View>
            </View>
        );
    }
}
export default StatusCheckScreen;
