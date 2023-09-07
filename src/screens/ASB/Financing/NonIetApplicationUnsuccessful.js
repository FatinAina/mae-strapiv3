import moment from "moment";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { View, Image, StyleSheet, ScrollView, Dimensions } from "react-native";

import { DASHBOARD } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import ActionButton from "@components/Buttons/ActionButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import FixedActionContainer from "@components/Footers/FixedActionContainer";
import Popup from "@components/Popup";
import Typo from "@components/Text";

import { YELLOW, MEDIUM_GREY, APPROX_SUVA_GREY, WHITE } from "@constants/colors";
import {
    DATE,
    REFERENCE_NUMBER,
    APPLICATION_FALLED,
    PLZ_TRY_AGAIN,
    AUTHORISATION_ERROR,
    OOPS_SOMETHING_WENT_WRONG,
    DONE,
    BACK_TO_FINANCING,
    D_MMMM_YYYY,
    DD_MM_YYYY_1,
} from "@constants/strings";

import Assets from "@assets";

const screenHeight = Dimensions.get("window").height;

const NonIetApplicationUnsuccessfulScreen = ({ navigation, route }) => {
    const [showPopup, setShowPopup] = useState(false);
    function handleDone() {
        navigation.navigate(DASHBOARD);
    }
    function handleOkay() {
        setShowPopup(false);
    }
    const submitResponse = route.params?.submitResponse;
    return (
        <ScreenContainer backgroundType="color" backgroundColor={MEDIUM_GREY}>
            <ScreenLayout
                header={<HeaderLayout />}
                useSafeArea
                paddingHorizontal={0}
                paddingBottom={0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <View style={styles.statusPgImgBlockCls}>
                            <Image
                                resizeMode="contain"
                                style={styles.statusIcon}
                                source={Assets.icFailedIcon}
                                // icTickNew
                            />
                        </View>
                        <Typo
                            text={AUTHORISATION_ERROR}
                            fontSize={20}
                            lineHeight={20}
                            textAlign="left"
                            style={styles.title}
                        />
                        <Typo
                            text={OOPS_SOMETHING_WENT_WRONG}
                            lineHeight={20}
                            textAlign="left"
                            style={styles.subTitle}
                            color={APPROX_SUVA_GREY}
                        />
                        <View>
                            <React.Fragment>
                                <View style={styles.detailsRowContainer}>
                                    <Typo
                                        text={REFERENCE_NUMBER}
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.textRow}
                                    />
                                    <Typo
                                        text={submitResponse.requestMsgRefNo}
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="right"
                                        style={styles.textRow}
                                    />
                                </View>
                                <View style={styles.detailsRowContainer}>
                                    <Typo
                                        text={DATE}
                                        fontSize={12}
                                        lineHeight={18}
                                        textAlign="left"
                                        style={styles.textRow}
                                    />
                                    <Typo
                                        text={
                                            submitResponse?.msgBody?.trantime &&
                                            moment(
                                                submitResponse?.msgBody?.trantime,
                                                DD_MM_YYYY_1
                                            ).format(D_MMMM_YYYY)
                                        }
                                        fontSize={12}
                                        lineHeight={18}
                                        fontWeight="600"
                                        textAlign="right"
                                        style={styles.textRow}
                                    />
                                </View>
                            </React.Fragment>
                        </View>
                    </View>
                </ScrollView>
                <FixedActionContainer>
                    <View style={styles.bottomBtnContCls}>
                        <ActionButton
                            onPress={handleDone}
                            activeOpacity={0.5}
                            backgroundColor={WHITE}
                            fullWidth
                            componentCenter={
                                <Typo lineHeight={18} fontWeight="600" text={BACK_TO_FINANCING} />
                            }
                        />
                        <ActionButton
                            onPress={handleDone}
                            activeOpacity={0.5}
                            backgroundColor={YELLOW}
                            fullWidth
                            componentCenter={<Typo lineHeight={18} fontWeight="600" text={DONE} />}
                        />
                    </View>
                </FixedActionContainer>
            </ScreenLayout>
            <Popup
                visible={showPopup}
                onClose={handleOkay}
                title={APPLICATION_FALLED}
                description={PLZ_TRY_AGAIN}
                primaryAction={{
                    text: "Okay",
                    onPress: handleOkay,
                }}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    bottomBtnContCls: {
        flex: 1,
        justifyContent: "space-around",
    },

    container: {
        alignItems: "flex-start",
        flex: 1,
        justifyContent: "flex-start",
        marginHorizontal: 24,
        paddingBottom: 24,
    },
    detailsRowContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    statusIcon: {
        height: 56,
        width: 56,
    },
    statusPgImgBlockCls: {
        marginBottom: 25,
        marginTop: (screenHeight * 5) / 100,
        width: "100%",
    },

    textRow: {
        marginBottom: 15,
    },
    title: {
        marginBottom: 30,
    },
});

NonIetApplicationUnsuccessfulScreen.propTypes = {
    route: PropTypes.object,
    navigation: PropTypes.object,
};

export default React.memo(NonIetApplicationUnsuccessfulScreen);
