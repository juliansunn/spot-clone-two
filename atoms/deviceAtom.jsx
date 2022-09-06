import { atom } from "recoil";

export const currentDeviceState = atom({
    key: "currentDeviceState",
    default: {
        id: null,
        name: null,
        type: null
    },
});

export const myDevicesState = atom({
    key: "myDevicesState",
    default: null,
});
