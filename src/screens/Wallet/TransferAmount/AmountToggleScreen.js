import { isEmpty } from "lodash";
import moment from "moment";
import Numeral from "numeral";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { View, ScrollView, Keyboard, TouchableOpacity, Image } from "react-native";

import {
    REQUEST_TO_PAY_STACK,
    DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import RadioButton from "@components/Buttons/RadioButton";
import { AccountDetailsView, ScrollPickerView } from "@components/Common";
import { Dropdown } from "@components/Common/DropDownButtonCenter";
import ScreenContainer from "@components/Containers/ScreenContainer";
import Switch from "@components/Inputs/Switch";
import NumericalKeyboard from "@components/NumericalKeyboard";
import DatePicker from "@components/Pickers/DatePicker";
import Popup from "@components/Popup";
import Typo from "@components/Text";
import TextInput from "@components/TextInput";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { useModelController } from "@context";

import { productList as productListApi } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY, BLACK, GRAY, DISABLED, YELLOW, SWITCH_GREY } from "@constants/colors";
import { paymentMethodsList } from "@constants/data/DuitNowRPP";
import {
    FREQUENCY,
    FREQUENCY_TRN,
    LIMIT_PER_TRN,
    FREQUENCY_DETAILS,
    LIMIT_DETAILS,
    ENTER_AMOUNT,
    REQUEST_AMOUNT,
    REQUEST_TO_PAY,
    FILL_REQUESTED,
    CURRENCY_CODE,
    AUTODEBIT_TOGGLE_LABEL,
    PRODUCT_NAME,
    RECIPIENT_CAN_EDIT_AMOUNT,
    SET_EXPIRY_DATE,
    NEXT_SMALL_CAPS,
    VALID_AMOUNT_DIGIT_PLACES_ERROR,
    VALID_AMOUNT_ERROR,
    PLEASE_SELECT,
    START_DATE_PLACEHOLDER,
    END_DATE_PLACEHOLEDER,
    PAYMENT_METHOD_PLACEHOLDER,
    EXPIRY_DATE_IN_WEEK,
    LIMIT_PER_TRANSACTION,
    NO,
    YES,
    FA_DUIT_NOW_REQUEST,
    START_DATE,
    END_DATE,
    DONE,
    CANCEL,
    DUINTNOW_IMAGE,
    SC_DN_REQUEST_FEE,
    SC_DN_AUTODEBIT_ENDDATE,
    DATE_SHORT_FORMAT,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import { toTitleCase } from "@utils/dataModel/rtdHelper";

import Assets from "@assets";

function AmountToggleScreen(props) {
    const [errorMessage, setErrorMessage] = useState("");
    const [showLocalError, setShowLocalError] = useState(false);
    const [showLocalErrorMessage, setShowLocalErrorMessage] = useState("");
    const [transferParams, setTransferParams] = useState({});
    const [screenData, setScreenData] = useState({
        image: {
            image: DUINTNOW_IMAGE,
            imageName: DUINTNOW_IMAGE,
            imageUrl: DUINTNOW_IMAGE,
            shortName: "",
            type: true,
        },
        name: "",
        description1: "",
        description2: "",
        imageBase64: false,
    });
    const [amount, setAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState(0.0);
    const [screenLabel, setScreenLabel] = useState(ENTER_AMOUNT);
    const [imageBase64, setImageBase64] = useState(true);
    const [amountLength, setAmountLength] = useState(8);
    const [amountValue, setAmountValue] = useState(0);
    const [autoDebitEnabled, setAutoDebitEnabled] = useState(false);
    const [productList, setProductList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [productView, setProductView] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(moment().add(1, "days").toDate());
    const [endDate, setEndDate] = useState(moment().add(30, "days").toDate());
    const [displayStartDate, setDisplayStartDate] = useState("");
    const [displayEndDate, setDisplayEndDate] = useState("");
    const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
    const [frequencyView, setFrequencyView] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [textInputValue, setTextInputValue] = useState("");
    const [amtInputErrorMessage, setAmtInputErrorMessage] = useState("");
    const [isAmtValidate, setIsAmtValidate] = useState(true);
    const [isAmtTouched, setIsAmtTouched] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState({
        code: "04",
        name: "Monthly",
        index: 3,
    });
    const [frequencyList, setFrequencyList] = useState([]);
    const [recipientCanEditAmt, setRecipientCanEditAmt] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState(paymentMethodsList);
    const [expiryDate, setExpiryDate] = useState(false);
    const [showNumericKeypad, setShowNumericKeypad] = useState(false);
    const [productInfo, setProductInfo] = useState(null);
    const [isSubmitDisble, setIsSubmitDisble] = useState(false);
    const [maxAmountError, setMaxAmountError] = useState("");
    const [image, setImage] = useState("");
    const [showError, setShowError] = useState(false);
    const [cusType, setCusType] = useState();
    const [allowCancel, setAllowCancel] = useState(true);
    const { getModel, updateModel } = useModelController();
    const [showInfoMessage] = useState(props?.route?.params?.transferParams?.nameMasked);
    const { utilFlag } = getModel("rpp")?.permissions || {};

    useEffect(() => {
        _updateDataInScreen();
        const cusType = getModel("user").cus_type;
        setCusType(cusType);
        const { params } = props?.route || {};
        if (params?.merchantId || params?.merchantDetails?.merchantId) {
            getAllProducts();
        }
        RTPanalytics.viewDNRSetupAmtToggel();
        if (showInfoMessage) {
            showInfoToast({ message: params?.transferParams?.recipientNameMaskedMessage });
        }
    }, []);

    useEffect(() => {
        isFieldsValid();
    }, [
        displayStartDate,
        displayEndDate,
        showError,
        startDate,
        endDate,
        textInputValue,
        isAmtTouched,
    ]);

    async function getAllProducts() {
        try {
            const { params } = props?.route || {};
            const { merchantId } = params?.merchantDetails || "";
            const productsContext = getModel("rpp")?.productsContext;
            const { frequencyContext } = getModel("rpp");
            const frequencyList = frequencyContext?.list;
            setFrequencyList(frequencyList);

            if (params?.transferParams?.consentMaxLimit) {
                const startDate = DataModel.getFormatedDateMoments(
                    moment(params?.transferParams?.consentStartDate),
                    DATE_SHORT_FORMAT
                );
                const endDate = DataModel.getFormatedDateMoments(
                    moment(params?.transferParams?.consentExpiryDate),
                    DATE_SHORT_FORMAT
                );

                setDisplayStartDate(startDate);
                setDisplayEndDate(endDate);
                setTextInputValue(
                    Numeral(params?.transferParams?.consentMaxLimit).format("0,0.00")
                );
            }
            //if products not in context initiate api call
            if (
                params?.transferParams?.productId &&
                params?.isEdit &&
                productsContext?.list.length > 0
            ) {
                const findObj = productsContext?.list?.find(
                    (el) => el.productId === params?.transferParams?.productId
                );
                if (findObj?.productId) {
                    setSelectedProductIndex(findObj?.value);
                    setSelectedProduct(findObj);
                    setProductList(productsContext?.list);
                    setProductInfo(findObj);
                }
            } else if (productsContext?.apiCalled === false) {
                const res = await productListApi({
                    merchantId,
                });
                if (res?.data?.code === 200) {
                    const products =
                        res?.data?.result?.data?.merchants?.map((el) => {
                            return {
                                ...el,
                                name: el.productName,
                                value: el.productId,
                                merchantId: el.merchantId,
                            };
                        }) ?? [];
                    updateModel({
                        rpp: {
                            productsContext: {
                                list: products,
                                apiCalled: true,
                            },
                        },
                    });
                    setProductList(products);
                    if (products?.length === 1) {
                        setSelectedProductIndex(products[0].value);
                        setSelectedProduct(products[0]);
                        setProductList(products);
                        setProductInfo(products[0]);
                    }
                }
            } else {
                setProductList(productsContext?.list);
                if (productsContext?.list?.length === 1) {
                    setSelectedProductIndex(productsContext?.list[0]?.value);
                    setSelectedProduct(productsContext?.list[0]);
                    setProductList(productsContext?.list);
                    setProductInfo(productsContext?.list[0]);
                }
            }
        } catch (err) {
            showErrorToast({
                message: err?.message,
            });
        }
    }

    async function _updateDataInScreen() {
        const transferParams = props.route.params?.transferParams;
        const { params } = props?.route || {};
        const {
            amount,
            imageBase64,
            maxAmount,
            amountError,
            amountLength,
            maxAmountError,
            debtorName,
            image,
            selectedProxy,
            idValueFormatted,
            nameMasked,
            accHolderName,
        } = transferParams;
        const newScreenData = {
            image: screenData?.image || image,
            name: idValueFormatted || params?.screenData?.formattedToAccount || null,
            description1: nameMasked
                ? accHolderName
                : toTitleCase(debtorName) || params?.screenData?.accountName || null,
            description2: selectedProxy?.name || params?.screenData?.bankName,
            imageBase64: screenData?.imageBase64 ?? "",
        };
        const sourceFunds = params?.sourceFunds;
        let paymentMethodList = [];
        if (!isEmpty(sourceFunds)) {
            paymentMethodList = [...paymentMethods]?.filter((el) => sourceFunds.includes(el?.key));
        }
        const amountTemp = amount ? amount.toString().replace(/,/g, "").replace(".", "") : 0.0;
        const amountValue = amountTemp ? Numeral(amountTemp).value() : 0;
        if (amountValue >= 0.01) {
            changeText(amountValue);
        }

        setScreenLabel(REQUEST_AMOUNT);
        setImageBase64(imageBase64);
        setMaxAmount(maxAmount);
        setTransferParams(transferParams);
        setErrorMessage(amountError);
        setScreenData(newScreenData);
        setAmountLength(amountLength || 8);
        setMaxAmountError(maxAmountError || amountError);
        setImage(image);
        setPaymentMethods(paymentMethodList);
        setAllowCancel(allowCancel);
    }

    function changeText(val) {
        const value = val ? parseInt(val) : 0;

        if (value > 0) {
            const formatted = numberWithCommas(value);
            setAmount(formatted);
            setAmountValue(value);
            setShowLocalError(false);
        } else {
            setAmount("");
            setAmountValue(value);
            setShowLocalError(false);
        }
    }

    function numberWithCommas(val) {
        const text = JSON.stringify(val);
        let x = "0.00";
        if (text) {
            let resStr = "";
            if (text.length === 1) {
                resStr =
                    text.substring(0, text.length - 2) + "0.0" + text.substring(text.length - 2);
            } else if (text.length < 3) {
                resStr =
                    text.substring(0, text.length - 2) + "0." + text.substring(text.length - 2);
            } else {
                if (parseInt(text) > 0) {
                    resStr =
                        text.substring(0, text.length - 2) + "." + text.substring(text.length - 2);
                } else {
                    resStr = "0.00";
                }
            }

            x = resStr.toString();
            const pattern = /(-?\d+)(\d{3})/;
            while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
        }
        return x;
    }

    function doneClick() {
        if (autoDebitEnabled) {
            setShowNumericKeypad(false);
        } else {
            const amountFinal = amount;
            const amountData = amount ? amount.toString().replace(/,/g, "") : "0.00";
            let amountText = Numeral(amountData).value();

            if (!amountText) {
                amountText = 0;
            }
            const serviceFeeItems = utilFlag.filter((item) => {
                return item?.serviceCode === SC_DN_REQUEST_FEE;
            });

            if (amountText < 0.01) {
                setShowLocalErrorMessage(errorMessage);
                setShowLocalError(true);
            } else if (amountText > maxAmount) {
                setShowLocalErrorMessage(maxAmountError);
                setShowLocalError(true);
            } else {
                setShowLocalError(false);
                const modParams = {};
                const amountValue = amountFinal
                    ? amountFinal.toString().replace(/,/g, "").replace(".", "")
                    : 0;
                modParams.amount = amountFinal;
                modParams.formattedAmount = amountFinal;
                modParams.amountValue = amountValue;
                modParams.serviceFee =
                    amountText > serviceFeeItems[0]?.mainNote1
                        ? serviceFeeItems[0]?.mainNote2
                        : 0.0;
                modParams.transferFlow = 25;
                modParams.allowCancel = allowCancel;
                const params = {
                    ...props.route.params,
                    transferParams: { ...transferParams, ...modParams },
                    decoupleTransaction: true,
                };
                props.navigation.navigate(REQUEST_TO_PAY_STACK, {
                    screen: DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
                    params,
                });
            }
        }
    }

    function _onBackPress() {
        props.navigation.pop();
    }

    function handleInfoPress(type) {
        const infoTitle = type === FREQUENCY ? FREQUENCY_TRN : LIMIT_PER_TRN;
        const infoMessage = type === FREQUENCY ? FREQUENCY_DETAILS : LIMIT_DETAILS;
        setInfoTitle(infoTitle);
        setInfoMessage(infoMessage);
        setShowFrequencyInfo(!showFrequencyInfo);
    }

    function onToggle(isEdit) {
        const { soleProp, isRtdEnabled } = props?.route?.params || {};
        if ((!autoDebitEnabled || isEdit) && soleProp && isRtdEnabled) {
            setAutoDebitEnabled(!autoDebitEnabled);
        } else {
            disableAutoDebit();
        }
    }

    function disableAutoDebit() {
        setAutoDebitEnabled(false);
    }

    /***
     * _onProductClick
     * On Product dropdown click event open the pop up
     */
    function _onProductClick() {
        Keyboard.dismiss();
        setProductView(true);
    }

    function _onProductRightButtonPress(val, index) {
        setProductView(false);
        setSelectedProductIndex(val.value);
        setSelectedProduct(val);
        setProductInfo(val);
    }

    /***
     * _onProductRightLeftButtonPress
     * On Product pop up cancel click event close the pop up
     */
    function _onProductRightLeftButtonPress() {
        setProductView(false);
    }

    function onShowStartDatePicker() {
        setShowStartDatePicker(true);
    }

    function onShowEndDatePicker() {
        setShowEndDatePicker(true);
    }

    function hideStartDatePicker() {
        setShowStartDatePicker(false);
    }

    function hideEndDatePicker() {
        setShowEndDatePicker(false);
    }

    function isFieldsValid() {
        const regex = /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/gi;
        const isValid = regex.test(textInputValue.replace(/,/g, ""));
        const minAmount = parseFloat(textInputValue) > 1;
        let amountInputErrorMessage = "";
        if (!isValid || !displayStartDate || !displayEndDate) {
            if (isAmtTouched) {
                amountInputErrorMessage =
                    !textInputValue || !minAmount
                        ? VALID_AMOUNT_ERROR
                        : textInputValue && !isValid
                        ? VALID_AMOUNT_DIGIT_PLACES_ERROR
                        : "";
            }

            setAmtInputErrorMessage(amountInputErrorMessage);
            setIsAmtValidate(isAmtTouched ? isValid : true);
            setIsSubmitDisble(true);
            return false;
        }
        setAmtInputErrorMessage("");
        setIsSubmitDisble(false);
        return true;
    }

    function selectedStartDay(day) {
        try {
            setDisplayStartDate(DataModel.getDateFormated(day));
            setShowError(false);
            setStartDate(day);
        } catch (e) {
            showErrorToast({
                message: e?.message,
            });
        } finally {
            hideStartDatePicker();
        }
    }

    function selectedEndDay(day) {
        try {
            setDisplayEndDate(DataModel.getDateFormated(day));
            setShowError(false);
            setEndDate(day);
        } catch (e) {
            showErrorToast({
                message: e?.message,
            });
        } finally {
            hideEndDatePicker();
        }
    }

    /***
     * _onFrequencyClick
     * On Bank dropdown click event open the pop up
     */
    function _onFrequencyClick() {
        Keyboard.dismiss();
        setFrequencyView(true);
    }

    /**
     *_onFrequencyRightButtonModePress
     * On Frequency on click handle right button click event
     */
    function _onFrequencyRightButtonModePress(val) {
        setSelectedFrequency(val);
        setFrequencyView(false);
    }
    /**
     *_onFrequencyLeftButtonModePress
     * On Frequency on click handle left button click event
     */
    function _onFrequencyLeftButtonModePress() {
        setFrequencyView(false);
    }

    function _onLimitChange(value) {
        setTextInputValue(value);
        setIsAmtTouched(true);
    }

    function onToggleRecipientAmt(val) {
        setRecipientCanEditAmt(val);
    }
    function onPaymentMethodsPress(title) {
        const temp = [...paymentMethods]?.map((el, key) => ({
            ...el,
            isSelected:
                title === el.title && el.key !== "01"
                    ? !paymentMethods[key]?.isSelected
                    : paymentMethods[key]?.isSelected,
        }));
        setPaymentMethods(temp);
    }
    function onToggleExpiryDate(val) {
        setExpiryDate(val);
    }

    function _coupledCheck() {
        let _amount = amount;
        const amountFinal = amount;
        _amount = amount ? amount.toString().replace(/,/g, "") : "0.00";
        let amountText = Numeral(_amount).value();

        if (!amountText) {
            amountText = 0;
        }
        if (amountText < 0.01) {
            setShowLocalErrorMessage(errorMessage);
            setShowLocalError(true);
        } else if (amountText > maxAmount) {
            setShowLocalErrorMessage(maxAmountError);
            setShowLocalError(true);
        } else {
            setShowLocalError(false);
            const fieldValid = isFieldsValid();

            const serviceFeeItems = utilFlag.filter((item) => {
                return item?.serviceCode === SC_DN_REQUEST_FEE;
            });

            if (fieldValid) {
                setShowLocalError(false);
                const modParams = {};
                const amountValue = amountFinal
                    ? amountFinal.toString().replace(/,/g, "").replace(".", "")
                    : 0;
                modParams.amount = amountFinal;
                modParams.formattedAmount = amountFinal;
                modParams.amountValue = amountValue;
                modParams.serviceFee =
                    amountText > serviceFeeItems[0]?.mainNote1
                        ? serviceFeeItems[0]?.mainNote2
                        : 0.0;
                modParams.transferFlow = 25;
                modParams.consentStartDate = startDate;
                modParams.consentExpiryDate = endDate;
                modParams.consentFrequency = selectedFrequency?.code;
                modParams.consentFrequencyText = selectedFrequency?.name;
                modParams.consentMaxLimit = textInputValue;
                modParams.consentMaxLimitFormatted = Numeral(textInputValue).format("0,0.00");
                modParams.productInfo = productInfo;
                modParams.showProductInfo = true;
                modParams.allowCancel = allowCancel;
                const params = {
                    ...props.route.params,
                    transferParams: { ...transferParams, ...modParams },
                    autoDebitEnabled,
                    isAutoDebitEnabled: true,
                    coupleTransaction: true,
                    autoDebitParams: {
                        consentStartDate: startDate,
                        consentExpiryDate: endDate,
                        consentFrequency: selectedFrequency?.code,
                        consentFrequencyText: selectedFrequency?.name,
                        consentMaxLimit: textInputValue,
                        consentMaxLimitFormatted: Numeral(textInputValue).format("0,0.00"),
                        editAmount: recipientCanEditAmt,
                        editExpiryDate: expiryDate,
                    },
                };
                props.navigation.navigate(REQUEST_TO_PAY_STACK, {
                    screen: DUITNOW_DECOUPLED_REQUEST_CONFIRMATION_SCREEN,
                    params,
                });
            }
        }
    }

    function onAmountFocus() {
        Keyboard.dismiss();
        setShowNumericKeypad(true);
    }

    function handleScroll() {
        if (showNumericKeypad) {
            setShowNumericKeypad(false);
        }
    }

    const { soleProp } = props?.route?.params || {};
    const minEndDate = startDate
        ? moment(startDate).add(1, "days").toDate()
        : moment().add(30, "days").toDate();
    const defaultEndDate = utilFlag.filter((item) => {
        return item?.serviceCode === SC_DN_AUTODEBIT_ENDDATE;
    });

    const disableActionBtn = isSubmitDisble;
    return (
        <ScreenContainer
            backgroundType="color"
            errorMessage={errorMessage}
            showOverlay={false}
            backgroundColor={MEDIUM_GREY}
        >
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerCenterElement={
                            <Typo
                                fontSize={16}
                                fontWeight="600"
                                lineHeight={19}
                                text={REQUEST_TO_PAY}
                            />
                        }
                        headerLeftElement={<HeaderBackButton onPress={_onBackPress} />}
                    />
                }
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <React.Fragment>
                    <ScrollView
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={0}
                    >
                        <View style={Styles.container}>
                            {autoDebitEnabled && (
                                <Typo
                                    fontSize={14}
                                    fontWeight="normal"
                                    fontStyle="normal"
                                    lineHeight={19}
                                    color={BLACK}
                                    textAlign="left"
                                    text={FA_DUIT_NOW_REQUEST}
                                />
                            )}
                            <Typo
                                fontSize={14}
                                fontWeight="bold"
                                fontStyle="normal"
                                lineHeight={19}
                                color={BLACK}
                                textAlign="left"
                                text={FILL_REQUESTED}
                            />
                            {!autoDebitEnabled && (
                                <View style={Styles.logoInfoContainer}>
                                    <AccountDetailsView
                                        data={screenData}
                                        base64={imageBase64}
                                        image={image}
                                    />
                                </View>
                            )}
                            <View>
                                <View style={Styles.descriptionContainerAmount}>
                                    <Typo
                                        fontSize={14}
                                        fontWeight="normal"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        color={BLACK}
                                        textAlign="left"
                                        text={screenLabel}
                                    />
                                </View>
                                <View style={Styles.amountViewTransfer}>
                                    <TextInput
                                        style={Styles.duitNowAmount}
                                        prefixStyle={[Styles.duitNowAmountFaded]}
                                        accessibilityLabel="Password"
                                        isValidate={showLocalError}
                                        errorMessage={showLocalErrorMessage}
                                        value={amount}
                                        prefix={CURRENCY_CODE}
                                        clearButtonMode="while-editing"
                                        returnKeyType="done"
                                        editable={soleProp && autoDebitEnabled}
                                        placeholder="0.00"
                                        onFocus={onAmountFocus}
                                    />
                                </View>
                                <View style={Styles.descriptionContainerAmount} />
                                <Typo
                                    fontSize={14}
                                    fontWeight="600"
                                    fontStyle="normal"
                                    letterSpacing={0}
                                    lineHeight={19}
                                    textAlign="left"
                                    color={BLACK}
                                    text={AUTODEBIT_TOGGLE_LABEL}
                                />
                                <View style={Styles.enableDuit}>
                                    <Switch
                                        value={{ active: autoDebitEnabled }}
                                        onTogglePressed={() =>
                                            cusType === "02" &&
                                            props?.route?.params?.hasPermissionToggleAutoDebit
                                                ? onToggle(!autoDebitEnabled)
                                                : null
                                        }
                                        style={Styles.descriptionContainerAmount}
                                    />
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={19}
                                        textAlign="left"
                                        color={BLACK}
                                        text={autoDebitEnabled ? YES : NO}
                                        style={Styles.toggleLabel}
                                    />
                                </View>
                            </View>

                            {autoDebitEnabled && (
                                <View style={Styles.containerInner}>
                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={PRODUCT_NAME}
                                        />
                                    </View>
                                    <View style={Styles.contoryContainer}>
                                        <Dropdown
                                            title={selectedProduct?.productName ?? PLEASE_SELECT}
                                            disable={
                                                productList?.length === 1 ||
                                                props.route.params?.isEdit
                                            }
                                            align="left"
                                            iconType={1}
                                            textLeft={true}
                                            borderWidth={0.5}
                                            onPress={_onProductClick}
                                            hideCaret={
                                                productList?.length === 1 ||
                                                props.route.params?.isEdit
                                            }
                                        />
                                    </View>
                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={START_DATE}
                                        />
                                    </View>
                                    <View style={Styles.titleContainer}>
                                        <TouchableOpacity onPress={onShowStartDatePicker}>
                                            <View pointerEvents="none">
                                                <TextInput
                                                    maxLength={30}
                                                    value={
                                                        displayStartDate?.length > 2
                                                            ? displayStartDate
                                                            : ""
                                                    }
                                                    placeholder={START_DATE_PLACEHOLDER}
                                                    editable={true}
                                                    fontWeight="bold"
                                                    fontStyle="normal"
                                                    underlineStyle={Styles.underlineStyle}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={END_DATE}
                                        />
                                    </View>
                                    <View style={Styles.titleContainer}>
                                        <TouchableOpacity onPress={onShowEndDatePicker}>
                                            <View pointerEvents="none">
                                                <TextInput
                                                    maxLength={30}
                                                    value={
                                                        displayEndDate?.length > 2
                                                            ? displayEndDate
                                                            : ""
                                                    }
                                                    placeholder={END_DATE_PLACEHOLEDER}
                                                    editable={true}
                                                    fontWeight="bold"
                                                    fontStyle="normal"
                                                    underlineStyle={Styles.underlineStyle}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={FREQUENCY}
                                        />
                                        <TouchableOpacity
                                            onPress={() => handleInfoPress(FREQUENCY)}
                                        >
                                            <Image
                                                style={Styles.infoIcon}
                                                source={Assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={Styles.contoryContainer}>
                                        <Dropdown
                                            title={selectedFrequency?.name ?? PLEASE_SELECT}
                                            disable={false}
                                            align="left"
                                            iconType={1}
                                            textLeft={true}
                                            borderWidth={0.5}
                                            onPress={_onFrequencyClick}
                                        />
                                    </View>
                                    <View style={Styles.descriptionContainerAmount}>
                                        <Typo
                                            fontSize={14}
                                            fontWeight="normal"
                                            fontStyle="normal"
                                            letterSpacing={0}
                                            lineHeight={19}
                                            color={BLACK}
                                            textAlign="left"
                                            text={LIMIT_PER_TRANSACTION}
                                        />
                                        <TouchableOpacity
                                            onPress={() => handleInfoPress(LIMIT_PER_TRANSACTION)}
                                        >
                                            <Image
                                                style={Styles.infoIcon}
                                                source={Assets.icInformation}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={Styles.mb20}>
                                        <TextInput
                                            importantForAutofill="no"
                                            editable={true}
                                            isValid={isAmtValidate}
                                            prefix="RM"
                                            isValidate
                                            value={textInputValue}
                                            errorMessage={amtInputErrorMessage}
                                            returnKeyType="done"
                                            keyboardType="numeric"
                                            onChangeText={_onLimitChange}
                                            maxLength={16}
                                            placeholder="0.00"
                                            underlineStyle={Styles.underlineStyle}
                                        />
                                    </View>
                                    <View>
                                        <View style={Styles.descriptionContainerAmount}>
                                            <Typo
                                                fontSize={14}
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                textAlign="left"
                                                color={BLACK}
                                                text={RECIPIENT_CAN_EDIT_AMOUNT}
                                            />
                                        </View>
                                        <View style={Styles.enableDuit}>
                                            <Switch
                                                value={{ active: recipientCanEditAmt }}
                                                onTogglePressed={() =>
                                                    onToggleRecipientAmt(!recipientCanEditAmt)
                                                }
                                                style={Styles.descriptionContainerAmount}
                                            />
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                textAlign="left"
                                                color={BLACK}
                                                text={recipientCanEditAmt ? YES : NO}
                                                style={Styles.toggleLabel}
                                            />
                                        </View>
                                        {soleProp && !isEmpty(paymentMethods) ? (
                                            <View style={Styles.mt10}>
                                                <Typo
                                                    text={PAYMENT_METHOD_PLACEHOLDER}
                                                    fontSize={14}
                                                    lineHeight={19}
                                                    textAlign="left"
                                                    style={Styles.mb10}
                                                />
                                                {paymentMethods?.map((value, index) => {
                                                    const { title, isSelected } = value;
                                                    return (
                                                        <View key={index} style={Styles.listItem}>
                                                            <RadioButton
                                                                {...props}
                                                                key={`radio-${index}`}
                                                                title={title}
                                                                isSelected={isSelected}
                                                                onRadioButtonPressed={() =>
                                                                    onPaymentMethodsPress(title)
                                                                }
                                                                fontSize={14}
                                                            />
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        ) : null}
                                        <View style={Styles.descriptionContainerAmount}>
                                            <Typo
                                                fontSize={14}
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                textAlign="left"
                                                color={BLACK}
                                                text={SET_EXPIRY_DATE}
                                            />
                                        </View>
                                        <View style={Styles.enableDuit}>
                                            <Switch
                                                value={{ active: expiryDate }}
                                                onTogglePressed={() =>
                                                    onToggleExpiryDate(!expiryDate)
                                                }
                                                style={Styles.descriptionContainerAmount}
                                            />
                                            <Typo
                                                fontSize={14}
                                                fontWeight="600"
                                                fontStyle="normal"
                                                letterSpacing={0}
                                                lineHeight={19}
                                                textAlign="left"
                                                color={BLACK}
                                                text={EXPIRY_DATE_IN_WEEK}
                                                style={Styles.toggleLabel}
                                            />
                                        </View>
                                    </View>
                                    <View style={Styles.footerButton}>
                                        <ActionButton
                                            disabled={disableActionBtn}
                                            fullWidth
                                            borderRadius={25}
                                            onPress={_coupledCheck}
                                            backgroundColor={disableActionBtn ? DISABLED : YELLOW}
                                            componentCenter={
                                                <Typo
                                                    color={BLACK}
                                                    text={NEXT_SMALL_CAPS}
                                                    fontSize={14}
                                                    fontWeight="600"
                                                    lineHeight={18}
                                                />
                                            }
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </React.Fragment>
            </ScreenLayout>
            {(!(soleProp && autoDebitEnabled) || showNumericKeypad) && (
                <NumericalKeyboard
                    value={`${amountValue}`}
                    onChangeText={changeText}
                    maxLength={amountLength}
                    onDone={doneClick}
                />
            )}
            <ScrollPickerView
                showMenu={productView}
                list={productList}
                selectedIndex={selectedProductIndex}
                onRightButtonPress={_onProductRightButtonPress}
                onLeftButtonPress={_onProductRightLeftButtonPress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <ScrollPickerView
                showMenu={frequencyView}
                list={frequencyList}
                selectedIndex={selectedFrequency?.index}
                onRightButtonPress={_onFrequencyRightButtonModePress}
                onLeftButtonPress={_onFrequencyLeftButtonModePress}
                rightButtonText={DONE}
                leftButtonText={CANCEL}
            />
            <DatePicker
                showDatePicker={showStartDatePicker}
                onCancelButtonPressed={hideStartDatePicker}
                onDoneButtonPressed={selectedStartDay}
                dateRangeStartDate={moment().add(1, "days").toDate()}
                dateRangeEndDate={moment().add(31, "days").toDate()}
                defaultSelectedDate={startDate}
            />
            <DatePicker
                showDatePicker={showEndDatePicker}
                onCancelButtonPressed={hideEndDatePicker}
                onDoneButtonPressed={selectedEndDay}
                dateRangeStartDate={moment(startDate).add(1, "days").toDate()}
                dateRangeEndDate={moment().add(defaultEndDate[0]?.mainNote1, "days").toDate()}
                defaultSelectedDate={minEndDate}
            />
            <Popup
                visible={showFrequencyInfo}
                title={infoTitle}
                description={infoMessage}
                onClose={handleInfoPress}
            />
        </ScreenContainer>
    );
}

AmountToggleScreen.propTypes = {
    getModel: PropTypes.func,
    resetModel: PropTypes.func,
    route: PropTypes.object,
    navigation: PropTypes.object,
};

const FLEX_START = "flex-start";
const Styles = {
    container: {
        flex: 1,
        alignItems: FLEX_START,
        paddingEnd: 38,
        paddingStart: 36,
        marginBottom: 60,
    },
    footerContainer: {
        flex: 1,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    descriptionContainerAmount: {
        paddingTop: 26,
        alignItems: "center",
        flexDirection: "row",
    },
    formEditableContainer: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 32,
        marginTop: 4,
        width: "100%",
    },
    radioButtonContainer: {
        flexDirection: "row",
        marginRight: 40,
        marginTop: 16,
    },
    radioButtonTitle: { marginLeft: 12 },
    amountViewTransfer: {
        flexDirection: "row",
        marginTop: 4,
        width: "100%",
    },
    enableDuit: {
        flexDirection: "row",
        justifyContent: FLEX_START,
        marginBottom: 8,
        marginTop: 20,
    },
    toggleLabel: {
        marginLeft: 4,
    },
    toggleContainer: {
        width: "100%",
    },
    containerInner: { flex: 1, width: "100%" },
    contoryContainer: {
        alignSelf: FLEX_START,
        marginTop: 10,
        paddingBottom: 5,
        width: "100%",
    },
    infoIcon: { height: 16, marginLeft: 10, width: 16 },
    lineConfirm: {
        backgroundColor: SWITCH_GREY,
        flexDirection: "row",
        height: 1,
        marginTop: 25,
    },
    underlineStyle: {
        borderBottomColor: GRAY,
    },
    mt10: {
        marginTop: 10,
    },
    mb10: {
        marginBottom: 10,
    },
    mb20: {
        marginBottom: 20,
    },
    listItem: {
        alignItems: FLEX_START,
        height: 36,
        justifyContent: "center",
        width: "100%",
    },
    footerButton: {
        marginTop: 16,
    },
};
export default AmountToggleScreen;
