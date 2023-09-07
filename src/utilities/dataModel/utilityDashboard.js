import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";

import { DASHBOARD, MAYBANK2U, TAB, TAB_NAVIGATOR } from "@navigation/navigationConstant";
import navigationService from "@navigation/navigationService";

import { SERVER_DATE_FORMAT } from "@constants/strings";

const DashboardKey = "userDashboard";
const DashboardBannerDismissKey = "dashboardBannerDismissCount";
const DashboardBannerDateStartKey = "dashboardBannerDismissStart";
const DashboardBannerDateEndKey = "dashboardBannerDismissEnd";

export const AVAILABLE_DASHBOARDS = Object.freeze({
    HOME: DASHBOARD,
    ACCOUNTS: MAYBANK2U,
});

export const DEFAULT_DASHBOARD = AVAILABLE_DASHBOARDS.HOME;

export function getDefaultDashboard(getModel) {
    const { userDashboard } = getModel("dashboard");
    return userDashboard ?? DEFAULT_DASHBOARD;
}

export function navigateToUserDashboard(navigation, getModel, params) {
    const dashboard = getDefaultDashboard(getModel);

    navigation.navigate(TAB_NAVIGATOR, {
        screen: TAB,
        params: {
            screen: dashboard,
            params,
        },
    });
}

export function navigateToHomeDashboard(navigation, params) {
    const navObject = {
        screen: TAB,
        params: {
            screen: AVAILABLE_DASHBOARDS.HOME,
            params,
        },
    };

    if (navigation) {
        navigation.navigate(TAB_NAVIGATOR, navObject);
    } else {
        navigationService.navigate(TAB_NAVIGATOR, navObject);
    }
}

export function navigateToAccountsDashboard(navigation, params) {
    navigation.navigate(TAB_NAVIGATOR, {
        screen: TAB,
        params: {
            screen: AVAILABLE_DASHBOARDS.ACCOUNTS,
            params,
        },
    });
}

export async function setDefaultDashboard(updateModel, dashboard) {
    await AsyncStorage.setItem(DashboardKey, dashboard);
    updateModel({ dashboard: { userDashboard: dashboard } });
}

export async function shouldShowBanner(getModel) {
    const {
        dashboard: {
            multiDashboard: { bannerFrequency, bannerStart, bannerEnd },
        },
    } = getModel(["dashboard"]);

    const [dismissedCountStr, displayDateStartArr, displayDateEndArr] = await AsyncStorage.multiGet(
        [DashboardBannerDismissKey, DashboardBannerDateStartKey, DashboardBannerDateEndKey]
    );

    let displayDateStart = displayDateStartArr[1];
    let displayDateEnd = displayDateEndArr[1];
    let dismissedCount = dismissedCountStr[1];

    //If banner dates missing from config >> take as dismissed
    if (!bannerStart || !bannerEnd) {
        return false;
    }

    //If not set or items has been changed >> reset to new data
    if (
        !displayDateStart ||
        !displayDateEnd ||
        displayDateStart !== bannerStart ||
        displayDateEnd !== bannerEnd
    ) {
        displayDateStart = bannerStart;
        displayDateEnd = bannerEnd;
        dismissedCount = "0";

        await AsyncStorage.multiSet([
            [DashboardBannerDateStartKey, bannerStart],
            [DashboardBannerDateEndKey, bannerEnd],
            [DashboardBannerDismissKey, "0"],
        ]);
    }

    const date = new Date();
    const currentDate = moment(date, SERVER_DATE_FORMAT);
    const startDate = moment(displayDateStart, SERVER_DATE_FORMAT);
    const endDate = moment(displayDateEnd, SERVER_DATE_FORMAT);
    const isBetween = moment(currentDate).isBetween(startDate, endDate, "date", "[]");

    const count = dismissedCount ? parseInt(dismissedCount, 0) : 0;

    return isBetween && count < bannerFrequency;
}

export async function dismissDefaultBanner() {
    const dismissedCountStr = await AsyncStorage.getItem(DashboardBannerDismissKey);
    const dismissedCount = dismissedCountStr ? parseInt(dismissedCountStr, 0) + 1 : 1;

    await AsyncStorage.setItem(DashboardBannerDismissKey, dismissedCount.toString());
}

export function closeGeneralPopups(updateModel) {
    updateModel({
        ui: {
            ssoPopup: false,
            suspendOrLockedPopup: false,
            tagBlockPopup: false,
            rsaLockedPopup: false,
            deactivatedAccountPopup: false,
            generalErrorPopup: false,
            missingUsernamePopup: false,
            secureStorageFailedPopup: false,
        },
    });
}

export function massageWidgetData({ storedWidgets, defaultWidgets, sslReady }) {
    /**
     * 1. Get widgets from AS or use default. Unlike dashboard tile, dashboard widgets does not get stored in db.
     * 2. Previous widget has only 4 item.
     *      - old users with cached widgets, we manually add SSL to first item
     * 3. New users will use our defaultWidgets, which already consist of SSL
     */
    let widgets = JSON.parse(storedWidgets) ?? defaultWidgets;
    if (sslReady) {
        const item = widgets.find((obj) => obj.id === "samaSamaLokalWidget");
        if (!item) {
            widgets.unshift({
                id: "samaSamaLokalWidget",
                title: "Order Food & More",
            });
        }
    } else {
        const item = widgets.find((obj) => obj.id === "surveyingWidget");
        if (!item) {
            widgets.unshift({
                id: "surveyingWidget",
                title: "Survey",
            });
        } else {
            widgets = widgets.filter((action) => action.id !== "samaSamaLokalWidget");
        }
    }

    return widgets;
}
