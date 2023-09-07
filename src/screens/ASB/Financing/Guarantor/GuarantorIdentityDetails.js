import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import { APPLY_LOANS, ASB_GUARANTOR_DECLARATION } from "@navigation/navigationConstant";

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
    EMAIL_ADDRESS_ACTION,
    GUARANTOR_IDENTITY_CONTINUE_BUTTON_ENABLE_ACTION,
    ID_NUMBER_ACTION,
    MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
    MOBILE_NUMBER_WITH_EXTENSION_ACTION,
    RELATIONSHIP_ACTION,
} from "@redux/actions/ASBFinance/guarantorIdentityDetailsAction";
import { asbPrePostQualGuarantor } from "@redux/services/ASBServices/asbApiPrePostQualGuarantor";

import { DISABLED, YELLOW } from "@constants/colors";
import {
    ID_NUMBER,
    ASB_ADD_GUARANTOR,
    ASB_ADD_GUARANTOR_DETAILS,
    ASB_ADD_GUARANTOR_ID_NUMBER_PLACEHOLDER,
    PLEASE_SELECT,
    ASB_ADD_GUARANTOR_RELATIONSHIP_HEADING,
    PLSTP_MOBILE_NUM,
    MOB_CODE,
    EMAIL,
    DUMMY_EMAIL,
    SETTINGS_DEFAULT_NUMBER,
    DONE,
    CANCEL,
    NEXT_ASB,
    APPLY_ASBFINANCING_ADDGUARANTOR_PERSONALDETAILS,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    LEAVE,
} from "@constants/strings";
import { ASB_PRE_QUAL_URL } from "@constants/url";

const GuarantorIdentityDetails = ({ navigation }) => {
    // Hooks to access reducer data
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const guarantorIdentityDetailsReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorIdentityDetailsReducer
    );
    const prePostQualReducer = useSelector((state) => state.asbServicesReducer.prePostQualReducer);
    const resumeReducer = useSelector((state) => state.resumeReducer);
    const stpReferenceNumber =
        prePostQualReducer?.stpreferenceNo ?? resumeReducer?.stpDetails?.stpReferenceNo;
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    const [scrollPicker, setScrollPicker] = useState({
        isDisplay: false,
        selectedIndex: 0,
        filterType: "",
        data: [],
    });

    useEffect(() => {
        dispatch({ type: GUARANTOR_IDENTITY_CONTINUE_BUTTON_ENABLE_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        guarantorIdentityDetailsReducer.identityNumber,
        guarantorIdentityDetailsReducer.fullName,
        guarantorIdentityDetailsReducer.relationshipIndex,
        guarantorIdentityDetailsReducer.mobileNumberWithoutExtension,
        guarantorIdentityDetailsReducer.emailAddress,
    ]);

    function onBackTap() {
        navigation.goBack();
    }

    function handleLeaveBtn() {
        setShowPopupConfirm(false);
        navigation.navigate(APPLY_LOANS);
    }

    function onCloseTap() {
        setShowPopupConfirm(true);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function onNextTap() {
        if (guarantorIdentityDetailsReducer.isGuarantorIdentityContinueButtonEnabled) {
            const body = {
                msgBody: {
                    logonInfo: "N",
                    isGuarantor: "Y",
                    stpReferenceNo: stpReferenceNumber,
                    guarantorIdNo: guarantorIdentityDetailsReducer.identityNumber,
                    guarantorEmail: guarantorIdentityDetailsReducer.emailAddress,
                    relationship: guarantorIdentityDetailsReducer.relationshipValue?.value,
                    guarantorMobileNo: guarantorIdentityDetailsReducer.mobileNumberWithoutExtension,
                },
            };

            dispatch(
                asbPrePostQualGuarantor(
                    ASB_PRE_QUAL_URL,
                    body,
                    (_, data) => {
                        if (data) {
                            navigation.navigate(ASB_GUARANTOR_DECLARATION);
                        }
                    },
                    null,
                    false,
                    false
                )
            );
        }
    }

    function onMyKadInputDidChange(value) {
        dispatch({ type: ID_NUMBER_ACTION, identityNumber: value });
    }

    function onRelationshipDropdownDidTap() {
        setScrollPicker({
            isDisplay: true,
            selectedIndex: guarantorIdentityDetailsReducer.relationshipIndex,
            filterType: "",
            data: masterDataReducer.relationshipList,
        });
    }

    function scrollPickerOnPressDone(data, index) {
        dispatch({ type: RELATIONSHIP_ACTION, relationshipIndex: index, relationshipValue: data });
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function scrollPickerOnPressCancel() {
        setScrollPicker({
            isDisplay: false,
            selectedIndex: 0,
            filterType: "",
            data: [],
        });
    }

    function onMobileInputDidChange(value) {
        dispatch({
            type: MOBILE_NUMBER_WITHOUT_EXTENSION_ACTION,
            mobileNumberWithoutExtension: value,
        });
    }

    function onMobileInputEndEditing() {
        dispatch({
            type: MOBILE_NUMBER_WITH_EXTENSION_ACTION,
            mobileNumberWithExtension:
                SETTINGS_DEFAULT_NUMBER +
                guarantorIdentityDetailsReducer.mobileNumberWithoutExtension,
        });
    }

    function onEmailInputDidChange(value) {
        dispatch({
            type: EMAIL_ADDRESS_ACTION,
            emailAddress: value,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCING_ADDGUARANTOR_PERSONALDETAILS}
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
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            lineHeight={21}
                                            textAlign="left"
                                            text={ASB_ADD_GUARANTOR}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontWeight="600"
                                            lineHeight={24}
                                            textAlign="left"
                                            text={ASB_ADD_GUARANTOR_DETAILS}
                                        />
                                        <SpaceFiller height={24} />
                                        {detailsView()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        guarantorIdentityDetailsReducer.isGuarantorIdentityContinueButtonEnabled
                                            ? 1
                                            : 0.5
                                    }
                                    backgroundColor={
                                        guarantorIdentityDetailsReducer.isGuarantorIdentityContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={NEXT_ASB} />
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
                    onRightButtonPress={scrollPickerOnPressDone}
                    onLeftButtonPress={scrollPickerOnPressCancel}
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

    function detailsView() {
        return (
            <React.Fragment>
                <Typo lineHeight={18} textAlign="left" text={ID_NUMBER} />
                <SpaceFiller height={12} />
                <TextInputWithReturnType
                    errorMessage={guarantorIdentityDetailsReducer.identityNumberErrorMessage}
                    isValid={guarantorIdentityDetailsReducer.identityNumberErrorMessage === null}
                    isValidate
                    maxLength={12}
                    keyboardType="number-pad"
                    placeholder={ASB_ADD_GUARANTOR_ID_NUMBER_PLACEHOLDER}
                    onChangeText={onMyKadInputDidChange}
                    value={guarantorIdentityDetailsReducer.identityNumber}
                />

                <TitleAndDropdownPill
                    title={ASB_ADD_GUARANTOR_RELATIONSHIP_HEADING}
                    dropdownTitle={
                        guarantorIdentityDetailsReducer?.relationshipValue?.name ?? PLEASE_SELECT
                    }
                    dropdownOnPress={onRelationshipDropdownDidTap}
                    removeTopMargin={true}
                    titleFontWeight="400"
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={PLSTP_MOBILE_NUM} />
                <SpaceFiller height={12} />
                <TextInputWithReturnType
                    errorMessage={guarantorIdentityDetailsReducer.mobileNumberErrorMessage}
                    isValid={guarantorIdentityDetailsReducer.mobileNumberErrorMessage === null}
                    isValidate
                    maxLength={10}
                    value={guarantorIdentityDetailsReducer.mobileNumberWithoutExtension}
                    onChangeText={onMobileInputDidChange}
                    onEndEditing={onMobileInputEndEditing}
                    prefix={MOB_CODE}
                    keyboardType="number-pad"
                />
                <SpaceFiller height={24} />
                <Typo lineHeight={18} textAlign="left" text={EMAIL} />
                <SpaceFiller height={12} />
                <TextInput
                    errorMessage={guarantorIdentityDetailsReducer.emailAddressErrorMessage}
                    isValid={guarantorIdentityDetailsReducer.emailAddressErrorMessage === null}
                    isValidate
                    maxLength={40}
                    value={guarantorIdentityDetailsReducer.emailAddress}
                    placeholder={`e.g ${DUMMY_EMAIL}`}
                    onChangeText={onEmailInputDidChange}
                />
            </React.Fragment>
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
});

export const guarantorIdentityDetails = (GuarantorIdentityDetails.propTypes = {
    navigation: PropTypes.object,
});

export default GuarantorIdentityDetails;
