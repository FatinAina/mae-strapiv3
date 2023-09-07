import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import CarbonAmountContainer from "@components/EthicalCardComponents/CarbonAmountContainer";
import Typo from "@components/Text";

import { BLACK, WHITE, YELLOW, DARK_GREY } from "@constants/colors";

import * as utility from "@utils/dataModel/utility";

import assets from "@assets";

const TrackerListItem = ({
    onListItemPressed,
    iconImgUrl,
    iconBgColor,
    title,
    desc,
    amount,
    textColor,
    points,
    isDemo,
    mode,
    iconPadded,
    hideIcon,
    date,
    amountForeign,
    currencyCode,
    carbonAmount,
    ...props
}) => (
    <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.8} onPress={onListItemPressed}>
            <React.Fragment>
                <View style={styles.contentContainer}>
                    {!hideIcon && (
                        <View style={styles.avatarContainer}>
                            <BorderedAvatar
                                backgroundColor={iconBgColor != null ? iconBgColor : YELLOW}
                            >
                                <View style={styles.imageContainer}>
                                    <Image
                                        style={iconPadded ? styles.image : styles.imageFull}
                                        source={iconImgUrl}
                                    />
                                </View>
                            </BorderedAvatar>
                        </View>
                    )}
                    <View style={{ flex: 1, paddingRight: 24 }}>
                        <Typo
                            fontWeight={"600"}
                            textAlign={"left"}
                            fontSize={12}
                            lineHeight={19}
                            color={textColor ?? BLACK}
                            numberOfLines={date ? 1 : 3}
                            text={title}
                        />

                        {desc !== "" && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    textAlign={"left"}
                                    fontSize={12}
                                    lineHeight={12}
                                    color={textColor ?? DARK_GREY}
                                    text={desc}
                                />
                            </View>
                        )}

                        {date && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    textAlign="left"
                                    fontSize={12}
                                    fontWeight="normal"
                                    lineHeight={12}
                                    text={moment(date, "YYYY-MM-DD HH:mm:ss.0").format(
                                        "DD/MM/YYYY"
                                    )}
                                    color={DARK_GREY}
                                />
                            </View>
                        )}
                    </View>
                    <View>
                        {isDemo ? (
                            <Image
                                style={{ width: 90, height: 15, marginRight: -6, marginBottom: 2 }}
                                source={assets.rm88888}
                            />
                        ) : (
                            <Typo
                                fontWeight={"600"}
                                textAlign={"right"}
                                fontSize={12}
                                lineHeight={12}
                                color={
                                    mode === "categories"
                                        ? "#e35d5d"
                                        : Math.sign(amount) == -1
                                        ? "#e35d5d"
                                        : "#5dbc7d"
                                }
                                text={`${Math.sign(amount) === -1 ? "-" : ""}RM ${numeral(
                                    Math.abs(amount)
                                ).format("0,0.00")}`}
                            />
                        )}

                        {points && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    textAlign={"right"}
                                    fontSize={12}
                                    lineHeight={12}
                                    color={"#7c7c7d"}
                                    text={`+${points} pts`}
                                />
                            </View>
                        )}

                        {amountForeign != null && currencyCode != null && amountForeign !== 0 && (
                            <View style={styles.secondaryContainer}>
                                <Typo
                                    textAlign={"right"}
                                    fontSize={12}
                                    lineHeight={12}
                                    color={"#7c7c7d"}
                                    text={`${currencyCode} ${numeral(
                                        Math.abs(amountForeign)
                                    ).format("0,0.00")}`}
                                />
                            </View>
                        )}
                        {carbonAmount != null && carbonAmount !== 0 && (
                            <CarbonAmountContainer carbonAmount={carbonAmount} />
                        )}
                    </View>
                </View>
            </React.Fragment>
        </TouchableOpacity>
    </View>
);

TrackerListItem.propTypes = {
    onListItemPressed: PropTypes.func.isRequired,
    iconImgUrl: PropTypes.any.isRequired,
    iconBgColor: PropTypes.string,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isDemo: PropTypes.bool.isRequired,
    textColor: PropTypes.string,
    mode: PropTypes.string,
    iconPadded: PropTypes.bool,
    hideIcon: PropTypes.bool,
    date: PropTypes.string,
    amountForeign: PropTypes.number,
    currencyCode: PropTypes.string,
    carbonAmount: PropTypes.number,
};

TrackerListItem.defaultProps = {
    onListItemPressed: () => {},
    iconImgUrl: "",
    iconBgColor: YELLOW,
    title: "",
    desc: "",
    amount: 0,
    textColor: "",
    isDemo: false,
    mode: "default",
    iconPadded: true,
    hideIcon: false,
    date: null,
    amountForeign: null,
    currencyCode: null,
    carbonAmount: 0,
};

const Memoiz = React.memo(TrackerListItem);

export default Memoiz;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    imageContainer: {
        borderRadius: 22,
        height: 36,
        overflow: "hidden",
        width: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        height: "55%",
        width: "55%",
        resizeMode: "contain",
    },
    imageFull: {
        height: "90%",
        width: "90%",
        resizeMode: "contain",
    },
    contentContainer: {
        flexDirection: "row",
        minHeight: 48,
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
    },
    secondaryContainer: {
        marginTop: 2,
    },
    avatarContainer: { width: 36, height: 36, marginRight: 8 },
});
