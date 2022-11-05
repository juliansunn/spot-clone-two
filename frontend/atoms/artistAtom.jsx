import { atom } from "recoil";

export const artistsState = atom({
    key: "artistsState",
    default: [],
});

export const artistState = atom({
    key: "artistState",
    default: {},
});

export const artistIdState = atom({
    key: "artistIdState",
    default: null,
});

export const artistIdsState = atom({
    key: "artistIdsState",
    default: [],
});