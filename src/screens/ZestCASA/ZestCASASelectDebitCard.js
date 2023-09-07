import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";

import {
    ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS,
    PREMIER_MODULE_STACK,
    PREMIER_EMPLOYMENT_DETAILS,
    MORE,
} from "@navigation/navigationConstant";
import * as navigationConstant from "@navigation/navigationConstant";

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

import {
    SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION,
    SELECT_DEBIT_CARD_ACTION,
} from "@redux/actions/ZestCASA/selectDebitCardAction";
import { PREPOSTQUAL_UPDATE_USER_STATUS } from "@redux/actions/services/prePostQualAction";
import { fetchAccountList } from "@redux/services/apiGetAccountList";
import { getDebitCards } from "@redux/services/apiGetDebitCards";

import {
    CASA_STP_NTB_USER,
    CASA_STP_FULL_ETB_USER,
    CASA_STP_DEBIT_CARD_NTB_USER,
} from "@constants/casaConfiguration";
import { DISABLED, YELLOW, DARK_GREY } from "@constants/colors";
import {
    DEBIT_CARD_APPLICATION,
    SELECT_DEBIT_CARD,
    FA_FORM_PROCEED,
    FA_SCREEN_NAME,
    FA_ACTION_NAME,
    NEXT_SMALL_CAPS,
    STEP3OF3,
    DEBIT_CARD_PAYMENT_NOTE_START,
    DEBIT_CARD_PAYMENT_NOTE_END,
} from "@constants/strings";
import {
    ZEST_CASA_CLEAR_ALL,
    ZEST_DEBIT_CARD_NTB_USER,
    ZEST_DEBIT_CARD_USER,
    ZEST_FULL_ETB_USER,
    ZEST_NTB_USER,
} from "@constants/zestCasaConfiguration";

import { DebitCardSelector } from "./components/DebitCardSelector";
import { debitCardResidentailDetailsPrefiller } from "./helpers/CustomerDetailsPrefiller";
import { getCardsImage } from "./helpers/ZestHelpers";

const ZestCASASelectDebitCard = (props) => {
    const { navigation, route } = props;
    const params = route?.params ?? {};

    // Hooks for access reducer data
    const getDebitCardsReducer = useSelector((state) => state.getDebitCardsReducer);
    const prePostQualReducer = useSelector((state) => state.prePostQualReducer);
    const residentialDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.residentialDetailsReducer
    );
    const draftUserAccountInquiryReducer = useSelector(
        (state) => state.draftUserAccountInquiryReducer
    );
    const masterDataReducer = useSelector((state) => state.masterDataReducer);
    const identityDetailsReducer = useSelector(
        (state) => state.zestCasaReducer.identityDetailsReducer
    );
    const entryReducer = useSelector((state) => state.zestCasaReducer.entryReducer);

    const { userStatus } = prePostQualReducer;
    const { cardData } = getDebitCardsReducer;
    const reducer = isNTBOrETBUser() ? prePostQualReducer : draftUserAccountInquiryReducer;
    const selectDebitCardReducer = useSelector(
        (state) => state.zestCasaReducer.selectDebitCardReducer
    );

    // Hooks for dispatch reducer action
    const dispatch = useDispatch();

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        console.log("[ZestCASASelectDebitCard] >> [init]");
        if (!params?.from) {
            dispatch(fetchAccountList());
            dispatch(getDebitCards({}));
        }
    };

    useEffect(() => {
        dispatch({ type: SELECT_DEBIT_CARD_CONTINUE_BUTTON_DISABLED_ACTION });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectDebitCardReducer.debitCardIndex]);

    function onBackTap() {
        console.log("[ZestCASASelectDebitCard] >> [onBackTap]");
        if (identityDetailsReducer.identityType === 1 && entryReducer.isCASASTP) {
            navigation.navigate(PREMIER_MODULE_STACK, {
                screen: PREMIER_EMPLOYMENT_DETAILS,
            });
        } else {
            navigation.goBack();
        }
    }

    function onCloseTap() {
        console.log("[ZestCASAActivationPending] >> [onBackTap]");
        dispatch({ type: ZEST_CASA_CLEAR_ALL });
        navigation.navigate(MORE, {
            screen: navigationConstant.ACCOUNTS_SCREEN,
        });
    }

    function isNTBOrETBUser() {
        if (
            userStatus === ZEST_NTB_USER ||
            userStatus === ZEST_FULL_ETB_USER ||
            userStatus === CASA_STP_NTB_USER ||
            userStatus === CASA_STP_FULL_ETB_USER
        ) {
            return true;
        }
    }

    function isDebitCardUser() {
        if (
            userStatus === ZEST_DEBIT_CARD_NTB_USER ||
            userStatus === ZEST_DEBIT_CARD_USER ||
            userStatus === CASA_STP_DEBIT_CARD_NTB_USER
        ) {
            return true;
        }
    }

    function onNextTap() {
        console.log("[ZestCASASelectDebitCard] >> [onNextTap]");

        if (selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled) {
            if (isDebitCardUser()) {
                navigation.navigate(ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS, {
                    isFromActivationSuccess: props?.route?.params?.isFromActivationSuccess,
                });
            } else {
                if (userStatus === CASA_STP_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: CASA_STP_DEBIT_CARD_NTB_USER,
                    });
                } else if (userStatus === ZEST_NTB_USER) {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: ZEST_DEBIT_CARD_NTB_USER,
                    });
                } else {
                    dispatch({
                        type: PREPOSTQUAL_UPDATE_USER_STATUS,
                        userStatus: ZEST_DEBIT_CARD_USER,
                    });
                }
                if (residentialDetailsReducer?.postalCode === null) {
                    debitCardResidentailDetailsPrefiller(dispatch, masterDataReducer, reducer);
                } else {
                    const tempReducer = reducer;
                    tempReducer.addr1 = residentialDetailsReducer?.addressLineOne || "";
                    tempReducer.addr2 = residentialDetailsReducer?.addressLineTwo || "";
                    tempReducer.postCode = residentialDetailsReducer?.postalCode || "";
                    tempReducer.city = residentialDetailsReducer?.city || "";
                    tempReducer.stateValue = residentialDetailsReducer?.stateValue?.name || "";
                    debitCardResidentailDetailsPrefiller(dispatch, masterDataReducer, tempReducer);
                }
                navigation.navigate(ZEST_CASA_DEBIT_CARD_RESIDENTIAL_DETAILS);
            }
        }
    }

    function onCardViewDidTap(index, value, cardItem) {
        logEvent(FA_FORM_PROCEED, {
            [FA_SCREEN_NAME]: "Apply_RequestCard_DebitCard",
            [FA_ACTION_NAME]: cardItem?.cardName,
        });
        dispatch({
            type: SELECT_DEBIT_CARD_ACTION,
            debitCardIndex: index,
            debitCardValue: cardItem,
        });
    }

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                analyticScreenName="Apply_RequestCard_DebitCard"
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerLeftElement={<HeaderBackButton onPress={onBackTap} />}
                            headerCenterElement={
                                identityDetailsReducer.identityType === 1 ? (
                                    <Typo
                                        fontSize={12}
                                        fontWeight="600"
                                        lineHeight={15}
                                        text={STEP3OF3}
                                        color={DARK_GREY}
                                    />
                                ) : null
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
                                behavior={Platform.OS === "ios" ? "padding" : ""}
                                enabled
                            >
                                <View style={Style.formContainer}>
                                    <View style={Style.contentContainer}>
                                        <Typo
                                            lineHeight={21}
                                            textAlign="left"
                                            text={DEBIT_CARD_APPLICATION}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={16}
                                            fontWeight="600"
                                            lineHeight={22}
                                            textAlign="left"
                                            text={SELECT_DEBIT_CARD}
                                        />
                                        <SpaceFiller height={4} />
                                        <Typo
                                            fontSize={12}
                                            lineHeight={18}
                                            textAlign="left"
                                            text={`${DEBIT_CARD_PAYMENT_NOTE_START} ${masterDataReducer?.debitCardApplicationAmount} ${DEBIT_CARD_PAYMENT_NOTE_END}`}
                                        />
                                        <SpaceFiller height={36} />
                                        {renderDebitCardSelectorCardViews()}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ScrollView>

                        <FixedActionContainer>
                            <View style={Style.bottomBtnContCls}>
                                <ActionButton
                                    activeOpacity={
                                        selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled
                                            ? 1
                                            : 0.5
                                    }
                                    backgroundColor={
                                        selectDebitCardReducer.isSelectDebitCardContinueButtonEnabled
                                            ? YELLOW
                                            : DISABLED
                                    }
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={NEXT_SMALL_CAPS}
                                        />
                                    }
                                    onPress={onNextTap}
                                />
                            </View>
                        </FixedActionContainer>
                    </React.Fragment>
                </ScreenLayout>
            </ScreenContainer>
        </React.Fragment>
    );

    function renderDebitCardSelectorCardViews() {
        return cardData.map((cardItem) => {
            const { cardName, cardIndex } = cardItem;

            return (
                <React.Fragment key={cardIndex}>
                    <DebitCardSelector
                        cardName={cardName}
                        cardImageSource={getCardsImage(cardName)}
                        cardIndex={cardIndex}
                        cardItem={cardItem}
                        onDebitCardSelected={onCardViewDidTap}
                        selectedCardIndex={selectDebitCardReducer.debitCardIndex}
                    />
                    <SpaceFiller height={16} />
                </React.Fragment>
            );
        });
    }
};

ZestCASASelectDebitCard.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
    params: PropTypes.object,
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

export default ZestCASASelectDebitCard;
