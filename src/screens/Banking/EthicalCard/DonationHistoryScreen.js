import PropTypes from "prop-types";
import React from "react";
import { View, StyleSheet, Text, ImageBackground, FlatList, TouchableOpacity } from "react-native";

import { DASHBOARD_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import CarbonAmountContainer from "@components/EthicalCardComponents/CarbonAmountContainer";
import Typo from "@components/Text";
import { showInfoToast } from "@components/Toast";

import { WHITE, MEDIUM_GREY, GREEN, SHADOW, ROYAL_BLUE, FADE_GREY, RED } from "@constants/colors";
import {
    THANK_YOU_FOR_CONTRIBUTION,
    MY_DONATION,
    YOU_HELPED_OFFSET,
    VIEW_CERT,
} from "@constants/strings";

import * as utility from "@utils/dataModel/utility";

import Assets from "@assets";

const DonationCard = ({ data, onViewCert }) => {
    const certificateUrl = data?.certUrl ?? data?.carbonOffsetCertificateUrl;
    const handleOnViewCert = () => {
        onViewCert(certificateUrl);
    };

    return (
        <View style={styles.donationCard}>
            <View style={styles.donationCardInner}>
                <Typo
                    fontWeight="600"
                    textAlign="left"
                    text={data?.description}
                    numberOfLines={2}
                />
                <Typo
                    fontSize={12}
                    lineHeight={18}
                    textAlign="left"
                    color={FADE_GREY}
                    text={`Contributed ${data?.transactionDate}`}
                />
                {certificateUrl && (
                    <TouchableOpacity onPress={handleOnViewCert}>
                        <Typo
                            color={ROYAL_BLUE}
                            fontSize={12}
                            textAlign="left"
                            fontWeight="600"
                            lineHeight={16}
                            text={VIEW_CERT}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.donationAmountText}>
                <Typo
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    color={RED}
                    text={`${
                        Math.sign(data.amountLocal) === -1 ? "-" : ""
                    } - RM ${utility.commaAdder(Math.abs(data.amountLocal).toFixed(2))}`}
                />
                <CarbonAmountContainer carbonAmount={data?.carbonFootprintAmount} />
            </View>
        </View>
    );
};

DonationCard.propTypes = {
    data: PropTypes.object,
    onViewCert: PropTypes.func,
};

const DonationHistoryScreen = ({ route, navigation }) => {
    const donationData = route?.params?.donationData;
    const totalCarbonFootprint = route?.params?.totalCarbonFootprint;

    const handleOnViewCert = (url) => {
        if (url) {
            navigation.navigate(DASHBOARD_STACK, {
                screen: "ExternalUrl",
                params: {
                    url,
                },
            });
        } else {
            showInfoToast({ message: "Certificate Not Found" });
        }
    };

    function renderDonationItem({ item, index }) {
        return <DonationCard data={item} onViewCert={handleOnViewCert} />;
    }

    const renderDonationHistory = () => {
        return (
            <FlatList
                data={donationData}
                renderItem={renderDonationItem}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentInset={{
                    // iOS ONLY
                    top: 0,
                    left: 0, // Left spacing for the very first card
                    bottom: 30,
                    right: 0, // Right spacing for the very last card
                }}
            />
        );
    };

    const renderCarbonOffsetWidget = () => {
        return (
            <ImageBackground
                style={styles.offsetWidgetImage}
                resizeMode="stretch"
                source={Assets.offsetWidgetBg}
            >
                <View style={styles.widgetContainer}>
                    <Typo lineHeight={18} textAlign="left" text={THANK_YOU_FOR_CONTRIBUTION} />
                    <Typo lineHeight={18} textAlign="left">
                        <Text style={styles.offsetWidgetText}>{YOU_HELPED_OFFSET}</Text>
                        <Text style={styles.offsetWidgetCarbonFootprint}>
                            {" "}
                            {Math.abs(totalCarbonFootprint).toFixed(0)} Kg CO₂
                        </Text>
                    </Typo>
                </View>
            </ImageBackground>
        );
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={
                            <HeaderBackButton
                                onPress={() => {
                                    navigation.goBack();
                                }}
                            />
                        }
                        headerCenterElement={
                            <Typo
                                text={MY_DONATION}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
            >
                {renderCarbonOffsetWidget()}
                {renderDonationHistory()}
            </ScreenLayout>
        </ScreenContainer>
    );
};

DonationHistoryScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    offsetWidgetImage: { width: "100%" },
    widgetContainer: {
        height: 70,
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: "space-evenly",
    },
    offsetWidgetText: { fontWeight: "600" },
    offsetWidgetCarbonFootprint: { fontWeight: "600", color: GREEN },
    donationCard: {
        flexDirection: "row",
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 110,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        marginVertical: 10,

        marginHorizontal: 24,
        padding: 20,
    },
    donationCardInner: { flex: 2, justifyContent: "space-between" },
    donationAmountText: { flex: 1, alignItems: "flex-end" },
});

export default DonationHistoryScreen;
