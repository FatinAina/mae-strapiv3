// import Numeral from "numeral";
import React, { Component } from "react";

import { navigateToS2UCooling } from "@screens/OneTapAuth/CoolingNavigator";

import * as navigationConstant from "@navigation/navigationConstant";

import ScreenContainer from "@components/Containers/ScreenContainer";
import { showErrorToast, showInfoToast } from "@components/Toast";
import TransferEnterAmount from "@components/Transfers/TransferEnterAmount";

import { withModelContext } from "@context";

import { logEvent } from "@services/analytics";
import { callSecure2uValidateApi, inquiryJompay, inquiryJompayQr } from "@services/index";

import { MEDIUM_GREY } from "@constants/colors";
import {
    CURRENCY_CODE,
    ENTER_AMOUNT,
    FA_PAY_JOMPAY_AMT,
    FA_SCREEN_NAME,
    FA_VIEW_SCREEN,
    SECURE2U_IS_DOWN,
    FA_SCANPAY_JOMPAY_AMT,
    TRX_JOMPAY,
} from "@constants/strings";

import * as DataModel from "@utils/dataModel";
import {
    addSpaceAfter4Chars,
    checks2UFlow,
    addSlashesForBreakableSpecialCharacter,
} from "@utils/dataModel/utility";
import { secure2uCheckEligibility } from "@utils/secure2uCheckEligibility";

import Assets from "@assets";

("use strict");

class JomPayEnterAmount extends Component {
    static navigationOptions = { title: "", header: null };

    constructor(props) {
        console.log("JomPayEnterAmount: ", props.route.params);
        super(props);

        const billerName = props.route.params.extraInfo.billerName
            ? " - " + props.route.params.extraInfo.billerName
            : "";

        this.state = {
            amount:
                props.route.params?.extraInfo?.amount !== "0.00"
                    ? parseInt(props.route.params?.extraInfo?.amount)
                    : 0,
            amountText: "000",
            amountTextDisplay: "0.00",
            maxPaymentAmount: 999999,
            minPaymentAmount: 0.01,
            logoTitle: `${props.route.params.extraInfo.billerCode}${billerName}`,
            logoSubtitle: props.route.params.extraInfo.billRef1,
            logoImage: Assets.jompayLogo,
            errorMsg: "",
        };
    }

    async componentDidMount() {
        const isJomPayQR = this.props.route?.params?.extraInfo?.isJomPayQR;
        logEvent(FA_VIEW_SCREEN, {
            [FA_SCREEN_NAME]: isJomPayQR ? FA_SCANPAY_JOMPAY_AMT : FA_PAY_JOMPAY_AMT,
        });

        await DataModel._getDeviceInformation();

        this.focusSubscription = this.props.navigation.addListener("focus", () => {
            // this._virtualKeyboard.setValue(this.state.amountText);
        });

        this.blurSubscription = this.props.navigation.addListener("blur", () => {});
    }

    componentWillUnmount() {
        this.focusSubscription();
        this.blurSubscription();
    }

    onDoneClick = async (val) => {
        this.props.updateModel({
            ui: {
                showLoader: true,
            },
        });
        this.amount = val;
        // 2. enquiry ------------
        try {
            const params = {
                amount: val.toString(), //this.state.amountText,
                billerCode: this.props.route.params?.extraInfo?.billerCode,
                billRef1: this.props.route.params?.extraInfo?.billRef1,
                billRef2: addSlashesForBreakableSpecialCharacter(
                    this.props.route.params?.extraInfo?.billRef2 ?? ""
                ),
                fromAccountTypeInd: this.props.route?.params?.selectedAccount?.accountType
                    ? this.props.route.params?.selectedAccount?.accountType
                    : "D",
            };
            const inquiryJompayResult = this.props.route.params?.extraInfo?.isJomPayQR
                ? await inquiryJompayQr(params)
                : await inquiryJompay(params);

            const respone = inquiryJompayResult.data;
            if (respone.statusCode == "0000") {
                // for now is let, change to const after s2u support for Jompay is ready
                //passing new paramerter updateModel for s2u interops
                const { flow, secure2uValidateData } = await checks2UFlow(
                    17,
                    this.props.getModel,
                    this.props.updateModel,
                    TRX_JOMPAY
                );

                // Following code is disable, because jompay not support s2u at the moment
                if (!secure2uValidateData.s2u_enabled && !this.props.route.params.extraInfo.isFav) {
                    showInfoToast({ message: SECURE2U_IS_DOWN });
                }

                const nextParam = this.prepareNavParams();
                nextParam.extraInfo.secure2uValidateData = secure2uValidateData;
                nextParam.extraInfo.flow = flow;
                nextParam.billerInfo = respone;
                const {
                    navigation: { navigate },
                    route: { params },
                } = this.props;
                const s2uCheck = secure2uCheckEligibility(this.amount, secure2uValidateData);
                const screenParams =
                    flow === "S2UReg" || !secure2uValidateData.s2u_registered
                        ? {
                              screen: "Activate",
                              params: {
                                  flowParams: {
                                      success: {
                                          stack: navigationConstant.JOMPAY_MODULE,
                                          screen: navigationConstant.JOMPAY_CONFIRMATION_SCREEN,
                                      },
                                      fail: {
                                          stack: params?.extraInfo?.isJomPayQR
                                              ? navigationConstant.QR_STACK
                                              : navigationConstant.PAYBILLS_MODULE,
                                          screen: params?.extraInfo?.isJomPayQR
                                              ? navigationConstant.QRPAY_MAIN
                                              : navigationConstant.PAYBILLS_LANDING_SCREEN,
                                      },
                                      params: { ...nextParam, isFromS2uReg: true },
                                  },
                              },
                          }
                        : {
                              screen: navigationConstant.JOMPAY_CONFIRMATION_SCREEN,
                              params: { ...nextParam },
                          };
                if (!params.extraInfo?.isFav || (params.extraInfo?.isFav && s2uCheck)) {
                    if (
                        flow === navigationConstant.SECURE2U_COOLING ||
                        secure2uValidateData?.isUnderCoolDown
                    ) {
                        navigateToS2UCooling(navigate);
                    } else {
                        navigate(
                            flow === "S2UReg" || !secure2uValidateData.s2u_registered
                                ? navigationConstant.ONE_TAP_AUTH_MODULE
                                : navigationConstant.JOMPAY_MODULE,
                            screenParams
                        );
                    }
                } else {
                    navigate(navigationConstant.JOMPAY_MODULE, screenParams);
                }
            }
        } catch (err) {
            showErrorToast({
                message: `${err.message}`,
            });
        } finally {
            this.props.updateModel({
                ui: {
                    showLoader: false,
                },
            });
        }
    };

    // -----------------------
    // EVENT HANDLER
    // -----------------------

    onBackPress = () => {
        this.props.navigation.goBack();
    };

    // -----------------------
    // OTHERS
    // -----------------------

    prepareNavParams = () => {
        const navParam = { ...this.props.route.params };
        navParam.extraInfo.amount = this.amount;

        return navParam;
    };

    render() {
        const { logoTitle, logoSubtitle, logoDescription, logoImage } = this.state;
        const { extraInfo } = this.props.route.params;
        return (
            <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
                {extraInfo?.amount !== "0.00" ? (
                    <TransferEnterAmount
                        headerTitle="Pay Bills"
                        logoTitle={logoTitle}
                        logoSubtitle={addSpaceAfter4Chars(logoSubtitle)}
                        logoDescription={logoDescription}
                        amountTextDisplay={extraInfo?.amount ?? "0.00"}
                        amount={parseInt(extraInfo?.amount) ?? 0}
                        numericKeyboardVal={extraInfo?.amount ?? "0"}
                        isFirstTime={!extraInfo?.amount}
                        logoImage={{ type: "local", source: logoImage }}
                        instructionLabel={ENTER_AMOUNT}
                        amountPrefix={CURRENCY_CODE}
                        onDoneClick={this.onDoneClick}
                        onBackPress={this.onBackPress}
                    />
                ) : (
                    <TransferEnterAmount
                        headerTitle="Pay Bills"
                        logoTitle={logoTitle}
                        logoSubtitle={addSpaceAfter4Chars(logoSubtitle)}
                        logoDescription={logoDescription}
                        amount={0}
                        logoImage={{ type: "local", source: logoImage }}
                        instructionLabel={ENTER_AMOUNT}
                        amountPrefix={CURRENCY_CODE}
                        onDoneClick={this.onDoneClick}
                        onBackPress={this.onBackPress}
                    />
                )}
            </ScreenContainer>
        );
    }
}

//make this component available to the app
export default withModelContext(JomPayEnterAmount);
