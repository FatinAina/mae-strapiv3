// "use strict";
// const ReactNative = require("react-native");
// const GoogleAPIAvailability = ReactNative.NativeModules.ReactNativeGooglePlayServices;
// class RNGoogleAPIAvailability {
//     constructor() {}
//     checkGooglePlayServices(result) {
//         return GoogleAPIAvailability.checkGooglePlayServices(result);
//     }
// }
// module.exports = new RNGoogleAPIAvailability();
import { NativeModules } from "react-native";

const { ReactNativeGooglePlayServices } = NativeModules;

const RNGoogleAPIAvailability = {
    // checkGooglePlayServices: function (result) {
    //     return ReactNativeGooglePlayServices.checkGooglePlayServices(result);
    // },
    checkGooglePlayServices: function (callback) {
        const timeout = 4000;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`ReactNativeGooglePlayServices timeout ${timeout} ms`));
            }, timeout);

            ReactNativeGooglePlayServices.checkGooglePlayServices((message, error) => {
                callback && callback(message, error);

                if (error) {
                    clearTimeout(timer);
                    reject(error);
                } else {
                    clearTimeout(timer);
                    resolve(message);
                }
            });
        });
    },
};

export default RNGoogleAPIAvailability;
