import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    Platform,
    TouchableOpacity,
    Image,
    Text,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import {
    PREMIER_EMPLOYMENT_DETAILS,
    PREMIER_PERSONAL_DETAILS,
    PREMIER_MODULE_STACK,
    PREMIER_RESIDENTIAL_DETAILS,
    CAPTURE_ID_SCREEN,
    MAE_MODULE_STACK,
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
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import TitleAndDropdownPill from "@components/SSL/TitleAndDropdownPill";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";

import { useModelController } from "@context";

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
    ZEST_API_REQ_BODY_ACTION,
} from "@redux/actions/ZestCASA/debitCardResidentialDetailsAction";
import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import accountDetailsProps from "@redux/connectors/ZestCASA/accountDetailsConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import identityDetailsProps from "@redux/connectors/ZestCASA/identityDetailsConnector";
import personalDetailsProps from "@redux/connectors/ZestCASA/personalDetailsConnector";
import residentialDetailsProps from "@redux/connectors/ZestCASA/residentialDetailsConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import {
    GENDER_FEMALE_CODE,
    GENDER_MALE_CODE,
    PREMIER_CLEAR_ALL,
} from "@constants/casaConfiguration";
import {
    STEP1OF3,
    PERSONAL_POPUP_PARA_2,
    STEP1OF4,
    ARE_YOU_PEP_OR_PEP_RELATIVE,
} from "@constants/casaStrings";
import { DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    NEXT_SMALL_CAPS,
    DUMMY_EMAIL,
    EMAIL_LBL,
    FILL_IN_PERSONAL_DETAILS,
    GENDER_LBL,
    PLEASE_SELECT,
    MALE,
    FEMALE,
    TITLE,
    STEPUP_MAE_RACE,
    PLSTP_MOBILE_NUM,
    MOBILE_NUMBER_DUMMY,
    YES,
    NO,
    MOB_CODE,
    SETTINGS_DEFAULT_NUMBER,
    DONE,
    CANCEL,
    SIGNUP_MAE_FULLNAME,
    FULLNAME_LBL,
    CONFIRM,
    STEP1OF2,
    WHAT_IS_PEP,
    WHAT_IS_RCA,
    PEP_DEFINITION,
} from "@constants/strings";

import { identityDetailsPropTypes } from "./PremierIdentityDetails";
import { getAnalyticScreenName, isNTBUser } from "./helpers/CasaSTPHelpers";

const PremierPersonalDetails = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};
    const { getModel } = useModelController();

    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const personalDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.personalDetailsReducer
    );
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const { userStatus } = prePostQualReducer;

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const {
        titleIndex,
        titleValue,
        gender,
        raceIndex,
        raceValue,
        mobileNumberWithoutExtension,
        emailAddress,
        politicalExposure,
        identityType,
        fullNameErrorMessage,
    } = props;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [titleScrollPicker, setTitleScrollPicker] = useState(scrollPickerInitialState);

    const [raceScrollPicker, setRaceScrollPicker] = useState(scrollPickerInitialState);

    const [isPopupVisible, setIsPopupVisible] = useState(false);

    useEffect(() => {
        init();
        if (identityType === 2) {
            props.updateFullName(identityDetailsReducer.fullName);
        }
    }, []);

    useEffect(() => {
        props.checkButtonEnabled();
    }, [
        titleIndex,
        titleValue,
        gender,
        raceIndex,
        raceValue,
        mobileNumberWithoutExtension,
        emailAddress,
        politicalExposure,
        fullNameErrorMessage,
    ]);

    const init = async () => {
        console.log("[PM1PersonalDetails] >> [init]");

        //Repopulate gender radio button and Title dropdown on basis of props received from Zoloz.
        if (params && !props.isFromConfirmationScreenForPersonalDetails) {
            if (params?.filledUserDetails?.docData?.SEX === "F") {
                const filteredIndex = props.title.findIndex((ele) => ele.value === "MSS");
                const filteredValue = props.title.filter((ele) => ele.value === "MSS");
                props.updateGender(GENDER_FEMALE_CODE, FEMALE);
                props.updateTitle(filteredIndex, filteredValue[0]);
            } else if (params?.filledUserDetails?.docData?.SEX === "M") {
                const filteredIndex = props.title.findIndex((ele) => ele.value === "MRR");
                const filteredValue = props.title.filter((ele) => ele.value === "MRR");
                props.updateGender(GENDER_MALE_CODE, MALE);
                props.updateTitle(filteredIndex, filteredValue[0]);
            }
            if (isNTBUser(userStatus) && identityType === 1) {
                //Setting values for ResidentialDetails
                setTheStateValueUsingZolozState(params?.filledUserDetails?.docData?.STATE);
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_ONE_ACTION,
                    addressLineOne: params?.filledUserDetails?.docData?.ADDRESS1,
                });
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_TWO_ACTION,
                    addressLineTwo: params?.filledUserDetails?.docData?.ADDRESS2,
                });
                dispatch({
                    type: DEBIT_CARD_POSTAL_CODE_ACTION,
                    postalCode: params?.filledUserDetails?.docData?.ZIPCODE,
                });
                dispatch({
                    type: DEBIT_CARD_CITY_ACTION,
                    city: params?.filledUserDetails?.docData?.CITY,
                });
                dispatch({ type: ZEST_API_REQ_BODY_ACTION, reqBody: params?.dataToStoreInRedux });
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_ONE_MASK_ACTION,
                    isAddressLineOneMaskingOn: false,
                });
                dispatch({
                    type: DEBIT_CARD_ADDRESS_LINE_TWO_MASK_ACTION,
                    isAddressLineTwoMaskingOn: false,
                });
                dispatch({
                    type: DEBIT_CARD_TERMS_CONDITION,
                    isTermsConditionAgree: false,
                });
                dispatch({ type: DEBIT_CARD_RESIDENTIAL_CONTINUE_BUTTON_DISABLED_ACTION });
                props.updateAddressLineOne(params?.filledUserDetails?.docData?.ADDRESS1);
                props.updateAddressLineTwo(params?.filledUserDetails?.docData?.ADDRESS2);
                props.updateAddressLineThree("");
                props.updatePostalCode(params?.filledUserDetails?.docData?.ZIPCODE);
                props.updateCity(params?.filledUserDetails?.docData?.CITY);
                props.updateFullName(params?.filledUserDetails?.docData?.NAME);
                //Setting values for PremierAccountDetails
                setAdditionalDetailStateValue(
                    params?.filledUserDetails?.docData?.STATE,
                    params?.filledUserDetails?.docData?.CITY
                );
            }
        }
        if (identityType === 2) {
            const index = props.race.findIndex((race) => race.value === "OTH");
            props.updateRace(index, props.race[index]);
        }
        if (props.isFromConfirmationScreenForPersonalDetails) {
            props.updatePersonalDetailBackupData(
                props.titleIndex,
                props.titleValue,
                props.gender,
                props.gender === "F" ? FEMALE : MALE,
                props?.fullName,
                props.raceIndex,
                props.raceValue,
                props.mobileNumberWithoutExtension,
                props.mobileNumberWithExtension,
                props.emailAddress,
                props.politicalExposure
            );
        }
    };

    async function setTheStateValueUsingZolozState(zolozState) {
        let requiredStateObjIndex;
        let requiredStateObj = [];
        props.stateData.forEach((ele, index) => {
            if (ele.name.toUpperCase().includes(zolozState.toUpperCase())) {
                requiredStateObjIndex = index;
                requiredStateObj.push(ele);
            }
        });
        if (requiredStateObjIndex === undefined) {
            requiredStateObjIndex = 0;
            requiredStateObj = [props?.stateData[0]];
        }
        dispatch({
            type: DEBIT_CARD_STATE_ACTION,
            stateIndex: requiredStateObjIndex,
            stateValue: requiredStateObj[0],
        });
        props.updateState(requiredStateObjIndex, requiredStateObj[0]);
    }

    function enableOrDisableChecker() {
        return !!(props.isPersonalContinueButtonEnabled && props.fullNameErrorMessage === null);
    }

    async function setAdditionalDetailStateValue(zolozState, zolozDistrict) {
        try {
            let stateIndexVal;
            let reqStateObj = [];
            props?.branchStatesList.forEach((ele, index) => {
                if (ele.name.toUpperCase().includes(zolozState.toUpperCase())) {
                    stateIndexVal = index;
                    reqStateObj.push(ele);
                }
            });
            if (stateIndexVal === undefined) {
                stateIndexVal = 0;
                reqStateObj = props?.branchStatesList[0];
            }

            //Updating the State value
            await props.updateBranchState(stateIndexVal, reqStateObj[0]);

            let districtIndexVal;
            let reqDistrictObj = [];
            for (const key in props?.branchDistrictsList) {
                if (
                    key?.toString().toUpperCase() === reqStateObj[0]?.name.toString().toUpperCase()
                ) {
                    props.branchDistrictsList[key].forEach((eleBr, indexBr) => {
                        if (eleBr?.display === zolozDistrict) {
                            districtIndexVal = indexBr;
                            reqDistrictObj.push(eleBr);
                        }
                    });
                }
            }
            if (districtIndexVal === undefined) {
                districtIndexVal = 0;
                reqDistrictObj =
                    props?.branchDistrictsList[reqStateObj[0]?.name.toString().toUpperCase()];
            }
            const finalDistrictObj = {
                name: reqDistrictObj[0]?.display,
                value: reqDistrictObj[0]?.value,
            };

            //Updating the District value
            props.updateBranchDistrict(districtIndexVal, finalDistrictObj);

            const filterObjBranch = props.branchList.filter(
                (ele) => ele[`${finalDistrictObj.name}`]
            );
            const finalBranchData = {
                name: filterObjBranch[0][`${finalDistrictObj.name}`][0].branchName,
                ...filterObjBranch[0][`${finalDistrictObj.name}`][0],
            };

            //Updating the Branch value
            props.updateBranch(0, finalBranchData);
        } catch (err) {
            console.log("Error while creating preferred branch");
            props.updateBranchState(0, props.branchStatesList[0]);
            let branchIndexVal;
            let reqBranchObj;
            for (const key in props.branchDistrictsList) {
                if (
                    key.toString().toUpperCase() ===
                    props.branchStatesList[0].name.toString().toUpperCase()
                ) {
                    reqBranchObj = props.branchDistrictsList[key][0];
                    branchIndexVal = 0;
                }
            }
            const finalObj = {
                name: reqBranchObj?.display,
                value: reqBranchObj?.display,
            };
            props.updateBranchDistrict(branchIndexVal, finalObj);
            const filterObjBranch = props.branchList.filter((ele) => ele[`${finalObj.name}`]);
            const finalBranchData = {
                name: filterObjBranch[0][`${finalObj.name}`][0].branchName,
                ...filterObjBranch[0][`${finalObj.name}`][0],
            };
            //Setting the branch value
            props.updateBranch(0, finalBranchData);
        }
    }

    function onCloseTap() {
        // Clear all data from PM1 reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        if (enableOrDisableChecker()) {
            props.isFromConfirmationScreenForPersonalDetails
                ? navigation.goBack()
                : identityType === 1
                ? navigation.navigate(PREMIER_MODULE_STACK, {
                      screen: PREMIER_EMPLOYMENT_DETAILS,
                  })
                : navigation.navigate(PREMIER_RESIDENTIAL_DETAILS);
            props.updatePersonalDetailBackupData(
                props.titleIndex,
                props.titleValue,
                props.gender,
                props.gender === "F" ? FEMALE : MALE,
                props?.fullName,
                props.raceIndex,
                props.raceValue,
                props.mobileNumberWithoutExtension,
                props.mobileNumberWithExtension,
                props.emailAddress,
                props.politicalExposure
            );
        }
    }

    function onBackTap() {
        if (identityType === 1) {
            if (props.isFromConfirmationScreenForPersonalDetails) {
                resetData();
                navigation.goBack();
            } else {
                //When navigate via ZOLOS Max try screen
                if (params?.isFromMaxTry) {
                    navigation.goBack();
                } else {
                    const { eKycParams } = getModel("ekycCheckResult") || {};
                    //Will navigate to MyKad screen
                    navigation.navigate(MAE_MODULE_STACK, {
                        screen: CAPTURE_ID_SCREEN,
                        params: {
                            filledUserDetails: props.route?.params?.filledUserDetails || {},
                            eKycParams,
                        },
                    });
                }
            }
        } else {
            if (props.isFromConfirmationScreenForPersonalDetails) {
                resetData();
            }
            navigation.goBack();
        }
    }

    function resetData() {
        props.updateTitle(
            personalDetailsReducer.titleIndexBackup,
            personalDetailsReducer.titleValueBackup
        );
        props.updateGender(
            personalDetailsReducer.genderBackup,
            personalDetailsReducer.genderValueBackup
        );
        props.updateFullName(personalDetailsReducer.fullNameBackup);
        props.updateRace(
            personalDetailsReducer.raceIndexBackup,
            personalDetailsReducer.raceValueBackup
        );
        props.updateMobileNumberWithExtension(
            personalDetailsReducer.mobileNumberWithExtensionBackup
        );
        props.updateMobileNumberWithoutExtension(
            personalDetailsReducer.mobileNumberWithoutExtensionBackup
        );
        props.updateEmailAddress(personalDetailsReducer.emailAddressBackup);
        props.updatePoliticalExposure(personalDetailsReducer.politicalExposureBackup);
    }

    const analyticScreenName = getAnalyticScreenName(
        entryReducer?.productName,
        PREMIER_PERSONAL_DETAILS,
        ""
    );

    function onMaleRadioButtonDidTap() {
        props.updateGender(GENDER_MALE_CODE, MALE);
    }

    function onFemaleRadioButtonDidTap() {
        props.updateGender(GENDER_FEMALE_CODE, FEMALE);
    }

    function onMobileInputDidChange(value) {
        props.updateMobileNumberWithoutExtension(value);
    }

    function onMobileInputEndEditing() {
        props.updateMobileNumberWithExtension(
            SETTINGS_DEFAULT_NUMBER + props.mobileNumberWithoutExtension
        );
    }

    function onEmailInputDidChange(value) {
        props.updateEmailAddress(value);
    }

    function onPoliticsYesRadioButtonDidTap() {
        props.updatePoliticalExposure(true);
    }

    function onPoliticsNoRadioButtonDidTap() {
        props.updatePoliticalExposure(false);
    }

    function onTitleDropdownPillDidTap() {
        setTitleScrollPicker({
            isDisplay: true,
            selectedIndex: props.titleIndex,
            filterType: "",
            data: props.title,
        });
    }

    function onRaceDropdownPillDidTap() {
        setRaceScrollPicker({
            isDisplay: true,
            selectedIndex: props.raceIndex,
            filterType: "",
            data: props.race,
        });
    }

    function onTitleScrollPickerDoneButtonDidTap(data, index) {
        props.updateTitle(index, data);
        setTitleScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onRaceScrollPickerDoneButtonDidTap(data, index) {
        props.updateRace(index, data);
        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setTitleScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });

        setRaceScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onFullNameInputDidChange(value) {
        props.updateFullName(value);
        props.checkButtonEnable();
    }

    const stepCount = () => {
        if (identityType !== 1) {
            return STEP1OF4;
        } else {
            if (params?.isFromMaxTry) {
                return STEP1OF2;
            }
            return STEP1OF3;
        }
    };

    function popUpOverlay() {
        return (
            <View style={Style.popUpOverlayWrapper}>
                <View style={Style.popUpOverlayHeader}>
                    <Typo text={WHAT_IS_PEP} textAlign="left" lineHeight={23} fontWeight="600" />
                </View>
                <View>
                    <Typo text={PEP_DEFINITION} textAlign="left" lineHeight={23} />
                </View>
                <SpaceFiller height={16} />
                <View style={Style.popUpOverlayHeader}>
                    <Typo text={WHAT_IS_RCA} textAlign="left" lineHeight={23} fontWeight="600" />
                </View>
                <View>
                    <Typo text={PERSONAL_POPUP_PARA_2} textAlign="left" lineHeight={23} />
                </View>
            </View>
        );
    }

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={
                            props.isFromConfirmationScreenForPersonalDetails &&
                            identityDetailsReducer?.identityType === 1 ? null : (
                                <HeaderBackButton onPress={onBackTap} />
                            )
                        }
                        headerCenterElement={
                            props.isFromConfirmationScreenForPersonalDetails ? null : (
                                <Typo
                                    fontSize={12}
                                    fontWeight="600"
                                    lineHeight={15}
                                    text={stepCount()}
                                    color={DARK_GREY}
                                />
                            )
                        }
                        headerRightElement={
                            <HeaderCloseButton
                                onPress={
                                    props.isFromConfirmationScreenForPersonalDetails &&
                                    identityDetailsReducer?.identityType === 1
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
                                {identityType !== 1 ? (
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text={FILL_IN_PERSONAL_DETAILS}
                                    />
                                ) : (
                                    <Typo
                                        fontSize={16}
                                        fontWeight="600"
                                        lineHeight={24}
                                        textAlign="left"
                                        text="We've captured some info based on your ID, but we still need a few additional details"
                                    />
                                )}
                                {buildPersonalDetailsForm()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={enableOrDisableChecker() ? 1 : 0.5}
                            backgroundColor={enableOrDisableChecker() ? YELLOW : DISABLED}
                            fullWidth
                            componentCenter={
                                <Typo
                                    lineHeight={18}
                                    fontWeight="600"
                                    text={
                                        props.isFromConfirmationScreenForPersonalDetails
                                            ? CONFIRM
                                            : NEXT_SMALL_CAPS
                                    }
                                />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <ScrollPickerView
                showMenu={titleScrollPicker.isDisplay}
                list={titleScrollPicker.data}
                selectedIndex={titleScrollPicker.selectedIndex}
                onRightButtonPress={onTitleScrollPickerDoneButtonDidTap}
                onLeftButtonPress={scrollPickerOnPressCancel}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <Popup
                visible={isPopupVisible}
                onClose={handleInfoPopup}
                ContentComponent={popUpOverlay}
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
        </ScreenContainer>
    );

    function buildPersonalDetailsForm() {
        return (
            <>
                {props.isFromConfirmationScreenForPersonalDetails ||
                identityType !== 1 ||
                !params?.filledUserDetails?.docData?.SEX ? (
                    <View>
                        <TitleAndDropdownPill
                            title={TITLE}
                            titleFontWeight="400"
                            dropdownTitle={props?.titleValue?.name ?? PLEASE_SELECT}
                            dropdownOnPress={onTitleDropdownPillDidTap}
                        />
                        {identityType === 2 ||
                        (params?.isFromMaxTry &&
                            !props.isFromConfirmationScreenForPersonalDetails) ? null : (
                            <View>
                                <SpaceFiller height={24} />
                                <Typo lineHeight={18} textAlign="left" text={FULLNAME_LBL} />
                                <SpaceFiller height={12} />
                                <TextInput
                                    errorMessage={props.fullNameErrorMessage}
                                    isValid={props.fullNameErrorMessage === null}
                                    isValidate
                                    maxLength={40}
                                    value={props?.fullName}
                                    placeholder={SIGNUP_MAE_FULLNAME}
                                    onChangeText={onFullNameInputDidChange}
                                />
                            </View>
                        )}

                        <SpaceFiller height={24} />
                        {buildGenderRadioButtonGroupView()}
                    </View>
                ) : null}

                <SpaceFiller height={8} />
                <TitleAndDropdownPill
                    title={STEPUP_MAE_RACE}
                    titleFontWeight="400"
                    dropdownTitle={props?.raceValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onRaceDropdownPillDidTap}
                    isDisabled={identityType === 2}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={PLSTP_MOBILE_NUM} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.mobileNumberErrorMessage}
                    isValid={props.mobileNumberErrorMessage === null}
                    isValidate
                    maxLength={10}
                    keyboardType="number-pad"
                    value={props.mobileNumberWithoutExtension}
                    placeholder={`e.g ${MOBILE_NUMBER_DUMMY}`}
                    onChangeText={onMobileInputDidChange}
                    onEndEditing={onMobileInputEndEditing}
                    prefix={MOB_CODE}
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={EMAIL_LBL} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={props.emailAddressErrorMessage}
                    isValid={props.emailAddressErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={props.emailAddress}
                    placeholder={`e.g ${DUMMY_EMAIL}`}
                    onChangeText={onEmailInputDidChange}
                />
                <SpaceFiller height={24} />
                {buildPoliticsRadioButtonGroupView()}
            </>
        );
    }

    function buildGenderRadioButtonGroupView() {
        return (
            <>
                <Typo lineHeight={21} textAlign="left" text={GENDER_LBL} />
                <View style={Style.radioContentContainer}>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onMaleRadioButtonDidTap}
                        >
                            {props.gender === GENDER_MALE_CODE ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

                            <View style={Style.radioButtonTitle}>
                                <Typo
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    text={MALE}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onFemaleRadioButtonDidTap}
                        >
                            {props.gender === GENDER_FEMALE_CODE ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

                            <View style={Style.radioButtonTitle}>
                                <Typo
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    text={FEMALE}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    }

    function handleInfoPopup() {
        setIsPopupVisible(!isPopupVisible);
    }

    function buildPoliticsRadioButtonGroupView() {
        return (
            <>
                <View>
                    <Text>
                        <Typo lineHeight={18} textAlign="left" text={ARE_YOU_PEP_OR_PEP_RELATIVE} />
                        <TouchableOpacity onPress={handleInfoPopup} style={Style.infoImageWrapper}>
                            <Image
                                source={require("@assets/Fitness/info_black.png")}
                                style={Style.infoImage}
                            />
                        </TouchableOpacity>
                    </Text>
                </View>
                <View style={Style.radioContentContainer}>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onPoliticsYesRadioButtonDidTap}
                        >
                            {props.politicalExposure === true ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

                            <View style={Style.radioButtonTitle}>
                                <Typo
                                    fontWeight="600"
                                    lineHeight={20}
                                    textAlign="left"
                                    text={YES}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={Style.radioCheckContainer}>
                        <TouchableOpacity
                            style={Style.radioButtonContainer}
                            onPress={onPoliticsNoRadioButtonDidTap}
                        >
                            {props.politicalExposure === false ? (
                                <RadioChecked checkType="color" />
                            ) : (
                                <RadioUnchecked />
                            )}

                            <View style={Style.radioButtonTitle}>
                                <Typo fontWeight="600" lineHeight={20} textAlign="left" text={NO} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    }
};

export const personalDetailsPropTypes = (PremierPersonalDetails.propTypes = {
    // Entry props
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,
    ...identityDetailsPropTypes,

    // State
    titleIndex: PropTypes.number,
    titleValue: PropTypes.object,
    gender: PropTypes.number,
    raceIndex: PropTypes.number,
    raceValue: PropTypes.object,
    mobileNumberWithoutExtension: PropTypes.string,
    mobileNumberWithExtension: PropTypes.string,
    emailAddress: PropTypes.string,
    politicalExposure: PropTypes.bool,
    mobileNumberErrorMessage: PropTypes.string,
    emailAddressErrorMessage: PropTypes.string,
    isPersonalContinueButtonEnabled: PropTypes.bool,
    isFromConfirmationScreenForPersonalDetails: PropTypes.bool,
    titleDropdownItems: PropTypes.array,
    raceDropdownItems: PropTypes.array,
    isMobileNumberMaskingOn: PropTypes.bool,
    fullNameErrorMessage: PropTypes.string,

    // Dispatch
    getTitleDropdownItems: PropTypes.func,
    getRaceDropdownItems: PropTypes.func,
    updateTitle: PropTypes.func,
    updateGender: PropTypes.func,
    updateRace: PropTypes.func,
    updateMobileNumberWithoutExtension: PropTypes.func,
    updateMobileNumberWithExtension: PropTypes.func,
    updateEmailAddress: PropTypes.func,
    updatePoliticalExposure: PropTypes.func,
    updateConfirmationScreenStatusForPersonalDetails: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearPersonalReducer: PropTypes.func,
    updateMobileNumberMaskFlag: PropTypes.func,
    getAnalyticScreenName: PropTypes.func,
    updateAddressLineOne: PropTypes.func,
    updateAddressLineTwo: PropTypes.func,
    updateAddressLineThree: PropTypes.func,
    updatePostalCode: PropTypes.func,
    updateState: PropTypes.func,
    updateCity: PropTypes.func,
});

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

    radioContentContainer: {
        flexDirection: "row",
    },
    infoImage: {
        position: "absolute",
        height: 16,
        width: 16,
        bottom: -2.5,
    },
    infoImageWrapper: {
        position: "relative",
        height: 20,
        width: 30,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    popUpOverlayWrapper: {
        paddingHorizontal: 40,
        paddingVertical: 40,
    },
    popUpOverlayHeader: {
        marginBottom: 8,
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(
        entryProps(
            identityDetailsProps(
                residentialDetailsProps(
                    accountDetailsProps(personalDetailsProps(PremierPersonalDetails))
                )
            )
        )
    )
);
