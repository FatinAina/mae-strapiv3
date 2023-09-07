import { useRoute, useNavigation } from "@react-navigation/native";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useCallback, useState, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Keyboard } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import {
    ATM_WITHDRAW_CONFIRMATION,
    ATM_AMOUNT_SCREEN,
    ADD_PREFERRED_AMOUNT,
    ATM_CASHOUT_STACK,
    QRPAY_MAIN,
    QR_STACK,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { TopMenu } from "@components/TopMenu";

import { useModelController } from "@context";

import {
    YELLOW,
    BLACK,
    GREY,
    DISABLED,
    DISABLED_TEXT,
    GHOST_WHITE,
    MEDIUM_GREY,
} from "@constants/colors";
import { HOW_TO_USE, MUST_BE } from "@constants/strings";

import { handleGoToATMCashOutArticle } from "@utils/atmCashoutUtil";

import Images from "@assets";

const CloseButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.closeButton}>
        <Image source={Images.icCloseBlack} style={styles.closeButtonIcon} />
    </TouchableOpacity>
);
CloseButton.propTypes = {
    onPress: PropTypes.func,
};
const ATMAmountInputScreenTemplate = ({
    topComponent,
    bottomComponent,
    onHeaderBackButtonPressed,
    headerCenterText,
    textInputPrefix,
    textInputMaxLength,
    buttonText,
    isDisabled,
    setIsDisabled,
    showKeypad,
    setShowKeypad,
    qrParams,
    focusOnAmount,
    selectedPreferredAmount,
    amount,
    setAmount,
}) => {
    const screenHeight = Dimensions.get("window").height;
    const [textInputErrorMessage, setTextInputErrorMessage] = useState("");
    const route = useRoute();
    const navigation = useNavigation();
    const small = 500;
    const { updateModel } = useModelController();

    const [state, setState] = useState({
        isAmountValid: true,
        amountTextDisplay: "0.00",
        numericKeyboardVal: "0",
        menuArray: [],
        showMenu: false,
        textInputErrorMessage: "",
        showDotDotDot: true,
    });

    const setIsAmountValid = (value) => {
        setState((prevState) => ({
            ...prevState,
            isAmountValid: value,
        }));
    };

    const { isAmountValid, amountTextDisplay, numericKeyboardVal } = state;

    useEffect(() => {
        if (route?.params?.routeFrom === ADD_PREFERRED_AMOUNT) {
            updateAmount(0, "0");
        }
    }, [route]);

    useEffect(() => {
        const emptySelectedAmount = selectedPreferredAmount != null;
        const validAmount = (amount !== 0 && isAmountValid) || emptySelectedAmount;
        const amountSameAsPreferred = amount === selectedPreferredAmount;
        setIsDisabled(!validAmount);
        if (emptySelectedAmount && !amountSameAsPreferred) {
            updateAmount(0, "0");
        }
    }, [selectedPreferredAmount, amount]);

    useEffect(() => {
        const checkSelectedAmount =
            route?.params?.preferredAmountList?.includes(selectedPreferredAmount);
        if (!checkSelectedAmount) {
            setIsDisabled(true);
        }
    }, [route?.params?.preferredAmountList]);

    const handleATMArticle = () => {
        handleGoToATMCashOutArticle(
            navigation,
            setState((prevState) => ({ ...prevState, showMenu: false }))
        );
    };

    const updateAmount = (amtNumber, newValueStr) => {
        setState((prevState) => ({
            ...prevState,
            amountTextDisplay: Numeral(amtNumber).format("0,0.00"),
            numericKeyboardVal: newValueStr,
        }));
        setAmount(amtNumber);
    };

    const onNumPadButtonPressed = useCallback(
        (val) => {
            if (val === "00" && numericKeyboardVal === "0") {
                return;
            }
            const newValueStr = val;
            let amtInt = parseInt(newValueStr);
            amtInt = isNaN(amtInt) ? 0 : amtInt;
            const amtNumber = amtInt / 100;
            updateAmount(amtNumber, val);
        },
        [numericKeyboardVal, updateAmount]
    );

    const onNumPadDoneButtonPressed = (value) => {
        setIsAmountValid(true);
        if (!value) {
            setIsAmountValid(false);
        } else {
            const modValue = Number(value);
            const amountIsValid = modValue % 50 === 0 && modValue <= 1500;
            if (!amountIsValid) {
                setIsAmountValid(false);
                setTextInputErrorMessage(MUST_BE);
                setIsDisabled(true);
            }
        }
    };

    const onDonePress = useCallback(() => {
        if (amount) {
            onNumPadDoneButtonPressed(amount);
            updateModel({
                atm: {
                    selectedAmount: amount,
                    entryPoint: route.params.entryPoint,
                },
            });
            setShowKeypad(false);
            setIsDisabled(false);
        } else {
            setShowKeypad(false);
            setIsDisabled(true);
        }
    }, [onNumPadDoneButtonPressed, amount, showKeypad, isDisabled]);

    const showMenuToggle = useCallback(() => {
        const menuArray = [
            {
                menuLabel: HOW_TO_USE,
                menuParam: "MANAGE_PREFERRED_AMOUNT",
            },
        ];
        setState((prevState) => ({
            ...prevState,
            showMenu: true,
            menuArray,
            showDotDotDot: false,
        }));
    }, [state.showMenu, state.menuArray]);

    const onSubmit = async () => {
        if (!selectedPreferredAmount) {
            if (amount && isAmountValid && !isDisabled) {
                const transferAmountStr = amount.toString();
                let params = {
                    ...route.params,
                    routeFrom: ATM_AMOUNT_SCREEN,
                    transferAmount: transferAmountStr,
                };
                if (buttonText === "Next") {
                    if (typeof qrParams !== "undefined" && qrParams !== null) {
                        const { qrText, refNo } = JSON.parse(qrParams);
                        params = {
                            ...params,
                            qrText,
                            refNo,
                        };
                    }
                    navigation.navigate(ATM_CASHOUT_STACK, {
                        screen: ATM_WITHDRAW_CONFIRMATION,
                        params,
                    });
                } else {
                    // TO BE USED AS PER DIFFERENT ENTRY POINTS
                    updateModel({
                        atm: {
                            entryPoint: route.params.entryPoint,
                            textEntryPoint: ATM_AMOUNT_SCREEN,
                        },
                    });
                    navigation.navigate(QR_STACK, {
                        screen: QRPAY_MAIN,
                        params: {
                            ...route.params,
                            routeFrom: ATM_AMOUNT_SCREEN,
                            transferAmount: transferAmountStr,
                        },
                    });
                }
            }
        } else {
            const selectedPreferredAmountString = Numeral(selectedPreferredAmount).format("0,0.00");
            //SELECTED PREFERRED AMOUNT onSubmit
            if (buttonText === "Next") {
                let params = {
                    ...route.params,
                    routeFrom: ATM_AMOUNT_SCREEN,
                    transferAmount: selectedPreferredAmountString,
                };
                if (typeof qrParams !== "undefined" && qrParams !== null) {
                    const { qrText, refNo } = JSON.parse(qrParams);
                    params = {
                        ...params,
                        qrText,
                        refNo,
                    };
                }
                navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_WITHDRAW_CONFIRMATION,
                    params,
                });
            } else {
                // TO BE USED AS PER DIFFERENT ENTRY POINTS
                updateModel({
                    atm: {
                        entryPoint: route.params.entryPoint,
                        textEntryPoint: ATM_AMOUNT_SCREEN,
                    },
                });
                navigation.navigate(QR_STACK, {
                    screen: QRPAY_MAIN,
                    params: {
                        ...route.params,
                        routeFrom: ATM_AMOUNT_SCREEN,
                        transferAmount: selectedPreferredAmount,
                    },
                });
            }
        }
    };

    return (
        <>
            <ScreenContainer backgroundType="color">
                <View style={styles.container}>
                    <ScreenLayout
                        header={
                            <>
                                {!state.showMenu ? (
                                    <HeaderLayout
                                        headerLeftElement={
                                            onHeaderBackButtonPressed && (
                                                <HeaderBackButton
                                                    onPress={onHeaderBackButtonPressed}
                                                />
                                            )
                                        }
                                        headerCenterElement={
                                            headerCenterText ? (
                                                <Typo
                                                    text={headerCenterText}
                                                    fontWeight="600"
                                                    fontSize={16}
                                                    lineHeight={19}
                                                />
                                            ) : null
                                        }
                                        headerRightElement={
                                            <HeaderDotDotDotButton
                                                onPress={() => showMenuToggle()}
                                            />
                                        }
                                    />
                                ) : (
                                    <HeaderLayout />
                                )}
                            </>
                        }
                        scrollable
                        paddingLeft={24}
                    >
                        <View style={styles.informationContainer}>
                            <View style={styles.top}>{topComponent}</View>
                            <TextInput
                                showSoftInputOnFocus={false}
                                accessibilityLabel="Password"
                                importantForAutofill="no"
                                editable
                                clearButtonMode="while-editing"
                                value={amountTextDisplay}
                                prefix={textInputPrefix}
                                isValidate
                                isValid={isAmountValid}
                                errorMessage={textInputErrorMessage}
                                maxLength={textInputMaxLength}
                                placeholder="0.00"
                                prefixStyle={styles.blackPrefix}
                                onBlur={() => amountTextDisplay && setIsAmountValid(true)}
                                onFocus={() => {
                                    setIsDisabled(false);
                                    setShowKeypad(true);
                                    Keyboard.dismiss();
                                    focusOnAmount();
                                }}
                                style={{
                                    color: !amount || !amountTextDisplay ? GREY : BLACK,
                                }}
                            />
                            {isAmountValid && (
                                <View style={styles.bottomScrollable(showKeypad, screenHeight)}>
                                    {bottomComponent}
                                </View>
                            )}
                        </View>
                    </ScreenLayout>
                    <View style={styles.keypad(showKeypad)}>
                        {showKeypad && (
                            <NumericalKeyboard
                                value={numericKeyboardVal}
                                onChangeText={onNumPadButtonPressed}
                                maxLength={8}
                                onDone={() => onDonePress()}
                            />
                        )}
                    </View>
                    <View style={styles.imgView(showKeypad, screenHeight, small, route)}>
                        <Image
                            source={Images.dashboardManageWidgetIllustration}
                            resizeMode="stretch"
                            style={styles.imgWidth}
                        />
                    </View>
                    <View>
                        <LinearGradient
                            colors={[GHOST_WHITE, MEDIUM_GREY]}
                            style={styles.linearGradient1}
                        />
                        <ActionButton
                            style={styles.actionButton}
                            borderRadius={24}
                            backgroundColor={isDisabled ? DISABLED : YELLOW}
                            onPress={() => onSubmit()}
                            disabled={isDisabled}
                            componentCenter={
                                <Typo
                                    text={buttonText}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={17}
                                    color={isDisabled ? DISABLED_TEXT : BLACK}
                                />
                            }
                        />
                        <LinearGradient
                            start={{ x: 1, y: 1 }}
                            end={{ x: 1, y: 1 }}
                            colors={[GHOST_WHITE, MEDIUM_GREY]}
                            style={styles.linearGradient2}
                        />
                    </View>
                </View>
            </ScreenContainer>
            {state.showMenu && (
                <TopMenu
                    showTopMenu={state.showMenu}
                    onClose={() =>
                        setState((prevState) => ({
                            ...prevState,
                            showMenu: false,
                            showDotDotDot: true,
                        }))
                    }
                    menuArray={state.menuArray}
                    onItemPress={() => handleATMArticle()}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    blackPrefix: {
        color: BLACK,
    },
    bottomScrollable: (showKeypad, screenHeight) => ({
        marginBottom: showKeypad ? screenHeight * 0.08 : 0,
    }),
    imgView: (showKeypad, screenHeight, small, route) => {
        const preferredAmountListLength = route?.params?.preferredAmountList?.length || 0;
        const isSmallScreen = screenHeight <= small;
        const calculateMarginBottom = (factor) => -screenHeight * factor;

        let marginBottom;

        if (showKeypad) {
            marginBottom = isSmallScreen ? calculateMarginBottom(0.4) : calculateMarginBottom(0.13);
        } else {
            switch (preferredAmountListLength) {
                case 2:
                    marginBottom = isSmallScreen
                        ? calculateMarginBottom(0.5)
                        : calculateMarginBottom(0.1);
                    break;
                case 3:
                    marginBottom = isSmallScreen
                        ? calculateMarginBottom(0.5)
                        : calculateMarginBottom(0.13);
                    break;
                default:
                    marginBottom = calculateMarginBottom(0.15);
            }
        }

        return {
            marginBottom,
        };
    },
    actionButton: {
        marginBottom: 36,
        marginLeft: 18,
        width: "90%",
    },
    imgWidth: { width: "100%" },
    container: {
        flexGrow: 1,
    },
    linearGradient2: {
        height: 36,
        left: 0,
        position: "absolute",
        right: 0,
        bottom: 0,
    },
    linearGradient1: {
        height: 120,
        left: 0,
        position: "absolute",
        right: 0,
        bottom: 36,
    },
    top: {
        width: "100%",
    },
    closeButton: {
        padding: 20,
    },
    informationContainer: {
        alignItems: "flex-start",
    },
    keypad: (showKeypad) => ({
        zIndex: showKeypad ? 1 : 0,
        position: "absolute",
        width: "100%",
        bottom: 0,
    }),
});

ATMAmountInputScreenTemplate.propTypes = {
    topComponent: PropTypes.element,
    bottomComponent: PropTypes.element,
    onHeaderBackButtonPressed: PropTypes.func.isRequired,
    onHeaderCloseButtonPressed: PropTypes.func,
    isTextInputValueValid: PropTypes.bool,
    textInputPrefix: PropTypes.string,
    headerCenterText: PropTypes.string,
    textInputMaxLength: PropTypes.number,
    _selectedAmount: PropTypes.string,
    headerData: PropTypes.object,
    buttonText: PropTypes.string,
    isDisabled: PropTypes.bool,
    setIsDisabled: PropTypes.func,
    qrParams: PropTypes.object,
    focusOnAmount: PropTypes.func,
    selectedPreferredAmount: PropTypes.number,
    amount: PropTypes.number,
    setAmount: PropTypes.number,
    showKeypad: PropTypes.bool,
    setShowKeypad: PropTypes.bool,
};

ATMAmountInputScreenTemplate.defaultProps = {
    topComponent: null,
    bottomComponent: null,
    isTextInputValueValid: true,
    textInputPrefix: "RM",
    textInputMaxLength: 11,
    _selectedAmount: "",
    headerCenterText: "",
    headerData: {},
    buttonText: "",
};

export default React.memo(ATMAmountInputScreenTemplate);
