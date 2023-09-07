import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform, TouchableOpacity, Linking } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { APPLY_ETB_REGISTERM2U } from "@screens/CasaSTP/helpers/AnalyticsEventConstants";
import {
    isUnidentifiedUser,
    isWithoutM2UUser,
    isM2UOnlyUser,
    isDraftUser,
    isDraftBranchUser,
    isNTBUser,
    isETBUser,
    getAnalyticScreenName,
    getSceneCode,
    getAnalyticProductName,
} from "@screens/CasaSTP/helpers/CasaSTPHelpers";
import {
    EmployeeDetailsPrefiller,
    PersonalDetailsPrefiller,
} from "@screens/ZestCASA/helpers/CustomerDetailsPrefiller";
import { shouldShowSuitabilityAssessmentForETBCustomer } from "@screens/ZestCASA/helpers/ZestHelpers";

import {
    PREMIER_ACCOUNT_NOT_FOUND,
    PREMIER_LOGIN_ENTRY,
    PREMIER_OTP_VERIFICATION,
    PREMIER_RESIDENTIAL_DETAILS,
    PREMIER_SUITABILITY_ASSESSMENT,
    PREMIER_IDENTITY_DETAILS,
    APPLY_MAE_SCREEN,
    PREMIER_MODULE_STACK,
    MAE_MODULE_STACK,
    PREMIER_PERSONAL_DETAILS,
    PREMIER_ACTIVATE_ACCOUNT,
    PREMIER_ACTIVATION_CHOICE,
    MORE,
    ACCOUNTS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { ScrollPickerView } from "@components/Common";
import RadioChecked from "@components/Common/RadioChecked";
import RadioUnchecked from "@components/Common/RadioUnchecked";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import DatePicker from "@components/Pickers/DatePicker";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast } from "@components/Toast";

import { useModelController } from "@context";

import { GACasaSTP } from "@services/analytics/analyticsCasaSTP";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import identityDetailsProps from "@redux/connectors/ZestCASA/identityDetailsConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";
import prePostQualServiceProps, {
    prePostQualServicePropTypes,
} from "@redux/connectors/services/prePostQualConnector";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import {
    MYKAD_CODE,
    PASSPORT_CODE,
    PRE_QUAL_PRE_LOGIN_FLAG,
    PREMIER_CLEAR_ALL,
    MYKAD_ID_TYPE,
    PASSPORT_ID_TYPE,
    PREQUAL_PENDING_ACCOUNT_CREATION_STATUS,
} from "@constants/casaConfiguration";
import {
    M2U_REGISTRATION,
    M2U_REGISTRATION_DESC,
    M2U_REGISTRATION_BUTTON,
} from "@constants/casaStrings";
import { PREMIER_PRE_POST } from "@constants/casaUrl";
import { DISABLED, YELLOW, DARK_GREY } from "@constants/colors";
import {
    NEXT_SMALL_CAPS,
    DOB_LBL,
    DUMMY_CALENDER_DATE2,
    MYKAD_NUMBER,
    MYKAD_NUMBER_PLACEHOLDER,
    SELECT_YOUR_ID_TYPE,
    TELL_US_YOUR_ID_TYPE,
    NATIONALITY_LBL,
    PLSTP_UD_MYKAD,
    PASSPORT,
    FULLNAME_LBL,
    SIGNUP_MAE_FULLNAME,
    PASSPORTID_LBL,
    PASSPORT_NO_DUMMY,
    PASSPORT_EXPIRY_DATE,
    PLEASE_SELECT,
    WELCOME_BACK,
    RESUME_FLOW_MESSAGE,
    OKAY,
    ALREADY_HAVE_ACCOUNT_ERROR,
    ZEST_08_ACC_TYPE_ERROR,
    ACCOUNT_NOT_OPENED_MESSAGE,
    DONE,
    CANCEL,
} from "@constants/strings";

import { apiToMhDateLocal, apiToMhDateLocalServer } from "@utils/momentUtils";

const PremierIdentityDetails = (props) => {
    const { navigation } = props;
    const { getModel } = useModelController();

    // Hooks to access reducer data
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const [isDOBDatePickerVisible, setIsDOBDatePickerVisible] = useState(false);
    const [isPassportDatePickerVisible, setIsPassportDatePickerVisible] = useState(false);
    const [isWelcomePopupVisible, setIsWelcomePopupVisible] = useState(false);
    const [isM2UIdPopupVisible, setIsM2UIdPopupVisible] = useState(false);
    const [onlineRegUrl, setOnlineRegUrl] = useState("");

    const screenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_IDENTITY_DETAILS,
        ""
    );

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    const currentDate = new Date();

    // DOB DatePicker Start Date
    const dateRangeDOBStartDate = new Date(
        currentDate.getFullYear() - 99,
        currentDate.getMonth(),
        currentDate.getDate()
    );
    // DOB DatePicker End Date
    const dateRangeDOBEndDate = new Date(
        currentDate.getFullYear() - 18,
        currentDate.getMonth(),
        currentDate.getDate()
    );
    // Passport DatePicker Start Date
    const dateRangePassportStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
    );
    // Passport DatePicker End Date
    const dateRangePassportEndDate = new Date(
        currentDate.getFullYear() + 30,
        currentDate.getMonth(),
        currentDate.getDate()
    );
    // Passport DatePicker End Date
    const dateRangePassportDefaultDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
    );

    function onBackTap() {
        console.log("[PremierIdentityDetails] >> [onBackTap]");
        navigation.goBack();
    }

    function onCloseTap() {
        console.log("[PremierIdentityDetails] >> [onCloseTap]");
        // Clear all data from PMA reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    // SetUp Pre Call Pre Login Data
    const fetchPreQualPreLoginData = (state) => {
        return {
            idType: state.identityType === 1 ? MYKAD_CODE : PASSPORT_CODE,
            birthDate:
                state.identityType === 1 ? "" : apiToMhDateLocalServer(state.dateOfBirthDateObject),
            passportExpiryDate:
                state.identityType === 1
                    ? ""
                    : apiToMhDateLocalServer(state.passportExpiryDateObject),
            preOrPostFlag: PRE_QUAL_PRE_LOGIN_FLAG,
            icNo: state.identityType === 1 ? state.identityNumber : state.passportNumber,
            mobileNo: "",
            productName: entryReducer?.productName,
        };
    };

    function onNextTap() {
        if (
            (props?.identityType === 1 &&
                props?.identityNumber !== null &&
                props?.identityNumberErrorMessage === null) ||
            props.isIdentityContinueButtonEnabled
        ) {
            callPreQualService();
        }
    }

    async function callPreQualService() {
        const userIdentityType =
            identityDetailsReducer.identityType === 1 ? MYKAD_ID_TYPE : PASSPORT_ID_TYPE;
        GACasaSTP.onPremierIdentityDetails(screenName, userIdentityType);

        const body = fetchPreQualPreLoginData(identityDetailsReducer);

        await props.prePostQualPremier(PREMIER_PRE_POST, body, (result, userStatus, exception) => {
            if (result) {
                if (isUnidentifiedUser(userStatus)) {
                    return showErrorToast({
                        message: ACCOUNT_NOT_OPENED_MESSAGE,
                    });
                }
                if (isWithoutM2UUser(userStatus)) {
                    setIsM2UIdPopupVisible(true);
                    GACasaSTP.onPremierActivation(APPLY_ETB_REGISTERM2U);
                    setOnlineRegUrl(result.onlineRegUrl);
                    return;
                }
                if (isETBUser(userStatus, entryReducer)) prefillDetailsForExistingUser(result);

                handleNavigationBasedOnModuleFlag(entryReducer.isPMA, userStatus, result);
            } else {
                if (exception) {
                    const { statusCode } = exception;

                    if (statusCode === "4775") {
                        navigation.navigate(PREMIER_LOGIN_ENTRY, {
                            needToCheck08: true,
                        });
                    } else if (statusCode === "4778") {
                        showErrorToast({
                            message: ALREADY_HAVE_ACCOUNT_ERROR,
                        });
                    } else if (statusCode === "6608") {
                        showErrorToast({
                            message: ZEST_08_ACC_TYPE_ERROR,
                        });
                    } else if (statusCode === "6610") {
                        navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    } else {
                        dispatch({ type: PREMIER_CLEAR_ALL });
                        props.clearDownTimeReducer();
                        props.clearMasterDataReducer();
                        dispatch({ type: PREPOSTQUAL_CLEAR });
                        navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                            isVisitBranchMode: true,
                        });
                    }
                }
            }
        });
    }

    function prefillDetailsForExistingUser(result) {
        PersonalDetailsPrefiller(dispatch, masterDataReducer, result);
        EmployeeDetailsPrefiller(dispatch, masterDataReducer, result);
    }

    function handleNavigationBasedOnModuleFlag(isPMA, userStatus, prePostQualResult) {
        const saDailyIndicator = prePostQualResult?.saDailyInd ?? null;
        const { isEKYCDone } = getModel("isEKYCDone");
        const eKycParams = {
            selectedIDType:
                identityDetailsReducer.identityType === 1 ? MYKAD_ID_TYPE : PASSPORT_ID_TYPE,
            entryStack: MORE,
            entryScreen: ACCOUNTS_SCREEN,
            navigateToNextStack: PREMIER_MODULE_STACK,
            navigateToNextScreen:
                !isEKYCDone && !isNTBUser(userStatus)
                    ? PREMIER_ACTIVATE_ACCOUNT
                    : PREMIER_PERSONAL_DETAILS,
            exceedLimitScreen: PREMIER_ACTIVATION_CHOICE,
            entryParams: { from: "eKYC" },
            from: userStatus,
            idNo: props?.identityNumber,
            fullName: "",
            passportCountry: "",
            passportCountryCode: "",
            reqType: "E01",
            isNameCheck: false,
            sceneCode: getSceneCode(entryReducer),
            isPM1: entryReducer.isPM1,
            isPMA: entryReducer.isPMA,
            isKawanku: entryReducer.isKawanku,
            isKawankuSavingsI: entryReducer.isKawankuSavingsI,
        };
        if (isM2UOnlyUser(userStatus) || isETBUser(userStatus, isETBUser)) {
            const { isOnboard } = getModel("user");

            if (isOnboard) {
                shouldShowSuitabilityAssessmentForETBCustomer(isPMA, saDailyIndicator)
                    ? navigation.navigate(PREMIER_SUITABILITY_ASSESSMENT)
                    : navigation.navigate(PREMIER_RESIDENTIAL_DETAILS);
            } else {
                navigation.navigate(PREMIER_LOGIN_ENTRY, {
                    needToCheck08: false,
                });
            }
        } else if (isDraftUser(userStatus)) {
            const { isOnboard } = getModel("user");
            if (!isOnboard) {
                navigation.navigate(PREMIER_LOGIN_ENTRY, {
                    needToCheck08: !!isDraftUser(userStatus),
                });
            }
        } else if (isNTBUser(userStatus)) {
            if (prePostQualResult.statusCode === PREQUAL_PENDING_ACCOUNT_CREATION_STATUS) {
                navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                    isVisitBranchMode: true,
                });
            } else if (
                prePostQualResult.statusCode === "4400" ||
                prePostQualResult.statusCode === STATUS_CODE_SUCCESS
            ) {
                if (identityDetailsReducer.identityType === 1 && !isPMA) {
                    navigation.navigate(MAE_MODULE_STACK, {
                        screen: APPLY_MAE_SCREEN,
                        params: {
                            eKycParams,
                        },
                    });
                } else {
                    isPMA
                        ? navigation.navigate(PREMIER_SUITABILITY_ASSESSMENT)
                        : navigation.navigate(PREMIER_MODULE_STACK, {
                              screen: PREMIER_PERSONAL_DETAILS,
                          });
                }
            }
        } else if (isDraftBranchUser(userStatus)) {
            navigation.navigate(PREMIER_ACCOUNT_NOT_FOUND, {
                isVisitBranchMode: true,
            });
        }
    }

    function onMyKadRadioButtonDidTap() {
        props.clearIdentityReducer();
        props.updateIdentityType(1);
        props.checkButtonEnable();
    }

    function onPassportRadioButtonDidTap() {
        props.clearIdentityReducer();
        props.updateIdentityType(2);
        props.checkButtonEnable();
    }

    function onFullNameInputDidChange(value) {
        props.updateFullName(value);
        props.checkButtonEnable();
    }

    function onMyKadInputDidChange(value) {
        props.updateIdentityNumber(value, true);
        props.checkButtonEnable();
    }

    function onPassportNumberInputDidChange(value) {
        props.updatePassportNumber(value);
        props.checkButtonEnable();
    }

    function handleDOBDatePickerVisibility() {
        setIsDOBDatePickerVisible(!isDOBDatePickerVisible);
    }

    function handlePassportDatePickerVisibility() {
        setIsPassportDatePickerVisible(!isPassportDatePickerVisible);
    }

    function onDOBDatePickerDoneButtonDidTap(value) {
        handleDOBDatePickerVisibility();
        props.updateDateOfBirth(apiToMhDateLocal(value), value);
        props.checkButtonEnable();
    }

    function onPassportDatePickerDoneButtonDidTap(value) {
        handlePassportDatePickerVisibility();
        props.updatePassportExpiryDate(apiToMhDateLocal(value), value);
        props.checkButtonEnable();
    }

    function onNationalityDropdownDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: props.nationalityIndex,
            filterType: "",
            data: props.residentialcountryforeigner,
        });
    }

    function scrollPickerOnPressDone(data, index) {
        props.updateNationality(index, data);
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
        props.checkButtonEnable();
    }

    function scrollPickerOnPressCancel() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onWelcomePopupOkayButtonDidTap() {
        setIsWelcomePopupVisible(false);
        navigation.navigate(PREMIER_OTP_VERIFICATION);
    }

    function onM2UIdPopupCloseButtonDidTap() {
        setIsM2UIdPopupVisible(false);
    }

    function registerM2U() {
        const accountName = getAnalyticProductName(entryReducer?.productName);
        GACasaSTP.onregisterM2U(APPLY_ETB_REGISTERM2U, accountName);
        Linking.openURL(onlineRegUrl);
    }

    function onWelcomePopupCloseButtonDidTap() {
        setIsWelcomePopupVisible(false);
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={screenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        headerCenterElement={
                            <Typo
                                fontSize={12}
                                fontWeight="600"
                                lineHeight={15}
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                <Typo
                                    lineHeight={21}
                                    textAlign="left"
                                    text={entryReducer?.productTile}
                                />
                                <SpaceFiller height={4} />
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={24}
                                    textAlign="left"
                                    text={TELL_US_YOUR_ID_TYPE}
                                />
                                <SpaceFiller height={36} />
                                {buildRadioButtonGroupView()}
                                <SpaceFiller height={24} />
                                {switchDetailsView()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={
                                (props?.identityType === 1 &&
                                    props?.identityNumber !== null &&
                                    props?.identityNumberErrorMessage === null) ||
                                props.isIdentityContinueButtonEnabled
                                    ? 1
                                    : 0.5
                            }
                            backgroundColor={
                                (props?.identityType === 1 &&
                                    props?.identityNumber !== null &&
                                    props?.identityNumberErrorMessage === null) ||
                                props.isIdentityContinueButtonEnabled
                                    ? YELLOW
                                    : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={NEXT_SMALL_CAPS} />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            {isWelcomePopupVisible && (
                <Popup
                    visible={isWelcomePopupVisible}
                    onClose={onWelcomePopupCloseButtonDidTap}
                    title={WELCOME_BACK}
                    description={RESUME_FLOW_MESSAGE}
                    primaryAction={{
                        text: OKAY,
                        onPress: onWelcomePopupOkayButtonDidTap,
                    }}
                />
            )}
            {isDOBDatePickerVisible && entryReducer.isPMA && (
                <DatePicker
                    showDatePicker={isDOBDatePickerVisible}
                    onCancelButtonPressed={handleDOBDatePickerVisibility}
                    onDoneButtonPressed={onDOBDatePickerDoneButtonDidTap}
                    dateRangeEndDate={dateRangeDOBEndDate}
                    defaultSelectedDate={dateRangeDOBEndDate}
                />
            )}
            {isDOBDatePickerVisible && !entryReducer.isPMA && (
                <DatePicker
                    showDatePicker={isDOBDatePickerVisible}
                    onCancelButtonPressed={handleDOBDatePickerVisibility}
                    onDoneButtonPressed={onDOBDatePickerDoneButtonDidTap}
                    dateRangeStartDate={dateRangeDOBStartDate}
                    dateRangeEndDate={dateRangeDOBEndDate}
                    defaultSelectedDate={dateRangeDOBEndDate}
                />
            )}
            {isPassportDatePickerVisible && (
                <DatePicker
                    showDatePicker={isPassportDatePickerVisible}
                    onCancelButtonPressed={handlePassportDatePickerVisibility}
                    onDoneButtonPressed={onPassportDatePickerDoneButtonDidTap}
                    dateRangeStartDate={dateRangePassportStartDate}
                    dateRangeEndDate={dateRangePassportEndDate}
                    defaultSelectedDate={dateRangePassportDefaultDate}
                />
            )}
            <ScrollPickerView
                showMenu={scrollPicker.isDisplay}
                list={scrollPicker.data}
                selectedIndex={scrollPicker.selectedIndex}
                onRightButtonPress={scrollPickerOnPressDone}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            {isM2UIdPopupVisible && (
                <Popup
                    visible={isM2UIdPopupVisible}
                    onClose={onM2UIdPopupCloseButtonDidTap}
                    title={M2U_REGISTRATION}
                    description={M2U_REGISTRATION_DESC}
                    primaryAction={{
                        text: M2U_REGISTRATION_BUTTON,
                        onPress: registerM2U,
                    }}
                />
            )}
        </ScreenContainer>
    );

    function buildRadioButtonGroupView() {
        return (
            <>
                <Typo lineHeight={21} textAlign="left" text={SELECT_YOUR_ID_TYPE} />
                <SpaceFiller height={16} />
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={onMyKadRadioButtonDidTap}
                    >
                        {props.identityType === 1 ? (
                            <RadioChecked checkType="color" />
                        ) : (
                            <RadioUnchecked />
                        )}

                        <View style={Style.radioButtonTitle}>
                            <Typo
                                fontWeight="600"
                                lineHeight={20}
                                textAlign="left"
                                text={PLSTP_UD_MYKAD}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={Style.radioCheckContainer}>
                    <TouchableOpacity
                        style={Style.radioButtonContainer}
                        onPress={onPassportRadioButtonDidTap}
                    >
                        {props.identityType === 2 ? (
                            <RadioChecked checkType="color" />
                        ) : (
                            <RadioUnchecked />
                        )}

                        <View style={Style.radioButtonTitle}>
                            <Typo
                                fontWeight="600"
                                lineHeight={20}
                                textAlign="left"
                                text={PASSPORT}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    function switchDetailsView() {
        if (props.identityType === 1) {
            return buildMyKadDetailsView();
        } else if (props.identityType === 2) {
            return buildPassportDetailsView();
        }
    }

    function buildMyKadDetailsView() {
        return (
            <>
                <Typo lineHeight={18} textAlign="left" text={MYKAD_NUMBER} />
                <SpaceFiller height={16} />
                <TextInput
                    errorMessage={props.identityNumberErrorMessage}
                    isValid={props.identityNumberErrorMessage === null}
                    isValidate
                    maxLength={12}
                    keyboardType="number-pad"
                    placeholder={MYKAD_NUMBER_PLACEHOLDER}
                    onChangeText={onMyKadInputDidChange}
                    value={props?.identityNumber}
                />
            </>
        );
    }

    function buildPassportDetailsView() {
        return (
            <>
                <Typo lineHeight={18} textAlign="left" text={FULLNAME_LBL} />
                <SpaceFiller height={16} />
                <TextInput
                    errorMessage={props.fullNameErrorMessage}
                    isValid={props.fullNameErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={props.fullName}
                    placeholder={SIGNUP_MAE_FULLNAME}
                    onChangeText={onFullNameInputDidChange}
                />
                <SpaceFiller height={16} />
                <Typo lineHeight={18} textAlign="left" text={PASSPORTID_LBL} />
                <SpaceFiller height={16} />
                <TextInput
                    maxLength={20}
                    errorMessage={props.isValidPassportError}
                    isValid={props.isValidPassportError === null}
                    isValidate
                    value={props.passportNumber}
                    autoCapitalize="characters"
                    placeholder={`e.g. ${PASSPORT_NO_DUMMY}`}
                    onChangeText={onPassportNumberInputDidChange}
                />
                <SpaceFiller height={16} />
                <Typo lineHeight={18} textAlign="left" text={PASSPORT_EXPIRY_DATE} />
                <SpaceFiller height={16} />
                <TouchableOpacity onPress={handlePassportDatePickerVisibility}>
                    <View pointerEvents="none">
                        <TextInput
                            maxLength={30}
                            value={props.passportExpiryDate}
                            placeholder={`e.g. ${DUMMY_CALENDER_DATE2}`}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
                <SpaceFiller height={16} />
                <Typo lineHeight={18} textAlign="left" text={DOB_LBL} />
                <SpaceFiller height={16} />
                <TouchableOpacity onPress={handleDOBDatePickerVisibility}>
                    <View pointerEvents="none">
                        <TextInput
                            maxLength={30}
                            value={props.dateOfBirth}
                            placeholder={`e.g. ${DUMMY_CALENDER_DATE2}`}
                            editable={false}
                        />
                    </View>
                </TouchableOpacity>
                <TitleAndDropdownPill
                    title={NATIONALITY_LBL}
                    titleFontWeight="400"
                    dropdownTitle={props?.nationalityValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onNationalityDropdownDidTap}
                />
            </>
        );
    }
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

    radioButtonContainer: {
        flexDirection: "row",
        marginRight: 40,
        marginTop: 16,
    },

    radioButtonTitle: {
        marginLeft: 12,
    },

    radioCheckContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
    },
});

export const identityDetailsPropTypes = (PremierIdentityDetails.propTypes = {
    // Entry props
    ...downTimeServicePropTypes,
    ...masterDataServicePropTypes,
    ...prePostQualServicePropTypes,

    // State
    identityType: PropTypes.number,
    identityNumber: PropTypes.string,
    fullName: PropTypes.string,
    passportExpiryDate: PropTypes.string,
    dateOfBirth: PropTypes.string,
    nationalityIndex: PropTypes.number,
    nationalityValue: PropTypes.object,
    identityNumberErrorMessage: PropTypes.string,
    fullNameErrorMessage: PropTypes.string,
    isIdentityContinueButtonEnabled: PropTypes.bool,
    passportNumber: PropTypes.string,
    isValidPassportError: PropTypes.string,

    // Dispatch
    updateIdentityType: PropTypes.func,
    updateIdentityNumber: PropTypes.func,
    updateFullName: PropTypes.func,
    updatePassportExpiryDate: PropTypes.func,
    updateDateOfBirth: PropTypes.func,
    updateNationality: PropTypes.func,
    checkButtonEnable: PropTypes.func,
    updatePassportNumber: PropTypes.func,
    prePostQual: PropTypes.func,
});

export default prePostQualServiceProps(
    downTimeServiceProps(
        masterDataServiceProps(entryProps(identityDetailsProps(PremierIdentityDetails)))
    )
);
