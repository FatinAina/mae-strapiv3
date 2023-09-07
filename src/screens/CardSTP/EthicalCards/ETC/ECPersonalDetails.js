import numeral from "numeral";
import PropTypes from "prop-types";
import React, { useEffect, useReducer, useCallback, useRef } from "react";
import { TouchableOpacity, Image, StyleSheet, ScrollView, View } from "react-native";

import AmountInput from "@screens/Property/Common/AmountInput";
import SlidingNumPad from "@screens/Property/Common/SlidingNumPad";

import { EC_TNC, STP_CARD_MODULE, MORE, APPLY_SCREEN } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import { LongTextInput } from "@components/Common";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { makeETCInquiry } from "@services";

import { STATUS_CODE_SUCCESS } from "@constants/api";
import {
    MEDIUM_GREY,
    YELLOW,
    BLACK,
    DISABLED_TEXT,
    DISABLED,
    VERY_LIGHT_GREY,
    DARK_GREY,
} from "@constants/colors";
import {
    ETHICAL_CARD_TITLE,
    PERSONAL_DETAILS_PREFILLED,
    NAME_ON_CARD,
    MOBILE_NUMBER,
    ENTER_YOUR_EMAIL_ADDRESS,
    MONTHLY_GROSS_INC,
    YES_PREFER_PHYSICAL_CARD,
    NO_PREFER_PHYSICAL_CARD,
    EMAIL_LBL,
    EMAIL_ERROR,
    SAVE_AND_CONTINUE,
    MONTHLY_GROSS_INCOME_TITLE,
    MONTHLY_GROSS_INCOME_DESC,
    OTHER_MONTHLY_COMMITMENTS_TITLE,
    OTHER_MONTHLY_COMMITMENTS_DESC,
    REQUEST_FOR_PHYSICAL_CARD_TITLE,
    REQUEST_FOR_PHYSICAL_CARD_DESC,
    COMMON_ERROR_MSG,
} from "@constants/strings";

import { validateEmail } from "@utils/dataModel";

import Assets from "@assets";

const initialState = {
    // name on card
    nameOnCard: "",
    nameOnCardValid: true,
    nameOnCardErrorMsg: "",

    // Mobile number
    mobileNumberPrefix: "",
    mobileNumberSuffix: "",

    // Email address
    email: "",
    emailValid: true,
    emailErrorMsg: "",

    // Gross Income related
    mothlyGrossIncomeDisplayAmt: "",
    mothlyGrossIncomeRawAmt: "",
    monthyGrossIncomeKeypadAmt: "",
    monthyGrossIncomePopup: false,
    monthyGrossIncomeValid: true,
    monthyGrossIncomeErrorMsg: "",

    // Other Commitment related
    otherCommitmentsDisplayAmt: "",
    otherCommitmentsRawAmt: "",
    otherCommitmentsKeypadAmt: "",
    otherCommitmentsPopup: false,

    // Request for a physical card
    radioYesChecked: false,
    radioNoChecked: true,
    reqPhysicalCardPopup: false,

    minAmountRaw: "",
    isShowRequestPhysicalCard: false,

    // Numerical Keypad related
    showNumPad: false,
    keypadAmount: "",
    numKeypadHeight: 0,
    currentKeypadType: "",

    // Others
    showExitPopup: false,
    isContinueDisabled: true,
    editFlow: false,
    pickerType: null,
};

function reducer(state, action) {
    const { actionType, payload } = action;
    switch (actionType) {
        case "EXPAND_FIELD":
        case "SET_MONTHLY_GROSS_INCOME":
        case "SET_OTHER_COMMITMENTS":
        case "SET_MIN_AMOUNT":
        case "RESET_VALIDATION_ERRORS":
        case "SET_EMAIL_ERROR":
        case "SET_INCOME_ERROR":
            return {
                ...state,
                ...payload,
            };
        case "SET_NAME_ON_CARD":
            return {
                ...state,
                nameOnCard: payload?.nameOnCard,
            };
        case "SET_MOBILE_NUMBER":
            return {
                ...state,
                mobileNumberPrefix: payload?.mobileNumberPrefix,
                mobileNumberSuffix: payload?.mobileNumberSuffix,
            };
        case "SET_EMAIL":
            return {
                ...state,
                email: payload,
            };
        case "SHOW_MOTHLY_GROSS_INCOME_INFO_POPUP":
            return {
                ...state,
                monthyGrossIncomePopup: payload,
            };
        case "SHOW_OTHER_MONTHLY_COMM_INFO_POPUP":
            return {
                ...state,
                otherCommitmentsPopup: payload,
            };
        case "SHOW_REQ_PHYSICAL_CARD_INFO_POPUP":
            return {
                ...state,
                reqPhysicalCardPopup: payload,
            };
        case "SET_RADIO_BUTTON_YES":
            return {
                ...state,
                radioYesChecked: true,
                radioNoChecked: false,
            };
        case "SET_RADIO_BUTTON_NO":
            return {
                ...state,
                radioYesChecked: false,
                radioNoChecked: true,
            };
        case "SET_CONTINUE_DISABLED":
            return {
                ...state,
                isContinueDisabled: payload,
            };
        case "SET_KEYPAD_HEIGHT":
            return {
                ...state,
                numKeypadHeight: payload,
            };
        case "SHOW_NUM_PAD":
            return {
                ...state,
                showNumPad: payload?.value ?? false,
                currentKeypadType: payload?.fieldType ?? null,
                keypadAmount: payload?.amount ?? state.keypadAmount,
            };
        case "SET_EDIT_FLAG":
            return {
                ...state,
                editFlow: payload,
            };
        default:
            return { ...state };
    }
}

function ECPersonalDetails({ route, navigation }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        isContinueDisabled,
        showNumPad,
        numKeypadHeight,
        nameOnCard,
        mobileNumberPrefix,
        mobileNumberSuffix,
        email,
        mothlyGrossIncomeRawAmt,
        otherCommitmentsRawAmt,
        radioYesChecked,
        radioNoChecked,
        minAmountRaw,
        isShowRequestPhysicalCard,
    } = state;
    const scrollRef = useRef();

    useEffect(() => {
        init();
    }, []);

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn

    const init = useCallback(() => {
        console.log("[ECPersonalDetails] >> [init]");

        // Prepopulate any existing details
        prepopulateData();
    }, [route, navigation]);

    function onBackTap() {
        console.log("[ECPersonalDetails] >> [onBackTap]");

        navigation.navigate("CardsTypeSelection", {
            ...route.params,
        });
    }

    function onCloseTap() {
        console.log("[ECPersonalDetails] >> [onCloseTap]");

        // Hide keypad
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: false,
            },
        });

        navigation.navigate(route?.params?.entryStack || MORE, {
            screen: route?.params?.entryScreen || APPLY_SCREEN,
            params: route?.params?.entryParams,
        });
    }

    const prepopulateData = () => {
        console.log("[ECPersonalDetails] >> [prepopulateData]");

        const navParams = route?.params ?? {};
        const paramsEditFlow = navParams?.editFlow ?? false;

        const nameOnCard = navParams?.nameOnCard ?? "";
        const mobileNumberPrefix = navParams?.mobilePrefix ?? "";
        const mobileNumberSuffix = navParams?.mobileNumber ?? "";
        const email = navParams?.email ?? "";
        const monthlyGrossIncome = navParams?.monthlyGrossIncome ?? "";
        const otherCommitments = navParams?.otherCommitments ?? "";
        const requestForPhysicalCard = navParams?.requestForPhysicalCard ?? "";
        const minAmountRaw = navParams?.minAmount ?? 3000;

        // Set Edit Flag
        dispatch({
            actionType: "SET_EDIT_FLAG",
            payload: paramsEditFlow,
        });

        // name On Card
        if (nameOnCard) {
            dispatch({
                actionType: "SET_NAME_ON_CARD",
                payload: {
                    nameOnCard,
                },
            });
        }

        if (mobileNumberPrefix && mobileNumberSuffix) {
            dispatch({
                actionType: "SET_MOBILE_NUMBER",
                payload: {
                    mobileNumberPrefix,
                    mobileNumberSuffix,
                },
            });
        }

        if (minAmountRaw) {
            dispatch({
                actionType: "SET_MIN_AMOUNT",
                payload: {
                    minAmountRaw,
                },
            });
        }

        // Email
        if (email) {
            dispatch({
                actionType: "SET_EMAIL",
                payload: email,
            });
        }

        // Gross Income
        if (monthlyGrossIncome && !isNaN(monthlyGrossIncome)) {
            const grossIncomeData = getPrepopulateAmount(monthlyGrossIncome);
            dispatch({
                actionType: "SET_MONTHLY_GROSS_INCOME",
                payload: {
                    mothlyGrossIncomeDisplayAmt: grossIncomeData?.dispAmt,
                    mothlyGrossIncomeRawAmt: grossIncomeData?.rawAmt,
                    monthyGrossIncomeKeypadAmt: grossIncomeData?.keypadAmt,
                },
            });
        }

        // other Commitments
        if (otherCommitments && !isNaN(otherCommitments)) {
            const otherCommitmentsData = getPrepopulateAmount(otherCommitments);
            dispatch({
                actionType: "SET_MONTHLY_GROSS_INCOME",
                payload: {
                    otherCommitmentsDisplayAmt: otherCommitmentsData?.dispAmt,
                    otherCommitmentsRawAmt: otherCommitmentsData?.rawAmt,
                    otherCommitmentsKeypadAmt: otherCommitmentsData?.keypadAmt,
                },
            });
        }

        // Request for a physical card
        if (requestForPhysicalCard) {
            const radioBtnId = requestForPhysicalCard === "Y" ? "Yes" : "No";
            onRadioBtnPNTap({ radioBtnId });
        }
    };

    // Used to check if all fields are filled in, then accordingly enable/disable "Continue" btn
    useEffect(() => {
        dispatch({
            actionType: "SET_CONTINUE_DISABLED",
            payload: !mothlyGrossIncomeRawAmt || email.trim() === "",
        });
    }, [mothlyGrossIncomeRawAmt, email]);

    function onEmailChange(value) {
        dispatch({
            actionType: "SET_EMAIL",
            payload: value,
        });
    }

    function getPrepopulateAmount(rawAmt) {
        const defaultResponse = {
            dispAmt: "",
            rawAmt: "",
            keypadAmt: "",
        };

        if (!rawAmt) return defaultResponse;

        return {
            dispAmt: numeral(rawAmt).format("0,0.00"),
            rawAmt,
            keypadAmt: String(rawAmt * 100),
        };
    }

    function onGrossIncomePress() {
        console.log("[ECPersonalDetails] >> [onGrossIncomePress]");

        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "GROSS_INCOME",
                amount: state.monthyGrossIncomeKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 100 });
        }, 500);
    }

    function onCommitmentsIncomePress() {
        console.log("[ECPersonalDetails] >> [onCommitmentsIncomePress]");

        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: true,
                fieldType: "OTHER_COMMITMENTS",
                amount: state.otherCommitmentsKeypadAmt,
            },
        });

        // Used to adjust input field placement when keypad is open
        setTimeout(() => {
            scrollRef.current.scrollTo({ animated: true, x: 0, y: 200 });
        }, 500);
    }

    function getKeypadHeight(height) {
        dispatch({ actionType: "SET_KEYPAD_HEIGHT", payload: height });
    }

    function onNumKeypadChange(number) {
        const { currentKeypadType, keypadAmount } = state;

        if (number === "0" && !keypadAmount) return;

        const rawAmt = !number ? "" : parseInt(number, 10) / 100;
        const dispAmt = !number ? "" : numeral(rawAmt).format("0,0.00");
        const payload = {
            dispAmt,
            rawAmt,
            keypadAmt: number,
        };

        switch (currentKeypadType) {
            case "GROSS_INCOME":
                dispatch({
                    actionType: "SET_MONTHLY_GROSS_INCOME",
                    payload: {
                        mothlyGrossIncomeDisplayAmt: payload?.dispAmt,
                        mothlyGrossIncomeRawAmt: payload?.rawAmt,
                        monthyGrossIncomeKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            case "OTHER_COMMITMENTS":
                dispatch({
                    actionType: "SET_OTHER_COMMITMENTS",
                    payload: {
                        otherCommitmentsDisplayAmt: payload?.dispAmt,
                        otherCommitmentsRawAmt: payload?.rawAmt,
                        otherCommitmentsKeypadAmt: payload?.keypadAmt,
                        keypadAmount: payload?.keypadAmt,
                    },
                });
                break;
            default:
                break;
        }
    }

    function onNumKeypadDone() {
        dispatch({
            actionType: "SHOW_NUM_PAD",
            payload: {
                value: false,
            },
        });
    }

    function showMonthlyGrossIcomePopup() {
        dispatch({
            actionType: "SHOW_MOTHLY_GROSS_INCOME_INFO_POPUP",
            payload: true,
        });
    }
    function closeMonthlyGrossIcomePopup() {
        dispatch({
            actionType: "SHOW_MOTHLY_GROSS_INCOME_INFO_POPUP",
            payload: false,
        });
    }

    function showOtherMonthlyCommitmentsPopup() {
        dispatch({
            actionType: "SHOW_OTHER_MONTHLY_COMM_INFO_POPUP",
            payload: true,
        });
    }

    function closeOtherMonthlyCommitmentsPopup() {
        dispatch({
            actionType: "SHOW_OTHER_MONTHLY_COMM_INFO_POPUP",
            payload: false,
        });
    }

    function showReqPhysicalCardPopup() {
        dispatch({
            actionType: "SHOW_REQ_PHYSICAL_CARD_INFO_POPUP",
            payload: true,
        });
    }

    function closeReqPhysicalCardPopup() {
        dispatch({
            actionType: "SHOW_REQ_PHYSICAL_CARD_INFO_POPUP",
            payload: false,
        });
    }

    function onRadioBtnPNTap(params) {
        const radioBtnId = params.radioBtnId;
        dispatch({
            actionType: radioBtnId === "Yes" ? "SET_RADIO_BUTTON_YES" : "SET_RADIO_BUTTON_NO",
            payload: {},
        });
    }

    const resetValidationErrors = () => {
        console.log("[ECPersonalDetails] >> [resetValidationErrors]");

        dispatch({
            actionType: "RESET_VALIDATION_ERRORS",
            payload: {
                emailValid: true,
                emailErrorMsg: "",
                monthyGrossIncomeValid: true,
                monthyGrossIncomeErrorMsg: "",
            },
        });
    };

    const validateFormDetails = () => {
        console.log("[ECPersonalDetails] >> [validateFormDetails]");
        let isFormValid = true;

        // Reset existing error state
        resetValidationErrors();

        if (!validateEmail(email.trim())) {
            dispatch({
                actionType: "SET_EMAIL_ERROR",
                payload: { emailValid: false, emailErrorMsg: EMAIL_ERROR },
            });
            isFormValid = false;
        }

        if (mothlyGrossIncomeRawAmt < minAmountRaw) {
            dispatch({
                actionType: "SET_INCOME_ERROR",
                payload: {
                    monthyGrossIncomeValid: false,
                    monthyGrossIncomeErrorMsg: `Please enter a minimum of RM ${minAmountRaw}`,
                },
            });
            isFormValid = false;
        }

        // Return true if all validation checks are passed
        return isFormValid;
    };

    const getFormData = () => {
        console.log("[ECPersonalDetails] >> [getFormData]");

        const navParams = route?.params ?? {};

        return {
            ...navParams,
            nameOnCard,
            email: email.trim(),
            monthlyGrossIncome: String(mothlyGrossIncomeRawAmt),
            otherCommitments: String(otherCommitmentsRawAmt),
            requestForPhysicalCard: radioYesChecked ? "Y" : "N",
        };
    };

    async function onContinue() {
        console.log("[ECPersonalDetails] >> [onContinue]");

        // Return if form validation fails
        const isFormValid = validateFormDetails();
        if (!isFormValid) return;

        // Retrieve form data
        const formData = getFormData();

        const navParams = route?.params ?? {};
        const mbosRefNo = navParams?.mbosRefNo ?? "";
        const cardName = navParams?.userAction?.selectedCard[0].displayValue ?? "";

        //Make api consent
        const params = { mbosRefNo, channelType: "mae" };
        try {
            const httpResp = await makeETCInquiry(params);
            const result = httpResp?.result ?? {};
            const statusCode = result?.statusCode ?? null;
            const statusDesc = result?.statusDesc ?? COMMON_ERROR_MSG;
            const isSuccess = result?.isSuccess ?? false;

            if (statusCode === STATUS_CODE_SUCCESS) {
                if (isSuccess) {
                    // Navigate to TNC
                    navigation.navigate(STP_CARD_MODULE, {
                        screen: EC_TNC,
                        params: { ...navParams, ...formData, cardName },
                    });
                } else {
                    // Navigate to ETB Flow
                    navigation.navigate("CardsIntro", {
                        ...route.params,
                    });
                }
            } else {
                // Show error message
                showErrorToast({ message: statusDesc });
            }
        } catch (error) {
            const errorMsg = error?.message || error?.result?.statusDesc || COMMON_ERROR_MSG;
            showErrorToast({ message: errorMsg });
            console.log("[ECPersonalDetails][onContinue] >> Exception: ", error);
        }
    }

    return (
        <>
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
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
                    <>
                        <ScrollView
                            style={styles.scrollViewCls}
                            ref={scrollRef}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Apply mortgage */}
                            <Typo lineHeight={18} text={ETHICAL_CARD_TITLE} textAlign="left" />

                            {/* Header */}
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={22}
                                style={styles.headerText}
                                text={PERSONAL_DETAILS_PREFILLED}
                                textAlign="left"
                            />

                            {/* Name on card */}
                            <View style={styles.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={NAME_ON_CARD} />

                                <View style={styles.nameContainer}>
                                    <Typo
                                        style={[styles.inputFont, styles.prefix]}
                                        textAlign="left"
                                        text={nameOnCard}
                                        fontWeight="600"
                                    />
                                </View>
                            </View>

                            {/* Mobile Number */}
                            <View style={styles.fieldViewCls}>
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    lineHeight={18}
                                    text={MOBILE_NUMBER}
                                    textAlign="left"
                                />

                                <View style={styles.rowMobile}>
                                    <View style={styles.mobileNumberPrefix}>
                                        <Typo
                                            style={[styles.inputFont, styles.prefix]}
                                            textAlign="left"
                                            text={mobileNumberPrefix}
                                            fontWeight="600"
                                        />
                                        <Image
                                            style={styles.infoIcon}
                                            source={Assets.downArrowGrey}
                                        />
                                    </View>
                                    <View style={styles.mobileNumberSuffix}>
                                        <Typo
                                            style={[styles.inputFont, styles.prefix]}
                                            textAlign="left"
                                            text={mobileNumberSuffix}
                                            fontWeight="600"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Email address */}
                            <View style={styles.fieldViewCls}>
                                <Typo lineHeight={18} textAlign="left" text={EMAIL_LBL} />
                                <LongTextInput
                                    minLength={5}
                                    maxLength={40}
                                    isValidate
                                    isValid={state.emailValid}
                                    errorMessage={state.emailErrorMsg}
                                    value={email}
                                    placeholder={ENTER_YOUR_EMAIL_ADDRESS}
                                    onChangeText={onEmailChange}
                                    numberOfLines={2}
                                />
                            </View>

                            {/* Monthly gross income */}
                            <AmountInput
                                label={MONTHLY_GROSS_INC}
                                onPress={onGrossIncomePress}
                                isValidate
                                isValid={state.monthyGrossIncomeValid}
                                errorMessage={state.monthyGrossIncomeErrorMsg}
                                value={state.mothlyGrossIncomeDisplayAmt}
                                infoIcon
                                infoIconPress={showMonthlyGrossIcomePopup}
                                style={styles.incomeField}
                            />

                            {/* Other monthly commitment */}
                            <AmountInput
                                label={OTHER_MONTHLY_COMMITMENTS_TITLE}
                                onPress={onCommitmentsIncomePress}
                                value={state.otherCommitmentsDisplayAmt}
                                infoIcon
                                infoIconPress={showOtherMonthlyCommitmentsPopup}
                            />

                            {/* Request for a physical card */}
                            {isShowRequestPhysicalCard && (
                                <View>
                                    <View style={styles.requestPhysicalCardRow}>
                                        <Typo
                                            lineHeight={18}
                                            textAlign="left"
                                            text={REQUEST_FOR_PHYSICAL_CARD_TITLE}
                                        />
                                        <TouchableOpacity
                                            onPress={showReqPhysicalCardPopup}
                                            activeOpacity={0.8}
                                        >
                                            <Image
                                                style={styles.infoIcon}
                                                source={Assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <SpaceFiller height={16} />

                                    <RadioButtonText
                                        btnId="Yes"
                                        onPress={onRadioBtnPNTap}
                                        isSelected={radioYesChecked === true}
                                        text={YES_PREFER_PHYSICAL_CARD}
                                    />

                                    <SpaceFiller height={25} />

                                    <RadioButtonText
                                        btnId="No"
                                        onPress={onRadioBtnPNTap}
                                        isSelected={radioNoChecked}
                                        text={NO_PREFER_PHYSICAL_CARD}
                                    />
                                </View>
                            )}

                            {/* Bottom Spacer - Always place as last item among form elements */}
                            <View style={styles.bottomSpacer} />
                        </ScrollView>

                        {/* Vertical Spacer */}
                        <View
                            style={{
                                height: showNumPad ? numKeypadHeight : 0,
                            }}
                        />

                        {/* Bottom docked button container */}
                        {!showNumPad && (
                            <FixedActionContainer>
                                <ActionButton
                                    disabled={isContinueDisabled}
                                    activeOpacity={isContinueDisabled ? 1 : 0.5}
                                    backgroundColor={isContinueDisabled ? DISABLED : YELLOW}
                                    fullWidth
                                    componentCenter={
                                        <Typo
                                            color={isContinueDisabled ? DISABLED_TEXT : BLACK}
                                            lineHeight={18}
                                            fontWeight="600"
                                            text={SAVE_AND_CONTINUE}
                                        />
                                    }
                                    onPress={onContinue}
                                />
                            </FixedActionContainer>
                        )}
                    </>
                </ScreenLayout>
            </ScreenContainer>

            {/* Sliding Numerical Keypad */}
            <SlidingNumPad
                showNumPad={showNumPad}
                value={state.keypadAmount}
                onChange={onNumKeypadChange}
                onDone={onNumKeypadDone}
                getHeight={getKeypadHeight}
            />

            {/* Monthly gross income Info Popup */}
            <Popup
                visible={state.monthyGrossIncomePopup}
                title={MONTHLY_GROSS_INCOME_TITLE}
                description={MONTHLY_GROSS_INCOME_DESC}
                onClose={closeMonthlyGrossIcomePopup}
            />
            {/* Other monthly commitment Info Popup */}
            <Popup
                visible={state.otherCommitmentsPopup}
                title={OTHER_MONTHLY_COMMITMENTS_TITLE}
                description={OTHER_MONTHLY_COMMITMENTS_DESC}
                onClose={closeOtherMonthlyCommitmentsPopup}
            />
            {/* Request for a physical card Info Popup */}
            <Popup
                visible={state.reqPhysicalCardPopup}
                title={REQUEST_FOR_PHYSICAL_CARD_TITLE}
                description={REQUEST_FOR_PHYSICAL_CARD_DESC}
                onClose={closeReqPhysicalCardPopup}
            />
        </>
    );
}

function RadioButtonText({ btnId, onPress, isSelected, text }) {
    const onItemPress = () => {
        if (onPress) onPress({ radioBtnId: btnId });
    };

    return (
        <TouchableOpacity style={styles.radioContainer} onPress={onItemPress}>
            <Image
                style={styles.tickImage}
                source={isSelected ? Assets.icRadioChecked : Assets.icRadioUnchecked}
            />
            <Typo textAlign="left" lineHeight={18} text={text} style={styles.radioButtonText} />
        </TouchableOpacity>
    );
}

RadioButtonText.propTypes = {
    btnId: PropTypes.string,
    onPress: PropTypes.func,
    isSelected: PropTypes.bool,
    text: PropTypes.string,
};

ECPersonalDetails.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomSpacer: {
        marginTop: 60,
    },

    fieldViewCls: {
        marginTop: 25,
    },

    incomeField: {
        marginTop: 16,
    },

    headerText: {
        paddingTop: 8,
    },

    radioButtonText: { flexWrap: "wrap", flex: 1 },

    radioContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
    },

    scrollViewCls: {
        paddingHorizontal: 36,
        paddingTop: 24,
    },
    tickImage: {
        borderColor: BLACK,
        borderRadius: 10,
        borderWidth: 1,
        height: 20,
        marginRight: 7,
        width: 20,
    },
    rowMobile: {
        alignItems: "flex-end",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    nameContainer: {
        width: "100%",
        alignItems: "center",
        borderBottomColor: VERY_LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "space-between",
        marginRight: 10,
    },
    mobileNumberSuffix: {
        width: "75%",
        alignItems: "center",
        borderBottomColor: VERY_LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "space-between",
        marginRight: 10,
    },
    mobileNumberPrefix: {
        width: "25%",
        alignItems: "center",
        borderBottomColor: VERY_LIGHT_GREY,
        borderBottomWidth: 1,
        flexDirection: "row",
        height: 48,
        justifyContent: "space-between",
        marginRight: 10,
    },
    requestPhysicalCardRow: {
        flexDirection: "row",
    },
    infoIcon: {
        height: 16,
        marginLeft: 10,
        width: 16,
    },
    inputFont: {
        color: DARK_GREY,
        fontSize: 20,
    },
    prefix: {
        color: DARK_GREY,
        lineHeight: 24,
        marginRight: 8,
    },
});

export default ECPersonalDetails;
