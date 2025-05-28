import { ShieldCheckIcon } from "lucide-react";

const FinalStep = () => {
  return (
    <div className="space-y-4">
      <ShieldCheckIcon className="size-12 text-primary" />
      <h1 className="font-bold text-2xl">All done!</h1>
      <p className="text-slate-500">
        Your account verification has been successfully completed.
      </p>
    </div>
  );
};

export default FinalStep;
