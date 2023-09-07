import { useRoute, useNavigation } from "@react-navigation/native";
import React, { useState, useCallback, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, Keyboard } from "react-native";

import {
    ADD_PREFERRED_AMOUNT,
    ATM_CASHOUT_STACK,
    ATM_WITHDRAW_CONFIRMATION,
    ATM_AMOUNT_SCREEN,
    REMOVE_PREFERRED_AMOUNT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderDotDotDotButton from "@components/Buttons/HeaderDotDotDotButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showInfoToast } from "@components/Toast";
import { TopMenu } from "@components/TopMenu";

import { withModelContext, useModelController } from "@context";

import {
    MEDIUM_GREY,
    WHITE,
    BLACK,
    ASH_GREY,
    GREY,
    YELLOW,
    DISABLED,
    DISABLED_TEXT,
} from "@constants/colors";
import {
    CONFIRMATION,
    WITHDRAWAL_SCREEN,
    MUST_BE,
    HOW_TO_USE,
    SET_AMOUNT,
    ADD_PREF_AMOUNT,
    ADDED_PREF_AMOUNT,
    NO_AMOUNT,
    ADD,
    SHARE_RECEIPT,
    BACK,
    CONFIRM,
    CANCEL,
    REMOVAL_DESC_AMOUNT_ATMCASHOUT,
    DUPLICATE_ADDED_PREFERRED,
    MAX_THREE_PREFERRED,
} from "@constants/strings";

import {
    setItemInStorage,
    getItemFromStorage,
    handleGoToATMCashOutArticle,
} from "@utils/atmCashoutUtil";

import RemovePreferredAmount from "./RemovePreferredAmount";

const AddPreferredAmount = () => {
    const route = useRoute();
    const { params } = route;
    const navigation = useNavigation();
    const textInputPrefix = route?.params?.textInputPrefix;
    const textInputMaxLength = route?.params?.textInputMaxLength;
    const [state, setState] = useState({
        isAmountValid: true,
        textInputErrorMessage: "",
        menuArray: [],
        showMenu: false,
        amount: 0,
        amountTextDisplay: "0.00",
        numericKeyboardVal: "0",
        isFirstTime: true,
        showAddButton: false,
        showBackButton: false,
        tempList: [],
        showKeypad: false,
        hideHeader: false,
        popupVisible: false,
        selectedItem: null,
        load: false,
        shareReceiptLoaded: false,
        backFromShareReceipt: false,
    });

    const updateAmount = (amtNumber, newValueStr) => {
        const amountTextDisplay = amtNumber.toFixed(2);

        setState((prevState) => ({
            ...prevState,
            amount: amtNumber,
            amountTextDisplay,
            numericKeyboardVal: newValueStr,
        }));
    };

    const setHideHeader = (value) => {
        setState((prevState) => ({
            ...prevState,
            hideHeader: value,
        }));
    };
    const setPopupVisible = (value) => {
        setState((prevState) => ({
            ...prevState,
            popupVisible: value,
        }));
    };

    const setSelectedItem = (value) => {
        setState((prevState) => ({
            ...prevState,
            selectedItem: value,
        }));
    };

    const { amountTextDisplay, amount } = state;
    const [isDisabled, setIsDisabled] = useState(!amountTextDisplay || !amount);
    const { getModel, updateModel } = useModelController();

    const onNumPadButtonPressed = useCallback(
        (val) => {
            if (val === "00" && state.numericKeyboardVal === "0") {
                return;
            }
            const newValueStr = val;
            let amtInt = parseInt(newValueStr);
            amtInt = isNaN(amtInt) ? 0 : amtInt;
            const amtNumber = amtInt / 100;
            updateAmount(amtNumber, val);
        },
        [state.numericKeyboardVal, updateAmount]
    );

    const verifyAmount = (amount) => {
        if (!state.isFirstTime || state.tempList) {
            if (!route?.params?.preferredAmountList?.length) {
                return false;
            }
            const isAmountExists = state.tempList.filter((filterObj) => {
                return parseInt(filterObj) === amount;
            });
            return isAmountExists.length > 0;
        }
    };

    const checkAddingPreferredAmount = (value) => {
        const modValue = Number(value);
        const amountIsValid = modValue % 50 === 0 && modValue <= 1500;
        const amountAddedPrev = verifyAmount(modValue);
        const duplicateValue = params?.currentList?.length ? amountAddedPrev : false;

        if (amountAddedPrev) {
            showInfoToast({
                message: DUPLICATE_ADDED_PREFERRED,
            });
            setIsDisabled(true);
            return false;
        }

        if (state.tempList.length >= 3) {
            showInfoToast({
                message: MAX_THREE_PREFERRED,
            });
            setIsDisabled(true);
            return false;
        }

        if (amountIsValid) {
            setState((prevState) => ({ ...prevState, showAddButton: true }));
            if (duplicateValue) {
                return false;
            } else if (params?.routeFrom === WITHDRAWAL_SCREEN) {
                if (route.params?.onAmountUpdated) {
                    route.params?.onAmountUpdated(modValue);
                }
                navigation.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_WITHDRAW_CONFIRMATION,
                    params: {
                        ...route.params,
                        transferAmount: modValue,
                        type: CONFIRMATION,
                        isPreferred: params?.isPreferred && params.amountObj?.amount === modValue,
                        selectedAccount: route.params?.selectedAccount ?? state.selectedAccount,
                    },
                });
                return true;
            } else {
                return true;
            }
        } else {
            setIsDisabled(true);
            setState((prevState) => ({
                ...prevState,
                isAmountValid: false,
                textInputErrorMessage: MUST_BE,
            }));
            return false;
        }
    };

    const onNumPadDoneButtonPressed = (value) => {
        setState((prevState) => ({ ...prevState, isAmountValid: true }));
        if (!value) {
            setState((prevState) => ({ ...prevState, isAmountValid: false }));
            setIsDisabled(true);
        } else {
            checkAddingPreferredAmount(value);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
    }, [navigation]);

    useEffect(() => {
        const fromShareReceipt = params?.routeFrom === SHARE_RECEIPT;
        const shareReceiptLoaded = state.shareReceiptLoaded === true;
        const fetchListFromStorage = async () => {
            const dataString = await getItemFromStorage();
            const list = JSON.parse(dataString);
            if (dataString !== null && list !== null) {
                setState((prevState) => ({
                    ...prevState,
                    tempList: list,
                    shareReceiptLoaded: true,
                }));
                return true;
            }
        };
        if (fromShareReceipt && !shareReceiptLoaded) {
            setState((prevState) => ({
                ...prevState,
                backFromShareReceipt: true,
            }));
            const { preferredAmountList } = getModel("atm");
            if (preferredAmountList) {
                setState((prevState) => ({
                    ...prevState,
                    tempList: preferredAmountList,
                    shareReceiptLoaded: true,
                }));
            } else {
                fetchListFromStorage();
            }
            const amount = params.amountObj.amount;
            const parseAmount = parseFloat(amount);
            const strAmount = parseAmount.toFixed(2);
            updateAmount(parseAmount, strAmount);
            setState((prevState) => ({ ...prevState, showBackButton: true, showAddButton: true }));
            setIsDisabled(false);
        }
    }, [params?.routeFrom]);

    useEffect(() => {
        let tempPreferredList;
        const fromShareReceipt = params?.routeFrom === SHARE_RECEIPT;
        const shareReceiptLoaded = state.shareReceiptLoaded === true;
        const normalLoading = (fromShareReceipt && shareReceiptLoaded) || !fromShareReceipt;

        if (normalLoading && !state.load) {
            tempPreferredList = route?.params?.preferredAmountList || [];
            setState((prevState) => ({
                ...prevState,
                load: true,
                tempList: tempPreferredList,
            }));
        }
    }, [route?.params?.preferredAmountList]);

    const showMenuToggle = useCallback(() => {
        const menuArray = [
            {
                menuLabel: HOW_TO_USE,
                menuParam: "MANAGE_PREFERRED_AMOUNT",
            },
        ];
        setState((prevState) => ({ ...prevState, menuArray, showMenu: true }));
    }, [state.showMenu, state.menuArray]);

    const onDonePress = useCallback(() => {
        if (amount) {
            onNumPadDoneButtonPressed(amount);
            setState((prevState) => ({ ...prevState, showKeypad: false }));
        } else {
            setState((prevState) => ({ ...prevState, showKeypad: true }));
            setIsDisabled(true);
        }
    }, [onNumPadDoneButtonPressed, amount, state.showKeypad]);

    const redirection = () => {
        const finalCheckPreferred = () => {
            if (state.tempList.includes(amount)) {
                showInfoToast({
                    message: DUPLICATE_ADDED_PREFERRED,
                });
                return false;
            } else {
                return true;
            }
        };
        const finalCheck = finalCheckPreferred();
        if (finalCheck) {
            if (state.isFirstTime) setState((prevState) => ({ ...prevState, isFirstTime: false }));
            const updatedList = [...state.tempList, amount].sort((a, b) => a - b);
            setState((prevState) => ({
                ...prevState,
                tempList: updatedList,
                amountTextDisplay: 0.0,
            }));
            updateModel({
                atm: {
                    preferredAmountList: updatedList,
                },
            });
            setItemInStorage(updatedList);
            if (params?.routeFrom === SHARE_RECEIPT) {
                updateModel({
                    atm: {
                        selectedAmount: false,
                    },
                });
                navigation?.replace(ATM_CASHOUT_STACK, {
                    screen: ATM_AMOUNT_SCREEN,
                    params: {
                        ...route.params,
                        routeFrom: ADD_PREFERRED_AMOUNT,
                        preferredAmountList: updatedList,
                        backFromShareReceipt: state.backFromShareReceipt,
                        didPerformAddOrUpdate:
                            params?.routeFrom === ATM_AMOUNT_SCREEN ? "update" : "add",
                    },
                });
            } else {
                navigation?.navigate(ATM_CASHOUT_STACK, {
                    screen: ATM_AMOUNT_SCREEN,
                    params: {
                        ...route.params,
                        routeFrom: ADD_PREFERRED_AMOUNT,
                        preferredAmountList: updatedList,
                        didPerformAddOrUpdate:
                            params?.routeFrom === ATM_AMOUNT_SCREEN ? "update" : "add",
                    },
                });
            }
        }
    };

    const handleRemoval = () => {
        showInfoToast({
            message: "Preferred amount removed.",
        });
    };

    const handleATMArticle = () => {
        handleGoToATMCashOutArticle(
            navigation,
            setState((prevState) => ({ ...prevState, showMenu: false }))
        );
    };

    const handleClosePopup = () => {
        setState((prevState) => ({ ...prevState, popupVisible: false, hideHeader: false }));
    };

    const removePreferredAmountPopUp = () => {
        setState((prevState) => ({ ...prevState, popupVisible: false, hideHeader: false }));
        handleRemoval();
        onItemDelete();
    };

    const navigateToAddPreferred = (filteredArray) => {
        const fromShareReceipt = route.params.routeFrom === SHARE_RECEIPT;
        navigation.navigate(ATM_CASHOUT_STACK, {
            screen: ADD_PREFERRED_AMOUNT,
            params: {
                ...route.params,
                routeFrom: fromShareReceipt ? SHARE_RECEIPT : REMOVE_PREFERRED_AMOUNT,
                didPerformAddOrUpdate: "delete",
                preferredAmountList: filteredArray,
            },
        });
    };

    const goBackAmountScreen = () => {
        if (params?.routeFrom === SHARE_RECEIPT) {
            updateModel({
                atm: {
                    selectedAmount: false,
                },
            });
            navigation?.replace(ATM_CASHOUT_STACK, {
                screen: ATM_AMOUNT_SCREEN,
                params: {
                    ...route.params,
                    routeFrom: ADD_PREFERRED_AMOUNT,
                    preferredAmountList: state.tempList,
                    backFromShareReceipt: state.backFromShareReceipt,
                },
            });
        } else {
            navigation?.navigate(ATM_CASHOUT_STACK, {
                screen: ATM_AMOUNT_SCREEN,
                params: {
                    ...route.params,
                    routeFrom: ADD_PREFERRED_AMOUNT,
                    preferredAmountList: state.tempList,
                    backFromShareReceipt: state.backFromShareReceipt,
                },
            });
        }
    };

    const onItemDelete = async () => {
        const { selectedAmount } = getModel("atm");
        const deletedSelectedAmount = selectedAmount === state.selectedItem.toString();
        if (deletedSelectedAmount) {
            updateModel({
                atm: {
                    selectedAmount: false,
                },
            });
        }
        const filteredArray = [...state.tempList].filter((item) => state.selectedItem !== item);
        setItemInStorage(filteredArray);
        updateModel({
            atm: {
                preferredAmountList: filteredArray,
            },
        });
        if (!filteredArray.length) {
            navigation.setParams({
                preferredAmountList: [],
            });
            setState((prevState) => ({ ...prevState, selectedItem: "" }));
            navigateToAddPreferred(filteredArray);
        } else {
            filteredArray && navigateToAddPreferred(filteredArray);
            setState((prevState) => ({ ...prevState, selectedItem: "" }));
        }
        setState((prevState) => ({ ...prevState, tempList: filteredArray }));
    };

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout
                    header={
                        !state.showMenu ? (
                            <HeaderLayout
                                headerLeftElement={
                                    <HeaderBackButton onPress={goBackAmountScreen} />
                                }
                                headerCenterElement={
                                    <Typo
                                        text={SET_AMOUNT}
                                        fontWeight="600"
                                        fontSize={16}
                                        lineHeight={24}
                                    />
                                }
                                headerRightElement={
                                    <HeaderDotDotDotButton onPress={() => showMenuToggle()} />
                                }
                                key="addPreferredAmount"
                            />
                        ) : (
                            <HeaderLayout />
                        )
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    scrollable
                    key="AddPreferredAmount"
                >
                    <View style={styles.container}>
                        <View style={styles.whiteBlock}>
                            <Typo
                                fontSize={14}
                                lineHeight={18}
                                fontWeight="400"
                                text={ADD_PREF_AMOUNT}
                                textAlign="left"
                                color={BLACK}
                            />
                            <View style={styles.textView}>
                                <TextInput
                                    showSoftInputOnFocus={false}
                                    accessibilityLabel="Password"
                                    importantForAutofill="no"
                                    editable
                                    clearButtonMode="while-editing"
                                    onFocus={() => {
                                        setIsDisabled(false);
                                        setState((prevState) => ({
                                            ...prevState,
                                            showKeypad: true,
                                        }));
                                        Keyboard.dismiss();
                                    }}
                                    onBlur={() =>
                                        amountTextDisplay
                                            ? setState((prevState) => ({
                                                  ...prevState,
                                                  isAmountValid: true,
                                              }))
                                            : ""
                                    }
                                    value={amountTextDisplay}
                                    prefix={textInputPrefix ?? "RM"}
                                    isValidate
                                    isValid={state.isAmountValid}
                                    errorMessage={state.textInputErrorMessage}
                                    maxLength={textInputMaxLength}
                                    placeholder="0.00"
                                    prefixStyle={styles.blackPrefix}
                                    style={{ color: !amount ? GREY : BLACK }}
                                />
                            </View>
                            {state.isAmountValid && (
                                <View style={styles.textUnder}>
                                    <Typo
                                        text={MUST_BE}
                                        fontSize={12}
                                        fontWeight="400"
                                        lineHeight={18}
                                        textAlign="left"
                                    />
                                </View>
                            )}
                        </View>
                        <View style={styles.addedAmt(state.showKeypad)}>
                            {state.tempList?.length ? (
                                <>
                                    <Typo
                                        text={ADDED_PREF_AMOUNT}
                                        fontSize={14}
                                        fontWeight="400"
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.prefAmount}
                                    />
                                    <RemovePreferredAmount
                                        preferredAmountList={state.tempList}
                                        setShowAddButton={() =>
                                            setState((prevState) => ({
                                                ...prevState,
                                                setShowAddButton: false,
                                            }))
                                        }
                                        handleRemoval={() => handleRemoval()}
                                        setHideHeader={setHideHeader}
                                        setPopupVisible={setPopupVisible}
                                        handleClosePopup={() => handleClosePopup()}
                                        setSelectedItem={setSelectedItem}
                                        onItemDelete={() => onItemDelete()}
                                    />
                                </>
                            ) : (
                                <Typo
                                    text={NO_AMOUNT}
                                    fontSize={14}
                                    fontWeight="500"
                                    lineHeight={18}
                                    textAlign="center"
                                    color={ASH_GREY}
                                    style={styles.noAmount}
                                />
                            )}
                        </View>
                    </View>
                </ScreenLayout>
                <View style={styles.keypad}>
                    {state.showKeypad && (
                        <NumericalKeyboard
                            value={state.numericKeyboardVal}
                            onChangeText={onNumPadButtonPressed}
                            maxLength={7}
                            onDone={onDonePress}
                        />
                    )}
                </View>
                {state.showBackButton && !state.showKeypad && (
                    <View style={styles.cta2}>
                        <ActionButton
                            borderRadius={24}
                            onPress={() => navigation.goBack()}
                            backgroundColor={isDisabled ? DISABLED : WHITE}
                            disabled={!amount && !state.isAmountValid && isDisabled}
                            componentCenter={
                                <Typo
                                    text={BACK}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={17}
                                    color={isDisabled ? DISABLED_TEXT : BLACK}
                                />
                            }
                        />
                    </View>
                )}
                {state.showAddButton && !state.showKeypad && (
                    <View style={styles.cta}>
                        <ActionButton
                            borderRadius={24}
                            onPress={() => redirection()}
                            backgroundColor={isDisabled ? DISABLED : YELLOW}
                            disabled={isDisabled}
                            componentCenter={
                                <Typo
                                    text={ADD}
                                    fontSize={14}
                                    fontWeight="600"
                                    lineHeight={17}
                                    color={isDisabled ? DISABLED_TEXT : BLACK}
                                />
                            }
                        />
                    </View>
                )}

                <Popup
                    visible={state.popupVisible}
                    onClose={handleClosePopup}
                    title="Remove preferred amount"
                    description={REMOVAL_DESC_AMOUNT_ATMCASHOUT}
                    primaryAction={{
                        text: CONFIRM,
                        onPress: removePreferredAmountPopUp,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: handleClosePopup,
                    }}
                    key="removePreferredAmount"
                />
            </ScreenContainer>
            {state.showMenu && (
                <TopMenu
                    showTopMenu={state.showMenu}
                    onClose={() => setState((prevState) => ({ ...prevState, showMenu: false }))}
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
    modal: {
        margin: 0,
    },
    noAmount: { marginTop: 46 },
    prefAmount: { marginBottom: 16 },
    textUnder: { marginTop: 8 },
    textView: { width: "90%" },
    whiteBlock: {
        backgroundColor: WHITE,
        height: 144,
        width: "100%",
        paddingLeft: 24,
        paddingTop: 24,
        marginTop: 12,
    },
    container: {
        display: "flex",
        flexDirection: "column",
    },
    keypad: {
        marginBottom: 0,
        width: "100%",
    },
    addedAmt: (showKeypad) => ({
        height: showKeypad ? 250 : 230,
        paddingLeft: 24,
        paddingRight: 24,
        marginTop: 40,
        maxHeight: 260,
        overflow: "scroll",
    }),
    cta: {
        marginBottom: 36,
        paddingLeft: 24,
        paddingRight: 24,
    },
    cta2: {
        marginBottom: 15,
        paddingLeft: 24,
        paddingRight: 24,
    },
    preferredAmtBlock: {
        backgroundColor: WHITE,
        borderRadius: 8,
        height: 56,
        marginTop: 8,
        width: 327,
    },
    preferredAmtValue: {
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    addIconBtn: {
        backgroundColor: WHITE,
        borderColor: GREY,
        borderRadius: 24,
        borderWidth: 1,
        display: "flex",
        flexDirection: "row",
        height: 50,
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 15,
    },
    iconAdd: {
        height: 16,
        marginRight: 10,
        marginTop: 5,
        width: 16,
    },
});

AddPreferredAmount.defaultProps = {
    selectedAmount: "",
    textInputPrefix: "RM",
    textInputMaxLength: 8,
    preferredAmountList: [],
};

export default withModelContext(AddPreferredAmount);
