import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import * as Animatable from "react-native-animatable";

import { DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { YELLOW, MEDIUM_GREY } from "@constants/colors";
import { OKAY } from "@constants/strings";

import Assets from "@assets";

import {
    GUARANTOR_PENDING_APPROVAL,
    GUARANTOR_PENDING_APPROVAL_DES,
} from "../../../../constants/strings";

function PendingGaurantorApproval({ route, navigation }) {
    this.bannerAnimate = new Animated.Value(0);

    function oKay() {
        navigation.navigate(DASHBOARD);
    }

    const animateBanner = () => {
        return {
            opacity: this.bannerAnimate.interpolate({
                inputRange: [0, 120, 240],
                outputRange: [1, 0.8, 0],
            }),
            transform: [
                {
                    scale: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 1],
                        outputRange: [1.4, 1, 1],
                    }),
                },
                {
                    translateY: this.bannerAnimate.interpolate({
                        inputRange: [-200, 0, 240],
                        outputRange: [0, 0, -100],
                    }),
                },
            ],
        };
    };

    return (
        <ScreenContainer backgroundType="color" analyticScreenName="Apply_ASBFinancing_Fail">
            <ScreenLayout
                paddingBottom={0}
                paddingTop={0}
                paddingHorizontal={0}
                useSafeArea
                neverForceInset={["bottom"]}
                paddingLeft={0}
                paddingRight={0}
                header={<HeaderLayout headerLeftElement={<HeaderBackButton onPress={oKay} />} />}
            >
                <View style={styles.container}>
                    <Animated.View style={[styles.promotionImage, animateBanner()]}>
                        <Animatable.Image
                            animation="fadeInUp"
                            duration={300}
                            source={Assets.fdAccount}
                            style={styles.merchantBanner}
                            resizeMode="cover"
                        />
                    </Animated.View>
                    <Animated.ScrollView
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [
                                {
                                    nativeEvent: {
                                        contentOffset: { y: this.bannerAnimate },
                                    },
                                },
                            ],
                            { useNativeDriver: true }
                        )}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.mainContent}>
                            <View style={styles.contentArea}>
                                <Typo
                                    lineHeight={19}
                                    textAlign="left"
                                    text={GUARANTOR_PENDING_APPROVAL}
                                    style={styles.title}
                                />
                                <Typo
                                    fontSize={16}
                                    lineHeight={22}
                                    fontWeight="600"
                                    textAlign="left"
                                    text={GUARANTOR_PENDING_APPROVAL_DES}
                                />
                            </View>
                        </View>
                    </Animated.ScrollView>
                    <FixedActionContainer>
                        <View style={styles.bottomBtnContCls}>
                            <ActionButton
                                activeOpacity={0.5}
                                backgroundColor={YELLOW}
                                fullWidth
                                componentCenter={
                                    <Typo lineHeight={18} fontWeight="600" text={OKAY} />
                                }
                                onPress={oKay}
                            />
                        </View>
                    </FixedActionContainer>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
}

PendingGaurantorApproval.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    container: {
        backgroundColor: MEDIUM_GREY,
        borderWidth: 0,
        flex: 1,
    },
    contentArea: {
        marginHorizontal: 36,
        paddingTop: 25,
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
        marginTop: 240,
    },
    merchantBanner: { flex: 1, height: "100%", width: "100%" },
    promotionImage: {
        height: 240,
        position: "absolute",
        width: "100%",
    },
    title: {
        paddingBottom: 20,
    },
});

export default PendingGaurantorApproval;
