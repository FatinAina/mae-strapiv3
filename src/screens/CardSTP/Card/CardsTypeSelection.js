/* eslint-disable react/jsx-no-bind */
import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, FlatList } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";

import { STP_CARD_MODULE, EC_CONSENT } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import { cardsVerify, getCutomerPersonalDetails } from "@services";
import { applyCC } from "@services/analytics/analyticsSTPCreditcardAndSuppCard";

import { MEDIUM_GREY, YELLOW, LIGHT_YELLOW, BLACK, WHITE, LIGHT_BLACK } from "@constants/colors";
import { COMMON_ERROR_MSG, FA_APPLY_CREDITCARD_SELECTCARD } from "@constants/strings";

import Assets from "@assets";

const CardListItem = ({ item, onPress }) => {
    const onListItemPressed = useCallback(() => onPress(item), [item, onPress]);
    return (
        <View style={styles.listView}>
            <TouchableOpacity activeOpacity={1} onPress={onListItemPressed}>
                <View style={styles.cardFeatureListClickable}>
                    <View style={styles.cardItemContainer}>
                        <View style={styles.cardRowContainer}>
                            <View style={styles.cardItemSubContainer}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={18}
                                    textAlign="left"
                                    style={styles.cardItemName}
                                    text={item?.level1}
                                />
                                <Image
                                    style={styles.cardItemImg}
                                    resizeMode={Platform.select({
                                        ios: "contain",
                                        android: "cover",
                                    })}
                                    source={{
                                        uri: item?.cardImagePath,
                                    }}
                                />
                            </View>
                            <View style={styles.rightArrowContainer}>
                                <Image
                                    source={Assets.icChevronRight24Black}
                                    style={styles.rightArrowIcon}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

CardListItem.propTypes = {
    item: PropTypes.object,
    onPress: PropTypes.func,
};

const CardList = ({ list, onItemPress }) => {
    const extractKey = useCallback((item, index) => `${item.contentId}-${index}`, []);
    const onListItemPressed = useCallback((item) => onItemPress(item), [onItemPress]);
    const renderItem = useCallback(
        ({ item }) => <CardListItem item={item} onPress={onListItemPressed} />,
        [onListItemPressed]
    );

    return (
        <FlatList
            style={styles.cardList}
            data={list}
            extraData={list}
            scrollToIndex={0}
            showsHorizontalScrollIndicator={false}
            showIndicator={false}
            keyExtractor={extractKey}
            renderItem={renderItem}
        />
    );
};

CardList.propTypes = {
    list: PropTypes.any,
    onItemPress: PropTypes.any,
};

function CardsTypeSelection({ navigation, route }) {
    const params = route?.params ?? {};
    const [featureList, setFeatureList] = useState(params?.formattedFeaturesList ?? []);
    const { getModel } = useModelController();
    const { icNumber } = getModel("user");

    function handleBack() {
        navigation.canGoBack() && navigation.goBack();
    }

    function handleClose() {
        navigation.navigate(route?.params?.entryStack || "More", {
            screen: route?.params?.entryScreen || "Apply",
            params: route?.params?.entryParams,
        });
    }

    async function checkCardsVerifyApi(selectedCard) {
        const param = { selectedCardArray: selectedCard };
        const httpResp = await cardsVerify(param, "loan/v1/cardStp/stpCheckCard").catch((error) => {
            console.log(" Exception: ", error);
        });
        const result = httpResp?.data?.result ?? null;
        if (!result) {
            return;
        }
        const { statusCode, statusDesc } = result;
        if (statusCode === "0000") {
            const stpPackageCode = selectedCard[0].stpPackageCode;
            const ethicalCardPackageCode = [
                "STP0102",
                "STP0104",
                "STP0100",
                "STP0101",
                "STP0103",
                "STP0105",
            ];

            //Ethical Card
            if (ethicalCardPackageCode.includes(stpPackageCode)) {
                const userAction = { ...params?.userAction, selectedCard };
                handleEthicalCard(userAction, selectedCard);
            } else {
                navigation.navigate("CardsIntro", {
                    ...params,
                    userAction: { ...params?.userAction, selectedCard },
                });
            }
        } else {
            showErrorToast({
                message: statusDesc || COMMON_ERROR_MSG,
            });
        }
    }

    function handleProceedButton(newData) {
        const selectedCard = newData.map((item) => ({
            ...item,
            displayValue: item?.level1,
            image: item?.cardImagePath,
        }));

        if (params?.postLogin) {
            checkCardsVerifyApi(selectedCard);
        } else {
            navigation.navigate("CardsIntro", {
                ...params,
                userAction: { ...params?.userAction, selectedCard },
            });
        }
        applyCC.onFormProceedCardTypeSelection(selectedCard);
    }

    async function handleEthicalCard(userAction, selectedCard) {
        console.log(`[CardsTypeSelection] >> [handleEthicalCard]`);
        // make an api call to get the details: stpPackageCode and channelType
        try {
            const stpPackageCode =
                selectedCard && selectedCard.length > 0 ? selectedCard[0].stpPackageCode : "";
            const params = { stpPackageCode, channelType: "mae" };
            const httpResp = await getCutomerPersonalDetails(params);
            const result = httpResp?.result ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
            const isSuccess = result?.isSuccess ?? false;

            if (statusCode === "0000") {
                if (isSuccess) {
                    // Navigate to EC Consent screen
                    navigation.navigate(STP_CARD_MODULE, {
                        screen: EC_CONSENT,
                        params: {
                            ...route.params,
                            userAction,
                            ...result,
                        },
                    });
                } else {
                    // Navigate to ETB Flow
                    navigation.navigate("CardsIntro", {
                        ...route.params,
                        userAction,
                    });
                }
            } else {
                showInfoToast({ message: statusDesc });
            }
        } catch (error) {
            console.log("[CardsTypeSelection][handleEthicalCard] >> Exception: ", error);
        }
    }

    function onSelectCard(value) {
        console.log(`onSelectCard:`, value);
        const newData = [];
        newData.push({ ...value, isSelected: true });
        handleProceedButton(newData);
    }
    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={FA_APPLY_CREDITCARD_SELECTCARD}
        >
            <>
                <ScreenLayout
                    paddingBottom={0}
                    paddingTop={0}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <View style={styles.copy}>
                            <Typo
                                fontSize={14}
                                lineHeight={28}
                                text="Credit Card Application"
                                textAlign="left"
                            />
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={28}
                                style={styles.label}
                                text="Select the right credit card for you"
                                textAlign="left"
                            />
                        </View>
                        <CardList list={featureList} onItemPress={onSelectCard} />
                    </View>
                </ScreenLayout>
            </>
        </ScreenContainer>
    );
}

CardsTypeSelection.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const BottomView = ({ bottomInfo, onDoneEvent, buttonLabel, isButtonEnabled }) => {
    const safeArea = useSafeArea();

    return (
        <View style={styles.containerFooter(safeArea)}>
            <Typo
                fontSize={14}
                fontWeight="600"
                letterSpacing={0}
                lineHeight={18}
                textAlign="left"
                text={bottomInfo}
            />
            <ActionButton
                backgroundColor={isButtonEnabled ? YELLOW : LIGHT_YELLOW}
                onPress={onDoneEvent}
                width={108}
                height={40}
                borderRadius={20}
                componentCenter={
                    <Typo
                        text={buttonLabel}
                        fontSize={14}
                        fontWeight="600"
                        color={isButtonEnabled ? BLACK : LIGHT_BLACK}
                    />
                }
                disabled={!isButtonEnabled}
            />
        </View>
    );
};

BottomView.propTypes = {
    bottomInfo: PropTypes.any,
    buttonLabel: PropTypes.any,
    isButtonEnabled: PropTypes.any,
    onDoneEvent: PropTypes.any,
};

const styles = StyleSheet.create({
    cardFeatureListClickable: {
        backgroundColor: WHITE,
        borderRadius: 8,
    },
    cardItemContainer: { margin: 20, paddingRight: 10 },
    cardItemImg: { height: 96, marginBottom: 10, width: 149 },
    cardItemName: { marginVertical: 5 },
    cardItemSubContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        paddingRight: 15,
        width: "90%",
    },
    cardList: { width: "100%" },

    cardRowContainer: {
        alignContent: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    container: {
        flex: 1,
    },
    containerFooter: (inset) => ({
        alignItems: "center",
        backgroundColor: WHITE,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 18,
        paddingHorizontal: 24,
        paddingBottom: inset.bottom ? inset.bottom : 18,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 15,
        shadowOpacity: 1,
    }),
    copy: {
        marginBottom: 2,
        paddingHorizontal: 36,
    },
    label: {
        marginBottom: 24,
    },
    listView: {
        marginBottom: 14,
        paddingHorizontal: 36,
    },
    rightArrowIcon: {
        height: 24,
        width: 24,
    },
    rightArrowContainer: { justifyContent: "center" },
});

export default CardsTypeSelection;
