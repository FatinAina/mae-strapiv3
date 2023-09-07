import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
import DeviceInfo from "react-native-device-info";

import {
    DASHBOARD_STACK,
    GATEWAY_SCREEN,
    SEND_REQUEST_MONEY_STACK,
} from "@navigation/navigationConstant";

import DashboardCampaignWidget from "@components/Dashboard/campaign/DashboardCampaignWidget";
import useCampaignNotification from "@components/Dashboard/campaign/useCampaignNotification";

import { useModelController } from "@context";

import ApiManager from "@services/ApiManager";
import { callCloudApi } from "@services/ApiManagerCloud";

import { KEY_CEP_UNIT } from "@constants/data";
import { CAMPAIGN_BASED_ENDPOINT } from "@constants/url";

import TurboStorage from "@libs/TurboStorage";

const useFestive = () => {
    const { getModel, updateModel } = useModelController();
    const { isTapTasticReady, tapTasticType, campaignAssetsUrl } = getModel("misc");
    const { isEnabled: qrEnabled } = getModel("qrPay");
    const [festiveAssets, setFestiveAssets] = useState(null);
    const FESTIVE_ENDPOINT = `${campaignAssetsUrl}`;
    const { pushNotificationPrediction } = useCampaignNotification();

    const getConfig = useCallback(async () => {
        try {
            const campaignConfig = JSON.parse(TurboStorage.getItem("campaign_config"));
            if (campaignConfig?.campaignWebViewUrl) {
                updateModel({
                    misc: {
                        campaignWebViewUrl: campaignConfig.campaignWebViewUrl,
                    },
                });
                setFestiveAssets(campaignConfig);
            }
        } catch {}
    }, []);

    useEffect(() => {
        getConfig().catch(console.error);
    }, [getConfig]);

    const getImageUrl = (imagePath) => {
        return { uri: `${FESTIVE_ENDPOINT}/${imagePath}` };
    };

    const festiveModuleStack = () => {
        return {
            module: "GameStack",
            screen: "TapTrackWin",
        };
    };

    const getDashboardContent = (statusCheck) => {
        const status = pushNotificationPrediction();
        return festiveAssets?.dashboardstatus[statusCheck][`${statusCheck}${status}`];
    };

    const getSSLDashboardContent = (status) => {
        const title = festiveAssets?.ssl.sslTitle;
        const description = festiveAssets?.ssl.sslDescription;
        const buttonText = festiveAssets?.ssl.orderNow;
        return { title, description, buttonText };
    };

    const getPushNotificationContent = (isBoosterPeriod) => {
        const status = pushNotificationPrediction();
        const title = isBoosterPeriod
            ? festiveAssets?.pushNotification?.festive[`isBoosterFestive${status}`].title
            : festiveAssets?.pushNotification?.festive[`nonBooster${status}`].title;
        const desc = isBoosterPeriod
            ? festiveAssets?.pushNotification?.festive[`isBoosterFestive${status}`].description
            : festiveAssets?.pushNotification?.festive[`nonBooster${status}`].description;
        return { title, desc };
    };

    /*Campaign has Send Greeting feature*/
    function greetingNavigation(navigation, index) {
        if (index === 0) {
            navigation.navigate("QrStack", {
                screen: qrEnabled ? "QrMain" : "QrStart",
                params: {
                    primary: true,
                    settings: false,
                    fromRoute: "",
                    fromStack: "",
                    quickAction: true,
                },
            });
        } else if (index === 1) {
            navigation.navigate(SEND_REQUEST_MONEY_STACK, {
                screen: GATEWAY_SCREEN,
                params: {
                    action: "FESTIVE_SENDMONEY",
                    entryPoint: "festiveScreen",
                },
            });
        } else {
            navigation.navigate(DASHBOARD_STACK, {
                screen: "Dashboard",
                params: {
                    isTapTasticReady,
                    tapTasticType,
                    screen: "SendGreetingsContacts",
                    eDuitData: null,
                },
            });
        }
    }

    /*Campaign Widget Dashboard Navigation*/
    const festiveNavigation = (navigation, isRefresh = false) => {
        const { module, screen, params } = festiveModuleStack();
        navigation.navigate(module, {
            screen,
            params: { ...params, isRefresh },
        });
    };

    const festiveNavigationObject = festiveModuleStack();

    const getLottieAnimation = (imagePath) => {
        const uri = `${campaignAssetsUrl}/${imagePath}`;
        const asyncStorage = TurboStorage.getItem(uri);
        if (asyncStorage) {
            return JSON.parse(asyncStorage);
        }

        const headers = { "content-type": "application/json" };

        callCloudApi({ uri, headers, method: "GET" })
            .then((lottie) => {
                TurboStorage.setItem(uri, JSON.stringify(lottie));
                return lottie;
            })
            .catch(() => {
                return null;
            });
    };

    return {
        getImageUrl,
        festiveNavigation,
        greetingNavigation,
        festiveAssets,
        festiveNavigationObject,
        getDashboardContent,
        getSSLDashboardContent,
        getPushNotificationContent,
        getLottieAnimation,
        getMasterConfig,
        cacheConfig,
        fetchS3Config,
    };
};

export async function getMasterConfig(updateModel) {
    const currentVersion = DeviceInfo.getVersion();
    const campaignMasterEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/setting/${currentVersion}/masterConfig.json`;

    // Fetch latest Campaign Setting
    getCampaignSetting(campaignMasterEndpoint)
        .then(({ selectCampaign, contentVersion, cacheConfig = null, cepUnit }) => {
            if (selectCampaign && contentVersion) {
                const currentCampaign = `${selectCampaign}/${currentVersion}/${contentVersion}`;
                const festiveEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/${currentCampaign}`;
                TurboStorage.setItem(KEY_CEP_UNIT, JSON.stringify(cepUnit));
                updateModel({
                    misc: {
                        tapTasticType: selectCampaign,
                        campaignAssetsUrl: festiveEndpoint,
                        isTapTasticReady: true,
                        cacheConfigData: cacheConfig,
                        contentVersion: contentVersion,
                    },
                });
            }
        })
        .catch(() => {
            if (TurboStorage.getItem("current_campaign")) {
                const cacheMaster = TurboStorage.getItem("master_campaign");
                if (cacheMaster) {
                    const { selectCampaign, festiveEndpoint, cacheConfigData, contentVersion } =
                        JSON.parse(cacheMaster);
                    updateModel({
                        misc: {
                            tapTasticType: selectCampaign,
                            campaignAssetsUrl: festiveEndpoint.split("/config.json")[0],
                            isTapTasticReady: true,
                            cacheConfigData: cacheConfigData,
                            contentVersion: contentVersion,
                        },
                    });
                }
            }
            TurboStorage.getItem(KEY_CEP_UNIT);
        });
}

export async function cacheConfig(cacheConfigData) {
    const currentVersion = DeviceInfo.getVersion();
    if (cacheConfigData?.length > 0) {
        fetchConfig(
            "axiosCache",
            `${CAMPAIGN_BASED_ENDPOINT}/setting/${currentVersion}/${cacheConfigData}`
        );
    }
}

export async function fetchS3Config(getModel) {
    const { tapTasticType, cacheConfigData, contentVersion } = getModel("misc");
    const currentVersion = DeviceInfo.getVersion();
    const currentCampaign = `${tapTasticType}/${currentVersion}/${contentVersion}`;
    const festiveEndpoint = `${CAMPAIGN_BASED_ENDPOINT}/${currentCampaign}`;
    // Check if the current_campaign key not same version, it will invalidate the cache and fetech latest CampaignConfig ;)
    if (tapTasticType && contentVersion) {
        if (TurboStorage.resetStorage("current_campaign", currentCampaign)) {
            fetchConfig("campaign_config", `${festiveEndpoint}/config.json`).then(() => {
                TurboStorage.setItem(
                    "master_campaign",
                    JSON.stringify({
                        tapTasticType,
                        festiveEndpoint,
                        cacheConfigData,
                        contentVersion,
                    })
                );
            });
        }
    }
}

const fetchConfig = async (key, endpoint) => {
    const headers = {
        "content-type": "application/json",
        "cache-control": "no-cache",
    };

    try {
        const response = await callCloudApi({ uri: endpoint, headers, method: "GET" });
        TurboStorage.setItem(key, JSON.stringify(response)); //@syn
        ApiManager.resetCacheAdapterConfig();
        return response;
    } catch (error) {
        console.log("after response fetchConfig error", error);
    }
};

const getCampaignSetting = async (campaignMasterEndpoint) => {
    const headers = {
        "content-type": "application/json",
    };
    const CONFIG_URL = campaignMasterEndpoint; //calling the cloud api
    try {
        return await callCloudApi({ uri: CONFIG_URL, headers, method: "GET" });
    } catch (error) {
        console.log("after response campaign_master_config error", error);
    }
};

export function DashboardFestiveWidget({ tapTasticType, gameMetadata, isRefresh }) {
    return <DashboardCampaignWidget isRefresh={isRefresh} />;
}
DashboardFestiveWidget.propTypes = {
    tapTasticType: PropTypes.string,
    gameMetadata: PropTypes.object,
    isRefresh: PropTypes.bool,
};

export default useFestive;
