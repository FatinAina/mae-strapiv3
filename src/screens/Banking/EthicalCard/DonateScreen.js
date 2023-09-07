import { parseInt } from "lodash";
import moment from "moment";
import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useRef, useEffect } from "react";
import {
    ScrollView,
    TouchableOpacity,
    View,
    StyleSheet,
    Image,
    Text,
    ImageBackground,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import HTML from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import {
    DASHBOARD_STACK,
    DONATE_CONFIRMATION_SCREEN,
    ETHICAL_CARD_STACK,
} from "@navigation/navigationConstant";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import HorizontalRadioButton from "@components/EthicalCardComponents/HorizontalRadioButton";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { calculateCarbonOffsetAPI, pfmGetData } from "@services";

import {
    GREY,
    RED,
    ROYAL_BLUE,
    SHADOW,
    WHITE,
    YELLOW,
    DARK_GREY,
    MEDIUM_GREY,
    GREEN,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
} from "@constants/colors";
import {
    FOOTPRINT_CALCULATION_POPUP_BODY,
    FOOTPRINT_CALCULATION_POPUP_HEADER,
    CARBON_FOOTPRINT_PRODUCED,
    HOW_IS_THIS_CALCULATED,
    DONATE_TO_OFFSET,
    DONATION_FORM_ERROR_MSG,
    PAY_NOW,
    PROJECT_DETAILS,
    CARBON_OFFSET,
    OFFSET_CALCULATOR_INVALID,
    OFFSET_CALCULATOR_DEFAULT,
    CALCULATE,
    CALCULATE_AGAIN,
    FOOTER_NOTE_DONATE,
    COMMON_ERROR_MSG,
    SHOW_LESS,
    READ_MORE,
    CURRENCY_CODE,
    AMOUNT_PLACEHOLDER,
    DATE_PARAM_FORMAT,
} from "@constants/strings";

import Assets from "@assets";

const { width } = Dimensions.get("window");

const DonateScreen = ({ navigation, route, getModel }) => {
    const [state, setState] = useState({
        showPopup: false,
        showImageModal: false,
        showKeyboard: false,
        keypadHeight: 0,
        amoutFieldYPosition: 0,

        popupTitle: "",
        popupDesc: "",

        carbonFootprintAmount: 0,

        donationAmount: "", // actual value with formatting
        donationAmountValue: 0, //keypad display
        selectedAmount: 0, //radio value & to compare between radio selected val and text input val

        isDonationAmountValid: true,
        isContinueButtonValid: false,

        carbonCalculationText: "default",
        calculateCTADisabled: true,
        calculatedOffsetAmount: 0,
        calculateCTALoader: false,

        isViewMore: false,
        projectDetailHeight: 150,
    });

    const params = route?.params;

    const scrollRef = useRef();
    const safeAreaInsets = useSafeAreaInsets();

    useEffect(() => {
        fetchCarbonFootprintData();
    }, []);

    useEffect(() => {
        setState({
            ...state,
            calculateCTADisabled: state.selectedAmount < 1,
            isContinueButtonValid: false,
            calculateCTALoader: false,
        });
    }, [state.selectedAmount]);

    const onPressViewMore = () => {
        setState({
            ...state,
            isViewMore: !state.isViewMore,
            projectDetailHeight: state.isViewMore ? 150 : "auto",
        });
    };

    const onPopupClose = () => {
        setState({ ...state, popupTitle: "", popupDesc: "", showPopup: false });
    };

    const onPopupOpen = () => {
        setState({
            ...state,
            popupTitle: FOOTPRINT_CALCULATION_POPUP_HEADER,
            popupDesc: FOOTPRINT_CALCULATION_POPUP_BODY,
            showPopup: true,
            showKeyboard: false,
        });
    };

    const calculateCarbonOffset = async () => {
        try {
            setState({ ...state, calculateCTALoader: true, calculateCTADisabled: true });

            const data = { amount: state.selectedAmount };
            const response = await calculateCarbonOffsetAPI(data);

            if (response && response?.amount) {
                setState({
                    ...state,
                    calculatedOffsetAmount: response?.amount,
                    carbonCalculationText: "valid",
                    isContinueButtonValid: true,
                    calculateCTALoader: false,
                });
            } else {
                setState({
                    ...state,
                    carbonCalculationText: "invalid",
                    calculateCTADisabled: false,
                    calculateCTALoader: false,
                });
            }
        } catch (error) {
            setState({
                ...state,
                carbonCalculationText: "invalid",
                calculateCTADisabled: false,
                calculateCTALoader: false,
            });
            showInfoToast({ message: error?.message || COMMON_ERROR_MSG });
        }
    };

    const fetchCarbonFootprintData = async () => {
        //reuse pfm api to fetch total carbon footprint - filter by current month from start of month
        try {
            const date = new Date();

            let endDate;
            date.setDate(1);

            if (moment(date).isSame(new Date(), "month")) {
                endDate = moment().format(DATE_PARAM_FORMAT);
            } else {
                endDate = moment(date)
                    .add(1, "months")
                    .subtract(1, "days")
                    .format(DATE_PARAM_FORMAT);
            }
            const startDate = moment(date).format(DATE_PARAM_FORMAT);
            const cardNo = params?.cardDetails?.cardNo;

            const url = `/pfm/creditCard/transaction/history?startDate=${startDate}&endDate=${endDate}&acctNos=${cardNo}`;
            const response = await pfmGetData(url, false);
            if (response) {
                setState({
                    ...state,
                    carbonFootprintAmount:
                        response?.data?.carbonFootprintAmountSum?.toFixed(2) ?? 0,
                });
            }
        } catch (error) {
            console.log("ERORR", error);
        }
    };

    const onSelectAmount = (val) => {
        const formatted = val.toFixed(2);
        setState({
            ...state,
            donationAmount: formatted,
            donationAmountValue: val * 100,
            isDonationAmountValid: true,
            selectedAmount: val,
        });
    };

    const onChangeDonationAmount = (val) => {
        const value = val ? parseInt(val, 10) : 0;
        const rawAmt = !val ? "" : parseInt(val, 10) / 100;
        const formatted = !val ? "" : numeral(rawAmt).format("0,0.00");

        if (value > 0) {
            setState({
                ...state,
                donationAmount: formatted,
                donationAmountValue: value,
                selectedAmount: rawAmt,
            });
        } else {
            setState({
                ...state,
                donationAmount: "",
                donationAmountValue: value,
                selectedAmount: rawAmt,
            });
        }
    };

    const onShowKeyboard = () => {
        setState({ ...state, showKeyboard: true });
        setTimeout(() => {
            scrollRef.current.scrollTo({ x: 0, y: state.amoutFieldYPosition, animated: true });
        }, 500);
    };

    const onKeyboardDone = () => {
        validateDonationAmount();
    };

    const getKeypadHeight = (height) => {
        setState({ ...state, keypadHeight: height });
    };

    const validateDonationAmount = () => {
        if (state.donationAmountValue / 100 < 1) {
            setState({
                ...state,
                isDonationAmountValid: false,
                showKeyboard: false,
            });
        } else {
            setState({
                ...state,
                isDonationAmountValid: true,
                showKeyboard: false,
            });
        }
    };

    const onContinuePress = () => {
        const payeeDetails = JSON.parse(params?.projectDetails?.riskChallenge);

        navigation.navigate(ETHICAL_CARD_STACK, {
            screen: DONATE_CONFIRMATION_SCREEN,
            params: {
                ...route.params,
                donationAmount: state.selectedAmount,
                carbonOffsetAmount: state.calculatedOffsetAmount,
                projectName: params?.projectDetails?.title,
                payeeDetails,
            },
        });
    };

    const navToBrowser = (evt, href) => {
        navigation.navigate(DASHBOARD_STACK, {
            screen: "ExternalUrl",
            params: {
                url: href,
            },
        });
    };

    const renderHeaderText = () => {
        return (
            <View style={styles.headerTextContainer}>
                <Image source={Assets.icOffsetInitiative} style={styles.headerIcon} />
                <Typo
                    fontSize={20}
                    textAlign="left"
                    fontWeight="600"
                    color={WHITE}
                    lineHeight={24}
                    numberOfLines={3}
                    text={params?.projectDetails?.title}
                />
            </View>
        );
    };

    const renderTopHeader = () => {
        return (
            <HeaderLayout
                headerCenterElement={
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={19}
                        color={WHITE}
                        text={CARBON_OFFSET}
                    />
                }
                headerLeftElement={
                    <HeaderBackButton
                        onPress={() => {
                            navigation.goBack();
                        }}
                        isWhite={true}
                    />
                }
            />
        );
    };

    const renderProjectHeader = () => {
        return (
            <>
                <ImageBackground
                    style={styles.projectImageHeader}
                    resizeMode="stretch"
                    source={{
                        uri: params?.projectDetails?.campaignBanner,
                    }}
                >
                    <View style={styles.projectHeaderContainer}>
                        {renderTopHeader()}
                        {renderHeaderText()}
                    </View>
                </ImageBackground>
            </>
        );
    };

    const renderCarbonFootprintWidget = () => {
        return (
            <ImageBackground
                style={styles.footprintWidgetContainer}
                resizeMode="stretch"
                source={Assets.carbonFootprintBanner}
            >
                <Typo
                    fontSize={12}
                    fontWeight="600"
                    textAlign="left"
                    lineHeight={16}
                    text={CARBON_FOOTPRINT_PRODUCED}
                />
                <View style={styles.footprintWidgetTextContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        textAlign="left"
                        lineHeight={20}
                        color={RED}
                        style={styles.carbonFootprintText}
                    >
                        <Text>{state.carbonFootprintAmount}</Text>
                        <Text> Kg CO₂</Text>
                    </Typo>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        onPopupOpen();
                    }}
                >
                    <Typo
                        color={ROYAL_BLUE}
                        fontSize={12}
                        textAlign="left"
                        fontWeight="600"
                        lineHeight={16}
                        style={styles.hyperlinkText}
                        text={HOW_IS_THIS_CALCULATED}
                    />
                </TouchableOpacity>
            </ImageBackground>
        );
    };

    const renderCarbonCalculationSection = () => {
        function renderCarbonText() {
            switch (state.carbonCalculationText) {
                case "valid":
                    return (
                        <Typo
                            fontSize={12}
                            fontWeight="600"
                            textAlign="left"
                            color={DARK_GREY}
                            style={styles.carbonCalculationText}
                        >
                            <Text>{"You will offset\n"}</Text>
                            <Text style={{ color: GREEN }}>
                                {state.calculatedOffsetAmount?.toFixed(2)} Kg CO₂
                            </Text>
                        </Typo>
                    );
                case "invalid":
                    return (
                        <Typo
                            fontSize={12}
                            fontWeight="600"
                            textAlign="left"
                            color={RED}
                            style={styles.carbonCalculationText}
                            text={OFFSET_CALCULATOR_INVALID}
                        />
                    );
                case "default":
                    return (
                        <Typo
                            fontSize={12}
                            textAlign="left"
                            style={styles.carbonCalculationText}
                            text={OFFSET_CALCULATOR_DEFAULT}
                        />
                    );
            }
        }

        return (
            <View style={styles.calculateCarbonOffsetContainer}>
                {state.carbonCalculationText !== "default" && (
                    <Image source={Assets.icOffsetLeaf} style={styles.carbonOffsetIcon} />
                )}

                {renderCarbonText()}

                <TouchableOpacity
                    style={styles.calculateCTA(state.calculateCTADisabled)}
                    onPress={calculateCarbonOffset}
                    disabled={state.calculateCTADisabled}
                >
                    {state.calculateCTALoader ? (
                        <ActivityIndicator size="small" color={GREY} />
                    ) : (
                        <Typo
                            text={
                                state.carbonCalculationText === "default"
                                    ? CALCULATE
                                    : CALCULATE_AGAIN
                            }
                            color={state.calculateCTADisabled ? DISABLED_TEXT : BLACK}
                            fontSize={12}
                            fontWeight="600"
                            lineHeight={16}
                        />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    const onLayout = ({
        nativeEvent: {
            layout: { y },
        },
    }) => {
        console.log("height", y);
        setState({ ...state, amoutFieldYPosition: y });
    };

    const renderDonationSection = () => {
        const radioValueList = [5, 10, 15, 30, 50]; // as per biz requirement

        return (
            <>
                <View style={styles.donateSectionContainer}>
                    {renderCarbonFootprintWidget()}
                    <View style={styles.donateFormContainer}>
                        <Typo textAlign="left" lineHeight={18} text={DONATE_TO_OFFSET} />
                        <View activeOpacity={1} onTouchEnd={onShowKeyboard}>
                            <TextInput
                                placeholder={AMOUNT_PLACEHOLDER}
                                prefix={CURRENCY_CODE}
                                prefixStyle={[{ color: GREY }]}
                                isValid={state.isDonationAmountValid}
                                isValidate
                                errorMessage={DONATION_FORM_ERROR_MSG}
                                value={state.donationAmount}
                                onChangeText={(val) => {
                                    onChangeDonationAmount(val);
                                }}
                                editable={false}
                            />
                        </View>
                        <HorizontalRadioButton
                            valueList={radioValueList}
                            selectedValue={state.selectedAmount}
                            onPress={onSelectAmount}
                        />
                        {renderCarbonCalculationSection()}
                        <Typo fontSize={12} textAlign="left" color={DARK_GREY} lineHeight={16}>
                            <Text style={styles.footnoteText}>Note: </Text>
                            <Text>{FOOTER_NOTE_DONATE}</Text>
                        </Typo>
                    </View>
                </View>
                <FixedActionContainer>
                    <View style={styles.continueButtonContainer(safeAreaInsets.bottom)}>
                        <ActionButton
                            disabled={!state.isContinueButtonValid}
                            fullWidth
                            componentCenter={
                                <Typo
                                    color={!state.isContinueButtonValid ? DISABLED_TEXT : BLACK}
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={PAY_NOW}
                                />
                            }
                            backgroundColor={!state.isContinueButtonValid ? DISABLED : YELLOW}
                            onPress={onContinuePress}
                        />
                    </View>
                </FixedActionContainer>
            </>
        );
    };

    const validateHtmlContent = (html) => {
        //app will crash upon unrecognizable font-family, validating html first before rendering
        if (html) {
            if (html.toLowerCase().indexOf("font-family") !== -1) {
                return "<p><p/>";
            } else {
                return html;
            }
        }
    };

    const renderDonateScreenContainer = () => {
        const contentHtml = validateHtmlContent(params?.projectDetails?.longDesc);
        return (
            <View style={styles.donateContainer}>
                <View style={styles.projectHeading}>
                    <Typo
                        fontWeight="600"
                        lineHeight={16}
                        style={styles.projectDetailText}
                        text={PROJECT_DETAILS}
                    />
                    <View
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                            overflow: "hidden",
                            height: state.projectDetailHeight,
                        }}
                    >
                        <HTML
                            html={contentHtml}
                            baseFontStyle={styles.subtitleBaseFont}
                            tagsStyles={{
                                font: {
                                    fontFamily: "montserrat",
                                    fontSize: 12,
                                    fontWeight: "normal",
                                    lineHeight: 20,
                                    color: BLACK,
                                },
                                p: {
                                    fontFamily: "montserrat",
                                    fontSize: 12,
                                    fontWeight: "normal",
                                    lineHeight: 20,
                                    color: BLACK,
                                },
                                a: {
                                    fontFamily: "montserrat",
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    lineHeight: 20,
                                    color: ROYAL_BLUE,
                                },
                            }}
                            imagesMaxWidth={width * 0.8}
                            onLinkPress={navToBrowser}
                        />
                    </View>
                    {!state.isViewMore && (
                        <LinearGradient
                            colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
                            style={styles.linearGradientContainer}
                        />
                    )}
                    <TouchableOpacity onPress={onPressViewMore}>
                        <Typo
                            fontWeight="600"
                            fontSize={12}
                            textAlign="left"
                            text={state.isViewMore ? SHOW_LESS : READ_MORE}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.subSectionContainer} onLayout={onLayout}>
                    {/* {renderGallerySection()} */}
                    {renderDonationSection()}
                </View>
            </View>
        );
    };

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScrollView
                    ref={scrollRef}
                    scrollToOverflowEnabled={true}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    alwaysBounceVertical={false}
                >
                    <View>
                        {renderProjectHeader()}
                        {renderDonateScreenContainer()}
                    </View>

                    {/* Vertical Spacer for when keypad visible*/}
                    <View
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                            height: state.showKeyboard ? state.keypadHeight : 0,
                        }}
                    />
                </ScrollView>
                <Popup
                    visible={state.showPopup}
                    onClose={onPopupClose}
                    title={state.popupTitle}
                    description={state.popupDesc}
                />
            </ScreenContainer>
            <SlidingNumPad
                showNumPad={state.showKeyboard}
                value={`${state.donationAmountValue}`}
                maxLength={8}
                onChange={(val) => {
                    onChangeDonationAmount(val);
                }}
                getHeight={getKeypadHeight}
                onDone={onKeyboardDone}
            />
        </>
    );
};

DonateScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    projectImageHeader: { width: "100%", height: 300 },
    headerIcon: { marginBottom: 15 },
    subSectionContainer: { backgroundColor: MEDIUM_GREY, paddingTop: 30 },
    donateContainer: {
        marginTop: -50,
        paddingTop: 10,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        backgroundColor: WHITE,
    },
    footprintWidgetContainer: {
        padding: 14,
        justifyContent: "space-between",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: "hidden",
    },
    footprintWidgetTextContainer: { flexDirection: "row" },
    carbonFootprintText: { marginRight: 15 },
    hyperlinkText: { textDecorationLine: "underline" },
    calculateCarbonOffsetContainer: { flexDirection: "row", marginTop: 10, marginBottom: 24 },
    calculateCTA: (ctaDisabled) => ({
        flex: 2,
        height: 30,
        backgroundColor: ctaDisabled ? DISABLED : YELLOW,
        borderRadius: 25,
        justifyContent: "center",
        alignSelf: "center",
    }),
    carbonCalculationText: { marginRight: 20, flex: 2, alignSelf: "center" },
    carbonOffsetIcon: {
        marginHorizontal: 10,
        height: 20,
        width: 15,
        alignSelf: "center",
    },
    projectHeading: {
        flex: 1,
        padding: 24,
    },
    donateSectionContainer: {
        elevation: 10,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 3,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 10,
        marginHorizontal: 24,
        marginBottom: 40,
        borderRadius: 10,
    },
    donateFormContainer: {
        backgroundColor: WHITE,
        padding: 16,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    footnoteText: { fontWeight: "600" },
    continueButtonContainer: (bottom) => ({ width: "100%", marginBottom: bottom }),
    subtitleBaseFont: {
        color: BLACK,
        fontFamily: "montserrat",
        fontSize: 12,
        fontWeight: "400",
    },
    headerTextContainer: { marginBottom: 70, marginHorizontal: 24 },
    // eslint-disable-next-line react-native/no-color-literals
    projectHeaderContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "space-between",
    },
    projectDetailText: { paddingBottom: 10, alignSelf: "flex-start" },
    linearGradientContainer: { height: 40, marginTop: -40, marginBottom: 10 },
});

export default withModelContext(DonateScreen);
