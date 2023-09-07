import PropTypes from "prop-types";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";

import ScreenLayout from "@layouts/ScreenLayout";

import Spring from "@components/Animations/Spring";
import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import HeaderLayout from "@components/Layouts/HeaderLayout";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showSuccessToast } from "@components/Toast";

import { logEvent } from "@services/analytics";

import { asbDeclineBecomeAGuarantor } from "@redux/services/ASBServices/asbDeclineBecomeAGuarantor";

import { MEDIUM_GREY, ROYAL_BLUE, SEPARATOR, WHITE, YELLOW, GREY } from "@constants/colors";
import {
    BECOME_GUARANTOR,
    DECLINE,
    CANCEL,
    DECLINE_BECOME_GUARANTOR_TITLE,
    DECLINE_BECOME_GUARANTOR_DESC,
    REJECT,
    DECLINE_BECOME_GUARANTOR_TOAST,
    APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
} from "@constants/strings";

import { getShadow } from "@utils/dataModel/utilityPartial.2";

const GaurantorValidation = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );
    const { guarantorDataStore } = asbApplicationDetailsReducer;
    const title = guarantorDataStore?.title ?? route?.params?.title;
    const subTitle = guarantorDataStore?.subTitle ?? route?.params?.subTitle;
    const subTitle2 = guarantorDataStore?.subTitle2 ?? route?.params?.subTitle2;
    const subTitle3 = guarantorDataStore?.subTitle3 ?? route?.params?.subTitle3;
    const onDoneTap = guarantorDataStore?.onDoneTap ?? route?.params?.onDoneTap;
    const headingTitle = guarantorDataStore?.headingTitle ?? route?.params?.headingTitle;
    const headingTitleValue =
        guarantorDataStore?.headingTitleValue ?? route?.params?.headingTitleValue;
    const bodyList = guarantorDataStore?.bodyList ?? route?.params?.bodyList;
    const mainApplicantName =
        guarantorDataStore?.mainApplicantName ?? route?.params?.mainApplicantName;
    const onCancelTap = guarantorDataStore?.onCancelTap ?? route?.params?.onCancelTap;
    const userDataDecline = guarantorDataStore?.userDataDecline ?? route?.params?.userDataDecline;

    const [cancelPopup, setCancelPopup] = useState(false);

    function onBackTap() {
        goBackHomeScreen(navigation);
    }

    function onPopupCloseConfirm() {
        setCancelPopup(false);
    }

    function handleLeaveBtn() {
        setCancelPopup(false);
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
            [FA_ACTION_NAME]: DECLINE,
        });
        const declineBecomeAGuarantorData = {
            stpReferenceNo: userDataDecline?.stpReferenceNo,
        };
        dispatch(
            asbDeclineBecomeAGuarantor(declineBecomeAGuarantorData, () => {
                showSuccessToast({
                    message: DECLINE_BECOME_GUARANTOR_TOAST,
                });
                goBackHomeScreen(navigation);
            })
        );
    }

    function onDeclineBecomeGuarantor() {
        setCancelPopup(true);
    }

    function contentElement() {
        return (
            <React.Fragment>
                <View style={styles.dialogInnerContainer}>
                    <View style={styles.dialogSectionContainer}>
                        <Typo
                            text={DECLINE_BECOME_GUARANTOR_TITLE}
                            textAlign="left"
                            lineHeight={18}
                            fontWeight="600"
                        />
                    </View>
                </View>
                <View style={styles.dialogDescriptionContainer}>
                    <Typo
                        text={DECLINE_BECOME_GUARANTOR_DESC(mainApplicantName)}
                        textAlign="left"
                        lineHeight={20}
                        fontWeight="normal"
                    />
                </View>

                <View style={styles.dialogActionContainer}>
                    <View style={styles.primarySecondaryActionContainer}>
                        <View style={styles.primaryFooterContainer}>
                            <ActionButton
                                fullWidth
                                borderRadius={20}
                                height={40}
                                onPress={onPopupCloseConfirm}
                                backgroundColor={WHITE}
                                style={styles.primaryFooterButton}
                                componentCenter={
                                    <Typo
                                        text={CANCEL}
                                        fontWeight="600"
                                        lineHeight={18}
                                        numberOfLines={1}
                                        textBreakStrategys="simple"
                                    />
                                }
                            />
                        </View>
                        <View style={styles.secondaryFooterContainer}>
                            <ActionButton
                                fullWidth
                                borderRadius={20}
                                height={40}
                                onPress={handleLeaveBtn}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo
                                        text={REJECT}
                                        fontWeight="600"
                                        lineHeight={18}
                                        numberOfLines={1}
                                        textBreakStrategys="simple"
                                    />
                                }
                            />
                        </View>
                    </View>
                </View>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_NOMINATED}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
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
                                style={styles.containerView}
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={styles.formContainer}>
                                    <View>
                                        {title && (
                                            <Typo
                                                fontWeight="300"
                                                lineHeight={23}
                                                textAlign="left"
                                                text={title}
                                            />
                                        )}
                                        {subTitle && <SpaceFiller height={4} />}
                                        {subTitle && (
                                            <Typo
                                                fontSize={16}
                                                fontWeight="600"
                                                lineHeight={24}
                                                textAlign="left"
                                                text={subTitle}
                                            />
                                        )}
                                        {subTitle2 && <SpaceFiller height={12} />}
                                        {subTitle2 && (
                                            <Typo
                                                fontWeight="300"
                                                lineHeight={21}
                                                textAlign="left"
                                                text={subTitle2}
                                            />
                                        )}

                                        {subTitle3 && <SpaceFiller height={32} />}

                                        {subTitle3 && (
                                            <Typo
                                                fontWeight="600"
                                                lineHeight={21}
                                                textAlign="left"
                                                text={subTitle3}
                                            />
                                        )}

                                        <SpaceFiller height={12} />

                                        {buildGuarantorValidationForm()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>
                        {buildActionButton()}
                        <Popup
                            visible={cancelPopup}
                            onClose={onPopupCloseConfirm}
                            ContentComponent={contentElement}
                        />
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function buildGuarantorValidationForm() {
        return (
            <View>
                <View style={styles.container}>
                    <View style={styles.mainContent}>
                        <View style={styles.shadow}>
                            <Spring style={styles.card} activeOpacity={0.9}>
                                <View style={styles.cardBody}>
                                    <SpaceFiller height={24} />
                                    <View style={styles.formContainerCard}>
                                        <View>
                                            <Typo lineHeight={18} text={headingTitle} />
                                            <SpaceFiller height={4} />
                                            <Typo
                                                fontSize={24}
                                                lineHeight={29}
                                                fontWeight="700"
                                                text={headingTitleValue}
                                            />
                                        </View>
                                    </View>
                                    <SpaceFiller height={8} />
                                    <View style={styles.recRow} />
                                    <SpaceFiller height={14} />
                                    {bodyList?.map((data, index) => {
                                        return (
                                            <View key={index}>
                                                {data?.isVisible &&
                                                    (!data?.isMutiTierVisible ||
                                                        !data?.divider) && (
                                                        <View style={styles.cardBodyRow}>
                                                            <View style={styles.cardBodyColL}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    textAlign="left"
                                                                    text={data.heading}
                                                                />
                                                            </View>
                                                            <View style={styles.cardBodyColR}>
                                                                <Typo
                                                                    lineHeight={18}
                                                                    fontWeight="600"
                                                                    textAlign="right"
                                                                    text={data.headingValue}
                                                                />
                                                            </View>
                                                        </View>
                                                    )}
                                                {data?.isMutiTierVisible && (
                                                    <View style={styles.cardBodyRow}>
                                                        <View style={styles.cardBodyColL}>
                                                            <Typo
                                                                lineHeight={18}
                                                                fontWeight="600"
                                                                textAlign="left"
                                                                text={data.heading}
                                                            />
                                                        </View>
                                                    </View>
                                                )}

                                                {data?.divider && (
                                                    <View>
                                                        <View style={styles.recRow} />
                                                        <SpaceFiller height={8} />
                                                    </View>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </Spring>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    function buildActionButton() {
        return (
            <FixedActionContainer>
                <View style={styles.bottomBtnContCls}>
                    <View style={styles.footer}>
                        <ActionButton
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={BECOME_GUARANTOR} />
                            }
                            onPress={onDoneTap}
                        />
                        <SpaceFiller height={12} />
                        <ActionButton
                            fullWidth
                            borderRadius={25}
                            backgroundColor={MEDIUM_GREY}
                            componentCenter={
                                <Typo
                                    text={DECLINE}
                                    fontWeight="600"
                                    lineHeight={18}
                                    color={ROYAL_BLUE}
                                />
                            }
                            onPress={onCancelTap ?? onDeclineBecomeGuarantor}
                        />
                    </View>
                </View>
            </FixedActionContainer>
        );
    }
};

export const successPropTypes = (GaurantorValidation.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
});

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    card: {
        backgroundColor: WHITE,
        borderRadius: 10,
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        paddingBottom: 25,
        paddingVertical: 0,
        width: "100%",
    },

    cardBody: {
        paddingHorizontal: 16,
    },
    cardBodyColL: {
        width: "65%",
    },
    cardBodyColR: {
        width: "35%",
    },
    cardBodyRow: {
        flexDirection: "row",
        paddingVertical: 10,
    },
    container: {
        flex: 1,
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
    formContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    formContainerCard: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
    },
    mainContent: {
        backgroundColor: MEDIUM_GREY,
    },
    recRow: {
        borderBottomColor: SEPARATOR,
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    shadow: {
        ...getShadow({}),
    },

    dialogActionContainer: {
        paddingHorizontal: 30,
    },

    dialogDescriptionContainer: {
        paddingBottom: 40,
        paddingHorizontal: 30,
    },
    dialogInnerContainer: {
        flexDirection: "column",
        paddingBottom: 16,
        paddingHorizontal: 30,
        paddingTop: 40,
    },

    primaryFooterButton: {
        borderColor: GREY,
        borderWidth: 1,
    },
    primaryFooterContainer: {
        flexDirection: "row",
        paddingRight: 4,
        width: "50%",
    },
    primarySecondaryActionContainer: {
        flexDirection: "row",
        paddingBottom: 40,
        width: "100%",
    },
    secondaryFooterContainer: {
        flexDirection: "row",
        paddingLeft: 4,
        width: "50%",
    },
});

export default GaurantorValidation;
