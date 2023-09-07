import PropTypes from "prop-types";
import React from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image,
} from "react-native";

import Typo from "@components/Text";

import { BLACK, WHITE, LIGHT_GREY } from "@constants/colors";
import { VIEW_CARD_DETAILS } from "@constants/strings";

import { maskAccount, getCardProviderImage } from "@utils/dataModel/utility";

import assets from "@assets";

export const { width, height } = Dimensions.get("window");

const CreditCardBig = ({
    onCardPressed,
    image,
    title,
    accountNumber,
    desc,
    amount,
    isPrimary,
    hasSupplementary,
    showViewCardDetail,
    onVirtualCardDetailTap,
    isAccountSuspended,
}) => (
    <View style={styles.container(showViewCardDetail)}>
        <TouchableOpacity activeOpacity={0.8} onPress={onCardPressed}>
            <ImageBackground source={image} style={styles.imageBackground(isAccountSuspended)}>
                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <View style={styles.titleLabelContainer}>
                            <Typo
                                fontSize={14}
                                fontWeight="600"
                                fontStyle="normal"
                                letterSpacing={0}
                                lineHeight={18}
                                textAlign="left"
                                color={WHITE}
                                text={title}
                                numberOfLines={2}
                            />
                        </View>

                        <Image
                            style={styles.providerImage}
                            source={getCardProviderImage(accountNumber)}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.middleContainer}>
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={24}
                            textAlign="left"
                            text={maskAccount(accountNumber, 12)}
                            color={WHITE}
                        />
                    </View>

                    <View style={styles.bottomContainer}>
                        <Typo
                            fontSize={12}
                            fontWeight="normal"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={15}
                            textAlign="left"
                            color={WHITE}
                            text={desc}
                        />
                        <Typo
                            fontSize={16}
                            fontWeight="600"
                            fontStyle="normal"
                            letterSpacing={0}
                            lineHeight={19}
                            textAlign="left"
                            color={WHITE}
                            text={`RM ${amount}`}
                        />
                    </View>
                </View>
                {showViewCardDetail && (
                    <TouchableOpacity
                        onPress={() => {
                            onVirtualCardDetailTap();
                        }}
                    >
                        <View style={styles.virtualCardContainer}>
                            <Image
                                style={styles.cardDetailImage}
                                source={assets.icCardDetail}
                                resizeMode="contain"
                            />
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={15}
                                style={styles.virtualCardText}
                                textAlign="left"
                                text={VIEW_CARD_DETAILS}
                            />
                            <Image
                                style={styles.rightArrowImage}
                                source={assets.enabledArrowRightIcon}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </ImageBackground>
        </TouchableOpacity>
        {hasSupplementary && (
            <View style={styles.supplementaryBadge(showViewCardDetail)}>
                <Typo fontSize={9} lineHeight={11} text="Supp. Card Available" />
            </View>
        )}
    </View>
);

CreditCardBig.propTypes = {
    onCardPressed: PropTypes.func.isRequired,
    image: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    amount: PropTypes.any,
    isPrimary: PropTypes.bool,
    hasSupplementary: PropTypes.bool,
    isAccountSuspended: PropTypes.bool,
    showViewCardDetail: PropTypes.bool,
    onVirtualCardDetailTap: PropTypes.func,
};

CreditCardBig.defaultProps = {
    onCardPressed: () => {},
    image: "",
    title: "",
    accountNumber: "",
    desc: "",
    amount: 0,
    isPrimary: false,
    hasSupplementary: false,
    isAccountSuspended: false,
    showViewCardDetail: false,
    onVirtualCardDetailTap: () => {},
};

const styles = StyleSheet.create({
    bottomContainer: {
        bottom: 24,
        marginTop: 12,
        position: "absolute",
    },
    container: (showViewCardDetail) => ({
        backgroundColor: BLACK,
        borderRadius: 8,
        elevation: 5,
        height: showViewCardDetail ? 250 : 200,
        marginBottom: 24,
        overflow: "hidden",
        shadowColor: BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: width - 48,
    }),
    contentContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 20,
    },
    headerContainer: {
        flexDirection: "row",
    },
    imageBackground: (isAccountSuspended) => ({
        height: "100%",
        width: "100%",
        opacity: isAccountSuspended ? 0.5 : 1.0,
    }),
    middleContainer: {
        marginTop: 44,
    },
    supplementaryBadge: (showViewCardDetail) => ({
        alignItems: "center",
        backgroundColor: LIGHT_GREY,
        borderRadius: 11,
        bottom: showViewCardDetail ? 73 : 23,
        height: 22,
        justifyContent: "center",
        position: "absolute",
        right: 16,
        width: 113,
    }),
    titleLabelContainer: {
        flex: 1,
        paddingRight: 24,
    },
    providerImage: { height: 24, width: 42 },
    virtualCardContainer: {
        backgroundColor: WHITE,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
    },
    cardDetailImage: { flex: 1 },
    virtualCardText: { flex: 3 },
    rightArrowImage: { flex: 1 },
});

export default React.memo(CreditCardBig);
