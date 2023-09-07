import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";
import { updateDataOnReducerBaseOnApplicationDetails } from "@screens/ASB/Financing/helpers/CustomerDetailsPrefiller";
import { maskAddress, maskMobile, maskPostCode } from "@screens/PLSTP/PLSTPController";

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
import TextInput from "@components/TextInput";
import TextInputWithReturnType from "@components/TextInputWithReturnType";

import {
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_CITY_ACTION,
    GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_COUNTRY_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION,
    GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
    GUARANTOR_EMPLOYMENT_STATE_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION,
    GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION,
} from "@redux/actions/ASBFinance/guarantorEmploymentDetailsAction";
import { asbApplicationDetails } from "@redux/services/ASBServices/asbApiApplicationDetails";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
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
    MOBILE_NUMBER_DUMMY,
    SETTINGS_DEFAULT_NUMBER,
    MOB_CODE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    CANCEL,
    DONE,
    LEAVE,
    COUNTRY,
    GUARANTOR,
    OCCUPATION_INFORMATION_CHECK_UPDATE,
    CONTINUE,
    OFFICE_ADDR1,
    OFFICE_PHNO,
    OFFICE_ADDR2,
    OFFICE_ADDR3,
    STEP,
    SUCC_STATUS,
} from "@constants/strings";

const GuarantorEmploymentDetails2 = ({ navigation, route }) => {
    const { currentSteps, totalSteps } = route?.params;

    // Hooks for access reducer data
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );

    const guarantorEmploymentDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorEmploymentDetailsReducer
    );
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );

    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const idNumber = asbGuarantorPrePostQualReducer?.idNo;
    const additionalDetails = asbGuarantorPrePostQualReducer?.additionalDetails;
    const { dataStoreValidation } = asbApplicationDetailsReducer;

    const allStateList =
        masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.allState : [];

    const {
        addressLineOneEmployment,
        addressLineTwoEmployment,
        addressLineThreeEmployment,
        postalCodeEmployment,
        stateIndexEmployment,
        stateValueEmployment,
        countryIndexEmployment,
        countryValueEmployment,
        cityEmployment,
        mobileNumberWithoutExtensionEmployment,
        mobileNumberErrorMessageEmployment,
        isAddressLineOneMaskingOnEmployment,
        isAddressLineTwoMaskingOnEmployment,
        isAddressLineThreeMaskingOnEmployment,
        isMobileNumberMaskingOnEmployment,
        isPostalCodeMaskingOnEmployment,
        isCityMaskingOnEmployment,
        isEmploeymentDetails2ContinueButtonEnabled,
        cityErrorMessageEmployment,
        postalCodeErrorMessageEmployment,
        addressLineTwoErrorMessageEmployment,
        addressLineOneErrorMessageEmployment,
        addressLineThreeErrorMessageEmployment,
        isStateDropdownEnabledEmployment,
    } = guarantorEmploymentDetailsReducer;

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);
    const [countryScrollPicker, setCountryScrollPicker] = useState(scrollPickerInitialState);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [stateDropdownList, setStateDropdownList] = useState([]);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_DEATILS_2_CONTINUE_BUTTON_DISABLED_ACTION,
        });
    }, [
        addressLineOneEmployment,
        addressLineTwoEmployment,
        addressLineThreeEmployment,
        postalCodeEmployment,
        stateIndexEmployment,
        stateValueEmployment,
        countryIndexEmployment,
        countryValueEmployment,
        cityEmployment,
        mobileNumberWithoutExtensionEmployment,
    ]);

    const init = async () => {
        if (countryValueEmployment.value) {
            getReleventState(countryValueEmployment.value);
        }
    };

    const getReleventState = async (country) => {
        const stateList = allStateList.find(({ value }) => value === country);
        const stateListData = JSON.stringify(stateList?.name);
        const stateListDataArray = stateListData?.split('"');
        const finalStateList = stateListDataArray[1]?.split(",");
        const arr = [];
        const len = finalStateList.length;
        for (let i = 0; i < len; i++) {
            arr.push({
                name: finalStateList[i],
                value: finalStateList[i],
            });
        }
        setStateDropdownList(arr);
    };

    function onBackTap() {
        navigation.push(navigationConstant.ASB_GUARANTOR_EMPLOYMENT_DETAILS, {
            currentSteps: 1,
            totalSteps: 2,
        });
    }

    function onCloseTap() {
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    const handleLeaveBtn = async () => {
        setShowPopupConfirm(false);
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    };

    const onNextTap = async () => {
        if (isEmploeymentDetails2ContinueButtonEnabled) {
            updateApiCEP(() => {
                const bodyApplicationDetails = {
                    stpReferenceNumber,
                    idNumber,
                };
                dispatch(
                    asbApplicationDetails(
                        bodyApplicationDetails,
                        (resultAsbApplicationDetails, _, eligibilityCheckOutcomeData) => {
                            updateDataOnReducerBaseOnApplicationDetails(
                                resultAsbApplicationDetails,
                                masterDataReducer?.data,
                                eligibilityCheckOutcomeData,
                                dispatch,
                                navigation,
                                true,
                                true,
                                additionalDetails
                            );
                        },
                        null,
                        null,
                        dataStoreValidation?.mainApplicantName
                    )
                );
            });
        }
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "12",
            stpReferenceNo: stpReferenceNumber,
            officePhoneNumber: mobileNumberWithoutExtensionEmployment,
            employerCountry: countryValueEmployment?.value,
            officeAddressLine1: addressLineOneEmployment,
            officeAddressLine2: addressLineTwoEmployment,
            officeAddressLine3: addressLineThreeEmployment,
            employerPostCode: postalCodeEmployment,
            employerStateCode: stateValueEmployment?.value,
            employerStateDesc: stateValueEmployment?.name,
            employerCity: cityEmployment,
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data & callback) {
                    callback();
                }
            })
        );
    }

    function addressLineOneFocus() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOnEmployment: false,
        });
    }

    function onAddressLineOneInputDidChange(value) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOnEmployment: false,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_ONE_ACTION,
            addressLineOneEmployment: value,
        });
    }

    function addressLineTwoFocus() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOnEmployment: false,
        });
    }

    function addressLineThreeFocus() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
            isAddressLineThreeMaskingOnEmployment: false,
        });
    }

    function onAddressLineTwoInputDidChange(value) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOnEmployment: false,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_TWO_ACTION,
            addressLineTwoEmployment: value,
        });
    }

    function onAddressLineThreeInputDidChange(value) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_MASK_ACTION,
            isAddressLineThreeMaskingOnEmployment: false,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_ADDRESS_LINE_THREE_ACTION,
            addressLineThreeEmployment: value,
        });
    }

    function onPostalCodeInputDidChange(value) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
            isPostalCodeMaskingOnEmployment: false,
        });
        dispatch({ type: GUARANTOR_EMPLOYMENT_POSTAL_CODE_ACTION, postalCodeEmployment: value });
    }

    function postalCodeFocus() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_POSTAL_CODE_MASK_ACTION,
            isPostalCodeMaskingOnEmployment: false,
        });
    }

    function onCityFocus() {
        dispatch({ type: GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION, isCityMaskingOnEmployment: false });
    }

    function onCityInputDidChange(value) {
        dispatch({ type: GUARANTOR_EMPLOYMENT_CITY_MASK_ACTION, isCityMaskingOnEmployment: false });
        dispatch({ type: GUARANTOR_EMPLOYMENT_CITY_ACTION, cityEmployment: value });
    }

    function onMobileNumberFocus() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
            isMobileNumberMaskingOnEmployment: false,
        });
    }

    function onMobileInputDidChange(value) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_MASK_ACTION,
            isMobileNumberMaskingOnEmployment: false,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtensionEmployment: value,
        });
    }

    function onMobileInputEndEditing() {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtensionEmployment:
                SETTINGS_DEFAULT_NUMBER + mobileNumberWithoutExtensionEmployment,
        });
    }

    function onStateDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: stateIndexEmployment,
            filterType: "",
            data: stateDropdownList,
        });
    }

    function onCountryDropdownPillDidTap() {
        setCountryScrollPicker({
            isDisplay: true,
            selectedIndex: countryIndexEmployment,
            filterType: "",
            data: masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.countryUpdate : [],
        });
    }

    function onScrollPickerDoneButtonDidTap(data, index) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_STATE_ACTION,
            stateIndexEmployment: index,
            stateValueEmployment: data,
        });
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onCountryScrollPickerDoneButtonDidTap(data, index) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_COUNTRY_ACTION,
            countryIndexEmployment: index,
            countryValueEmployment: data,
        });
        dispatch({
            type: GUARANTOR_EMPLOYMENT_STATE_ACTION,
            stateIndexEmployment: 0,
            stateValueEmployment: null,
        });
        getReleventState(data.value);
        dispatch({
            type: GUARANTOR_EMPLOYMENT_IS_STATE_ENABLED_ACTION,
            isStateDropdownEnabledEmployment: true,
        });
        setCountryScrollPicker({
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

    function onCountryScrollPickerCancelButtonDidTap() {
        setCountryScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function getAddressLineOneValue() {
        if (addressLineOneEmployment) {
            return isAddressLineOneMaskingOnEmployment
                ? maskAddress(addressLineOneEmployment)
                : addressLineOneEmployment;
        }
    }

    function getAddressLineTwoValue() {
        if (addressLineTwoEmployment) {
            return isAddressLineTwoMaskingOnEmployment
                ? maskAddress(addressLineTwoEmployment)
                : addressLineTwoEmployment;
        }
    }

    function getAddressLineThreeValue() {
        if (addressLineThreeEmployment) {
            return isAddressLineThreeMaskingOnEmployment
                ? maskAddress(addressLineThreeEmployment)
                : addressLineThreeEmployment;
        }
    }

    function getPostalCodeValue() {
        return isPostalCodeMaskingOnEmployment
            ? maskPostCode(postalCodeEmployment)
            : postalCodeEmployment;
    }

    function getMobileNumberValue() {
        if (mobileNumberWithoutExtensionEmployment) {
            return isMobileNumberMaskingOnEmployment
                ? maskMobile(mobileNumberWithoutExtensionEmployment)
                : mobileNumberWithoutExtensionEmployment;
        }
    }

    function getCityValue() {
        if (cityEmployment) {
            return isCityMaskingOnEmployment ? maskAddress(cityEmployment) : cityEmployment;
        }
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Asb_Finance_Personal_Information"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={`${STEP} ${currentSteps} of ${totalSteps}`}
                                    color={DARK_GREY}
                                />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
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
                                style={Style.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={Style.formContainer}>
                                    <View>
                                        <Typo lineHeight={21} textAlign="left" text={GUARANTOR} />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={OCCUPATION_INFORMATION_CHECK_UPDATE}
                                        />
                                        {buildOccupationInformation2Form()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        isEmploeymentDetails2ContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        isEmploeymentDetails2ContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={CONTINUE} />
                                    }
                                    onPress={onNextTap}
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
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={countryScrollPicker.isDisplay}
                    list={countryScrollPicker.data}
                    selectedIndex={countryScrollPicker.selectedIndex}
                    onRightButtonPress={onCountryScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onCountryScrollPickerCancelButtonDidTap}
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
                        onPress: handleLeaveBtn,
                    }}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupCloseConfirm,
                    }}
                />
            </ScreenContainer>
        </React.Fragment>
    );

    function buildOccupationInformation2Form() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={COUNTRY}
                    dropdownTitle={countryValueEmployment?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onCountryDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                <SpaceFiller height={24} />

                <Typo lineHeight={18} textAlign="left" text={OFFICE_ADDR1} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={addressLineOneErrorMessageEmployment}
                    isValid={addressLineOneErrorMessageEmployment === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineOneValue()}
                    placeholder={`e.g ${UNIT_NUMBER}/${FLOOR}/${BUILDING}`}
                    onChangeText={onAddressLineOneInputDidChange}
                    onFocus={addressLineOneFocus}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={OFFICE_ADDR2} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={addressLineTwoErrorMessageEmployment}
                    isValid={addressLineTwoErrorMessageEmployment === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineTwoValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineTwoInputDidChange}
                    onFocus={addressLineTwoFocus}
                />

                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={OFFICE_ADDR3} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={addressLineThreeErrorMessageEmployment}
                    isValid={addressLineThreeErrorMessageEmployment === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineThreeValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineThreeInputDidChange}
                    onFocus={addressLineThreeFocus}
                />

                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_POSTAL} />
                <SpaceFiller height={12} />
                <TextInputWithReturnType
                    errorMessage={postalCodeErrorMessageEmployment}
                    isValid={postalCodeErrorMessageEmployment === null}
                    isValidate
                    maxLength={5}
                    value={getPostalCodeValue()}
                    placeholder={`e.g ${POSTAL_CODE_DUMMY}`}
                    onChangeText={onPostalCodeInputDidChange}
                    onFocus={postalCodeFocus}
                    keyboardType="number-pad"
                />
                <TitleAndDropdownPill
                    title={PLSTP_STATE}
                    dropdownTitle={stateValueEmployment?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onStateDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    isDisabled={!isStateDropdownEnabledEmployment}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_CITY} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={cityErrorMessageEmployment}
                    isValid={cityErrorMessageEmployment === null}
                    isValidate
                    maxLength={30}
                    value={getCityValue()}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                    onFocus={onCityFocus}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={OFFICE_PHNO} />
                <SpaceFiller height={12} />
                <TextInputWithReturnType
                    errorMessage={mobileNumberErrorMessageEmployment}
                    isValid={mobileNumberErrorMessageEmployment === null}
                    isValidate
                    maxLength={10}
                    value={getMobileNumberValue()}
                    placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                    onChangeText={onMobileInputDidChange}
                    onEndEditing={onMobileInputEndEditing}
                    onFocus={onMobileNumberFocus}
                    prefix={MOB_CODE}
                    keyboardType="number-pad"
                />
            </React.Fragment>
        );
    }
};

export const guarantorEmploymentDetails2PropTypes = (GuarantorEmploymentDetails2.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    params: PropTypes.object,
});

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
});

export default GuarantorEmploymentDetails2;
