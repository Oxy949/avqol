import { debug } from "./debug"

type RTCWorldSettings = {
    mode: AVSettings.AV_MODES
}

type RTCClientSettings = {
    audioSink: string
    audioSrc: string
    videoSrc: string
    voice: {
        mode: AVSettings.VOICE_MODES
    }
}

export type LivekitAVClient = AVClient & {
    _liveKitClient: {
        videoTrack: {
            sender: RTCRtpSender
        }
    }
}

type AVQOLClient = LivekitAVClient | SimplePeerAVClient

export const getRTCWorldSettings = () => {
    const settings = (game as Game).settings.get("core", "rtcWorldSettings");
    return settings as RTCWorldSettings
}

export const getRTCClientSettings = () => {
    const settings = (game as Game).settings.get("core", "rtcClientSettings");
    return settings as RTCClientSettings
}


export const getRTCClient = (): AVQOLClient => {
    // @ts-ignore
    return game.webrtc.client;
}

export const setRTCClientSettings = async (settings: RTCClientSettings) => {
    const currentSettings = (game as Game).settings.get("core", "rtcClientSettings");
    await (game as Game).settings.set("core", "rtcClientSettings", {
        ...currentSettings,
        ...settings,
        voice: {
            ...currentSettings.voice,
            ...settings.voice
        }
    });
}

export const avclientIsLivekit = (): boolean => {
    return (game as Game).modules.get("avclient-livekit")?.active ?? false;
}

export const cameraEffectsIsSupported = (): boolean => {
    return avclientIsLivekit();
}

export const updateLocalStream = async (stream: MediaStream) => {
    if (avclientIsLivekit()) {
        debug('Updating local stream with camera effects')
        const rtcClient = getRTCClient() as LivekitAVClient;
        debug(rtcClient._liveKitClient.videoTrack)
        if (rtcClient._liveKitClient.videoTrack?.sender) {
            rtcClient._liveKitClient.videoTrack.sender.replaceTrack(
                stream.getVideoTracks()[0]
            );
        }
    } else {
        // // @ts-ignore
        // const oldStream = this.localStream;
        // // @ts-ignore
        // rtcClient.localStream = effectStream;
        // // @ts-ignore
        // rtcClient.levelsStream = effectStream.clone()
        // // @ts-ignore
        // for ( let peer of rtcClient.peers.values() ) {
        //     if (peer.destroyed) continue;
        //     if (oldStream) peer.removeStream(oldStream);
        //     peer.addStream(effectStream);
        // }
        // rtcClient._liveKitClient.videoTrack.mediaStream = effectStream.clone();
        // rtcClient._liveKitClient.videoTrack.setDeviceId(deviceId)
        debug('Camera effects are not supported with this AV client.')
    }
};
