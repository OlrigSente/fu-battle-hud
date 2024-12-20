import { FubhConstants } from "../FubhConstants.js";

export class PlaylistHelper{
    static playlist;
    constructor(){

    }

    load(playlistId){
        if(!game.playlists || game.playlists.size === 0)
            return;

        if(playlistId === "nothing"){
            PlaylistHelper.playlist = undefined;
            return;
        }

        PlaylistHelper.playlist = game.playlists.get(playlistId);
    }

    play(){
        if(!PlaylistHelper.playlist)
            return;
        PlaylistHelper.playlist.playAll();
    }

    stop(){
        if(!PlaylistHelper.playlist)
            return;
        PlaylistHelper.playlist.stopAll();
    }

    getPlaylists(){
        const data = {};
        data.choices = {};
        data.choices["nothing"] = "none";

        if(game.playlists?._source){
            game.playlists._source.forEach(playlist => {
                data.choices[playlist._id] = playlist.name;
            });
        }
        
        return data;
    }
}