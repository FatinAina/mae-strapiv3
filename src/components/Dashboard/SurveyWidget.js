/* eslint-disable react-native/no-unused-styles */

/* eslint-disable react-native/sort-styles */
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useState, useEffect } from "react";

import {
    SURVEY_MODULE,
    SURVEY_SCREEN,
    ON_BOARDING_MODULE,
    ON_BOARDING_START,
} from "@navigation/navigationConstant";

import SurveyBanner from "@components/Survey/SurveyBanner";

import { withModelContext, useModelController } from "@context";

import { CXVOC, KEY_CEP_UNIT } from "@constants/data";

import TurboStorage from "@libs/TurboStorage";

function SurveyWidget() {
    const navigation = useNavigation();
    const { getModel } = useModelController();
    const { isOnboard } = getModel("user");
    const [data, setData] = useState(null);

    const getDataSurveyUser = useCallback(() => {
        try {
            const storageData = TurboStorage.getItem(KEY_CEP_UNIT);
            if (storageData) {
                const cepUnit = JSON.parse(storageData);
                setData(cepUnit?.[CXVOC]);
            }
        } catch {}
    }, []);
    useEffect(() => {
        getDataSurveyUser();
    }, []);

    function goToSurvey() {
        if (!isOnboard) {
            navigation.navigate(ON_BOARDING_MODULE, {
                screen: ON_BOARDING_START,
            });
        } else {
            navigation.navigate(SURVEY_MODULE, {
                screen: SURVEY_SCREEN,
            });
        }
    }

    if (isOnboard && data?.showBanner) {
        return <SurveyBanner onPress={goToSurvey} surveyData={data} getModel={getModel} />;
    }

    return null;
}

export default withModelContext(SurveyWidget);
