import React, { Component } from "react";
import ReactNative, { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";

import { PAYBILLS_ENTER_AMOUNT, PAYBILLS_MODULE } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import HeaderCloseButton from "@components/Buttons/HeaderCloseButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import EmptyState from "@components/DefaultState/EmptyState";
import HeaderLabel from "@components/Label/HeaderLabel";
import Popup from "@components/Popup";
import Typo from "@components/Text";
// import TextInput from "@components/TextInput";
import TextInputWithLengthCheck from "@components/TextInputWithLengthCheck";
import { showInfoToast } from "@components/Toast";
import TransferImageAndDetails from "@components/Transfers/TransferImageAndDetails";

import { lhdnServiceCall } from "@services";
import { logEvent } from "@services/analytics";

import { YELLOW, MEDIUM_GREY, LIGHT_YELLOW, BLACK, LIGHT_BLACK } from "@constants/colors";
import {
    CONTINUE,
    FA_PAY_BILLERS_RECIPIENT_INFO,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    COMMON_ERROR_MSG,
    LHDN_BILLNO_SOLEPROP,
    LHDN_INVALID_BILL_NO,
    LHDN_DOWNTIME,
    LHDN_ID_EXPIRED,
    LHDN_NO_OUTSTANDING,
    LHDN_PAYEE_CODE,
    NETWORK_ERROR,
    LHDN_BILL_NO_ERROR,
} from "@constants/strings";

import { getShadow, openNativeContactPicker, formateCardNo } from "@utils/dataModel/utility";

import assets from "@assets";

class PayBillsPayeeDetails extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        super(props);
        this.state = this.getInitialState(props);
    }

    getInitialState = (props) => {
        const { billerInfo, requiredFields } = props?.route?.params || {};
        return {
            requiredFields:
                requiredFields.map((item) => {
                    item.isValid = true;
                    item.isValidate = false;
                    item.errorMessage = "";
                    return item;
                }) || [],
            billerName: billerInfo.fullName ? billerInfo.fullName : billerInfo.shortName,
            billerSubName: billerInfo.subName,
            image: billerInfo.imageUrl,
            lengthError: false,
            doneBtnEnabled: false,
            popupData: {
                isVisible: false,
                infoMessage: LHDN_BILLNO_SOLEPROP,
                infoTitle: "Bill no.",
                primaryAction: () => {
                    this.setState({
                        popupData: {
                            ...this.state?.popupData,
                            isVisible: false,
                        },
                    });
                },
            },
            emptyStateObject: {},
            isOffline: false,
        };
    };

    componentDidMount() {
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: FA_PAY_BILLERS_RECIPIENT_INFO,
        });
        this.focusSubscription = this.props.navigation.addListener("focus", () => {});
        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
        if (this.state.billerName === "MaybankHeart") {
            // go to next screen
            this.props.navigation.navigate(PAYBILLS_MODULE, {
                screen: PAYBILLS_ENTER_AMOUNT,
                params: this.prepareNavParams(),
            });
        }
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    // -----------------------
    // EVENT HANDLER
    // -----------------------
    doneClick = async () => {
        this.setState({ isOffline: false });
        const isValid = this.getRequiredFieldValidation();
        if (!isValid) {
            return;
        }

        if (this.props.route.params?.billerInfo?.payeeCode === "786") {
            await this.getBillPrnInfo(
                this.state.requiredFields[0]?.fieldValue?.replace(/[^0-9]/g, "")
            );
            return;
        }
        this.navigateToEnterAmount();
    };

    navigateToEnterAmount = (extraData, navParams) => {
        this.props.navigation.navigate(PAYBILLS_MODULE, {
            screen: PAYBILLS_ENTER_AMOUNT,
            params: { ...this.prepareNavParams(), confirmationDataArray: extraData, ...navParams },
        });
    };

    onChangeText = (item, index, text) => {
        if (this.isSpecialBiller()) {
            const bilPrnNo = text?.replace(/[^0-9]/g, "");
            if (/[^0-9a-zA-Z ]/?.test(text)) {
                item.isValid = false;
                item.isValidate = true;
                item.errorMessage =
                    "Please enter in digits only. This field must not contain any alphabets and/or special characters.";
                item.isValid = false;
            } else if (bilPrnNo?.length > 16) {
                item.isValid = false;
                item.isValidate = true;
                item.errorMessage =
                    "Invalid Bill no. Please make sure the number entered is correct.";
                item.isValid = false;
            } else {
                item.isValid = true;
                item.isValidate = false;
                item.errorMessage = "";
                item.isValid = true;
            }
            item.fieldValue = text?.replace(/[a-zA-Z]+/g, "");

            // item.fieldValue = removeSpecialChar(text);

            const requiredFields = this.state.requiredFields;
            requiredFields[index] = item;

            this.setState({
                requiredFields,
                doneBtnEnabled: !/[^0-9 ]/?.test(text) && bilPrnNo?.length === 16,
            });
            return;
        }

        this.changeText(item, index, text);
    };

    changeText = (item, index, text) => {
        item.fieldValue = text?.replace(/[^0-9 a-z A-Z .\-(),:_/]/g, "");
        // item.fieldValue = removeSpecialChar(text);

        const requiredFields = this.state.requiredFields;
        requiredFields[index] = item;

        this.setState({
            requiredFields,
            doneBtnEnabled: this.isAllRequirdFieldFillup(),
        });
    };

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    // -----------------------
    // GET UI
    // -----------------------

    getHeaderUI = () => {
        return (
            <HeaderLayout
                horizontalPaddingMode="custom"
                horizontalPaddingCustomLeftValue={24}
                horizontalPaddingCustomRightValue={24}
                headerLeftElement={<HeaderBackButton onPress={this.onBackPress} />}
                headerCenterElement={
                    <HeaderLabel>
                        <Text>Pay Bills</Text>
                    </HeaderLabel>
                }
            />
        );
    };

    isSpecialBiller = () => {
        return this.props.route.params?.billerInfo?.payeeCode === LHDN_PAYEE_CODE;
    };

    getRequiredField = (requiredFields) => {
        return requiredFields.map((item, index) => {
            const label = item.fieldLabel ? item.fieldLabel : item.alternateLabel; //"Bill Account Number";
            const isMobile = label.toLowerCase().indexOf("mobile") > -1;
            const prefix = isMobile ? "+60" : null;
            return (
                <View key={index} style={Styles.requiredField}>
                    <View>
                        <TextInputWithLengthCheck
                            label={label}
                            testID="paymentDetail"
                            accessibilityLabel="paymentDetail"
                            onChangeText={(text) => this.onChangeText(item, index, text)}
                            value={
                                this.isSpecialBiller()
                                    ? !/[^0-9 ]/?.test(item?.fieldValue)
                                        ? formateCardNo(item?.fieldValue)
                                        : item?.fieldValue
                                    : item?.fieldValue
                            }
                            autoFocus={!!(index === 0 && this.state.billerName !== "MaybankHeart")}
                            onFocus={(event) => {
                                this.scrollToInput(ReactNative.findNodeHandle(event.target));
                            }}
                            errorMessage={item.errorMessage}
                            isValid={item.isValid}
                            isValidate={item.isValidate}
                            prefix={prefix}
                            maxLength={index === 0 ? 30 : 20}
                            keyboardType="ascii-capable"
                            hasInfo={this.isSpecialBiller()}
                            placeholder={this.isSpecialBiller() ? "e.g. 8888 8888 8888 8888" : ""}
                            onPressInfoBtn={() => {
                                this.setState({
                                    popupData: {
                                        ...this.state.popupData,
                                        isVisible: !this.state.popupData?.isVisible,
                                    },
                                });
                            }}
                        />
                        {isMobile && (
                            <TouchableOpacity
                                style={Styles.contactIconContainer}
                                onPress={() => this.selectContact(index)}
                            >
                                <Image style={Styles.contactIcon} source={assets.icContactList} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        });
    };

    // -----------------------
    // OTHERS
    // -----------------------

    prepareNavParams = () => {
        const navParam = this.props?.route?.params || {};
        navParam.requiredFields = [...this.state.requiredFields];
        // no need this info for next screeb

        navParam.requiredFields = navParam.requiredFields.map((item) => {
            //
            const label = item.fieldLabel ? item.fieldLabel : item.alternateLabel; //"Bill Account Number";
            const isMobile = label.toLowerCase().indexOf("mobile") > -1;
            if (isMobile) {
                item.fieldValue = `60${item.fieldValue.replace(/[^A-Z0-9]/gi, "")}`; //item.fieldValue.replace(/[^A-Z0-9]/gi, "")
            }
            delete item.isValid;
            delete item.isValidate;
            delete item.errorMessage;
            return item;
        });

        return navParam;
    };

    scrollToInput = (reactNode) => {
        // Add a 'scroll' ref to your ScrollView
        // this.scroll.props.scrollToFocusedInput(reactNode);
    };

    getRequiredFieldValidation = () => {
        let isValid = true;
        const updatedRequiredFields = this.state.requiredFields.map((item) => {
            // reset
            item.isValid = true;
            item.isValidate = true;
            item.errorMessage = "";
            if (item.fieldValue.length < 3) {
                item.isValid = false;
                item.isValidate = true;
                item.errorMessage = "Please enter valid payment details";
                item.isValid = false;
            }
            if (/^[^0-9\ ]$/.test(item.fieldValue) && this.isSpecialBiller()) {
                item.isValid = false;
                item.isValidate = true;
                item.errorMessage =
                    "Please enter in digits only. This field must not contain any alphabets and/or special characters.";
                item.isValid = false;
            }

            return item;
        });

        this.setState({ requiredFields: updatedRequiredFields });
        return isValid;
    };

    isAllRequirdFieldFillup = () => {
        let isAllFillUp = true;
        this.state.requiredFields.forEach((item) => {
            if (item.fieldValue === "" || item.fieldValue === null) {
                isAllFillUp = false;
            }
        });

        return isAllFillUp;
    };

    selectContact = (itemIndex) => {
        const requiredFields = this.state.requiredFields;
        const item = requiredFields[itemIndex];
        openNativeContactPicker()
            .then((result) => {
                let phoneNumber = result.phoneNumber;
                let strCheck = phoneNumber.substring(0, 3);
                if (strCheck === "+60") {
                    phoneNumber = phoneNumber.substring(3);
                } else {
                    strCheck = phoneNumber.substring(0, 2);
                    if (strCheck === "60") {
                        phoneNumber = phoneNumber.substring(2);
                    } else {
                        strCheck = phoneNumber.substring(0, 1);
                        if (strCheck === "0") {
                            phoneNumber = phoneNumber.substring(1);
                        }
                    }
                }

                phoneNumber = phoneNumber.replace(/[^A-Z0-9]/gi, "");
                phoneNumber = `${phoneNumber.substring(0, 2)} ${phoneNumber.substring(
                    2,
                    6
                )} ${phoneNumber.substring(6)}`;

                item.fieldValue = phoneNumber;
                requiredFields[itemIndex] = item;
                this.setState({
                    requiredFields,
                    doneBtnEnabled: this.isAllRequirdFieldFillup(),
                });
                this.getRequiredFieldValidation();
            })
            .catch((err) => {
                item.errorMessage = err.message;
                item.isValid = false;
                item.isValidate = true;
                requiredFields[itemIndex] = item;
                this.setState({
                    requiredFields,
                });
            });
    };

    hidePopup = () => {
        this.setState({
            emptyStateObject: {
                bgImage: assets.noInternetBg,
                title: "No Internet Connection",
                subTitle: `It looks like you've lost your Internet\nconnection. Check your settings or try again.`,
                buttonLabel: "Try Again",
            },
        });
    };

    getBillPrnInfo = async (billNo) => {
        this.hidePopup();
        try {
            const response = await lhdnServiceCall({ billNo }, "/RT/PMT/LHDN/1.0/verifyBill");
            // const result = response?.data?.msServicesStatus[0]["MS1/v1/lhdn/verifyBill"];
            const result = response?.data;
            const errorMesages = {
                300: LHDN_INVALID_BILL_NO,
                301: LHDN_ID_EXPIRED,
                302: LHDN_NO_OUTSTANDING,
                304: LHDN_BILL_NO_ERROR,
            };
            if (
                result === null ||
                result?.responseStatus === "false" ||
                result?.status === 500 ||
                result?.status === 404
            ) {
                const errMsg =
                    result?.responseCode === "200" && parseFloat(result?.outAmt) <= 0.0
                        ? LHDN_NO_OUTSTANDING
                        : errorMesages[result?.responseCode] || LHDN_DOWNTIME;
                if (result?.responseCode === "300" || result?.responseCode === "301") {
                    const errorData = this.state.requiredFields;
                    errorData[0].errorMessage = errMsg;
                    errorData[0].isValid = false;
                    errorData[0].isValidate = true;
                    this.setState({ requiredFields: errorData, doneBtnEnabled: false });
                    return;
                }

                showInfoToast({ message: errMsg || result?.responseMsg || COMMON_ERROR_MSG });
                return;
            }

            this.navigateToEnterAmount(null, {
                allowEdit: result?.outInd === 1,
                expectedAmount: String(result?.outAmt),
                billerData: { ...result, billNo },
            });
        } catch (ex) {
            if (ex?.message === NETWORK_ERROR) {
                this.setState({
                    isOffline: true,
                    emptyStateObject: {
                        bgImage: assets.noInternetBg,
                        title: "No Internet Connection",
                        subTitle: `It looks like you've lost your Internet\nconnection. Check your settings or try again.`,
                        buttonLabel: "Try Again",
                    },
                });
                return;
            } else {
                showInfoToast({
                    message: ex?.status === 504 ? LHDN_DOWNTIME : COMMON_ERROR_MSG,
                });
            }
        } finally {
            this.hidePopup();
        }
    };

    render() {
        const image = {
            type: "url",
            source: this.state.image,
        };

        const { billerName, billerSubName, doneBtnEnabled, emptyStateObject, popupData } =
            this.state;

        const requiredFields = this.state.requiredFields;

        if (this.state.isOffline) {
            return (
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerRightElement={<HeaderCloseButton onPress={this.doneClick} />}
                        />
                    }
                    useSafeArea
                    neverForceInset={["bottom"]}
                    paddingHorizontal={0}
                    paddingBottom={0}
                >
                    <EmptyState
                        {...emptyStateObject}
                        isShowBg
                        onActionBtnClick={this.doneClick}
                        titleContainerStyle={Styles.noInternetContainer}
                        buttonContainerStyle={Styles.noInternetBtnContainer}
                        enableAnimation
                    />
                </ScreenLayout>
            );
        }

        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                <ScreenLayout header={this.getHeaderUI()} paddingTop={24}>
                    <View style={Styles.container}>
                        <ScrollView style={Styles.scrollView}>
                            <View style={Styles.billerInfo}>
                                <TransferImageAndDetails
                                    title={billerName}
                                    subtitle={billerSubName}
                                    image={image}
                                    additionalData={{ noStyleTitle: this.isSpecialBiller() }}
                                ></TransferImageAndDetails>
                            </View>
                            <View style={Styles.requiredFieldsContainer}>
                                {this.getRequiredField(requiredFields)}
                            </View>
                        </ScrollView>
                        <View style={Styles.footerContainer}>
                            <ActionButton
                                height={48}
                                fullWidth
                                backgroundColor={doneBtnEnabled ? YELLOW : LIGHT_YELLOW}
                                borderRadius={24}
                                componentCenter={
                                    <Typo
                                        fontSize={14}
                                        fontWeight="600"
                                        fontStyle="normal"
                                        letterSpacing={0}
                                        lineHeight={18}
                                        text={CONTINUE}
                                        color={doneBtnEnabled ? BLACK : LIGHT_BLACK}
                                    />
                                }
                                onPress={this.doneClick}
                                disabled={!doneBtnEnabled}
                            />
                        </View>
                    </View>
                </ScreenLayout>

                {popupData?.isVisible && (
                    <Popup
                        title={popupData?.infoTitle}
                        description={popupData?.infoMessage}
                        visible={popupData?.isVisible}
                        onClose={() => {
                            this.setState({
                                popupData: {
                                    ...this.state.popupData,
                                    isVisible: false,
                                },
                            });
                        }}
                    />
                )}
            </ScreenContainer>
        );
    }
}

export default PayBillsPayeeDetails;

const Styles = {
    container: {
        flex: 1,
        alignItems: "flex-start",
    },
    scrollView: {
        flex: 1,
    },
    footerContainer: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingTop: 20,
    },
    requiredField: {},
    requiredFieldsContainer: {
        width: "100%",
        paddingTop: 26,
    },
    titleContainer: {
        // borderWidth: 1, borderColor: "#ff0000"
    },
    inputContainer: { flexDirection: "row", paddingBottom: 36 },
    inputContainerWithError: { flexDirection: "row", paddingBottom: 0 },
    contactIconContainer: {
        position: "absolute",
        top: 55,
        right: 0,
        width: 20,
        height: 22,
    },
    contactIcon: {
        width: "100%",
        height: "100%",
    },

    billerInfo: {
        width: "100%",
        flexDirection: "row",
    },
    circleImageView: {
        width: 64,
        height: 64,
        borderRadius: 64 / 2,
        borderWidth: 2,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",

        ...getShadow({
            // color: "#000000",
            // height: 4, // IOS
            // width: 1, // IOS
            // shadowOpacity: 0.08, // IOS
            // shadowRadius: 2, // IOS
            elevation: 2, // android
        }),
    },
    billerInfoText: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
        flexDirection: "column",
    },
    noInternetContainer: {
        marginTop: "-30%",
        marginHorizontal: "-10%",
        justifyContent: "center",
    },
    noInternetBtnContainer: { marginTop: 30 },
};
