import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { TouchableSpring, Animated } from "@components/Animations/TouchableSpring";
import Typo from "@components/Text";

import { BLUE, WHITE } from "@constants/colors";

function SurveyBanner({ onPress, surveyData }) {
    if (!surveyData) return null;

    return (
        <View style={styles.surveyContainer}>
            <TouchableSpring onPress={onPress}>
                {({ animateProp }) => (
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                transform: [
                                    {
                                        scale: animateProp,
                                    },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.cardContent}>
                            <Image
                                source={{ uri: surveyData?.bannerImage }}
                                style={styles.surveyImage}
                            />
                            <View style={styles.textContainer}>
                                <Typo
                                    fontSize={11}
                                    fontWeight="600"
                                    lineHeight={18}
                                    text={surveyData?.bannerText}
                                    textAlign="left"
                                    style={styles.cardTitle}
                                />
                                <Typo
                                    fontSize={9}
                                    lineHeight={18}
                                    text={surveyData?.bannerLinkText}
                                    color={BLUE}
                                    textAlign="left"
                                    style={styles.cardDescription}
                                />
                            </View>
                        </View>
                    </Animated.View>
                )}
            </TouchableSpring>
        </View>
    );
}

SurveyBanner.propTypes = {
    onPress: PropTypes.func.isRequired,
    surveyData: PropTypes.shape({
        bannerImage: PropTypes.string,
        bannerText: PropTypes.string,
        bannerLinkText: PropTypes.string,
    }),
};

const styles = StyleSheet.create({
    surveyContainer: {
        paddingBottom: 16,
    },

    container: {
        paddingHorizontal: 24,
    },

    cardContent: {
        backgroundColor: WHITE,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    textContainer: {
        flex: 1,
    },
    surveyImage: {
        width: 50,
        height: 50,
    },
});

export default SurveyBanner;
