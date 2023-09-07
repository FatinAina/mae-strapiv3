import Numeral from "numeral";
import PropTypes from "prop-types";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";

import {
    BANKINGV2_MODULE,
    COMMON_MODULE,
    PDF_VIEWER,
    ACCOUNT_DETAILS_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import CustomPdfGenerator from "@components/Common/CustomPdfGenerator";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Typo from "@components/Text";

import { FADE_GREY, GREY, MEDIUM_GREY, WHITE, YELLOW } from "@constants/colors";
import {
    AMOUNT,
    CARBON_OFFSET_SUCCESS_MSG,
    DATE_AND_TIME,
    DONE,
    FROM_ACCOUNT,
    RECEIPT_NOTE,
    REFERENCE_ID,
    SHARE_RECEIPT,
    SUCCESSFUL_STATUS,
    SUCC_STATUS,
    FAILED_STATUS,
    CARBON_OFFSET_RECEIPT_TITLE,
    CARBON_OFFSET,
    PROJECT_NAME,
    SHARERECEIPT,
} from "@constants/strings";

import { formatCreditCardNo } from "@utils/dataModel/utilityPartial.6";

import assets from "@assets";

const CarbonOffsetStatusScreen = ({ route, navigation }) => {
    const params = route?.params;
    const transferParams = params?.transferParams;
    const transferResponse = params?.transferResponse;

    const carbonOffsetAmount = transferParams?.carbonOffsetAmount;
    const cardDetails = transferParams?.cardDetails;
    const donationAmount = transferParams?.donationAmount;
    const status = transferResponse?.statusCode === "0" ? SUCC_STATUS : FAILED_STATUS;
    const formattedTransactionRefNumber = transferResponse?.formattedTransactionRefNumber;
    const statusDescription = transferResponse?.statusDescription;
    const serverDate = transferResponse?.serverDate;

    const descriptionMsg =
        status === SUCC_STATUS
            ? CARBON_OFFSET_SUCCESS_MSG
            : transferResponse?.additionalStatusDescription;

    const acknowledgementDetails = [
        ...(formattedTransactionRefNumber
            ? [{ key: REFERENCE_ID, value: formattedTransactionRefNumber }]
            : []),
        {
            key: DATE_AND_TIME,
            value: serverDate,
        },
    ];

    const handleOnDone = () => {
        navigation.navigate(BANKINGV2_MODULE, {
            screen: ACCOUNT_DETAILS_SCREEN,
        });
    };

    const onShareReceipt = async () => {
        const receiptTitle = CARBON_OFFSET_RECEIPT_TITLE;
        const formattedCardNo = formatCreditCardNo(cardDetails?.cardNo);

        const detailsArray = [
            {
                label: REFERENCE_ID,
                value: formattedTransactionRefNumber, //Reference ID
                showRightText: true,
                rightTextType: "text",
                rightStatusType: "",
                rightText: serverDate, //ServerDate
            },
            {
                label: PROJECT_NAME,
                value: params?.projectName,
                showRightText: false,
            },
            {
                label: CARBON_OFFSET,
                value: `${carbonOffsetAmount.toFixed(2)} Kg CO₂`,
                showRightText: false,
            },
            {
                label: FROM_ACCOUNT,
                value: `${cardDetails?.cardHolderName}\n${formattedCardNo}`,
                showRightText: false,
            },
            {
                label: AMOUNT,
                value: `RM ${Numeral(donationAmount).format("0,0.00")}`,
                showRightText: false,
                rightTextType: "status",
                rightText: SUCC_STATUS,
                isAmount: true,
            },
        ];

        try {
            // Call custom method to generate PDF
            const file = await CustomPdfGenerator.generateReceipt(
                true,
                receiptTitle,
                true,
                RECEIPT_NOTE,
                detailsArray,
                true,
                SUCC_STATUS,
                SUCCESSFUL_STATUS
            );

            if (file === null) {
                Alert.alert("Please allow permission");
                return;
            }

            const navParams = {
                file,
                share: true,
                type: "file",
                pdfType: SHARERECEIPT,
                title: SHARE_RECEIPT,
            };

            navigation.navigate(COMMON_MODULE, {
                screen: PDF_VIEWER,
                params: navParams,
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={<HeaderLayout />}
                paddingHorizontal={0}
                paddingBottom={0}
                paddingTop={0}
                useSafeArea
            >
                <React.Fragment>
                    <ScrollView style={styles.mainContainer}>
                        {/* Image Block */}
                        <View style={styles.statusImage}>
                            <Image
                                resizeMode="contain"
                                style={styles.statusIconCls}
                                source={
                                    status === FAILED_STATUS
                                        ? assets.icFailedIcon
                                        : assets.icTickNew
                                }
                            />
                        </View>

                        {/* Desc */}
                        <Typo
                            fontSize={20}
                            fontWeight="300"
                            lineHeight={28}
                            textAlign="left"
                            text={statusDescription}
                            style={styles.descCls}
                        />

                        {/* Server Error */}
                        <Typo
                            fontSize={12}
                            textAlign="left"
                            color={FADE_GREY}
                            lineHeight={18}
                            text={descriptionMsg}
                        />

                        {acknowledgementDetails && (
                            <View style={styles.detailsView}>
                                {acknowledgementDetails.map((item, index) => {
                                    return (
                                        <View style={styles.detailsBlock} key={`${index}`}>
                                            <Typo fontSize={12} lineHeight={18} text={item.key} />

                                            <Typo
                                                fontSize={12}
                                                fontWeight="600"
                                                lineHeight={18}
                                                text={item.value}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>

                    {/* Bottom docked button container */}
                    <FixedActionContainer>
                        <View style={styles.bottomBtn}>
                            {status === SUCC_STATUS && (
                                <ActionButton
                                    height={48}
                                    fullWidth
                                    borderRadius={24}
                                    borderColor={GREY}
                                    borderWidth={1}
                                    backgroundColor={WHITE}
                                    disabled={false}
                                    isLoading={false}
                                    componentCenter={
                                        <Typo
                                            fontWeight="600"
                                            lineHeight={18}
                                            text={SHARE_RECEIPT}
                                        />
                                    }
                                    onPress={onShareReceipt}
                                    style={styles.statusButton}
                                />
                            )}

                            <ActionButton
                                height={48}
                                fullWidth
                                borderRadius={24}
                                backgroundColor={YELLOW}
                                componentCenter={
                                    <Typo fontWeight="600" lineHeight={18} text={DONE} />
                                }
                                onPress={handleOnDone}
                            />
                        </View>
                    </FixedActionContainer>
                </React.Fragment>
            </ScreenLayout>
        </ScreenContainer>
    );
};

CarbonOffsetStatusScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

const styles = StyleSheet.create({
    bottomBtn: {
        width: "100%",
    },

    detailsBlock: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        marginTop: 10,
        width: "100%",
    },

    detailsView: {
        marginTop: 30,
    },

    mainContainer: {
        paddingHorizontal: 36,
    },

    statusButton: {
        marginBottom: 15,
    },

    statusIconCls: {
        height: 52,
        width: 57,
    },

    statusImage: {
        marginBottom: 25,
        marginTop: 50,
        width: "100%",
    },
});

export default CarbonOffsetStatusScreen;
