"use client"

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { toast } from "react-toastify"
import "./VideoCallInterface.css"

const VideoCallInterface = forwardRef(({ roomId, participants, user, onEndCall }, ref) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [activeParticipants, setActiveParticipants] = useState([])

  const localVideoRef = useRef(null)
  const peerConnections = useRef({})
  const screenShareStream = useRef(null)
  const containerRef = useRef(null)

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    toggleMute: () => toggleMute(),
    toggleVideo: () => toggleVideo(),
    endCall: () => {
      stopLocalStream()
      onEndCall()
    },
  }))

  // Initialize WebRTC when component mounts
  useEffect(() => {
    initializeLocalStream()

    return () => {
      stopLocalStream()
      Object.values(peerConnections.current).forEach((pc) => pc.close())
    }
  }, [])

  // Update active participants when participants change
  useEffect(() => {
    setActiveParticipants(participants.filter((p) => p._id !== user._id))
  }, [participants, user._id])

  // Initialize local video stream
  const initializeLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize peer connections for each participant
      activeParticipants.forEach((participant) => {
        createPeerConnection(participant._id, stream)
      })

      toast.success("Kết nối video thành công!")
    } catch (error) {
      console.error("Error accessing media devices:", error)
      toast.error("Không thể truy cập camera hoặc microphone. Vui lòng kiểm tra quyền truy cập.")
    }
  }

  // Stop local stream
  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track) => track.stop())
      screenShareStream.current = null
    }
  }

  // Create peer connection for a participant
  const createPeerConnection = (participantId, stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    })

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream)
    })

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the other peer via signaling server
        // This would typically use your socket connection
      }
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [participantId]: event.streams[0],
      }))
    }

    peerConnections.current[participantId] = pc
    return pc
  }

  // Toggle mute/unmute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  // Toggle video on/off
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach((track) => track.stop())
      }

      // Restore camera video
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream
      }

      setIsScreenSharing(false)
    } else {
      try {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        screenShareStream.current = stream

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Handle when user stops screen sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
          }
          setIsScreenSharing(false)
        }

        setIsScreenSharing(true)
      } catch (error) {
        console.error("Error sharing screen:", error)
        toast.error("Không thể chia sẻ màn hình. Vui lòng thử lại.")
      }
    }
  }

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
        setIsFullScreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullScreen(false)
      }
    }
  }

  return (
    <div className="video-call-interface" ref={containerRef}>
      <div className="video-grid">
        {/* Local video */}
        <div className="video-container local-video">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <div className="video-label">
            {user.username} {isScreenSharing ? "(Đang chia sẻ màn hình)" : ""}
          </div>
        </div>

        {/* Remote videos */}
        {Object.entries(remoteStreams).map(([participantId, stream]) => {
          const participant = activeParticipants.find((p) => p._id === participantId)
          if (!participant) return null

          return (
            <div key={participantId} className="video-container remote-video">
              <video
                autoPlay
                playsInline
                ref={(videoEl) => {
                  if (videoEl && stream) {
                    videoEl.srcObject = stream
                  }
                }}
              />
              <div className="video-label">{participant.username}</div>
            </div>
          )
        })}
      </div>

      <div className="video-controls">
        <button
          className={`control-button ${isMuted ? "active" : ""}`}
          onClick={toggleMute}
          title={isMuted ? "Bật microphone" : "Tắt microphone"}
        >
          <i className={`fas ${isMuted ? "fa-microphone-slash" : "fa-microphone"}`}></i>
        </button>

        <button
          className={`control-button ${isVideoOff ? "active" : ""}`}
          onClick={toggleVideo}
          title={isVideoOff ? "Bật camera" : "Tắt camera"}
        >
          <i className={`fas ${isVideoOff ? "fa-video-slash" : "fa-video"}`}></i>
        </button>

        <button
          className={`control-button ${isScreenSharing ? "active" : ""}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Dừng chia sẻ màn hình" : "Chia sẻ màn hình"}
        >
          <i className="fas fa-desktop"></i>
        </button>

        <button
          className="control-button"
          onClick={toggleFullScreen}
          title={isFullScreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        >
          <i className={`fas ${isFullScreen ? "fa-compress" : "fa-expand"}`}></i>
        </button>

        <button className="control-button end-call" onClick={onEndCall} title="Kết thúc cuộc gọi">
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>
    </div>
  )
})

export default VideoCallInterface
