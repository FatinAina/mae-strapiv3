import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import BorderedAvatar from "@components/Avatars/BorderedAvatar";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import NumericalKeyboard from "@components/NumericalKeyboard";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import {
    EDIT_CASA_TRANSFER_AMOUNT_CONTINUE_BUTTON_DISABLED_ACTION,
    TRANSFER_AMOUNT_ACTION,
    UPDATE_VALID_TRANSFER_AMOUNT,
} from "@redux/actions/ZestCASA/editCASATransferAmountAction";

import { KAWANKU_SAVINGS_ACCOUNT_NAME, SAVINGS_ACCOUNT_I } from "@constants/casaStrings";
import { GREY, MEDIUM_GREY, BLACK } from "@constants/colors";
import { CURRENCY_CODE, ENTER_AMOUNT, TRANSFER, PMA, ZEST_MIN_AMOUNT } from "@constants/strings";

import Assets from "@assets";

import { numberWithCommas } from "../ZestCASA/ZestCASAValidation";
import { entryPropTypes } from "./PremierIntroScreen";

const PremierEditCASATransferAmount = (props) => {
    const { navigation } = props;

    // Hooks to access reducer data
    // Hooks to access reducer data
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const editCASATransferAmountReducer = useSelector(
        (state) => state.zestCasaReducer.editCASATransferAmountReducer
    );
    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    const { pmaActivationAmountETB, kawanKuActivationAmountETB, savingIActivationAmountETB } =
        masterDataReducer;
    const {
        transferAmount,
        validTransferAmount,
        isEditCASATransferAmountContinueButtonEnabled,
        transferAmountWithoutFormated,
    } = editCASATransferAmountReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const { isKawanku, isKawankuSavingsI } = entryReducer;

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        dispatch({ type: EDIT_CASA_TRANSFER_AMOUNT_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transferAmount]);

    const init = async () => {
        console.log("[PremierEditCASATransferAmount] >> [init]");
        if (!validTransferAmount) {
            const amount = isKawanku
                ? kawanKuActivationAmountETB
                : isKawankuSavingsI
                ? savingIActivationAmountETB
                : pmaActivationAmountETB;
            const value = amount.replace(".", "");
            if (value > 0) {
                dispatch({
                    type: TRANSFER_AMOUNT_ACTION,
                    transferAmountWithoutFormated: value,
                    transferAmount: amount,
                    minimumTransferAmount: amount,
                });
            } else {
                dispatch({
                    type: TRANSFER_AMOUNT_ACTION,
                    transferAmountWithoutFormated: value,
                    transferAmount: "",
                    minimumTransferAmount: amount,
                });
            }
        }
    };

    function onBackTap() {
        console.log("[PremierEditCASATransferAmount] >> [onBackTap]");
        if (navigation.canGoBack()) navigation.goBack();
    }

    function onDoneButtonDidTap() {
        console.log("[ZestCASAEd itCASATransferAmount] >> [onDoneButtonDidTap]");
        if (isEditCASATransferAmountContinueButtonEnabled) {
            // Decimals are appended for UI and service purposes
            const amount = transferAmount ? transferAmount.toString().replace(/,/g, "") : 0;

            dispatch({
                type: UPDATE_VALID_TRANSFER_AMOUNT,
                validTransferAmount: amount,
            });
            if (navigation.canGoBack()) navigation.goBack();
        }
    }

    function onAmountTextInputDidChange(val) {
        const value = val ? Number(val) : 0;
        const amount = isKawanku
            ? kawanKuActivationAmountETB
            : isKawankuSavingsI
            ? savingIActivationAmountETB
            : pmaActivationAmountETB;
        if (value > 0) {
            const formatted = numberWithCommas(value);
            dispatch({
                type: TRANSFER_AMOUNT_ACTION,
                transferAmountWithoutFormated: val,
                transferAmount: formatted,
                minimumTransferAmount: amount,
            });
        } else {
            dispatch({
                type: TRANSFER_AMOUNT_ACTION,
                transferAmountWithoutFormated: Number(val) === 0 ? "" : val,
                transferAmount: "",
                minimumTransferAmount: amount,
            });
        }
    }

    const accountTypeTitle = () => {
        if (isKawanku) {
            return KAWANKU_SAVINGS_ACCOUNT_NAME;
        } else if (isKawankuSavingsI) {
            return SAVINGS_ACCOUNT_I;
        } else {
            return PMA;
        }
    };

    const minimumTopUpAmount = () => {
        if (isKawanku) {
            return kawanKuActivationAmountETB;
        } else if (isKawankuSavingsI) {
            return savingIActivationAmountETB;
        } else {
            return pmaActivationAmountETB ?? "50.00";
        }
    };

    return (
        <ScreenContainer backgroundType="color" showOverlay={false} backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo fontSize={16} fontWeight="600" lineHeight={19} text={TRANSFER} />
                        }
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
                neverForceInset={["bottom"]}
            >
                <React.Fragment>
                    <ScrollView showsHorizontalScrollIndicator={false}>
                        <View style={Style.container}>
                            <View style={Style.boxWrapper}>
                                <View style={Style.boxLogoWrapper}>
                                    <BorderedAvatar width={64} height={64} borderRadius={32}>
                                        <Image style={Style.avatarImage} source={Assets.MAYBANK} />
                                    </BorderedAvatar>
                                </View>
                                <View style={Style.boxTextWrapper}>
                                    <Typo
                                        lineHeight={20}
                                        fontWeight="600"
                                        text={accountTypeTitle()}
                                    />
                                </View>
                            </View>

                            <View style={Style.descriptionContainerAmount}>
                                <Typo lineHeight={19} textAlign="left" text={ENTER_AMOUNT} />
                            </View>

                            <View style={Style.amountViewTransfer}>
                                <TextInput
                                    style={Style.duitNowAmount}
                                    prefixStyle={[Style.duitNowAmountFaded]}
                                    accessibilityLabel="Password"
                                    // onSubmitEditing={this.onDone}
                                    value={transferAmount}
                                    prefix={CURRENCY_CODE}
                                    clearButtonMode="while-editing"
                                    returnKeyType="done"
                                    editable={true}
                                    placeholder="0.00"
                                />
                            </View>
                            <SpaceFiller height={8} />
                            <Typo
                                fontSize={12}
                                lineHeight={20}
                                text={`${ZEST_MIN_AMOUNT}${minimumTopUpAmount()}`}
                            />
                        </View>
                    </ScrollView>
                    <NumericalKeyboard
                        value={transferAmountWithoutFormated}
                        onChangeText={onAmountTextInputDidChange}
                        maxLength={8}
                        onDone={onDoneButtonDidTap}
                    />
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
};

const Style = StyleSheet.create({
    amountViewTransfer: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    avatarImage: {
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    container: {
        alignItems: "flex-start",
        flex: 1,
        marginBottom: 60,
        paddingEnd: 38,
        paddingStart: 36,
    },
    descriptionContainerAmount: {
        paddingTop: 26,
    },
    duitNowAmount: {
        color: BLACK,
        fontSize: 21,
        fontStyle: "normal",
        fontWeight: "bold",
    },

    duitNowAmountFaded: {
        color: GREY,
        fontSize: 21,
        fontStyle: "normal",
        fontWeight: "bold",
    },
    boxWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    boxLogoWrapper: {
        flex: 0.22,
    },
    boxTextWrapper: {
        flex: 0.73,
        flexDirection: "row",
        justifyContent: "flex-start",
    },
});

export const editCASATransferAmountPropTypes = (PremierEditCASATransferAmount.propTypes = {
    ...entryPropTypes,
    item: PropTypes.object,
    index: PropTypes.number,
    isSecure2uVisible: PropTypes.bool,
});

export default PremierEditCASATransferAmount;
