import { useFocusEffect } from "@react-navigation/native";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";

import { AUTOBILLING_MERCHANT_DETAILS, AUTOBILLING_STACK } from "@navigation/navigationConstant";

import HeaderLayout from "@layouts/HeaderLayout";
import ScreenLayout from "@layouts/ScreenLayout";

import HeaderBackButton from "@components/Buttons/HeaderBackButton";
import ScreenContainer from "@components/Containers/ScreenContainer";
import ScreenLoader from "@components/Loaders/ScreenLoader";
import TabView from "@components/Specials/TabView";
import Typo from "@components/Text";
import { showErrorToast } from "@components/Toast";

import { withModelContext, useModelController } from "@context";

import { invokeL3, getFrequencyList } from "@services";
import { RTPanalytics } from "@services/analytics/rtpAnalyticsSSL";

import { MEDIUM_GREY } from "@constants/colors";
import * as Strings from "@constants/strings";

import BillStatusScreen from "./BillStatusScreen";

function AutoBillingDashboard({ navigation, route }) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const [updateData, setUpdateData] = useState(false);
    const [showInScreenLoaderModal, setShowInScreenLoaderModal] = useState(false);
    const [frequencyList, setFrequencyList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { getModel, updateModel } = useModelController();
    const tabName = activeTabIndex === 0 ? Strings.BILL_STATUS : Strings.FA_PAST;

    useEffect(() => {
        updateComponent();
        getFrequencyListAPI();
        updateModel({
            ui: {
                onCancelLogin: onCancel,
            },
        });
    }, []);
    useFocusEffect(
        useCallback(() => {
            const updateScreenData = route.params?.updateScreenData ?? null;
            if (updateScreenData) {
                _updateDataInChild();
            } else {
                setUpdateData(false);
            }
        }, [route.params?.updateScreenData])
    );

    async function updateComponent() {
        const { isPostPassword } = getModel("auth");
        if (!isPostPassword) {
            const httpResp = await invokeL3(true).catch(() => {});
            const code = httpResp?.data?.code ?? null;
            if (code !== 0) return null;
        }
    }

    async function getFrequencyListAPI() {
        try {
            setIsLoading(true);
            const { frequencyContext } = getModel("rpp");
            if (!frequencyContext?.apiCalled) {
                //if frequencyContext not in context, initiate api call
                const response = await getFrequencyList();
                const { list } = response?.data || {};
                if (list?.length > 0) {
                    const freqList = list.map((item, index) => {
                        return {
                            code: item?.sub_service_code,
                            name: item?.sub_service_name,
                            index,
                        };
                    });
                    updateModel({
                        rpp: {
                            frequencyContext: {
                                list: freqList,
                                apiCalled: true,
                            },
                        },
                    });
                    setFrequencyList(freqList);
                }
            } else {
                setFrequencyList(frequencyContext?.list);
            }
        } catch (error) {
            showErrorToast({ message: error?.message ?? Strings.COMMON_ERROR_MSG });
        } finally {
            setIsLoading(false);
        }
    }

    /***
     * _updateDataInChild
     *  update Data In Child
     */

    function _updateDataInChild() {
        setUpdateData(true);
    }

    /***
     * onCancel
     * On Close button click in Pin or Password model
     */
    function onCancel() {
        navigation.goBack();
    }

    /***
     * _onBackPress
     * Handle screen back button
     */
    function _onBackPress() {
        navigation.goBack();
    }

    /***
     * handleTabChange
     * Handle Tab View tab change
     */
    function handleTabChange(activeTabIndex) {
        setActiveTabIndex(activeTabIndex);
    }

    /***
     * _onPayRequestPress
     * On pay now button click from pop when request item click
     */
    function _onPayRequestPress(item) {}

    /***
     * _onShowIncomingRequestPopupPress
     * show incoming request show the pay now popup
     */
    function _onShowIncomingRequestPopupPress(title, item) {}

    /***
     * _onNotificationRequestReqId
     * on Notification Request ReqId
     */
    function _onNotificationRequestReqId(reqId) {
        setActiveTabIndex(reqId);
    }

    /***
     * _onRejectRequestPress
     * On Reject request from child called
     */
    function _onRejectRequestPress() {}

    /***
     * _onBillingButtonPress
     * On send money button click form pending and past tabs
     */
    function _onBillingButtonPress() {
        RTPanalytics.selectSetUpAB(tabName);

        navigation.navigate(AUTOBILLING_STACK, {
            screen: AUTOBILLING_MERCHANT_DETAILS,
            params: { ...route.params },
        });
    }
    /***
     * _onChargeCustomerPress
     * On send money button click form pending and past tabs
     */
    function _onChargeCustomerPress() {}

    /***
     * toggleShowInScreenLoaderModal
     * toggle in Screen Loader view based on param
     */
    function toggleShowInScreenLoaderModal(value) {
        setShowLoaderModal(value);
        setShowInScreenLoaderModal(value);
    }

    const { cus_type } = getModel("user");

    const childData = {
        cusType: cus_type,
    };

    const params = {
        activeTabIndex,
        navigation,
        route,
        childData,
        screenDate: route.params?.screenDate ?? null,
        frequencyList,
        onBillingButtonPress: _onBillingButtonPress,
        onChargeCustomerPress: _onChargeCustomerPress,
        onPayRequestPress: _onPayRequestPress,
        onRejectRequestPress: _onRejectRequestPress,
        onNotificationRequestReqId: _onNotificationRequestReqId,
        onShowIncomingRequestPopupPress: _onShowIncomingRequestPopupPress,
        updateDataInChild: _updateDataInChild,
        toggleLoader: toggleShowInScreenLoaderModal,
    };

    const screens = [Strings.BILL_STATUS.toUpperCase(), Strings.PAST].map((item, index) => {
        return (
            <BillStatusScreen
                key={index}
                index={parseInt(index)}
                updateData={updateData}
                {...params}
            />
        );
    });

    return (
        <React.Fragment>
            <ScreenContainer
                backgroundType="color"
                showOverlay={false}
                backgroundColor={MEDIUM_GREY}
                showLoaderModal={showLoaderModal}
            >
                <ScreenLayout
                    header={
                        <HeaderLayout
                            headerCenterElement={
                                <Typo
                                    fontSize={16}
                                    fontWeight="600"
                                    lineHeight={19}
                                    text={Strings.AUTO_BILLING}
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
                        {!isLoading && (
                            <TabView
                                defaultTabIndex={0}
                                activeTabIndex={activeTabIndex}
                                onTabChange={handleTabChange}
                                titles={[Strings.BILL_STATUS.toUpperCase(), Strings.PAST]}
                                screens={screens}
                            />
                        )}
                    </React.Fragment>
                </ScreenLayout>
                {showInScreenLoaderModal && <ScreenLoader showLoader />}
            </ScreenContainer>
        </React.Fragment>
    );
}

AutoBillingDashboard.propTypes = {
    navigation: PropTypes.shape({
        addListener: PropTypes.func,
        goBack: PropTypes.func,
        navigate: PropTypes.func,
    }),
    route: PropTypes.shape({
        params: PropTypes.shape({
            acctNo: PropTypes.any,
            activeTabIndex: PropTypes.number,
            cta: PropTypes.string,
            doneFlow: PropTypes.bool,
            prevData: PropTypes.any,
            refId: PropTypes.any,
            screenDate: PropTypes.any,
            subModule: PropTypes.string,
            transferParams: PropTypes.object,
            updateScreenData: PropTypes.any,
        }),
    }),
};
export default withModelContext(AutoBillingDashboard);
