import { useNavigation, useRoute } from "@react-navigation/native";
import PropTypes from "prop-types";
import { useEffect } from "react";

import { ATM_AMOUNT_SCREEN, ATM_PREFERRED_AMOUNT } from "@navigation/navigationConstant";

import { withModelContext, useModelController } from "@context";

import { checkAtmOnboarding } from "@services";

const check24hrAvailability = async (atmCashOutReady) => {
    try {
        const response = await checkAtmOnboarding(true);
        if (response?.status === 200) {
            const isActive = response?.data?.result?.status === "ACTIVE";
            return {
                is24HrCompleted: atmCashOutReady && isActive,
            };
        }
    } catch (err) {
        console.log("dashboard -> checkAtmOnboarding -> ", err);
        return {
            is24HrCompleted: false,
            error: true,
        };
    }
};

const CheckRevampNavigation = (props) => {
    const { getModel } = useModelController();
    const { atmCashOutReady } = getModel("misc");
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        const callAsyncMethod = async () => {
            const twentyFourHoursFlag = await check24hrAvailability(atmCashOutReady);
            const screen = twentyFourHoursFlag.is24HrCompleted
                ? ATM_AMOUNT_SCREEN
                : ATM_PREFERRED_AMOUNT;
            navigation.replace(screen, {
                ...route.params,
                routeFrom: "Dashboard",
                is24HrCompleted: twentyFourHoursFlag.is24HrCompleted,
                preferredAmountList: [],
            });
        };
        callAsyncMethod();
    }, []);
    return null;
};

CheckRevampNavigation.propTypes = {
    route: PropTypes.any,
    navigation: PropTypes.any,
};

export default withModelContext(CheckRevampNavigation);
