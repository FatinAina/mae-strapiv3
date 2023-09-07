import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";

import {
    ASB_GUARANTOR_PERSONAL_INFORMATION,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS_2,
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
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import TitleAndDropdownPillWithIcon from "@components/TitleAndDropdownPillWithIcon";

import {
    GUARANTOR_EMPLOYER_NAME_ACTION,
    GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION,
    GUARANTOR_EMPLOYMENT_TYPE_ACTION,
    GUARANTOR_OCCUPATION_ACTION,
    GUARANTOR_SECTOR_ACTION,
} from "@redux/actions/ASBFinance/guarantorEmploymentDetailsAction";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { DARK_GREY, DISABLED, YELLOW } from "@constants/colors";
import {
    PLEASE_SELECT,
    EMPLOYER_DUMMY,
    STEPUP_MAE_OCUPATION,
    STEPUP_MAE_SECTOR,
    ASB_EMPLOYMENT_TYPE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    ASB_EMPLOYER_NAME,
    ASB_GUARANTOR_PERSONAL_INFORMATION_HEADING,
    ASB_GUARANTOR_EMPLOYMENT_DETAILS_HEADING,
    CONTINUE,
    LEAVE,
    DONE,
    CANCEL,
    OCUPATION_INFO,
    SECTOR_INFO,
    PLSTP_EMPLOYMENT_TYPE,
    EMPLOYMENT_TYPE_INFO,
    STEP,
    APPLY_ASBFINANCINGGUARANTOR_EMPLOYMENTDETAILS,
} from "@constants/strings";

const GuarantorEmploymentDetails = ({ route, navigation }) => {
    const { currentSteps, totalSteps } = route?.params;
    const isPersonalScreen = route?.params?.isPersonalScreen;

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    // Hooks for access reducer data
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );

    const guarantorEmploymentDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorEmploymentDetailsReducer
    );
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;

    const {
        employerName,
        occupationIndex,
        occupationValue,
        sectorIndex,
        sectorValue,
        employmentTypeIndex,
        employmentTypeValue,
        employerNameErrorMessage,
        isUSeries,
        isEmploymentDetailsContinueButtonEnabled,
        isFromConfirmationScreenForEmploymentDetails,
    } = guarantorEmploymentDetailsReducer;

    const scrollPickerInitialState = {
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    };

    const [showPopup, setShowPopup] = useState(false);

    const [occupationScrollPicker, setOccupationScrollPicker] = useState(scrollPickerInitialState);

    const [sectorScrollPicker, setSectorScrollPicker] = useState(scrollPickerInitialState);

    const [employmentTypeScrollPicker, setEmploymentTypeScrollPicker] =
        useState(scrollPickerInitialState);

    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const [popUpTitle, setPopUpTitle] = useState("");
    const [popUpDesc, setPopUpDesc] = useState("");

    useEffect(() => {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_DETAILS_CONTINUE_BUTTON_ENABLE_ACTION,
        });
    }, [employerName, occupationIndex, sectorIndex, employmentTypeIndex]);

    function onBackTap() {
        if (isFromConfirmationScreenForEmploymentDetails) {
            navigation.goBack();
        } else if (isPersonalScreen) {
            navigation.navigate(ASB_GUARANTOR_PERSONAL_INFORMATION, {
                isEmployeeDataMissing: true,
            });
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

    function onPopupDismiss() {
        setShowPopup(false);
        setPopUpTitle("");
        setPopUpDesc("");
    }

    function handleLeaveBtn() {
        setShowPopupConfirm(false);
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    }

    function onNextTap() {
        setShowPopup(false);
        updateApiCEP(() => {
            navigation.navigate(ASB_GUARANTOR_EMPLOYMENT_DETAILS_2, {
                currentSteps: 2,
                totalSteps: 2,
            });
        });
    }

    function updateApiCEP(callback) {
        const body = {
            screenNo: "11",
            stpReferenceNo: stpReferenceNumber,
            occupationCode: occupationValue?.value,
            occupationDesc: occupationValue?.name,
            occupationSectorCode: isUSeries ? "" : sectorValue?.value,
            occupationSectorDesc: isUSeries ? "" : sectorValue?.name,
            employerName: isUSeries ? "" : employerName,
            employmentTypeCode: isUSeries ? "" : employmentTypeValue?.value,
            employmentTypeDesc: isUSeries ? "" : employmentTypeValue?.name,
        };
        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    function onEmployerInputDidChange(value) {
        const input = value.replace(/  +/g, " ");
        dispatch({ type: GUARANTOR_EMPLOYER_NAME_ACTION, employerName: input });
    }

    function onOccupationDropdownPillDidTap() {
        setOccupationScrollPicker({
            isDisplay: true,
            selectedIndex: occupationIndex,
            filterType: "",
            data: masterDataReducer?.occupation,
        });
    }

    function onSectorDropdownPillDidTap() {
        setSectorScrollPicker({
            isDisplay: true,
            selectedIndex: sectorIndex,
            filterType: "",
            data: masterDataReducer?.sector,
        });
    }

    function onEmploymentTypeDropdownPillDidTap() {
        setEmploymentTypeScrollPicker({
            isDisplay: true,
            selectedIndex: employmentTypeIndex,
            filterType: "",
            data: masterDataReducer?.employmentType,
        });
    }

    function onOccupationScrollPickerDoneButtonDidTap(data, index) {
        dispatch({
            type: GUARANTOR_OCCUPATION_ACTION,
            occupationIndex: index,
            occupationValue: data,
        });
        setOccupationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onSectorScrollPickerDoneButtonDidTap(data, index) {
        dispatch({ type: GUARANTOR_SECTOR_ACTION, sectorIndex: index, sectorValue: data });
        setSectorScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEmploymentTypeScrollPickerDoneButtonDidTap(data, index) {
        dispatch({
            type: GUARANTOR_EMPLOYMENT_TYPE_ACTION,
            employmentTypeIndex: index,
            employmentTypeValue: data,
        });

        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onOccupationScrollPickerCancelButtonDidTap() {
        setOccupationScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onSectorScrollScrollPickerCancelButtonDidTap() {
        setSectorScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onEmploymentTypeScrollPickerCancelButtonDidTap() {
        setEmploymentTypeScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function occupationInfoPress() {
        setPopUpTitle(STEPUP_MAE_OCUPATION);
        setPopUpDesc(OCUPATION_INFO);
        setShowPopup(true);
    }

    function sectorInfoPress() {
        setPopUpTitle(STEPUP_MAE_SECTOR);
        setPopUpDesc(SECTOR_INFO);
        setShowPopup(true);
    }

    function employmentTypeInfoPress() {
        setPopUpTitle(PLSTP_EMPLOYMENT_TYPE);
        setPopUpDesc(EMPLOYMENT_TYPE_INFO);
        setShowPopup(true);
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_EMPLOYMENTDETAILS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                <Typo
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
                                            text={ASB_GUARANTOR_EMPLOYMENT_DETAILS_HEADING}
                                        />
                                        {buildEmploymentDetailsForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        isEmploymentDetailsContinueButtonEnabled ? 1 : 0.5
                                    }
                                    backgroundColor={
                                        isEmploymentDetailsContinueButtonEnabled ? YELLOW : DISABLED
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
                    showMenu={occupationScrollPicker.isDisplay}
                    list={occupationScrollPicker.data}
                    selectedIndex={occupationScrollPicker.selectedIndex}
                    onRightButtonPress={onOccupationScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onOccupationScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={sectorScrollPicker.isDisplay}
                    list={sectorScrollPicker.data}
                    selectedIndex={sectorScrollPicker.selectedIndex}
                    onRightButtonPress={onSectorScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onSectorScrollScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />
                <ScrollPickerView
                    showMenu={employmentTypeScrollPicker.isDisplay}
                    list={employmentTypeScrollPicker.data}
                    selectedIndex={employmentTypeScrollPicker.selectedIndex}
                    onRightButtonPress={onEmploymentTypeScrollPickerDoneButtonDidTap}
                    onLeftButtonPress={onEmploymentTypeScrollPickerCancelButtonDidTap}
                    rightButtonText={DONE}
                    leftButtonText={CANCEL}
                />

                <Popup
                    visible={showPopup}
                    onClose={onPopupDismiss}
                    title={popUpTitle}
                    description={popUpDesc}
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

    function buildEmploymentDetailsForm() {
        return (
            <React.Fragment>
                <TitleAndDropdownPillWithIcon
                    title={STEPUP_MAE_OCUPATION}
                    dropdownTitle={occupationValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onOccupationDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    dropdownOnInfoPress={occupationInfoPress}
                />
                {!isUSeries && displayNonUseriesForm()}
            </React.Fragment>
        );
    }

    function displayNonUseriesForm() {
        return (
            <React.Fragment>
                <TitleAndDropdownPillWithIcon
                    title={STEPUP_MAE_SECTOR}
                    dropdownTitle={sectorValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onSectorDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    dropdownOnInfoPress={sectorInfoPress}
                />

                <SpaceFiller height={24} />

                <Typo lineHeight={18} textAlign="left" text={ASB_EMPLOYER_NAME} />
                <SpaceFiller height={16} />
                <TextInput
                    errorMessage={employerNameErrorMessage}
                    isValid={employerNameErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={employerName}
                    placeholder={`e.g ${EMPLOYER_DUMMY}`}
                    onChangeText={onEmployerInputDidChange}
                />

                <TitleAndDropdownPillWithIcon
                    title={ASB_EMPLOYMENT_TYPE}
                    dropdownTitle={employmentTypeValue?.name ?? PLEASE_SELECT}
                    dropdownOnPress={onEmploymentTypeDropdownPillDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                    dropdownOnInfoPress={employmentTypeInfoPress}
                />
            </React.Fragment>
        );
    }
};

export const occupationInformationPropTypes = (GuarantorEmploymentDetails.propTypes = {
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

export default GuarantorEmploymentDetails;
