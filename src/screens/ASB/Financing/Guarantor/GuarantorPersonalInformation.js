import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";
import { updateDataOnReducerBaseOnApplicationDetails } from "@screens/ASB/Financing/helpers/CustomerDetailsPrefiller";
import { maskAddress, maskMobile, maskEmail, maskPostCode } from "@screens/PLSTP/PLSTPController";

import {
    ASB_GUARANTOR_EMPLOYMENT_DETAILS,
    ASB_ACCEPT_AS_GUARANTOR_DECLARATION,
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
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TextInputWithReturnType from "@components/TextInputWithReturnType";

import {
    GUARANTOR_ADDRESS_LINE_ONE_ACTION,
    GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_ACTION,
    GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
    GUARANTOR_ADDRESS_LINE_THREE_ACTION,
    GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION,
    GUARANTOR_CITY_ACTION,
    GUARANTOR_CITY_MASK_ACTION,
    GUARANTOR_COUNTRY_ACTION,
    GUARANTOR_EDUCATION_ACTION,
    GUARANTOR_EMAIL_MASK_ACTION,
    GUARANTOR_MARITAL_ACTION,
    GUARANTOR_MOBILE_NUMBER_MASK_ACTION,
    GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION,
    GUARANTOR_POSTAL_CODE_ACTION,
    GUARANTOR_RACE_ACTION,
    GUARANTOR_STATE_ACTION,
    GUARANTOR_EMAIL_ADDRESS_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    GUARANTOR_IS_STATE_ENABLED_ACTION,
    GUARANTOR_IS_STATE_CHANGED_ACTION,
    GUARANTOR_POSTAL_CODE_MASK_ACTION,
} from "@redux/actions/ASBFinance/guarantorPersonalInformationAction";
import { asbApplicationDetails } from "@redux/services/ASBServices/asbApiApplicationDetails";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { DISABLED, YELLOW } from "@constants/colors";
import {
    ADDRESS_LINE_ONE,
    ADDRESS_LINE_TWO,
    ADDRESS_LINE_THREE,
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
    PLSTP_MOBILE_NUM,
    MOBILE_NUMBER_DUMMY,
    SETTINGS_DEFAULT_NUMBER,
    MOB_CODE,
    DUMMY_EMAIL,
    EMAIL_LBL,
    PLSTP_MARITAL_STATUS,
    PLSTP_EDUCATION,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    CANCEL,
    UPDATE_PERSONAL_DETAILS,
    DEC_PERSONAL_DETAILS,
    ASB_GUARANTOR_PERSONAL_INFORMATION_HEADING,
    PERSONAL_INFORMATION_CHECK_UPDATE,
    STEPUP_MAE_RACE,
    UPDATE,
    DONE,
    OKAY,
    LEAVE,
    COUNTRY,
    ASB_NATIVE,
    APPLY_ASBFINANCINGGUARANTOR_PERSONALDETAILS,
    SUCC_STATUS,
} from "@constants/strings";

const GuarantorPersonalInformation = ({ navigation, route }) => {
    const isEmployeeDataMissing = route?.params?.isEmployeeDataMissing;

    // Hooks for access reducer data
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

    const { dataStoreValidation } = asbApplicationDetailsReducer;

    const allStateList =
        masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.allState : [];
    const raceData = asbGuarantorPrePostQualReducer?.resultAsbApplicationDetails?.stpRaceDesc;
    const raceCode = asbGuarantorPrePostQualReducer?.resultAsbApplicationDetails?.stpRaceCode;
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const idNumber = asbGuarantorPrePostQualReducer?.idNo;
    const additionalDetails = asbGuarantorPrePostQualReducer?.additionalDetails;

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    const {
        addressLineOne,
        addressLineTwo,
        addressLineThree,
        postalCode,
        stateIndex,
        stateValue,
        maritalIndex,
        maritalValue,
        educationIndex,
        educationValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
        mobileNumberErrorMessage,
        isAddressLineOneMaskingOn,
        isAddressLineTwoMaskingOn,
        isAddressLineThreeMaskingOn,
        isMobileNumberMaskingOn,
        isPostalCodeMaskingOn,
        isCityMaskingOn,
        isEmailMaskingOn,
        emailAddress,
        raceIndex,
        raceValue,
        isPersonalInformationContinueButtonEnabled,
        emailAddressErrorMessage,
        cityErrorMessage,
        postalCodeErrorMessage,
        addressLineThreeErrorMessage,
        addressLineTwoErrorMessage,
        addressLineOneErrorMessage,
        isStateDropdownEnabled,
        isFromConfirmationScreenForPersonalDetails,
    } = personalInformationReducer;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [scrollPicker, setScrollPicker] = useState(scrollPickerInitialState);
    const [maritalScrollPicker, setMaritalScrollPicker] = useState(scrollPickerInitialState);
    const [educationScrollPicker, setEducationScrollPicker] = useState(scrollPickerInitialState);
    const [countryScrollPicker, setCountryScrollPicker] = useState(scrollPickerInitialState);
    const [raceScrollPicker, setRaceScrollPicker] = useState(scrollPickerInitialState);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [stateDropdownList, setStateDropdownList] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        dispatch({
            type: GUARANTOR_PERSONAL_CONTINUE_BUTTON_DISABLED_ACTION,
            raceData,
        });
    }, [
        addressLineOne,
        addressLineTwo,
        postalCode,
        stateIndex,
        stateValue,
        maritalIndex,
        maritalValue,
        educationIndex,
        educationValue,
        countryIndex,
        countryValue,
        city,
        mobileNumberWithoutExtension,
        emailAddress,
        raceIndex,
        raceValue,
    ]);

    const init = async () => {
        if (countryValue?.value) {
            getReleventState(countryValue.value);
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
        if (isFromConfirmationScreenForPersonalDetails) {
            navigation.goBack();
        } else {
            navigation.navigate(ASB_ACCEPT_AS_GUARANTOR_DECLARATION);
        }
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
        setShowPopup(false);
        if (isPersonalInformationContinueButtonEnabled) {
            updateApiCEP(() => {
                if (isEmployeeDataMissing) {
                    navigation.navigate(ASB_GUARANTOR_EMPLOYMENT_DETAILS, {
                        currentSteps: 1,
                        totalSteps: 2,
                        isPersonalScreen: true,
                    });
                } else {
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
                }
            });
        }
    };

    function updateApiCEP(callback) {
        const body = {
            screenNo: "10",
            stpReferenceNo: stpReferenceNumber,
            maritalStatusCode: maritalValue?.value,
            maritalStatusDesc: maritalValue?.name,
            educationCode: educationValue?.value,
            educationDesc: educationValue?.name,
            mobileNumber: mobileNumberWithoutExtension,
            emailAddress,
            homeCountry: countryValue?.value,
            addressLine1: addressLineOne,
            addressLine2: addressLineTwo,
            addressLine3: addressLineThree,
            homePostCode: postalCode,
            homeStateCode: stateValue?.value,
            homeStateDesc: stateValue?.name,
            homeCity: city,
            raceCode,
            raceDesc: raceData,
            ethnicCode: raceValue?.value,
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    function addressLineOneFocus() {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_ONE_MASK_ACTION,
            isAddressLineOneMaskingOn: false,
        });
    }

    function onAddressLineOneInputDidChange(value) {
        dispatch({ type: GUARANTOR_ADDRESS_LINE_ONE_ACTION, addressLineOne: value });
    }

    function addressLineTwoFocus() {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_TWO_MASK_ACTION,
            isAddressLineTwoMaskingOn: false,
        });
    }

    function addressLineThreeFocus() {
        dispatch({
            type: GUARANTOR_ADDRESS_LINE_THREE_MASK_ACTION,
            isAddressLineThreeMaskingOn: false,
        });
    }

    function onAddressLineTwoInputDidChange(value) {
        dispatch({ type: GUARANTOR_ADDRESS_LINE_TWO_ACTION, addressLineTwo: value });
    }

    function onAddressLineThreeInputDidChange(value) {
        dispatch({ type: GUARANTOR_ADDRESS_LINE_THREE_ACTION, addressLineThree: value });
    }

    function onPostalCodeInputDidChange(value) {
        dispatch({ type: GUARANTOR_POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
        dispatch({ type: GUARANTOR_POSTAL_CODE_ACTION, postalCode: value });
    }
    function postalCodeFocus() {
        dispatch({ type: GUARANTOR_POSTAL_CODE_MASK_ACTION, isPostalCodeMaskingOn: false });
    }

    function onCityFocus() {
        dispatch({ type: GUARANTOR_CITY_MASK_ACTION, isCityMaskingOn: false });
    }

    function onCityInputDidChange(value) {
        dispatch({ type: GUARANTOR_CITY_ACTION, city: value });
    }

    function onMobileNumberFocus() {
        dispatch({ type: GUARANTOR_MOBILE_NUMBER_MASK_ACTION, isMobileNumberMaskingOn: false });
    }

    function onMobileInputDidChange(value) {
        dispatch({
            type: GUARANTOR_MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension: value,
        });
    }

    function onMobileInputEndEditing() {
        dispatch({
            type: GUARANTOR_MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtension: SETTINGS_DEFAULT_NUMBER + mobileNumberWithoutExtension,
        });
    }

    function onStateDropdownPillDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: stateIndex,
            filterType: "",
            data: stateDropdownList,
        });
    }

    function onMaritalDropdownPillDidTap() {
        setMaritalScrollPicker({
            isDisplay: true,
            selectedIndex: maritalIndex,
            filterType: "",
            data: masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.maritalStatus : [],
        });
    }

    function onEducationDropdownPillDidTap() {
        setEducationScrollPicker({
            isDisplay: true,
            selectedIndex: educationIndex,
            filterType: "",
            data: masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.education : [],
        });
    }

    function onCountryDropdownPillDidTap() {
        setCountryScrollPicker({
            isDisplay: true,
            selectedIndex: countryIndex,
            filterType: "",
            data: masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.countryUpdate : [],
        });
    }

    function onScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_STATE_ACTION, stateIndex: index, stateValue: data });
        if (isFromConfirmationScreenForPersonalDetails) {
            dispatch({ type: GUARANTOR_IS_STATE_CHANGED_ACTION, isStateChanged: true });
        } else {
            dispatch({ type: GUARANTOR_IS_STATE_CHANGED_ACTION, isStateChanged: false });
        }

        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onMaritalScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_MARITAL_ACTION, maritalIndex: index, maritalValue: data });
        setMaritalScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEducationScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_EDUCATION_ACTION, educationIndex: index, educationValue: data });
        setEducationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onCountryScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_COUNTRY_ACTION, countryIndex: index, countryValue: data });
        dispatch({ type: GUARANTOR_STATE_ACTION, stateIndex: 0, stateValue: null });
        getReleventState(data.value);
        dispatch({ type: GUARANTOR_IS_STATE_ENABLED_ACTION, isStateDropdownEnabled: true });
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

    function onMaritalScrollPickerCancelButtonDidTap() {
        setMaritalScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEducationScrollPickerCancelButtonDidTap() {
        setEducationScrollPicker({
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

    function onRaceDropdownPillDidTap() {
        setRaceScrollPicker({
            isDisplay: true,
            selectedIndex: raceIndex,
            filterType: "",
            data:
                masterDataReducer.status === SUCC_STATUS ? masterDataReducer?.personalInfoRace : [],
        });
    }

    function onRaceScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_RACE_ACTION, raceIndex: index, raceValue: data });
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEmailFocus() {
        dispatch({ type: GUARANTOR_EMAIL_MASK_ACTION, isEmailMaskingOn: false });
    }

    function onEmailInputDidChange(value) {
        dispatch({ type: GUARANTOR_EMAIL_ADDRESS_ACTION, emailAddress: value });
    }

    function getAddressLineOneValue() {
        if (addressLineOne) {
            return isAddressLineOneMaskingOn ? maskAddress(addressLineOne) : addressLineOne;
        }
    }

    function getAddressLineTwoValue() {
        if (addressLineTwo) {
            return isAddressLineTwoMaskingOn ? maskAddress(addressLineTwo) : addressLineTwo;
        }
    }

    function getAddressLineThreeValue() {
        if (addressLineThree) {
            return isAddressLineThreeMaskingOn ? maskAddress(addressLineThree) : addressLineThree;
        }
    }

    function getPostalCodeValue() {
        return isPostalCodeMaskingOn ? maskPostCode(postalCode) : postalCode;
    }

    function getMobileNumberValue() {
        if (mobileNumberWithoutExtension) {
            return isMobileNumberMaskingOn
                ? maskMobile(mobileNumberWithoutExtension)
                : mobileNumberWithoutExtension;
        }
    }

    function getEmailAddressValue() {
        if (emailAddress) {
            return isEmailMaskingOn ? maskEmail(emailAddress) : emailAddress;
        }
    }
    function getCityValue() {
        if (city) {
            return isCityMaskingOn ? maskAddress(city) : city;
        }
    }

    function onPopupShow() {
        setShowPopup(true);
    }

    function onPopupDismiss() {
        setShowPopup(false);
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_PERSONALDETAILS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                                        <Typo
                                            lineHeight={21}
                                            textAlign="left"
                                            text={ASB_GUARANTOR_PERSONAL_INFORMATION_HEADING}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={PERSONAL_INFORMATION_CHECK_UPDATE}
                                        />
                                        {buildPersonalInformationForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        isPersonalInformationContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        isPersonalInformationContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={UPDATE} />
                                    }
                                    onPress={onPopupShow}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
                <Popup
                    visible={showPopup}
                    onClose={onPopupDismiss}
                    title={UPDATE_PERSONAL_DETAILS}
                    description={DEC_PERSONAL_DETAILS}
                    secondaryAction={{
                        text: CANCEL,
                        onPress: onPopupDismiss,
                    }}
                    primaryAction={{
                        text: OKAY,
                        onPress: onNextTap,
                    }}
                />
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
                    showMenu={raceScrollPicker.isDisplay}
                    list={raceScrollPicker.data}
                    selectedIndex={raceScrollPicker.selectedIndex}
                    onRightButtonPress={onRaceScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={scrollPickerOnPressCancel}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <ScrollPickerView
                    showMenu={maritalScrollPicker.isDisplay}
                    list={maritalScrollPicker.data}
                    selectedIndex={maritalScrollPicker.selectedIndex}
                    onRightButtonPress={onMaritalScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onMaritalScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={educationScrollPicker.isDisplay}
                    list={educationScrollPicker.data}
                    selectedIndex={educationScrollPicker.selectedIndex}
                    onRightButtonPress={onEducationScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onEducationScrollPickerCancelButtonDidTap}
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

    function buildPersonalInformationForm() {
        return (
            <React.Fragment>
                <TitleAndDropdownPill
                    title={PLSTP_MARITAL_STATUS}
                    dropdownTitle={maritalValue?.name ? maritalValue.name : PLEASE_SELECT}
                    dropdownOnPress={onMaritalDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                <TitleAndDropdownPill
                    title={PLSTP_EDUCATION}
                    dropdownTitle={educationValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onEducationDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                {raceData === ASB_NATIVE ? (
                    <TitleAndDropdownPill
                        title={STEPUP_MAE_RACE}
                        dropdownTitle={raceValue?.name ?? PLEASE_SELECT}
                        dropdownOnPress={onRaceDropdownPillDidTap}
                        removeTopMargin={true}
                        titleFontWeight="400"
                    />
                ) : null}

                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={PLSTP_MOBILE_NUM} />
                <SpaceFiller height={12} />
                <TextInputWithReturnType
                    errorMessage={mobileNumberErrorMessage}
                    isValid={mobileNumberErrorMessage === null}
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

                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={EMAIL_LBL} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={emailAddressErrorMessage}
                    isValid={emailAddressErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getEmailAddressValue()}
                    placeholder={`e.g ${DUMMY_EMAIL}`}
                    onChangeText={onEmailInputDidChange}
                    onFocus={onEmailFocus}
                />

                <TitleAndDropdownPill
                    title={COUNTRY}
                    dropdownTitle={countryValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onCountryDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />

                <SpaceFiller height={24} />

                <Typo lineHeight={18} textAlign="left" text={ADDRESS_LINE_ONE} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={addressLineOneErrorMessage}
                    isValid={addressLineOneErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineOneValue()}
                    placeholder={`e.g ${UNIT_NUMBER}/${FLOOR}/${BUILDING}`}
                    onChangeText={onAddressLineOneInputDidChange}
                    onFocus={addressLineOneFocus}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={ADDRESS_LINE_TWO} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={addressLineTwoErrorMessage}
                    isValid={addressLineTwoErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={getAddressLineTwoValue()}
                    placeholder={`e.g ${STREET_NAME}`}
                    onChangeText={onAddressLineTwoInputDidChange}
                    onFocus={addressLineTwoFocus}
                />

                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={ADDRESS_LINE_THREE} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={addressLineThreeErrorMessage}
                    isValid={addressLineThreeErrorMessage === null}
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
                    errorMessage={postalCodeErrorMessage}
                    isValid={postalCodeErrorMessage === null}
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
                    dropdownTitle={stateValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onStateDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    isDisabled={!isStateDropdownEnabled}
                />

                <SpaceFiller height={24} />

                <Typo lineHeight={18} textAlign="left" text={STEPUP_MAE_ADDRESS_CITY} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={cityErrorMessage}
                    isValid={cityErrorMessage === null}
                    isValidate
                    maxLength={30}
                    value={getCityValue()}
                    placeholder={`e.g ${DUMMY_KUALA_LUMPUR}`}
                    onChangeText={onCityInputDidChange}
                    onFocus={onCityFocus}
                />
            </React.Fragment>
        );
    }
};

export const personalInformationPropTypes = (GuarantorPersonalInformation.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
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

export default GuarantorPersonalInformation;
