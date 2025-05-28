import TooltipWrapper from "@/components/TooltipWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useStore from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Volume1,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";

const VideoCalling = () => {
  const { chatId } = useParams();
  const { user } = useStore((state) => state);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isReceived, setIsReceived] = useState(true);
  const [isShareScreen, setIsShareScreen] = useState(false);

  const handleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const handleVolume = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleShareScreen = () => {
    setIsShareScreen(!isShareScreen);
  };

  const handleEndCall = () => {
    console.log("End call");
    setIsReceived(false);
  };

  const handleCancelCall = () => {
    console.log("cancel call");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative">
      {isReceived ? (
        <>
          <div className="w-full flex">
            <video className="h-full w-full rounded-lg object-cover" autoPlay>
              <source src="/assets/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* My video */}
          <div className="absolute top-1 left-1 right-0 max-w-sm">
            <video className="h-full w-full rounded-lg" autoPlay>
              <source src="/assets/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4">
          <Avatar className="size-32">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{user?.name}</h1>
          <p className="text-gray-600">Ringing...</p>
        </div>
      )}
      <div className="absolute left-0 bottom-10 w-full">
        <div className="flex justify-center items-center gap-2">
          <TooltipWrapper
            text={isSpeakerOn ? "Loudspeaker off" : "Loudspeaker on"}
          >
            <Button
              variant="outline"
              className={cn(
                "size-16 rounded-full cursor-pointer border-gray-200",
                { "bg-gray-100": isSpeakerOn }
              )}
              onClick={handleVolume}
            >
              {isSpeakerOn ? (
                <Volume2 className="size-6 text-gray-600" />
              ) : (
                <Volume1 className="size-6 text-gray-600" />
              )}
            </Button>
          </TooltipWrapper>
          <TooltipWrapper text={isMicOn ? "Mute" : "Unmute"}>
            <Button
              variant="outline"
              className={cn(
                "size-16 rounded-full cursor-pointer border-gray-200",
                { "bg-gray-100": !isMicOn }
              )}
              onClick={handleMic}
            >
              {isMicOn ? (
                <Mic className="size-6 text-gray-600" />
              ) : (
                <MicOff className="size-6 text-gray-600" />
              )}
            </Button>
          </TooltipWrapper>

          {isReceived ? (
            <>
              <TooltipWrapper
                text={isShareScreen ? "Stop sharing" : "Share screen"}
              >
                <Button
                  variant="outline"
                  className={cn(
                    "size-16 rounded-full cursor-pointer border-gray-200",
                    { "bg-gray-100": isShareScreen }
                  )}
                  onClick={handleShareScreen}
                >
                  {isShareScreen ? (
                    <ScreenShareOff className="size-6 text-gray-600" />
                  ) : (
                    <ScreenShare className="size-6 text-gray-600" />
                  )}
                </Button>
              </TooltipWrapper>
              <TooltipWrapper text="End call">
                <Button
                  onClick={handleEndCall}
                  className="size-16 rounded-full cursor-pointer bg-destructive/70 hover:bg-destructive/80"
                >
                  <PhoneOff className="size-6 text-white" />
                </Button>
              </TooltipWrapper>
            </>
          ) : (
            <TooltipWrapper text="Cancel call">
              <Button
                onClick={handleCancelCall}
                className="size-16 rounded-full cursor-pointer bg-destructive/70 hover:bg-destructive/80"
              >
                <PhoneOff className="size-6 text-white" />
              </Button>
            </TooltipWrapper>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCalling;
