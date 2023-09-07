import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";

import { getAnalyticScreenName, isNTBUser } from "@screens/CasaSTP/helpers/CasaSTPHelpers";

import {
    SETTINGS_MODULE,
    PREMIER_CONFIRMATION,
    PREMIER_DECLARATION,
    ZEST_CASA_STACK,
    ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
    PDF_SETTING,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import RadioButton from "@components/Buttons/RadioButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Typo from "@components/Text";

import { useModelController } from "@context";

import { PREPOSTQUAL_CLEAR } from "@redux/actions/services/prePostQualAction";
import declarationProps from "@redux/connectors/ZestCASA/declarationConnector";
import entryProps from "@redux/connectors/ZestCASA/entryConnector";
import downTimeServiceProps, {
    downTimeServicePropTypes,
} from "@redux/connectors/services/downTimeConnector";
import masterDataServiceProps, {
    masterDataServicePropTypes,
} from "@redux/connectors/services/masterDataConnector";

import { PREMIER_CLEAR_ALL } from "@constants/casaConfiguration";
import {
    PREMIER_PLSTP_AGREE_NOTE,
    DECLARATION_SUB_HEADER,
    TAX_RESIDENT_MY,
    DECLARATION_PIRACY_PARA1,
    DECLARATION_PIRACY_PARA2,
    DECLARATION_BROCHURE_SUB_HEADING,
    DECLARATION_BROCHURE_SUB_HEADING2,
    DECLARATION_IMPOSE_PARA,
    DECLARATION_SUB_HEADER_TEXT,
} from "@constants/casaStrings";
import {
    PMA_PDS_URL,
    PREMIER_PDPA_URL,
    PREMIER_PIDM_URL,
    PM1_TNC_URL,
    PMA_SPECIFIC_TNC_URL,
    KAWANKU_SAVINGS_TNC_URL,
    KAWANKU_SAVINGS_PIDM_URL,
    KAWANKU_SAVINGS_PDPA_URL,
    KAWANKU_SAVINGSI_SPECIFIC_TNC_URL,
    KAWANKU_SAVINGSI_PDS_URL,
    PRIVACY_STATEMENT_CASA,
} from "@constants/casaUrl";
import { YELLOW, DISABLED, TRANSPARENT, BLACK } from "@constants/colors";
import {
    PLSTP_AGREE,
    DECLARATION,
    PLSTP_TNC_NOTE,
    PLSTP_PDS_BOLD,
    PRIVACY_NOTICE,
    ZEST_CASA_PIDM_LINK,
    STP_TNC,
    PIDM,
    PN_TEXT,
    DECLARATION_NON_US_PERSON,
    TNC_NOT_ALLOW_PROCESS_PI,
    TNC_ALLOW_PROCESS_PI,
} from "@constants/strings";

const PremierDeclaration = (props) => {
    const { navigation, isAgreeToBeContacted } = props;
    const { getModel } = useModelController();
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);
    const { isPM1, isPMA, isKawanku, isKawankuSavingsI, productName } = entryReducer;
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const masterDataReducer = useSelector((state) => state.masterDataReducer);

    const { userStatus } = prePostQualReducer;
    const [isMasterData, setIsMasterData] = useState(false);

    const { exceedLimitScreen } = getModel("isFromMaxTry") || false;
    const [isFromMaxTry] = useState(exceedLimitScreen);

    // Hooks to dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        props.checkButtonEnabled();
    }, [isAgreeToBeContacted]);

    useEffect(() => {
        const pageDesc = masterDataReducer.casaPageDescriptionValue;
        if (pageDesc !== null) {
            setIsMasterData(pageDesc);
        }
    }, [masterDataReducer]);

    function onBackTap() {
        console.log("[PremierDeclaration] >> [onBackTap]");
        if (isNTBUser(userStatus) && identityDetailsReducer.identityType === 1 && !isFromMaxTry) {
            navigation.navigate(ZEST_CASA_STACK, {
                screen: ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
            });
        } else {
            navigation.goBack();
        }
    }

    function onCloseTap() {
        // Clear all data from Premier reducers
        dispatch({ type: PREMIER_CLEAR_ALL });
        props.clearDownTimeReducer();
        props.clearMasterDataReducer();
        dispatch({ type: PREPOSTQUAL_CLEAR });
        navigation.popToTop();
        navigation.goBack();
    }

    function onNextTap() {
        if (props.isDeclarationContinueButtonEnabled) navigation.navigate(PREMIER_CONFIRMATION);
    }

    function paramsStructure(title, url, color) {
        return {
            title,
            source: url,
            headerColor: color,
        };
    }

    function onTNCLinkDidTap() {
        const title = STP_TNC;
        const url = isPM1
            ? PM1_TNC_URL
            : isKawanku
            ? KAWANKU_SAVINGS_TNC_URL
            : isKawankuSavingsI
            ? KAWANKU_SAVINGSI_SPECIFIC_TNC_URL
            : PMA_SPECIFIC_TNC_URL;

        navigation.navigate(SETTINGS_MODULE, {
            screen: PDF_SETTING,
            params: paramsStructure(title, url, TRANSPARENT),
        });
    }

    function onPDSLinkDidTap() {
        const title = PLSTP_PDS_BOLD;
        const url = isKawankuSavingsI ? KAWANKU_SAVINGSI_PDS_URL : PMA_PDS_URL;

        navigation.navigate(SETTINGS_MODULE, {
            screen: PDF_SETTING,
            params: paramsStructure(title, url, TRANSPARENT),
        });
    }

    function onFATCACRSLinkDidTap() {
        const title = PN_TEXT;

        navigation.navigate(SETTINGS_MODULE, {
            screen: PDF_SETTING,
            params: paramsStructure(title, PRIVACY_STATEMENT_CASA, TRANSPARENT),
        });
    }

    function onPrivacyLinkDidTap() {
        const title = PRIVACY_NOTICE;
        const url = isKawanku ? KAWANKU_SAVINGS_PDPA_URL : PREMIER_PDPA_URL;

        navigation.navigate(SETTINGS_MODULE, {
            screen: PDF_SETTING,
            params: paramsStructure(title, url, TRANSPARENT),
        });
    }

    function onPIDMLinkDidTap() {
        const title = PIDM;
        const url = isKawanku ? KAWANKU_SAVINGS_PIDM_URL : PREMIER_PIDM_URL;

        navigation.navigate(SETTINGS_MODULE, {
            screen: PDF_SETTING,
            params: paramsStructure(title, url, TRANSPARENT),
        });
    }

    function onAgreeRadioButtonDidTap() {
        props.updateAgreeToBeContacted("Y");
    }

    function onDisagreeRadioButtonDidTap() {
        props.updateAgreeToBeContacted("N");
    }

    const analyticScreenName = getAnalyticScreenName(productName, PREMIER_DECLARATION, "");

    return (
        <ScreenContainer backgroundType="color" analyticScreenName={analyticScreenName}>
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
                <ScrollView showsVerticalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        behavior={Platform.OS === "ios" ? "padding" : ""}
                        enabled
                    >
                        <View style={Style.formContainer}>
                            <View style={Style.contentContainer}>
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={24}
                                    textAlign="left"
                                    text={DECLARATION}
                                />
                                <SpaceFiller height={24} />
                                {buildTNCParagraph()}
                                <SpaceFiller height={24} />
                                {buildFATCAParagraph()}
                                <SpaceFiller height={24} />
                                {buildDCRSRParagraph()}
                                <SpaceFiller height={24} />
                                {buildRadioButtonGroupView()}
                                <SpaceFiller height={24} />
                                {buildPIDMParagraph()}
                                <SpaceFiller height={24} />
                                {isPM1 ? buildPrivacyParagraph() : null}
                                {buildProductAndServicesParagraph()}
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                <FixedActionContainer>
                    <View style={Style.bottomBtnContCls}>
                        <ActionButton
                            activeOpacity={props.isDeclarationContinueButtonEnabled ? 1 : 0.5}
                            backgroundColor={
                                props.isDeclarationContinueButtonEnabled ? YELLOW : DISABLED
                            }
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={PLSTP_AGREE} />
                            }
                            onPress={onNextTap}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
        </ScreenContainer>
    );

    function buildTNCParagraph() {
        return (
            <Typo lineHeight={24} textAlign="left">
                {PLSTP_TNC_NOTE}
                <Typo
                    lineHeight={21}
                    fontWeight="700"
                    textAlign="left"
                    style={Style.underline}
                    text={STP_TNC}
                    onPress={onTNCLinkDidTap}
                />
                {(isPMA || isKawankuSavingsI) && (
                    <>
                        <Typo lineHeight={21} fontWeight="700" textAlign="left" text=" and " />
                        <Typo
                            lineHeight={21}
                            fontWeight="700"
                            textAlign="left"
                            style={Style.underline}
                            text={PLSTP_PDS_BOLD}
                            onPress={onPDSLinkDidTap}
                        />
                    </>
                )}
                <Typo lineHeight={21} textAlign="left" text="." />
            </Typo>
        );
    }

    function buildFATCAParagraph() {
        return (
            <View>
                <Typo lineHeight={21} textAlign="left">
                    <Typo lineHeight={21} textAlign="left" text={DECLARATION_SUB_HEADER} />
                </Typo>
                {/* <SpaceFiller height={10} /> */}
                <View style={Style.fieldContainer}>
                    <View style={Style.containerStyle}>
                        <View style={Style.whiteBulletCls} />
                        <Typo
                            lineHeight={21}
                            fontWeight="600"
                            textAlign="left"
                            text={DECLARATION_NON_US_PERSON}
                            style={Style.marginLeftForBullet}
                        />
                    </View>
                    <View style={[Style.containerStyle, Style.marginTopForBullet]}>
                        <View style={Style.whiteBulletCls} />
                        <Typo
                            lineHeight={21}
                            fontWeight="600"
                            textAlign="left"
                            text={TAX_RESIDENT_MY}
                            style={Style.marginLeftForBullet}
                        />
                    </View>
                    <View style={[Style.containerStyle, Style.marginTopForBullet]}>
                        <View style={Style.whiteBulletCls} />
                        <Typo
                            lineHeight={21}
                            fontWeight="600"
                            textAlign="left"
                            text={
                                masterDataReducer.casaPageDescriptionValue.filter(
                                    (ele) => ele.value === DECLARATION_SUB_HEADER_TEXT
                                )[0].display
                            }
                            style={Style.marginLeftForBullet}
                        />
                    </View>
                </View>
            </View>
        );
    }

    function buildDCRSRParagraph() {
        return (
            <Typo fontSize={15} lineHeight={21} textAlign="left">
                <Typo lineHeight={21} textAlign="left" text={DECLARATION_PIRACY_PARA1} />
                <Typo
                    lineHeight={21}
                    fontWeight="700"
                    textAlign="left"
                    style={Style.underline}
                    text={PN_TEXT}
                    onPress={onFATCACRSLinkDidTap}
                />
                <Typo lineHeight={21} textAlign="left" text={`.${DECLARATION_PIRACY_PARA2}`} />
            </Typo>
        );
    }

    function buildPrivacyParagraph() {
        return (
            <View>
                <Typo
                    lineHeight={21}
                    textAlign="left"
                    text={DECLARATION_IMPOSE_PARA(
                        isMasterData[2]?.display,
                        isMasterData[3]?.display
                    )}
                    onPress={onPrivacyLinkDidTap}
                />
                <SpaceFiller height={24} />
            </View>
        );
    }

    function buildRadioButtonGroupView() {
        return (
            <>
                <RadioButton
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    title={TNC_ALLOW_PROCESS_PI}
                    isSelected={props.isAgreeToBeContacted === "Y"}
                    onRadioButtonPressed={onAgreeRadioButtonDidTap}
                />
                <SpaceFiller height={25} />
                <RadioButton
                    fontSize={14}
                    fontWeight="400"
                    lineHeight={21}
                    textAlign="left"
                    title={TNC_NOT_ALLOW_PROCESS_PI}
                    isSelected={props.isAgreeToBeContacted === "N"}
                    onRadioButtonPressed={onDisagreeRadioButtonDidTap}
                />
            </>
        );
    }

    function buildPIDMParagraph() {
        let PIDM_PHRASE;

        if (isKawanku || isPMA || isKawankuSavingsI) {
            PIDM_PHRASE = DECLARATION_BROCHURE_SUB_HEADING;
        } else {
            PIDM_PHRASE = isMasterData
                ? DECLARATION_BROCHURE_SUB_HEADING2(isMasterData[4]?.display)
                : "";
        }
        return (
            <Typo lineHeight={21} textAlign="left">
                {PIDM_PHRASE}
                <Typo
                    lineHeight={21}
                    fontWeight="700"
                    textAlign="left"
                    style={Style.underline}
                    text={ZEST_CASA_PIDM_LINK}
                    onPress={onPIDMLinkDidTap}
                />
            </Typo>
        );
    }

    function buildProductAndServicesParagraph() {
        return <Typo lineHeight={21} textAlign="left" text={PREMIER_PLSTP_AGREE_NOTE} />;
    }
};

export const declarationPropTypes = (PremierDeclaration.propTypes = {
    // External props
    ...masterDataServicePropTypes,
    ...downTimeServicePropTypes,

    // State
    isAgreeToBeContacted: PropTypes.string,
    privacyPolicy: PropTypes.string,
    fatcaStateDeclaration: PropTypes.string,
    termsAndConditions: PropTypes.string,
    isDeclarationContinueButtonEnabled: PropTypes.bool,

    // Dispatch
    updateAgreeToBeContacted: PropTypes.func,
    checkButtonEnabled: PropTypes.func,
    clearDeclarationReducer: PropTypes.func,
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

    underline: {
        textDecorationLine: "underline",
    },
    fieldContainer: {
        marginTop: 16,
    },
    containerStyle: {
        flexDirection: "row",
        justifyContent: "flex-start",
        width: "100%",
        marginLeft: 4,
    },
    whiteBulletCls: {
        marginTop: 6.5,
        width: 6,
        height: 6,
        borderRadius: 6,
        borderStyle: "solid",
        borderWidth: 1,
        backgroundColor: BLACK,
    },
    marginLeftForBullet: {
        marginLeft: 10,
    },
    marginTopForBullet: {
        marginLeft: 4,
    },
});

export default masterDataServiceProps(
    downTimeServiceProps(entryProps(declarationProps(PremierDeclaration)))
);
