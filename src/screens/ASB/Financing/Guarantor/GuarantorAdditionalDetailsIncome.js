import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";

import * as navigationConstant from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TitleAndDropdownPillWithIcon from "@components/TitleAndDropdownPillWithIcon";

import {
    GUARANTOR_PRMIMARY_INCOME_ACTION,
    GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_ACTION,
    GUARANTOR_ADDITIONAL_INCOME_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, YELLOW, DISABLED } from "@constants/colors";
import {
    DONE,
    CANCEL,
    GUARANTOR,
    PLEASE_SELECT,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    FILL_IN_ADDITIONAL_DETAILS,
    PLSTP_SAVE_NEXT,
    GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_TITLE,
    GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_DESC,
    LEAVE,
    ZEST_CASA_PRIMARY_INCOME,
    APPLY_ASBFINANCINGGUARANTOR_ADDITIONALDETAILS,
    SUCC_STATUS,
} from "@constants/strings";

function GuarantorAdditionalDetailsIncome({ route, navigation }) {
    // Hooks to access reducer data
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const personalInformationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorPersonalInformationReducer
    );
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        primaryIncome,
        primarySourceOfWealth,
        isAdditionalIncomeDetailsContinueButtonEnabled,
        primaryIncomeIndex,
        primarySourceOfWealthIndex,
    } = personalInformationReducer;

    const [showPrimaryIncomePicker, setShowPrimaryIncomePicker] = useState(false);
    const [showPrimarySourceOfWealthPicker, setShowPrimarySourceOfWealthPicker] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showPrimaryIncome, setShowPrimaryIncome] = useState("");
    const [showWealth, setShowWealth] = useState("");

    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const { dataStoreValidation } = asbApplicationDetailsReducer;

    useEffect(() => {
        dispatch({
            type: GUARANTOR_ADDITIONAL_INCOME_CONTINUE_BUTTON_DISABLED_ACTION,
        });
    }, [primaryIncome, primarySourceOfWealth]);

    async function navToProceedScreen() {
        updateApiCEP(() => {
            navigation.navigate(navigationConstant.ASB_GUARANTOR_CONFIRM_FINANCING_DETAILS, {
                dataSendNotification: dataStoreValidation,
                isAdditionalDetails: true,
            });
        });
    }

    function onBackTap() {
        navigation.navigate(navigationConstant.ASB_GUARANTOR_CONFIRMATION);
    }

    function onDropdownPress() {
        setShowPrimaryIncomePicker(true);
    }

    function onDropdownSourceOfWealthPress() {
        setShowPrimarySourceOfWealthPicker(true);
    }

    function onPopupClose() {
        setShowPopup(false);
    }

    function onPickerCancel() {
        setShowPrimaryIncomePicker(false);
    }

    function onPickerDone(data, index) {
        setShowPrimaryIncome(data.name);
        dispatch({
            type: GUARANTOR_PRMIMARY_INCOME_ACTION,
            primaryIncomeIndex: index,
            primaryIncome: data,
        });
        onPickerCancel();
    }

    function onPickerourceOfWealthDone(data, index) {
        setShowWealth(data.name);
        dispatch({
            type: GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_ACTION,
            primarySourceOfWealthIndex: index,
            primarySourceOfWealth: data,
        });

        onPickerSourceOfWealthCancel();
    }

    function onPickerSourceOfWealthCancel() {
        setShowPrimarySourceOfWealthPicker(false);
    }

    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    async function handleLeaveButton() {
        setShowPopupConfirm(false);
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    }

    function updateApiCEP(callback) {
        const body = {
            screenNo: "13",
            stpReferenceNo: stpReferenceNumber,
            primaryIncome: primaryIncome?.name,
            primarySourceOfWealth: primarySourceOfWealth?.name,
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data) {
                    if (callback) {
                        callback();
                    }
                }
            })
        );
    }

    function onPrimarySourceOfWealthInfoPress() {
        setShowPopup(true);
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_ADDITIONALDETAILS}
        >
            <React.Fragment>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <View style={styles.container}>
                        <KeyboardAwareScrollView
                            style={styles.containerView}
                            behavior={Platform.OS === "ios" ? "padding" : ""}
                            enabled
                            showsVerticalScrollIndicator={false}
                        >
                            <Typo lineHeight={20} text={GUARANTOR} textAlign="left" />
                            <SpaceFiller height={4} />

                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={28}
                                text={FILL_IN_ADDITIONAL_DETAILS}
                                textAlign="left"
                            />

                            <TitleAndDropdownPill
                                title={ZEST_CASA_PRIMARY_INCOME}
                                dropdownTitle={showPrimaryIncome || PLEASE_SELECT}
                                dropdownOnPress={onDropdownPress}
                                removeTopMargin={true}
                                titleFontWeight="400"
                            />

                            <TitleAndDropdownPillWithIcon
                                title={GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_TITLE}
                                dropdownTitle={showWealth || PLEASE_SELECT}
                                dropdownOnPress={onDropdownSourceOfWealthPress}
                                removeTopMargin={true}
                                titleFontWeight="400"
                                dropdownOnInfoPress={onPrimarySourceOfWealthInfoPress}
                            />
                            <SpaceFiller height={20} />
                        </KeyboardAwareScrollView>
                        <View style={styles.view}>
                            <FixedActionContainer>
                                <View style={styles.footer}>
                                    <ActionButton
                                        fullWidth
                                        activeOpacity={
                                            isAdditionalIncomeDetailsContinueButtonEnabled ? 1 : 0.5
                                        }
                                        backgroundColor={
                                            isAdditionalIncomeDetailsContinueButtonEnabled
                                                ? YELLOW
                                                : DISABLED
                                        }
                                        borderRadius={25}
                                        onPress={navToProceedScreen}
                                        componentCenter={
                                            <Typo
                                                text={PLSTP_SAVE_NEXT}
                                                fontWeight="600"
                                                lineHeight={18}
                                            />
                                        }
                                    />
                                </View>
                            </FixedActionContainer>
                        </View>
                    </View>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_TITLE}
                    description={GUARANTOR_PRIMARY_SOURCE_OF_WEALTH_INFO_DESC}
                />
                <ScrollPickerView
                    showMenu={showPrimaryIncomePicker}
                    list={
                        masterDataReducer.status === SUCC_STATUS
                            ? masterDataReducer?.sourceOfFundOrigin
                            : []
                    }
                    selectedIndex={primaryIncomeIndex}
                    onRightButtonPress={onPickerDone}
                    onLeftButtonPress={onPickerCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={showPrimarySourceOfWealthPicker}
                    list={
                        masterDataReducer.status === SUCC_STATUS
                            ? masterDataReducer?.sourceOfWealthOrigin
                            : []
                    }
                    selectedIndex={primarySourceOfWealthIndex}
                    onRightButtonPress={onPickerourceOfWealthDone}
                    onLeftButtonPress={onPickerSourceOfWealthCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <Popup
                    visible={showPopupConfirm}
                    onClose={onPopupCloseConfirm}
                    title={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE}
                    description={ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC}
                    primaryAction={{
                        text: LEAVE,
                        onPress: handleLeaveButton,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </React.Fragment>
        </ScreenContainer>
    );
}

GuarantorAdditionalDetailsIncome.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    view: {
        marginTop: 24,
        paddingHorizontal: 12,
    },
});

export default GuarantorAdditionalDetailsIncome;
