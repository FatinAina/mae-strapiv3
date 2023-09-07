import React from "react";
import { Image, View, StyleSheet } from "react-native";

import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { MEDIUM_GREY } from "@constants/colors";
import {
    AUTH_PLACEHOLDER_WELCOME_BACK,
    AUTH_PLACEHOLDER_DESCRIPTION,
    AUTH_PLACEHOLDER_ACTION,
} from "@constants/strings";

import Images from "@assets";

const AuthPlaceHolder = () => {
    const { updateModel } = useModelController();

    function logInNow() {
        updateModel({
            ui: {
                touchId: true,
            },
        });
    }

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                neverForceInset={["bottom"]}
                useSafeArea
            >
                <View style={styles.footerBg}>
                    <Image source={Images.dashboardManage} style={styles.footerBgImg} />
                </View>
                <View style={styles.contentContainer}>
                    <Image style={styles.touchIcon} source={Images.loginAgainIcon} />
                    <Typo
                        fontSize={18}
                        fontWeight="600"
                        lineHeight={19}
                        text={AUTH_PLACEHOLDER_WELCOME_BACK}
                    />
                    <Typo
                        lineHeight={19}
                        style={styles.description}
                        text={AUTH_PLACEHOLDER_DESCRIPTION}
                    />
                    <ActionButton
                        borderRadius={20}
                        height={40}
                        width="auto"
                        componentCenter={
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={15}
                                text={AUTH_PLACEHOLDER_ACTION}
                            />
                        }
                        style={styles.actionLogin}
                        onPress={() => logInNow()}
                    />
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    contentContainer: { flex: 1, marginTop: 40, padding: 40, alignItems: "center" },
    description: { marginTop: 16 },
    touchIcon: {
        height: 64,
        width: 64,
        marginBottom: 24,
    },
    actionLogin: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    footerBg: {
        bottom: 0,
        height: 436,
        left: 0,
        position: "absolute",
        right: 0,
    },
    footerBgImg: {
        height: 436,
        width: "100%",
    },
});

export default AuthPlaceHolder;
