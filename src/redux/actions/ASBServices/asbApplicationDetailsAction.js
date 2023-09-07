export const ASB_APPLICAION_DEATAILS_LOADING = () => ({});

export const ASB_APPLICAION_DEATAILS_ERROR = (error) => ({
    error,
});

export const ASB_APPLICAION_DEATAILS_SUCCESS = (data, bodyList) => ({
    data,
    bodyList,
});

export const ASB_APPLICAION_DEATAILSP_CLEAR = () => ({});

export const ASB_APPLICAION_DATA_STORE_NOTIFICATION = (dataStoreValidation) => ({
    dataStoreValidation,
});

export const ASB_APPLICAION_DATA = (guarantorDataStore) => ({
    guarantorDataStore,
});
