import { atom } from "recoil";

export const albumsState = atom({
    key: "albumsState",
    default: [],
});

export const albumState = atom({
    key: "albumState",
    default: {},
});

export const albumIdState = atom({
    key: "albumIdState",
    default: null,
});

export const albumIdsState = atom({
    key: "albumIdsState",
    default: [],
});
