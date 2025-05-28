import { parseError } from "@/lib/utils";
import { Link } from "react-router";
import { buttonVariants } from "./ui/button";
import { MoveLeft } from "lucide-react";

interface Props {
  error: any;
}

const NotFound: React.FC<Props> = ({ error }) => {
  const parsedError = parseError(error);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-semibold text-gray-700">{error.status}</h1>
      <p className="text-gray-500">{parsedError}</p>
      <Link
        to="/chat"
        className={buttonVariants({
          variant: "outline",
          className: "border-gray-300",
        })}
      >
        <MoveLeft className="text-gray-500" />
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
