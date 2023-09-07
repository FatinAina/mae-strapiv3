import moment from "moment";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View, StyleSheet, Image, Dimensions } from "react-native";

import {
    DONATION_HISTORY_SCREEN,
    ETHICAL_CARD_STACK,
    DONATE_SCREEN,
} from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import SnapBanner from "@components/EthicalCardComponents/SnapBanner";
import SpaceFiller from "@components/Placeholders/SpaceFiller";
import ShimmerPlaceHolder from "@components/ShimmerPlaceholder";
import Typo from "@components/Text";
import { showErrorToast, showInfoToast } from "@components/Toast";

import { withModelContext } from "@context";

import { carbonOffsetHistoryAPI } from "@services";
import { callCloudApi } from "@services/ApiManagerCloud";

import {
    GREY,
    ROYAL_BLUE,
    SHADOW,
    WHITE,
    YELLOW,
    DARK_GREY,
    LIGHT_MINT,
    GREY_200,
    MEDIUM_GREY,
} from "@constants/colors";
import {
    MY_DONATION,
    VIEW_PROJECT,
    OFFSET_PROJECT_LIST_SUBHEADER,
    OFFSET_PROJECT_LIST_HEADER,
    CARBON_OFFSET,
    VIEW_ALL,
    COMMON_ERROR_MSG,
    DD_MMM_YYYY,
} from "@constants/strings";

import * as utility from "@utils/dataModel/utility";

import Assets from "@assets";

const CARD_WIDTH = Dimensions.get("window").width * 0.85;

const ProjectItem = ({ onPress, data }) => {
    const handleOnPress = () => {
        onPress(data);
    };
    return (
        <View style={styles.projectItemCard}>
            <View style={styles.projectItemCardInner}>
                {data?.image ? (
                    <Image source={{ uri: data?.image }} style={styles.projectItemFeatImg} />
                ) : (
                    <View
                        style={[
                            styles.projectItemFeatImg,
                            {
                                backgroundColor: GREY,
                            },
                        ]}
                    />
                )}
                <View style={styles.projectItemDescription}>
                    <Typo
                        fontWeight="600"
                        lineHeight={16}
                        text={data?.title}
                        textAlign="left"
                        numberOfLines={3}
                    />
                    <SpaceFiller height={20} />
                    <Typo
                        fontSize={12}
                        lineHeight={16}
                        text={data?.shortDesc}
                        textAlign="left"
                        numberOfLines={3}
                    />
                </View>
                <TouchableOpacity style={styles.projectButton} onPress={handleOnPress}>
                    <Typo text={VIEW_PROJECT} fontWeight="600" lineHeight={21} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

ProjectItem.propTypes = {
    onPress: PropTypes.func,
    data: PropTypes.object,
};

const ProjectLoader = () => {
    return (
        <View style={styles.projectItemCard}>
            <View style={styles.projectItemCardInner}>
                <View
                    style={[
                        styles.projectItemFeatImg,
                        {
                            backgroundColor: MEDIUM_GREY,
                        },
                    ]}
                />
                <View style={styles.promoLoadingContent}>
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                    <ShimmerPlaceHolder style={styles.loadingTitleFull} />
                </View>
            </View>
        </View>
    );
};

const CarbonOffsetScreen = ({ navigation, route, getModel }) => {
    const [state, setState] = useState({
        projectData: [],
        donationLatest: [], // latest 3 donation history
        donationData: [],
        totalCarbonFootprint: 0,
        isLoading: true,
    });

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const donationData = await getDonationData();
        const projectData = await getOffsetProjectData();

        setState({
            ...state,
            projectData,
            isLoading: false,
            ...donationData,
        });
    };

    const fetchMaybankHeartData = async (url) => {
        const headers = {
            "content-type": "application/json",
        };

        try {
            return await callCloudApi({
                uri: url,
                headers,
                method: "GET",
            });
        } catch (error) {
            console.log("fetch Maybank Heart Project", error);
        }
    };

    const getOffsetProjectData = async () => {
        try {
            const url = route?.params?.carbonOffsetProjectUrl;

            if (url) {
                const response = await fetchMaybankHeartData(url);
                const projectData = response?.data;
                if (projectData) {
                    if (Array.isArray(projectData)) {
                        return projectData;
                    } else return [projectData];
                } else {
                    return null;
                }
            } else {
                showErrorToast({ message: "Unable to retrieve URL" });
                return null;
            }
        } catch (err) {
            showErrorToast({ message: err.message ?? COMMON_ERROR_MSG });
            navigation.goBack();
        }
    };

    const getDonationData = async () => {
        try {
            const length = route?.params?.cardNo
                ? utility.getCardNoLength(route?.params?.cardNo)
                : 0;
            const cardNo = route?.params?.cardNo?.substring(0, length);
            const params = {
                cardNumber: cardNo,
                startDate: calculateEndDate(),
                endDate: null,
                source: "CREDIT",
                transactionType: "POSTED_DONATIONS",
            };
            const response = await carbonOffsetHistoryAPI(params);
            if (response?.data?.result) {
                const data = response?.data?.result?.data;
                const totalCarbonFootprint = response?.data?.result?.totalCarbonFootPrint;
                return {
                    donationData: data,
                    donationLatest: data?.slice(0, 3),
                    totalCarbonFootprint,
                };
            } else {
                return null;
            }
        } catch (err) {
            console.log("ERR", err);
            showInfoToast({ message: err.message ?? COMMON_ERROR_MSG });
        }
    };

    const getCalculatedMonth = (date) => {
        if (date.getMonth() >= 9) {
            return date.getMonth() + 1;
        } else {
            return "0" + (date.getMonth() + 1);
        }
    };

    const calculateEndDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return `${date.getFullYear()}${getCalculatedMonth(date)}${date.getDate()}`;
    };

    const navigateDonationHistoryScreen = () => {
        navigation.navigate(ETHICAL_CARD_STACK, {
            screen: DONATION_HISTORY_SCREEN,
            params: {
                donationData: state.donationData,
                totalCarbonFootprint: state.totalCarbonFootprint,
            },
        });
    };

    const navigateDonateScreen = (projectDetails) => {
        navigation.navigate(ETHICAL_CARD_STACK, {
            screen: DONATE_SCREEN,
            params: { ...route.params, projectDetails },
        });
    };

    const _renderProjectScrollview = () => {
        return (
            <>
                <View style={styles.projectHeaderContainer}>
                    <Typo
                        fontSize={16}
                        fontWeight="600"
                        lineHeight={20}
                        textAlign="left"
                        style={styles.paddingBottom10}
                        text={OFFSET_PROJECT_LIST_HEADER}
                    />
                    <Typo
                        fontSize={12}
                        lineHeight={16}
                        textAlign="left"
                        style={styles.paddingBottom10}
                        text={OFFSET_PROJECT_LIST_SUBHEADER}
                    />
                </View>
                <ScrollView contentContainerStyle={styles.projectListContainer}>
                    {state.isLoading ? (
                        <ProjectLoader />
                    ) : state.projectData ? (
                        state.projectData.map((data, index) => {
                            return (
                                <ProjectItem
                                    data={data}
                                    onPress={navigateDonateScreen}
                                    key={`${index}`}
                                />
                            );
                        })
                    ) : (
                        <></>
                    )}
                </ScrollView>
            </>
        );
    };

    const _renderDonationList = () => {
        function renderItem() {
            return state.donationLatest.map((item, index) => {
                return (
                    <View style={styles.donationBannerContainer} key={`key-${index}`}>
                        <View style={styles.donationBannerLeft}>
                            <Typo
                                fontWeight="600"
                                textAlign="left"
                                numberOfLines={2}
                                text={item.description}
                            />
                            <Typo
                                lineHeight={18}
                                textAlign="left"
                                style={styles.paddingBottom10}
                                text={`RM ${utility.commaAdder(
                                    Math.abs(item.amountLocal).toFixed(2)
                                )}`}
                            />
                            <Typo
                                fontSize={12}
                                lineHeight={18}
                                textAlign="left"
                                color={DARK_GREY}
                                text={`Contributed ${item.transactionDate}`}
                            />
                        </View>
                        <View style={styles.donationBannerRight}>
                            <Image source={Assets.carbonOffsetDonationImg} resizeMode="contain" />
                        </View>
                    </View>
                );
            });
        }
        return (
            <View style={styles.donationContainer}>
                <View style={styles.donationHeader}>
                    <Typo fontSize={16} fontWeight="600" lineHeight={18} text={MY_DONATION} />
                    <TouchableOpacity onPress={navigateDonationHistoryScreen}>
                        <Typo color={ROYAL_BLUE} fontWeight="600" lineHeight={18} text={VIEW_ALL} />
                    </TouchableOpacity>
                </View>
                <SnapBanner renderList={renderItem} cardWidth={CARD_WIDTH + 10} />
            </View>
        );
    };

    return (
        <ScreenContainer backgroundType="image" backgroundImage={Assets.carbonDashboardBg}>
            <ScreenLayout
                header={
                    <HeaderLayout
                        headerLeftElement={
                            <HeaderBackButton
                                onPress={() => {
                                    navigation.goBack();
                                }}
                            />
                        }
                        headerCenterElement={
                            <Typo
                                text={CARBON_OFFSET}
                                fontWeight="600"
                                fontSize={16}
                                lineHeight={19}
                            />
                        }
                    />
                }
                paddingHorizontal={0}
                paddingBottom={0}
                scrollable={true}
            >
                {state.donationLatest.length > 0 && _renderDonationList()}
                {_renderProjectScrollview()}
            </ScreenLayout>
        </ScreenContainer>
    );
};

CarbonOffsetScreen.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
    getModel: PropTypes.func,
};

const styles = StyleSheet.create({
    projectHeaderContainer: { marginHorizontal: 24 },
    projectItemCard: {
        backgroundColor: WHITE,
        borderRadius: 8,
        elevation: 8,
        height: 340,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    projectListContainer: {
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    projectItemCardInner: {
        flex: 1,
        justifyContent: "space-between",
        borderRadius: 8,
        overflow: "hidden",
    },
    projectItemDescription: {
        flex: 1,
        padding: 16,
    },
    projectItemFeatImg: { flex: 2 },
    donationContainer: {
        paddingBottom: 15,
        paddingTop: 20,
    },
    donationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    donationBannerContainer: {
        flexDirection: "row",
        backgroundColor: LIGHT_MINT,
        borderRadius: 8,
        elevation: 8,
        height: 100,
        width: CARD_WIDTH,
        shadowColor: SHADOW,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        marginRight: 10,
        marginVertical: 20,
    },
    donationBannerLeft: {
        flex: 2,
        paddingLeft: 20,
        justifyContent: "center",
    },
    donationBannerRight: {
        flex: 1,
        paddingRight: 20,
        overflow: "hidden",
    },
    projectButton: {
        backgroundColor: YELLOW,
        borderRadius: 25,
        height: 40,
        marginHorizontal: 16,
        marginBottom: 20,
        marginTop: 20,
        justifyContent: "center",
    },
    paddingBottom10: {
        paddingBottom: 10,
    },
    loadingTitleFull: {
        backgroundColor: GREY_200,
        borderRadius: 4,
        height: 8,
        marginBottom: 8,
        width: "100%",
    },
    promoLoadingContent: {
        padding: 20,
    },
});

export default withModelContext(CarbonOffsetScreen);
