import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Platform, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";
import { updateDataOnReducerBaseOnApplicationDetails } from "@screens/ASB/Financing/helpers/CustomerDetailsPrefiller";

import {
    ASB_ACCEPT_AS_GUARANTOR_DECLARATION,
    ASB_GUARANTOR_VALIDATION_SUCCESS,
    ASB_GUARANTOR_INCOME_DETAILS,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ColorRadioButton from "@components/Buttons/ColorRadioButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import {
    GUARANTOR_FATCA_DECLARATION_IS_US_PERSON,
    GUARANTOR_FATCA_DECLARATION_SUBMIT_BUTTON_ENABLE,
} from "@redux/actions/ASBFinance/guarantorFatcaDeclarationAction";
import { asbApplicationDetails } from "@redux/services/ASBServices/asbApiApplicationDetails";
import { asbUpdateCEP } from "@redux/services/ASBServices/asbApiUpdateCEP";

import { MEDIUM_GREY, YELLOW, DISABLED } from "@constants/colors";
import { DT_RECOM, DT_ELG, DT_ACTUAL, AMBER, GREEN } from "@constants/data";
import {
    FATCA_DECLARATION,
    AGREE_AND_PROCEED,
    FATCA_POPUP_DESC,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_TITLE,
    ARE_YOU_SURE_YOU_WANT_TO_LEAVE_DESC,
    ARE_YOU_US_PERSON,
    NO,
    YES,
    LEAVE,
    CANCEL,
    APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_DECLARATION,
} from "@constants/strings";

import Assets from "@assets";

function GuarantorFatcaDeclaration({ navigation, route }) {
    // Hooks to access reducer data
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );
    const guarantorFatcaDeclarationReducer = useSelector(
        (state) => state.asbFinanceReducer.guarantorFatcaDeclarationReducer
    );
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );

    const { lastUpdatedDate } = asbGuarantorPrePostQualReducer;
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();
    const { isUSPerson, isFatcaDeclarationButtonEnabled } = guarantorFatcaDeclarationReducer;

    const [showPopup, setShowPopup] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);

    const guarantorStpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const dataStoreValidation = asbApplicationDetailsReducer?.dataStoreValidation;
    const additionalDetails = asbGuarantorPrePostQualReducer?.additionalDetails;
    const stpReferenceNumber = asbGuarantorPrePostQualReducer?.stpReferenceNo;
    const idNumber = asbGuarantorPrePostQualReducer?.idNo;

    const overallValidationResult =
        route?.params?.overallValidationResult ??
        asbGuarantorPrePostQualReducer?.overallValidationResult;
    const dataType =
        route?.params?.dataType ??
        asbGuarantorPrePostQualReducer?.eligibilityCheckOutcomeData?.dataType;

    useEffect(() => {
        dispatch({
            type: GUARANTOR_FATCA_DECLARATION_SUBMIT_BUTTON_ENABLE,
        });
    }, [isUSPerson]);

    function handleBack() {
        const values = [DT_ELG, DT_RECOM, DT_ACTUAL];
        if (overallValidationResult === GREEN && values.includes(dataType)) {
            navigation.navigate(ASB_GUARANTOR_VALIDATION_SUCCESS, {
                dataSendNotification: dataStoreValidation,
            });
        } else if (overallValidationResult === AMBER && values.includes(dataType)) {
            navigation.navigate(ASB_GUARANTOR_INCOME_DETAILS);
        }
    }

    function handleClose() {
        setShowPopupConfirm(true);
    }

    function handleProceedButton() {
        updateApiCEP(() => {
            if (lastUpdatedDate) {
                navigation.navigate(ASB_ACCEPT_AS_GUARANTOR_DECLARATION);
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
                                false,
                                additionalDetails
                            );
                            navigation.navigate(ASB_ACCEPT_AS_GUARANTOR_DECLARATION);
                        },
                        null,
                        null,
                        dataStoreValidation?.mainApplicantName
                    )
                );
            }
        });
    }

    function handleLeaveBtn() {
        setShowPopupConfirm(false);
        updateApiCEP(() => {
            goBackHomeScreen(navigation);
        });
    }

    function updateApiCEP(callback) {
        let isUSAPerson;
        if (isUSPerson) {
            isUSAPerson = "Y";
        } else if (isUSPerson === false) {
            isUSAPerson = "N";
        }

        const body = {
            screenNo: "7",
            stpReferenceNo: guarantorStpReferenceNumber,
            isUSAPerson,
            stpRoleType: "G",
        };

        dispatch(
            asbUpdateCEP(body, (data) => {
                if (data && callback) {
                    callback();
                }
            })
        );
    }

    function onPinInfoPress() {
        setShowPopup(true);
    }
    function onPopupClose() {
        setShowPopup(false);
    }
    function onPopupCloseConfirm() {
        setShowPopupConfirm(false);
    }

    function onRadioBtnUS() {
        dispatch({ type: GUARANTOR_FATCA_DECLARATION_IS_US_PERSON, isUSPerson: true });
    }

    function onRadioBtnNonUS() {
        dispatch({ type: GUARANTOR_FATCA_DECLARATION_IS_US_PERSON, isUSPerson: false });
    }

    return (
        <ScreenContainer
            backgroundType="color"
            backgroundColor={MEDIUM_GREY}
            analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_SUCCESSFUL_DECLARATION}
        >
            <React.Fragment>
                <ScreenLayout
                    paddingBottom={36}
                    paddingTop={16}
                    paddingHorizontal={0}
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={handleClose} />}
                            headerLeftElement={<HeaderBackButton onPress={handleBack} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                >
                    <React.Fragment>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <KeyboardAwareScrollView
                                style={styles.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.mainSection}>
                                    <Typo
                                        fontWeight="600"
                                        lineHeight={28}
                                        text={FATCA_DECLARATION}
                                        textAlign="left"
                                    />
                                    <View style={styles.fieldViewCls}>
                                        <View style={styles.infoLabelContainerCls}>
                                            <Text>
                                                <Typo
                                                    lineHeight={20}
                                                    textAlign="left"
                                                    text={ARE_YOU_US_PERSON}
                                                />
                                                <TouchableOpacity onPress={onPinInfoPress}>
                                                    <Image
                                                        style={styles.infoIcon}
                                                        source={Assets.icInformation}
                                                    />
                                                </TouchableOpacity>
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.groupContainer}>
                                        <View>
                                            <ColorRadioButton
                                                title={YES}
                                                isSelected={isUSPerson}
                                                fontSize={14}
                                                fontWeight="400"
                                                onRadioButtonPressed={onRadioBtnUS}
                                            />
                                        </View>
                                        <View style={styles.noRadioBtn}>
                                            <ColorRadioButton
                                                title={NO}
                                                isSelected={isUSPerson === false}
                                                fontSize={14}
                                                fontWeight="400"
                                                onRadioButtonPressed={onRadioBtnNonUS}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        <FixedActionContainer>
                            <View style={styles.footer}>
                                <ActionButton
                                    activeOpacity={isFatcaDeclarationButtonEnabled ? 1 : 0.5}
                                    backgroundColor={
                                        isFatcaDeclarationButtonEnabled ? YELLOW : DISABLED
                                    }
                                    fullWidth
                                    borderRadius={25}
                                    onPress={handleProceedButton}
                                    componentCenter={
                                        <Typo
                                            text={AGREE_AND_PROCEED}
                                            fontWeight="600"
                                            lineHeight={18}
                                        />
                                    }
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>

                <Popup
                    visible={showPopup}
                    onClose={onPopupClose}
                    title={FATCA_DECLARATION}
                    description={FATCA_POPUP_DESC}
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
            </React.Fragment>
        </ScreenContainer>
    );
}

GuarantorFatcaDeclaration.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    containerView: {
        flex: 1,
        paddingHorizontal: 25,
        width: "100%",
    },
    fieldViewCls: {
        marginBottom: 15,
        marginTop: 25,
    },
    footer: {
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
    },
    groupContainer: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginLeft: 0,
        width: "100%",
    },
    infoIcon: {
        height: 16,
        left: 5,
        top: 3,
        width: 16,
    },
    infoLabelContainerCls: {
        alignItems: "center",
        flexDirection: "row",
    },
    mainSection: {
        marginBottom: 40,
    },
    noRadioBtn: {
        marginLeft: 20,
        width: "60%",
    },
});

export default GuarantorFatcaDeclaration;
