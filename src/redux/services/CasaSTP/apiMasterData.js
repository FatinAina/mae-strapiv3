import { fetchMasterDataServicePremier } from "@services/apiServicePremier";

import {
    MASTERDATA_LOADING,
    MASTERDATA_ERROR,
    MASTERDATA_SUCCESS,
} from "@redux/actions/services/masterDataAction";

export const getMasterDataPremier = () => {
    return async (dispatch) => {
        dispatch({ type: MASTERDATA_LOADING });

        try {
            const response = await fetchMasterDataServicePremier();
            console.log("[PM1][getMasterData] >> Success");

            const result = response?.result;

            const mergeDistrictWithStatesStructure = mergeDistrictWithStates(
                result?.mbbBranchState,
                result?.mbbBranchDistricts
            );

            const mergeBranchesWithDistrictsStructure = mergeBranchesWithDistricts(
                result?.mbbBranchDistricts,
                result?.mbbBranchList
            );

            const structuredStatesList = stateListWithKeyValuePair(result?.mbbBranchState);

            const branchStateDataStructure = {
                states: {
                    district: mergeDistrictWithStatesStructure,
                    states: mergeBranchesWithDistrictsStructure,
                },
                statesList: structuredStatesList,
            };
            const isDCCDataAvailable =
                result?.mbbBranchState && result?.mbbBranchDistricts && result?.mbbBranchList;
            if (result) {
                dispatch({
                    type: MASTERDATA_SUCCESS,
                    data: result,
                    branchStateData: isDCCDataAvailable
                        ? branchStateDataStructure
                        : isDCCDataAvailable,
                    branchStatesList: branchStatesScrollPickerData(
                        isDCCDataAvailable
                            ? structuredStatesList
                            : result?.branchStateData.statesList
                    ),
                    branchDistrictsList: isDCCDataAvailable
                        ? mergeDistrictWithStatesStructure
                        : result?.branchStateData.states.district,
                    branchList: isDCCDataAvailable
                        ? mergeBranchesWithDistrictsStructure
                        : result?.branchStateData.states.states,
                    countryOfBirth: result?.countryOfBirth,
                    crsStatus: result?.crsStatus,
                    employmentType: scrollPickerData(result?.employmentType),
                    estimatedMonthlyTxnAmount: result?.estimatedMonthlyTxnAmount,
                    estimatedMonthlyTxnVolume: result?.estimatedMonthlyTxnVolume,
                    fatcaCountryList: result?.fatcaCountryList,
                    fatcaStatus: result?.fatcaStatus,
                    financialObjective: scrollPickerData(result?.financialObjective),
                    gender: result?.gender,
                    icStateCode: result?.icStateCode,
                    icTypes: result?.icTypes,
                    incomeRange: scrollPickerData(result?.incomeRange),
                    maeResidentialCountry:
                        result?.maeResidentialCountry &&
                        scrollPickerData(result?.maeResidentialCountry),
                    permanentresidentcountry: result?.permanentresidentcountry,
                    purpose: scrollPickerData(result?.purpose),
                    occupation: scrollPickerData(result?.occupation),
                    race: scrollPickerData(result?.race),
                    residentialcountryforeigner: scrollPickerData(
                        result?.residentialcountryforeigner
                    ),
                    sector: scrollPickerData(result?.sector),
                    sourceOfFundCountry: result?.sourceOfFundCountry,
                    sourceOfFundOrigin: result?.sourceOfFundOrigin,
                    sourceOfWealthOrigin: result?.sourceOfWealthOrigin,
                    stateData: scrollPickerData(result?.stateData),
                    title: scrollPickerData(result?.title),
                    maeCitizenship:
                        result?.maeCitizenship && scrollPickerData(result?.maeCitizenship),
                    pm1ActivationAmountNTB: result?.pm1ActivationAmountNTB,
                    pmaActivationAmountNTB: result?.pmaActivationAmountNTB,
                    pm1ActivationAmountETB: result?.pm1ActivationAmountETB,
                    pmaActivationAmountETB: result?.pmaActivationAmountETB,
                    kawanKuActivationAmountETB: result?.kawanKuActivationAmountETB,
                    kawanKuActivationAmountNTB: result?.kawanKuActivationAmountNTB,
                    savingIActivationAmountETB: result?.savingIActivationAmountETB,
                    savingIActivationAmountNTB: result?.savingIActivationAmountNTB,
                    debitCardApplicationAmount: result?.debitCardApplicationAmount,
                    zestActivationAmountNTB: result?.zestActivationAmountNTB,
                    m2uPremierActivationAmountNTB: result?.m2uPremierActivationAmountNTB,
                    zestActivationAmountETB: result?.zestActivationAmountETB,
                    m2uPremierActivationAmountETB: result?.m2uPremierActivationAmountETB,
                    casaPageDescriptionValue: result?.casaPageDescriptionValue,
                });
            }
        } catch (error) {
            console.log("[PM1][getMasterData] >> Failure");
            dispatch({ type: MASTERDATA_ERROR, error });
        }
    };
};

const scrollPickerData = (data) => {
    return data.map((obj) => {
        const { display, value } = obj;
        return {
            name: display,
            value,
        };
    });
};

const branchStatesScrollPickerData = (data) => {
    return data.map((obj) => {
        const { stateId, stateName } = obj;
        return {
            name: stateName,
            value: stateId,
        };
    });
};

const stateListWithKeyValuePair = (states) => {
    let result = [];
    if (!states) {
        return [];
    }
    result = states.map((ele) => {
        return {
            stateId: ele.value.toUpperCase(),
            stateName: ele.value.toUpperCase(),
        };
    });
    return result;
};

const mergeDistrictWithStates = (states, districts) => {
    if (!states || !districts) {
        return [];
    }
    const resultObject = {};
    districts.forEach((district) => {
        const parentState = district.parent;
        const parentKey = parentState ? parentState.toUpperCase() : parentState; // Convert parent key to uppercase
        if (!resultObject[parentKey]) {
            resultObject[parentKey] = [];
        }
        resultObject[parentKey].push({ display: district.label, value: district.value });
    });
    states.forEach((state) => {
        const stateKey = state.value.toUpperCase(); // Convert state key to uppercase
        if (!resultObject[stateKey]) {
            resultObject[stateKey] = [];
        }
    });
    return resultObject;
};

function mergeBranchesWithDistricts(districts, branches) {
    const result = [];
    if (!districts || !branches) {
        return result;
    }
    districts.forEach((district) => {
        const districtName = district.value;
        const districtBranches = branches.filter(
            (branch) => branch.parent.toUpperCase() === district.label.toUpperCase()
        );

        const formattedDistrict = {
            [districtName]: districtBranches.map((branch) => ({
                branchCode: branch.value,
                address: branch.subLabel,
                district: district.parent,
                branchName: branch.label,
                branch: "Branch",
            })),
        };

        result.push(formattedDistrict);
    });

    return result;
}
