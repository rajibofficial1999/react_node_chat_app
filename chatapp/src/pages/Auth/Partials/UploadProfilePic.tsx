import FileInput from "@/components/FileInput";
import IconInput from "@/components/IconInput";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";

interface Props {
  setAvatar: React.Dispatch<React.SetStateAction<File | null>>;
  me: User;
}

const UploadProfilePic: React.FC<Props> = ({ setAvatar, me }) => {
  return (
    <div>
      <h1 className="mb-5 font-semibold text-xl">
        Upload your profile picture
      </h1>

      <div className="space-y-4">
        <div>
          <Label className="mb-2">Username</Label>
          <IconInput
            icon={User}
            disabled
            className="py-4 disabled:!border-gray-400"
            value={me.name}
          />
        </div>
        <div>
          <Label className="mb-2">Email address</Label>
          <IconInput
            icon={Mail}
            disabled
            className="py-4 disabled:!border-gray-400"
            value={me.email}
          />
        </div>
        <div>
          <FileInput
            onFileChange={(file) => setAvatar(file)}
            imageClassName="max-w-[150px]"
            accept=".png,.jpg,.jpeg,.webp"
            className="py-5"
            onRemove={() => setAvatar(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadProfilePic;
