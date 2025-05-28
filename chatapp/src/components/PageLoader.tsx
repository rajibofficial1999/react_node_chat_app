import { Loader } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Loader className="size-6 animate-spin" />
    </div>
  );
};

export default PageLoader;
