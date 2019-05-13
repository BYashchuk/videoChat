import React, { Component } from "react";
import axios from "axios";
import Video from "twilio-video";

export default class VideoComponent extends Component {
    constructor(props) {
        super(props);
        this.activeRoom = null;
        this.previewTracks = null;
        this.identity = null;
        this.roomName = null;
        this.roomJoined = this.roomJoined.bind(this);
    }

    componentDidMount() {
        window.addEventListener("beforeunload", this.leaveRoomIfJoined);
        this.refs.buttonPreview.onclick = ()=> {
            var localTracksPromise = this.previewTracks
                ? Promise.resolve(this.previewTracks)
                : Video.createLocalTracks();

            localTracksPromise.then(
                (tracks)=> {
                    window.previewTracks = this.previewTracks = tracks;
                    var previewContainer = document.getElementById("local-media");
                    if (!previewContainer.querySelector("video")) {
                        this.attachTracks(tracks, previewContainer);
                    }
                },
                (error)=> {
                    this.log("Unable to access Camera and Microphon");
                }
            );
        };

        axios.get("/token").then(results => {
            this.identity = results.data.identity;
           
            this.refs.roomControls.style.display = "block";

            this.refs.buttonJoin.onclick = ()=>{
                this.roomName = this.refs.roomName.value;
                if (!this.roomName) {
                    alert("Please enter a room name.");
                    return;
                }

                this.log("Joining room '" + this.roomName + "'...");
                var connectOptions = {
                    name: this.roomName,
                    logLevel: "debug"
                };

                if (this.previewTracks) {
                    connectOptions.tracks = this.previewTracks;
                }

                Video.connect(results.data.token, connectOptions).then(this.roomJoined, (error)=> {
                    this.log("Could not connect to Twilio: " + error.message);
                });
            };

            this.refs.buttonLeave.onclick = ()=> {
                this.log("Leaving room...");
                this.activeRoom.disconnect();
            };
        });
    }

    attachTracks(tracks, container) {
        tracks.forEach((track)=> {
            container.appendChild(track.attach());
        });
    }

    attachParticipantTracks(participant, container) {
        var tracks = Array.from(participant.tracks.values());
        this.attachTracks(tracks, container);
    }
    

    detachTracks(tracks) {
        tracks.forEach((track)=> {
            track.detach().forEach((detachedElement)=> {
                detachedElement.remove();
            });
        });
    }

    detachParticipantTracks(participant) {
        var tracks = Array.from(participant.tracks.values());
        this.detachTracks(tracks);
    }

    log(message) {
        var logDiv = this.refs.log;
        logDiv.innerHTML += "<p>&gt;&nbsp;" + message + "</p>";
        logDiv.scrollTop = logDiv.scrollHeight;
    }


    roomJoined(room) {
        this.activeRoom = room;
        window.room = room.name;

        this.log("Joined as '" + this.identity + "'");
        this.refs.buttonJoin.style.display = "none";
        this.refs.buttonLeave.style.display = "inline";

        var previewContainer = this.refs.localMedia;
        if (!previewContainer.querySelector("video")) {
            this.attachParticipantTracks(room.localParticipant, previewContainer);
        }

        room.participants.forEach((participant)=> {
            this.log("Already in Room: '" + participant.identity + "'");
            var previewContainer = document.getElementById("remote-media");
            this.attachParticipantTracks(participant, previewContainer);
        });

        room.on("participantConnected", (participant)=> {
            this.log("Joining: '" + participant.identity + "'");
        });

        room.on("trackAdded", (track, participant)=> {
            this.log(participant.identity + " added track: " + track.kind);
            var previewContainer = document.getElementById("remote-media");
            this.attachTracks([track], previewContainer);
        });

        room.on("trackRemoved", (track, participant)=> {
            this.log(participant.identity + " removed track: " + track.kind);
            this.detachTracks([track]);
        });

        room.on("participantDisconnected", (participant)=> {
            this.log("Participant '" + participant.identity + "' left the room");
            this.detachParticipantTracks(participant);
        });

        room.on("disconnected", ()=> {
            this.log("Left");
            if (this.previewTracks) {
                this.previewTracks.forEach((track)=> {
                    track.stop();
                });
            }
            this.detachParticipantTracks(room.localParticipant);
            room.participants.forEach(this.detachParticipantTracks);
            this.activeRoom = null;
            this.refs.buttonJoin.style.display = "inline";
            document.getElementById("button-leave").style.display = "none";
        });
    }

    leaveRoomIfJoined() {
        if (this.activeRoom) {
            this.activeRoom.disconnect();
        }
    }

    render() {
        return (
            <div>
                <div id="remote-media"></div>
                <div id="controls">
                    <div id="preview">
                        <p className="instructions">Hello</p>
                        <div ref="localMedia" id="local-media"></div>
                        <button ref="buttonPreview" id="button-preview">Preview My Camera</button>
                    </div>
                    <div ref="roomControls">
                        <p className="instructions">Room Name:</p>
                        <input ref="roomName" id="room-name" type="text" placeholder="Enter a room name" />
                        <button ref="buttonJoin" id="button-join">Join Room</button>
                        <button ref="buttonLeave" id="button-leave">Leave Room</button>
                    </div>
                    <div ref="log" id="log"></div>
                </div>
            </div>
        );
    }
}