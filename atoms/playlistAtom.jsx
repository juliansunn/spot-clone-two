import { atom } from "recoil";

export const playlistState = atom({
    key: "playlistState",
    default: null,
})

export const playlistsState = atom({
    key: "playlistsState",
    default: null,
})

export const playlistTrackState = atom({
    key: "playlistTrackState",
    default: null,
})

export const playlistTrackUrisState = atom({
    key: "playlistTrackUrisState",
    default: []
})

export const playlistIdState = atom({
    key: "playlistIdState",
    // default: '4LnTQT9pZuyXG96WS9RNzU'
    default: null
});
