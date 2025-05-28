import IconInput from "@/components/IconInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, User } from "lucide-react";
import { Link } from "react-router";

interface Props {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setTerms: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

const AddEmailForm: React.FC<Props> = ({
  email,
  setEmail,
  name,
  setName,
  setTerms,
  error,
  setError,
}) => {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!validEmail.test(e.target.value)) {
      setError("Invalid email address");
    } else {
      setError("");
    }

    setEmail(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <div>
      <h1 className="mb-5 font-semibold text-xl">Add new email address</h1>
      <div className="space-y-4">
        <div>
          <Label className="mb-2">Full name</Label>
          <IconInput
            icon={User}
            className="py-4"
            value={name}
            placeholder="Enter full name"
            onChange={handleNameChange}
          />
        </div>

        <div>
          <Label className="mb-2">Email address</Label>
          <IconInput
            icon={Mail}
            type="email"
            className="py-4"
            placeholder="Enter email address"
            value={email}
            onChange={handleEmailChange}
          />
          {error && (
            <div className="text-destructive text-sm mt-1">{error}</div>
          )}
        </div>
      </div>
      <div className="flex items-start gap-2 mt-8">
        <Checkbox
          id="terms"
          className="size-5"
          onCheckedChange={(value) => setTerms(Boolean(value))}
        />
        <Label htmlFor="terms" className="text-sm leading-none inline-block">
          <span className="">I agree to the</span>{" "}
          <Link className="underline text-primary" to="/">
            Terms and Conditions
          </Link>
          <span>
            . Learn about our Privacy Policy and our measures to keep your data
            safe and secure.
          </span>
        </Label>
      </div>
    </div>
  );
};

export default AddEmailForm;
