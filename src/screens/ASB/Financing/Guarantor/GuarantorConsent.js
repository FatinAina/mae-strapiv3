import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { goBackHomeScreen } from "@screens/ASB/Financing/helpers/ASBHelpers";

import {
    ASB_GUARANTOR_INCOME_DETAILS,
    ASB_GUARANTOR_VALIDATION,
    ASB_GUARANTOR_CONSENT,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { logEvent } from "@services/analytics";

import { getMasterData } from "@redux/services/ASBServices/apiMasterData";
import { asbBecomeAGuarantor } from "@redux/services/ASBServices/asbBecomeAGuarantor";

import { YELLOW } from "@constants/colors";
import {
    CREDIT_TNC,
    CREDIT_CONSET,
    GUARANTOR,
    CONTINUE,
    APPLY_ASBFINANCINGGUARANTOR_TERMSANDCONDITIONS,
    STP_TNC,
    TOTAL_FINANING_AMOUNT,
    FA_VIEW_SCREEN,
    FA_SCREEN_NAME,
    REVIEW_INFO,
    NOMINATED_YOU,
    APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
    BECOME_A_GUARANTOR,
    FA_ACTION_NAME,
    FINANCING_DETAILS,
    SUCC_STATUS,
} from "@constants/strings";

function GuarantorConsent({ navigation, route }) {
    const dispatch = useDispatch();

    const asbApplicationDetailsReducer = useSelector(
        (state) => state.asbServicesReducer.asbApplicationDetailsReducer
    );
    const asbGuarantorPrePostQualReducer = useSelector(
        (state) => state.asbServicesReducer.asbGuarantorPrePostQualReducer
    );

    const { resultAsbApplicationDetails, stpReferenceNo } = asbGuarantorPrePostQualReducer;

    const userData = route?.params?.userData;
    const masterDataReducer = useSelector((state) => state.asbServicesReducer.masterDataReducer);
    const status = masterDataReducer?.status;
    const { dataStoreValidation } = asbApplicationDetailsReducer;

    function onDoneTap() {
        if (status === SUCC_STATUS) {
            dispatch(
                asbBecomeAGuarantor(userData, (response) => {
                    if (response) {
                        navigation.navigate(ASB_GUARANTOR_INCOME_DETAILS, {
                            currentSteps: 1,
                            totalSteps: 4,
                        });
                    }
                })
            );
        } else {
            dispatch(
                getMasterData((result) => {
                    if (result) {
                        dispatch(
                            asbBecomeAGuarantor(userData, (response) => {
                                if (response) {
                                    navigation.navigate(ASB_GUARANTOR_INCOME_DETAILS, {
                                        currentSteps: 1,
                                        totalSteps: 4,
                                    });
                                }
                            })
                        );
                    }
                }, true)
            );
        }
    }

    function onCloseTap() {
        goBackHomeScreen(navigation);
    }

    function onBackTap() {
        const userDataDecline = {
            stpReferenceNo,
            guarantorEmail: resultAsbApplicationDetails?.stpEmail,
            guarantorMobileNumber: resultAsbApplicationDetails?.stpMobileContactNumber,
        };

        const dataSendNotification = {
            headingTitle: TOTAL_FINANING_AMOUNT,
            headingTitleValue: dataStoreValidation?.headingTitleValue,
            bodyList: dataStoreValidation?.bodyList,
            mainApplicantName: dataStoreValidation?.mainApplicantName,
            title: GUARANTOR,
            subTitle: NOMINATED_YOU(dataStoreValidation?.mainApplicantName),
            subTitle2: REVIEW_INFO,
            subTitle3: FINANCING_DETAILS,
            userDataDecline,
            onDoneTap: () => {
                logEvent(FA_VIEW_SCREEN, {
                    [FA_SCREEN_NAME]: APPLY_ASBFINANCINGGUARANTOR_NOMINATED,
                    [FA_ACTION_NAME]: BECOME_A_GUARANTOR,
                });
                navigation.navigate(ASB_GUARANTOR_CONSENT, {
                    userData,
                });
            },
        };
        navigation.navigate(ASB_GUARANTOR_VALIDATION, dataSendNotification);
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName={APPLY_ASBFINANCINGGUARANTOR_TERMSANDCONDITIONS}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo fontSize={16} fontWeight="600" lineHeight={19} text="" />
                            }
                            headerRightElement={<HeaderCloseButton onPress={onCloseTap} />}
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                        />
                    }
                    paddingHorizontal={0}
                    paddingBottom={0}
                    paddingTop={0}
                    useSafeArea
                >
                    <React.Fragment>
                        <ScrollView
                            style={Style.scrollViewCls}
                            showsVerticalScrollIndicator={false}
                        >
                            <Typo
                                lineHeight={23}
                                fontWeight="300"
                                textAlign="left"
                                text={GUARANTOR}
                                style={Style.headerLabelCls}
                            />
                            <SpaceFiller height={4} />
                            <Typo
                                fontSize={16}
                                lineHeight={20}
                                fontWeight="600"
                                textAlign="left"
                                text={CREDIT_CONSET}
                                style={Style.headerDescLabelCls}
                            />

                            <SpaceFiller height={8} />

                            <Typo
                                fontSize={16}
                                lineHeight={20}
                                fontWeight="600"
                                textAlign="left"
                                text={STP_TNC}
                                style={Style.headerDescLabelCls}
                            />

                            <SpaceFiller height={10} />
                            <View style={Style.textContainer}>
                                <Typo
                                    fontSize={12}
                                    lineHeight={20}
                                    textAlign="left"
                                    text={CREDIT_TNC}
                                />
                            </View>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={0.5}
                                    backgroundColor={YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo lineHeight={18} fontWeight="600" text={CONTINUE} />
                                    }
                                    onPress={onDoneTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );
}

const Style = StyleSheet.create({
    bottomBtnContCls: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },

    headerDescLabelCls: {
        marginTop: 10,
    },

    headerLabelCls: {
        marginTop: 15,
    },

    scrollViewCls: {
        paddingHorizontal: 24,
    },

    textContainer: {
        width: "100%",
    },
});

export default GuarantorConsent;

GuarantorConsent.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};
