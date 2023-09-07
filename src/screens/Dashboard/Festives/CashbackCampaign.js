import PropTypes from "prop-types";
import React, { useEffect } from "react";

import Common from "@screens/Wallet/QRPay/CashbackCampaign/Common";

import { OKAY } from "@constants/strings";

function CashbackCampaign({ navigation, route }) {
    const { isTapTasticReady, tapTasticType } = route.params?.params ?? route?.params;
    const { isSuccess, isSpecial, amount, displayPopup } = route?.params.data ?? "";

    function onDone() {
        // show the chances screen
        if (!isTapTasticReady && displayPopup) {
            navigation.replace("TabNavigator", {
                screen: "CampaignChancesEarned",
                params: {
                    isTapTasticReady,
                    tapTasticType,
                    chances: chance,
                },
            });
        } else {
            navigation.goBack();
        }
    }

    useEffect(() => {
        return () =>
            navigation.setParams({
                success: null,
                amount: null,
            });
    }, [navigation]);

    //Default Campaign temporary is latest cashback campaign which is Merdeka
    //Will try to improve and set default cashback screen (QrCashBackScreen.js) in here also
    return (
        <Common
            onButtonPressed={onDone}
            isSuccess={isSuccess === "true"}
            isSpecial={isSpecial === "true"}
            amount={amount}
            navigation={navigation}
            buttonText={OKAY}
        />
    );
}

CashbackCampaign.propTypes = {
    navigation: PropTypes.object,
    route: PropTypes.object,
};

export default CashbackCampaign;
