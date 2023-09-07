import { fetchMasterDataService } from "@services/apiServiceZestCASA";

import {
    MASTERDATA_LOADING,
    MASTERDATA_ERROR,
    MASTERDATA_SUCCESS,
} from "@redux/actions/services/masterDataAction";

export const getMasterData = () => {
    return async (dispatch) => {
        dispatch({ type: MASTERDATA_LOADING });

        try {
            const response = await fetchMasterDataService();
            console.log("[ZestCASA][getMasterData] >> Success");
            const result = response.data.result;
            // console.log(result);
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
                const branchStateData = isDCCDataAvailable
                    ? branchStateDataStructure
                    : result.branchStateData;
                const branchStatesList = branchStatesScrollPickerData(
                    isDCCDataAvailable ? structuredStatesList : result.branchStateData.statesList
                );
                const branchDistrictsList = isDCCDataAvailable
                    ? mergeDistrictWithStatesStructure
                    : result.branchStateData.states.district;
                const branchList = isDCCDataAvailable
                    ? mergeBranchesWithDistrictsStructure
                    : result.branchStateData.states.states;
                const countryOfBirth = result.countryOfBirth;
                const crsStatus = result.crsStatus;
                const employmentType = scrollPickerData(result.employmentType);
                const estimatedMonthlyTxnAmount = result.estimatedMonthlyTxnAmount;
                const estimatedMonthlyTxnVolume = result.estimatedMonthlyTxnVolume;
                const fatcaCountryList = result.fatcaCountryList;
                const fatcaStatus = result.fatcaStatus;
                const financialObjective = scrollPickerData(result.financialObjective);
                const gender = result.gender;
                const icStateCode = result.icStateCode;
                const icTypes = result.icTypes;
                const incomeRange = scrollPickerData(result.incomeRange);
                const maeResidentialCountry = scrollPickerData(result.maeResidentialCountry);
                const permanentresidentcountry = result.permanentresidentcountry;
                const purpose = scrollPickerData(result.purpose);
                const occupation = scrollPickerData(result.occupation);
                const race = scrollPickerData(result.race);
                const residentialcountryforeigner = scrollPickerData(
                    result.residentialcountryforeigner
                );
                const sector = scrollPickerData(result.sector);
                const sourceOfFundCountry = result.sourceOfFundCountry;
                const sourceOfFundOrigin = result.sourceOfFundOrigin;
                const sourceOfWealthOrigin = result.sourceOfWealthOrigin;
                const stateData = scrollPickerData(result.stateData);
                const title = scrollPickerData(result.title);
                const maeCitizenship = scrollPickerData(result.maeCitizenship);
                const zestActivationAmountNTB = result.zestActivationAmountNTB;
                const m2uPremierActivationAmountNTB = result.m2uPremierActivationAmountNTB;
                const zestActivationAmountETB = result.zestActivationAmountETB;
                const m2uPremierActivationAmountETB = result.m2uPremierActivationAmountETB;

                dispatch({
                    type: MASTERDATA_SUCCESS,
                    data: result,
                    branchStateData,
                    branchStatesList,
                    branchDistrictsList,
                    branchList,
                    countryOfBirth,
                    crsStatus,
                    employmentType,
                    estimatedMonthlyTxnAmount,
                    estimatedMonthlyTxnVolume,
                    fatcaCountryList,
                    fatcaStatus,
                    financialObjective,
                    gender,
                    icStateCode,
                    icTypes,
                    incomeRange,
                    maeResidentialCountry,
                    permanentresidentcountry,
                    purpose,
                    occupation,
                    race,
                    residentialcountryforeigner,
                    sector,
                    sourceOfFundCountry,
                    sourceOfFundOrigin,
                    sourceOfWealthOrigin,
                    stateData,
                    title,
                    maeCitizenship,
                    zestActivationAmountNTB,
                    m2uPremierActivationAmountNTB,
                    zestActivationAmountETB,
                    m2uPremierActivationAmountETB,
                    debitCardApplicationAmount: result?.debitCardApplicationAmount,
                });
            }
        } catch (error) {
            console.log("[ZestCASA][getMasterData] >> Failure");
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
