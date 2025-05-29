import React, { createContext, useContext, useMemo } from "react";

interface IPeerContext {
  peer: RTCPeerConnection;
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (
    offer: RTCSessionDescriptionInit
  ) => Promise<RTCSessionDescriptionInit>;
  setRemoteAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
}

const PeerContext = createContext<IPeerContext | undefined>(undefined);

const PeerContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }),
    []
  );

  const createOffer = async (): Promise<RTCSessionDescriptionInit> => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer: RTCSessionDescriptionInit) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteAnswer = async (answer: RTCSessionDescriptionInit) => {
    await peer.setRemoteDescription(answer);
  };

  return (
    <PeerContext.Provider
      value={{ peer, createOffer, createAnswer, setRemoteAnswer }}
    >
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) {
    throw new Error("usePeer must be used within a PeerContextProvider");
  }
  return context;
};

export default PeerContextProvider;
