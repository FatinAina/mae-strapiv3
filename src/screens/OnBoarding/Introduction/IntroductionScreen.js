import LottieView from "lottie-react-native";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { setIsIntroductionHasShow } from "@screens/OnBoarding/Introduction/utility";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { BLACK, WHITE, GRAY } from "@constants/colors";
import {
    FA_ONBOARDING_FEATURES,
    FA_ONBOARD_WELCOME,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
} from "@constants/strings";

import Assets from "@assets";

const { height } = Dimensions.get("window");
const introductionAssets = Assets.dashboard.introduction;
const data = [
    {
        title: `Your enhanced experience\nis here`,
        image: introductionAssets.first,
        hasAnimation: true,
    },
    {
        title: `Your Maybank accounts at a glance`,
        image: introductionAssets.second,
        hasAnimation: false,
    },
    {
        title: "Pay & transfer on the go",
        image: introductionAssets.third,
        hasAnimation: false,
    },
    {
        title: "Customise your app’s first screen",
        image: introductionAssets.fourth,
        hasAnimation: true,
    },
    {
        title: "Customise your Quick Actions",
        image: introductionAssets.fifth,
        hasAnimation: false,
    },
];

const IntroductionScreen = ({ onClose }) => {
    const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
    const imageRef = useRef();
    const isLastItem = selectedScreenIndex === data.length - 1;
    const isFirstItem = selectedScreenIndex === 0;
    const buttonText = isLastItem ? "Got It" : "Next";

    useEffect(() => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARD_WELCOME,
        });
    }, []);

    function goBack() {
        onClose && onClose();
    }

    const onPress = async (index) => {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_ONBOARDING_FEATURES.replace("Index", index),
        });

        if (index === data.length) {
            closeModal();
        } else {
            setSelectedScreenIndex(index);
        }
    };

    const closeModal = () => {
        setIsIntroductionHasShow(true, goBack);
    };

    const selectedScreen = data[selectedScreenIndex];
    return (
        <ScreenContainer
            backgroundType="image"
            backgroundImage={Assets.dashboard.introductionBackground}
        >
            <ScreenLayout
                useSafeArea
                neverForceInset={["bottom"]}
                header={
                    <HeaderLayout
                        headerRightElement={
                            !isLastItem ? (
                                <HeaderCloseButton onPress={closeModal} visible={false} />
                            ) : null
                        }
                    />
                }
            >
                <View style={styles.container}>
                    <Typo
                        fontSize={22}
                        fontWeight="600"
                        lineHeight={24}
                        text={selectedScreen?.title}
                    />

                    <SpaceFiller height={24} />
                    {selectedScreen.hasAnimation ? (
                        <LottieView
                            source={selectedScreen?.image}
                            autoPlay
                            loop={true}
                            style={styles.animation}
                        />
                    ) : (
                        <Animatable.Image
                            ref={imageRef}
                            source={selectedScreen?.image}
                            resizeMode="contain"
                            style={styles.image}
                        />
                    )}
                </View>
                <View style={styles.buttonContainer}>
                    {!isFirstItem && (
                        <View style={styles.buttonItem}>
                            <ActionButton
                                backgroundColor={WHITE}
                                borderColor={GRAY}
                                borderWidth={0.5}
                                fullWidth
                                onPress={() => onPress(selectedScreenIndex - 1)}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        lineHeight={18}
                                        color={BLACK}
                                        text="Previous"
                                    />
                                }
                            />
                        </View>
                    )}
                    <View style={[styles.buttonItem, isFirstItem && styles.fullWidthButtonItem]}>
                        <ActionButton
                            fullWidth
                            onPress={() => onPress(selectedScreenIndex + 1)}
                            componentCenter={
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={BLACK}
                                    text={buttonText}
                                />
                            }
                        />
                    </View>
                </View>
            </ScreenLayout>
        </ScreenContainer>
    );
};

IntroductionScreen.propTypes = {
    onClose: PropTypes.func,
};

const styles = StyleSheet.create({
    image: {
        height: 0.6 * height,
        width: "100%",
    },
    animation: {
        height: 0.6 * height,
        width: "100%",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonContainer: { flexDirection: "row", flexWrap: "wrap" },
    buttonItem: { width: "50%", padding: 6 },
    fullWidthButtonItem: { width: "100%" },
});

export default IntroductionScreen;
