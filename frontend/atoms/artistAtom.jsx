import { atom } from "recoil";

export const artistsState = atom({
    key: "artistsState",
    default: [],
});

export const artistIdState = atom({
    key: "artistIdState",
    default: null,
});

export const artistState = atom({
    key: "artistState",
    default: {},
});