// Account details actions

export const ACCOUNT_PURPOSE_ACTION = (accountPurposeIndex, accountPurposeValue) => ({
    accountPurposeIndex,
    accountPurposeValue,
});

export const BRANCH_STATE_ACTION = (branchStateIndex, branchStateValue) => ({
    branchStateIndex,
    branchStateValue,
});

export const BACKUP_DATA = (
    stateIndexBackup,
    stateValueBackup,
    districtIndexBackup,
    districtValueBackup,
    branchIndexBackup,
    branchValueBackup
) => ({
    stateIndexBackup,
    stateValueBackup,
    districtIndexBackup,
    districtValueBackup,
    branchIndexBackup,
    branchValueBackup,
});

export const BRANCH_DISTRICT_ACTION = (branchDistrictIndex, branchDistrictValue) => ({
    branchDistrictIndex,
    branchDistrictValue,
});

export const BRANCH_ACTION = (branchIndex, branchValue) => ({
    branchIndex,
    branchValue,
});

export const GET_BRANCH_DISTRICT_DROPDOWN_ITEMS_ACTION = (
    stateName,
    unfilteredDistrictDropdownItems
) => ({
    stateName,
    unfilteredDistrictDropdownItems,
});

export const GET_BRANCH_DROPDOWN_ITEMS_ACTION = (districtName, unfilteredBranchDropdownItems) => ({
    districtName,
    unfilteredBranchDropdownItems,
});

export const ACCOUNT_DETAILS_CONFIRMATION_ACTION = (isFromConfirmationScreenForAccountDetails) => ({
    isFromConfirmationScreenForAccountDetails,
});

export const ACCOUNT_DETAILS_CONTINUE_BUTTON_DISABLED_ACTION = () => ({});

export const BRANCH_DISTRICT_DROPDOWN_DISABLED_ACTION = () => ({});

export const BRANCH_DROPDOWN_DISABLED_ACTION = () => ({});

export const ACCOUNT_DETAILS_CLEAR = () => ({});

export const DISTRICT_CLEAR = () => ({});

export const BRANCH_CLEAR = () => ({});
