import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { maskAddress } from "@screens/PLSTP/PLSTPController";
import TermsConditionRadioButton from "@screens/ZestCASA/components/TermsCondtionRadioButton";

import {
    ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT,
    SETTINGS_MODULE,
    ZEST_CASA_OTP_VERIFICATION,
    ZEST_CASA_STACK,
    ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
    PREMIER_MODULE_STACK,
    PREMIER_OTP_VERIFICATION,
    PREMIER_DECLARATION,
    PREMIER_CONFIRMATION,
    ACCOUNTS_SCREEN,
    ZEST_CASA_SELECT_DEBIT_CARD,
    MORE,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { MASTERDATA_CLEAR } from "@redux/actions";
import {
    DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
    DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION,
    DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION,
    DEBIT_CARD_CITY_ACTION,
    DEBIT_CARD_TERMS_CONDITION,
    DEBIT_CARD_POSTAL_CODE_ACTION,
    DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION,
    DEBIT_CARD_STATE_ACTION,
    ZEST_BACKUP_DEBIT_CARD_DATA,
    DEBIT_CARD_ADDRESS_LINE_THREE_ACTION,
} from "@redux/actions/ZestCASA/debitCardResidentialDetailsAction";
import { DEBIT_CARD_SELECT_ACCOUNT_ACTION } from "@redux/actions/ZestCASA/debitCardSelectAccountAction";
import { DOWNTIME_CLEAR } from "@redux/actions/services/downTimeAction";
import { applyDebitCardBody } from "@redux/utilities/actionUtilities";

import {
    CASA_STP_NTB_USER,
    CASA_STP_FULL_ETB_USER,
    CASA_STP_DEBIT_CARD_NTB_USER,
} from "@constants/casaConfiguration";
import { FN_FUND_TRANSFER_APPLY_DEBIT_CARD } from "@constants/casaFundConstant";
import { BLACK, DISABLED, TRANSPARENT, YELLOW, DARK_GREY } from "@constants/colors";
import { S2U_PULL } from "@constants/data";
import {
    ADDRESS_LINE_ONE,
    ADDRESS_LINE_TWO,
    UNIT_NUMBER,
    FLOOR,
    BUILDING,
    STREET_NAME,
    STEPUP_MAE_ADDRESS_POSTAL,
    POSTAL_CODE_DUMMY,
    PLEASE_SELECT,
    STEPUP_MAE_ADDRESS_CITY,
    DUMMY_KUALA_LUMPUR,
    PLSTP_STATE,
    ZEST_DEBIT_CARD_APPLICATION,
    FILL_IN_DEBIT_CARD_RESIDENTIAL_DETAILS,
    ZEST_DEBIT_CARD_RESIDENTIAL_DETAIL_TERMS_CONDITION,
    STP_TNC,
    TERMS_CONDITIONS,
    NEXT_SMALL_CAPS,
    STEP3OF3,
    CONFIRM,
} from "@constants/strings";
import { ZEST_CASA_DEBIT_CARD_FPX_TNC } from "@constants/url";
import {
    ZEST_NTB_USER,
    ZEST_CASA_CLEAR_ALL,
    ZEST_DEBIT_CARD_USER,
    ZEST_FULL_ETB_USER,
} from "@constants/zestCasaConfiguration";

import * as DataModel from "@utils/dataModel";

import { CARD_REQUESTCARD_DEBITCARD_DELIVERY_ADDRESS } from "../CasaSTP/helpers/AnalyticsEventConstants";
import { checkS2UStatus } from "../CasaSTP/helpers/CasaSTPHelpers";

const ZestCASADebitCardResidentailDetails = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks to access reducer data
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.debitCardResidentialDetailsReducer
    );
    const debitCardInquiryReducer = useSelector((state) => state.debitCardInquiryReducer);
    //console.log('debitCardInquiryReducer--', debitCardInquiryReducer);
    const getAccountListReducer = useSelector((state) => state.getAccountListReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    const { accountListings } = getAccountListReducer ?? [];
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();
    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);

    useEffect(() => {
        initAccountList();
        dispatch({
            type: ZEST_BACKUP_DEBIT_CARD_DATA,
            addressLineOneBackup: residentialDetailsReducer.addressLineOne,
            addressLineTwoBackup: residentialDetailsReducer.addressLineTwo,
            addressLineThreeBackup: residentialDetailsReducer.addressLineThree,
            postalCodeBackup: residentialDetailsReducer.postalCode,
            cityBackup: residentialDetailsReducer.city,
            stateIndexBackup: residentialDetailsReducer.stateIndex,
            stateValueBackup: residentialDetailsReducer.stateValue,
            isTermsConditionAgreeBackup: residentialDetailsReducer.isTermsConditionAgree,
        });
    }, []);

    const initAccountList = async () => {
        console.log("[ZestCASADebitCardResidentailDetails] >> [initAccountList]");

        if (userStatus === ZEST_DEBIT_CARD_USER) {
            const firstAccount = accountListings[0];
            const accountCode = firstAccount.code;
            const accountNumberWithPaddingRemoved = firstAccount.number.substring(0, 12);

            dispatch({
                type: DEBIT_CARD_SELECT_ACCOUNT_ACTION,
                debitCardSelectAccountIndex: 0,
                debitCardSelectAccountCode: accountCode,
                debitCardSelectAccountNumber: accountNumberWithPaddingRemoved,
            });
        }
    };

    useEffect(() => {
        console.log("[ZestCASADebitCardResidentailDetails] >> [init]");
        dispatch({ type: DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        residentialDetailsReducer.addressLineOne,
        residentialDetailsReducer.addressLineTwo,
        residentialDetailsReducer.postalCode,
        residentialDetailsReducer.stateIndex,
        residentialDetailsReducer.city,
        residentialDetailsReducer.isTermsConditionAgree,
    ]);

    function onBackTap() {
        console.log("[ZestCASADebitCardResidentialDetails] >> [onBackTap]");
        if (
            identityDetailsReducer.identityType === 1 &&
            entryReducer.isCASASTP &&
            !params.isFromConfirmationScreenForResidentialDetails
        ) {
            navigation.navigate(ZEST_CASA_STACK, {
                screen: ZEST_CASA_SELECT_DEBIT_CARD,
                params: {
                    from: "ZestCASADebitCardResidentailDetails",
                },
            });
        } else {
            if (params.isFromConfirmationScreenForResidentialDetails) {
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
                    addressLineOne: residentialDetailsReducer.addressLineOneBackup,
                });
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
                    addressLineTwo: residentialDetailsReducer.addressLineTwoBackup,
                });
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_THREE_ACTION,
                    addressLineThree: residentialDetailsReducer.addressLineThreeBackup || "",
                });
                dispatch({
                    type: DEBIT_CARD_POSTAL_CODE_ACTION,
                    postalCode: residentialDetailsReducer.postalCodeBackup,
                });
                dispatch({
                    type: DEBIT_CARD_CITY_ACTION,
                    city: residentialDetailsReducer.cityBackup,
                });
                dispatch({
                    type: DEBIT_CARD_STATE_ACTION,
                    stateIndex: residentialDetailsReducer.stateIndexBackup,
                    stateValue: residentialDetailsReducer.stateValueBackup,
                });
                dispatch({
                    type: DEBIT_CARD_TERMS_CONDITION,
                    isTermsConditionAgree: residentialDetailsReducer.isTermsConditionAgreeBackup,
                });
            }
            navigation.goBack();
        }
    }

    function lengthLimiter(str) {
        return (
            <View style={Style.lengthLimiterWrapper}>
                <Typo lineHeight={18} textAlign="left" text={str ? `${40 - str.length}` : "40"} />
            </View>
        );
    }

    function onCloseTap() {
        console.log("[ZestCASADebitCardResidentialDetails] >> [onCloseTap]");
        // Clear all data from ZestCASA reducers
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        dispatch({ type: DOWNTIME_CLEAR });
        dispatch({ type: MASTERDATA_CLEAR });
        navigation.navigate(MORE, {
            screen: ACCOUNTS_SCREEN,
        });
    }

    function onClickNext() {
        onNextTap();
    }

    const onNextTap = async () => {
        if (residentialDetailsReducer.isDebitCardResidentialContinueButtonEnabled) {
            console.log("[ZestCASADebitCardResidentailDetails] >> [onContinue]");
            if (userStatus === CASA_STP_DEBIT_CARD_NTB_USER) {
                if (props?.route?.params?.isFromActivationSuccess) {
                    if (accountListings === null || accountListings?.length < 2) {
                        initiateS2USdk(false);
                    } else {
                        navigation.navigate(ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT);
                    }
                } else if (params.isFromConfirmationScreenForResidentialDetails) {
                    navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_CONFIRMATION,
                    });
                } else {
                    navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_DECLARATION,
                    });
                }
            } else {
                if (userStatus === ZEST_DEBIT_CARD_USER) {
                    if (accountListings.length < 2) {
                        initiateS2USdk(false);
                    } else {
                        navigation.navigate(ZEST_CASA_DEBIT_CARD_SELECT_ACCOUNT);
                    }
                } else {
                    navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_OTP_VERIFICATION,
                    });
                }
            }
        }
    };

    function onAddressLineOneInputDidChange(value) {
        dispatch({
            type: DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOn: false,
        });
        dispatch({ type: DEBIT_CARD_ADDRESS_LINE_ONE_ACTION, addressLineOne: value });
    }

    function onAddressLineTwoInputDidChange(value) {
        dispatch({
            type: DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOn: false,
        });
        dispatch({ type: DEBIT_CARD_ADDRESS_LINE_TWO_ACTION, addressLineTwo: value });
    }

    function onPostalCodeInputDidChange(value) {
        dispatch({ type: DEBIT_CARD_POSTAL_CODE_ACTION, postalCode: value });
    }

    function onCityInputDidChange(value) {
        dispatch({ type: DEBIT_CARD_CITY_ACTION, city: value });
    }

    function onStateDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: residentialDetailsReducer.stateIndex,
            filterType: "",
            data: masterDataReducer.stateData,
        });
    }

    function onScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: DEBIT_CARD_STATE_ACTION, stateIndex: index, stateValue: data });
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onScrollPickerCancelButtonDidTap() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function isDebitCardUser() {
        if (
            (userStatus !== CASA_STP_NTB_USER && userStatus !== CASA_STP_FULL_ETB_USER) ||
            (userStatus !== ZEST_NTB_USER && userStatus !== ZEST_FULL_ETB_USER)
        ) {
            return true;
        }
    }

    function getAddressLineOneValue() {
        if (residentialDetailsReducer.addressLineOne) {
            return isDebitCardUser() && residentialDetailsReducer.isAddressLineOneMaskingOn
                ? maskAddress(residentialDetailsReducer.addressLineOne)
                : residentialDetailsReducer.addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (residentialDetailsReducer.addressLineTwo) {
            return isDebitCardUser() && residentialDetailsReducer.isAddressLineTwoMaskingOn
                ? maskAddress(residentialDetailsReducer.addressLineTwo)
                : residentialDetailsReducer.addressLineTwo;
        }
    }

    function getPostalCodeValue() {
        if (residentialDetailsReducer.postalCode) {
            return residentialDetailsReducer.postalCode;
        }
    }

    function onAgreeRadioButtonDidTap() {
        dispatch({
            type: DEBIT_CARD_TERMS_CONDITION,
            isTermsConditionAgree: !residentialDetailsReducer.isTermsConditionAgree,
        });
    }

    function onLinkDidTapMethod() {
        console.log("onLinkDidTap");
        const title = TERMS_CONDITIONS;
        const url = ZEST_CASA_DEBIT_CARD_FPX_TNC;

        const props = {
            title,
            source: url,
            headerColor: TRANSPARENT,
        };

        navigation.navigate(SETTINGS_MODULE, {
            screen: "PdfSetting",
            params: props,
        });
    }

    function getTextMap() {
        return [
            {
                key: TERMS_CONDITIONS,
                fontSize: 14,
                fontWeight: "700",
                textAlign: "left",
                underline: true,
                onLinkDidTap: onLinkDidTapMethod,
                text: TERMS_CONDITIONS,
            },
        ];
    }

    function initiateS2USdk(isNTBFlow) {
        const firstAccount = accountListings ? accountListings[0] : null;
        const accountNumberWithPaddingRemoved = firstAccount
            ? firstAccount.number.substring(0, 12)
            : null;
        const accountNumberSend = isNTBFlow
            ? prePostQualReducer.acctNo
            : accountNumberWithPaddingRemoved;
        const applyDebitCardData = applyDebitCardBody(
            residentialDetailsReducer,
            selectDebitCardReducer,
            "",
            accountNumberSend
        );
        const address =
            residentialDetailsReducer?.addressLineOne +
            ",\n" +
            residentialDetailsReducer?.addressLineTwo +
            ",\n" +
            residentialDetailsReducer?.postalCode +
            ", " +
            residentialDetailsReducer?.city +
            ",\n" +
            residentialDetailsReducer?.stateValue?.name;

        const s2uBody = {
            totalAmount: masterDataReducer?.debitCardApplicationAmount,
            address,
            MAEAcctNo: DataModel.spaceBetweenChar(accountNumberWithPaddingRemoved),
            productName: accountListings ? accountListings[0]?.name : null,
            debitCardFee: debitCardInquiryReducer?.msgBody?.debitCardFee,
            Msg: {
                MsgBody: applyDebitCardData,
            },
        };

        const extraData = {
            fundConstant: FN_FUND_TRANSFER_APPLY_DEBIT_CARD,
            stack: ZEST_CASA_STACK,
            screen: ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
        };
        checkS2UStatus(
            navigation.navigate,
            params,
            (type, mapperData, timeStamp) => {
                if (type === S2U_PULL) {
                    navigation.navigate(ZEST_CASA_STACK, {
                        screen: ZEST_CASA_OTP_VERIFICATION,
                        params: { s2u: true, mapperData, timeStamp },
                    });
                } else {
                    navigation.navigate(PREMIER_MODULE_STACK, {
                        screen: PREMIER_OTP_VERIFICATION,
                        params: { s2u: false },
                    });
                }
            },
            extraData,
            s2uBody
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={CARD_REQUESTCARD_DEBITCARD_DELIVERY_ADDRESS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={
                                params.isFromConfirmationScreenForResidentialDetails &&
                                entryReducer.isCASASTP ? null : (
                                    <HeaderBackButton onPress={onBackTap} />
                                )
                            }
                            headerCenterElement={
                                identityDetailsReducer.identityType === 1 &&
                                entryReducer.isCASASTP &&
                                !params.isFromConfirmationScreenForResidentialDetails ? (
                                    <Typo
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text={STEP3OF3}
                                        color={DARK_GREY}
                                    />
                                ) : null
                            }
                            headerRightElement={
                                <HeaderCloseButton
                                    onPress={
                                        identityDetailsReducer.identityType === 1 &&
                                        entryReducer.isCASASTP &&
                                        params.isFromConfirmationScreenForResidentialDetails
                                            ? onBackTap
                                            : onCloseTap
                                    }
                                />
                            }
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            fontWeight="400"
                                            lineHeight={21}
                                            textAlign="left"
                                            text={ZEST_DEBIT_CARD_APPLICATION}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={FILL_IN_DEBIT_CARD_RESIDENTIAL_DETAILS}
                                        />
                                        <SpaceFiller height={24} />
                                        {buildResidentialDetailsForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        residentialDetailsReducer.isDebitCardResidentialContinueButtonEnabled
                                            ? 1
                                            : 0.5
                                    }
                                    backgroundColor={
                                        residentialDetailsReducer.isDebitCardResidentialContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={
                                                params.isFromConfirmationScreenForResidentialDetails &&
                                                identityDetailsReducer.identityType === 1 &&
                                                entryReducer.isCASASTP
                                                    ? CONFIRM
                                                    : NEXT_SMALL_CAPS
                                            }
                                        />
                                    }
                                    onPress={onClickNext}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <ScrollPickerView
                    showMenu={scrollPicker.isDisplay}
                    list={scrollPicker.data}
                    selectedIndex={scrollPicker.selectedIndex}
                    onRightButtonPress={onScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onScrollPickerCancelButtonDidTap}
                    rightButtonText="Done"
                    leftButtonText="Cancel"
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildResidentialDetailsForm() {
        return (
            <React.Fragment>
                <Typo
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_ONE}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.addressLineOneErrorMessage}
                    isValid={residentialDetailsReducer.addressLineOneErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineOneValue()}
                    placeholder={`e.g ${UNIT_NUMBER}/${FLOOR}/${BUILDING}`}
                    onChangeText={onAddressLineOneInputDidChange}
                />
                {identityDetailsReducer?.identityType === 1 && entryReducer.isCASASTP ? (
                    <View>
                        <SpaceFiller height={8} />
                        {lengthLimiter(getAddressLineOneValue())}
                    </View>
                ) : null}
                <SpaceFiller
                    height={
                        identityDetailsReducer?.identityType === 1 && entryReducer.isCASASTP
                            ? 16
                            : 24
                    }
                />
                <Typo
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={ADDRESS_LINE_TWO}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.addressLineTwoErrorMessage}
                    isValid={residentialDetailsReducer.addressLineTwoErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineTwoValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineTwoInputDidChange}
                />
                {identityDetailsReducer?.identityType === 1 && entryReducer.isCASASTP ? (
                    <View>
                        <SpaceFiller height={8} />
                        {lengthLimiter(getAddressLineTwoValue())}
                    </View>
                ) : null}
                <SpaceFiller
                    height={
                        identityDetailsReducer?.identityType === 1 && entryReducer.isCASASTP
                            ? 16
                            : 24
                    }
                />
                <Typo
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={STEPUP_MAE_ADDRESS_POSTAL}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.postalCodeErrorMessage}
                    isValid={residentialDetailsReducer.postalCodeErrorMessage === null}
                    isValidate
                    maxLength={5}
                    value={getPostalCodeValue()}
                    keyboardType="number-pad"
                    placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                    onChangeText={onPostalCodeInputDidChange}
                />
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    titleFontWeight="400"
                    dropdownTitle={
                        residentialDetailsReducer.stateValue &&
                        residentialDetailsReducer.stateValue.name
                            ? residentialDetailsReducer.stateValue.name
                            : PLEASE_SELECT
                    }
                    dropdownOnPress={onStateDropdownPillDidTap}
                />
                <SpaceFiller height={24} />
                <Typo
                    fontWeight="400"
                    lineHeight={18}
                    textAlign="left"
                    text={STEPUP_MAE_ADDRESS_CITY}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={residentialDetailsReducer.cityErrorMessage}
                    isValid={residentialDetailsReducer.cityErrorMessage === null}
                    isValidate
                    maxLength={20}
                    value={residentialDetailsReducer.city}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                />
                <SpaceFiller height={24} />
                {buildTermsAndCondition()}
            </React.Fragment>
        );
    }

    function buildTermsAndCondition() {
        return (
            <React.Fragment>
                <SpaceFiller height={16} />
                <Typo
                    fontWeight="600"
                    lineHeight={18}
                    textAlign="left"
                    text={STP_TNC}
                    color={BLACK}
                />
                <SpaceFiller height={12} />
                <TermsConditionRadioButton
                    isSelected={residentialDetailsReducer.isTermsConditionAgree}
                    onRadioButtonPressed={onAgreeRadioButtonDidTap}
                    titleStart={ZEST_DEBIT_CARD_RESIDENTIAL_DETAIL_TERMS_CONDITION}
                    textMap={getTextMap()}
                />
                <SpaceFiller height={25} />
            </React.Fragment>
        );
    }
};

ZestCASADebitCardResidentailDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    params: PropTypes.object,
    isFromConfirmationScreenForResidentialDetails: PropTypes.bool,
};

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    contentContainer: {
        marginHorizontal: 24,
    },

    formContainer: {
        marginBottom: 40,
    },
    lengthLimiterWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
});

export default ZestCASADebitCardResidentailDetails;
