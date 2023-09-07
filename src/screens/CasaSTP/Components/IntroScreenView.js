import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ImageBackground, Image } from "react-native";

import Typo from "@components/Text";

import { CASA_ACCOUNT_ID } from "@constants/casaStrings";
import { WHITE, DARK_CYAN } from "@constants/colors";

import Assets from "@assets";

export const IntroScreenViewSelection = ({
    accountId,
    accountType,
    accountName,
    accountImage,
    accountSubText,
    accountDesc,
}) => {
    const buildDescription = () => {
        return accountDesc.map((text, index) => {
            return (
                <View style={styles.descText} key={`descText-${index}`}>
                    <Image source={Assets.blackTick16} style={styles.tick} />
                    <Typo
                        lineHeight={18}
                        textAlign="left"
                        text={text}
                        style={styles.rightTickText}
                    />
                </View>
            );
        });
    };

    return (
        <>
            <View style={styles.introScreen} testID={CASA_ACCOUNT_ID(accountId)}>
                <View style={styles.imageBg}>
                    {accountImage ? (
                        <ImageBackground source={accountImage} style={styles.imageBg} />
                    ) : null}
                </View>
                <View style={styles.description}>
                    {accountType ? (
                        <View style={styles.accountType}>
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={16}
                                textAlign="left"
                                text={accountType}
                                style={styles.accountText}
                            />
                        </View>
                    ) : null}
                    {accountName ? (
                        <View>
                            <Typo
                                fontSize={20}
                                fontWeight="700"
                                lineHeight={28}
                                textAlign="left"
                                text={accountName}
                            />
                        </View>
                    ) : null}
                    {accountSubText ? (
                        <View style={styles.subtext}>
                            <Typo
                                fontSize={16}
                                lineHeight={24}
                                textAlign="left"
                                text={accountSubText}
                            />
                        </View>
                    ) : null}
                    <View style={styles.descContainer}>{buildDescription()}</View>
                </View>
            </View>
        </>
    );
};

IntroScreenViewSelection.propTypes = {
    accountId: PropTypes.string,
    accountType: PropTypes.string,
    accountName: PropTypes.string,
    accountSubText: PropTypes.string,
    accountImage: PropTypes.number,
    accountDesc: PropTypes.string,
};

const styles = StyleSheet.create({
    accountText: {
        color: WHITE,
        textAlign: "center",
    },
    accountType: {
        backgroundColor: DARK_CYAN,
        borderRadius: 12,
        color: WHITE,
        marginBottom: 24,
        marginTop: 24,
        paddingBottom: 4,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 4,
        width: 150,
    },
    descContainer: {
        marginBottom: 58,
    },
    descText: {
        flexDirection: "row",
        marginBottom: 15,
    },
    description: {
        marginLeft: 24,
        marginRight: 38,
    },
    imageBg: {
        height: 210,
        width: "100%",
    },
    subtext: {
        marginBottom: 27,
        marginTop: 8,
    },
    tick: {
        height: 10,
        marginRight: 12.8,
        marginTop: 5,
        width: 14,
    },
});
