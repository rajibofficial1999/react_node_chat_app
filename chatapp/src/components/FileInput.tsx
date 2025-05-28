import { cn } from "@/lib/utils";
import { CloudUpload, X } from "lucide-react";
import { useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface Props extends React.HTMLAttributes<HTMLInputElement> {
  onFileChange: (file: File) => void;
  className?: string;
  imageClassName?: string;
  accept?: string;
  onRemove?: () => void;
}

const FileInput: React.FC<Props> = ({
  onFileChange,
  className,
  imageClassName,
  accept,
  onRemove,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<
    string | Buffer | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileChange(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      {previewImageUrl ? (
        <div
          className={cn(
            "relative group max-h-[300px] max-w-[200px] rounded-sm mt-5"
          )}
        >
          <LazyLoadImage
            alt="Preview"
            src={previewImageUrl as string}
            className={cn("w-full h-full rounded-sm", imageClassName)}
          />
          <button
            onClick={() => {
              onRemove && onRemove();
              setPreviewImageUrl(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="size-6 bg-destructive absolute -top-3 -right-3 rounded-full flex justify-center items-center cursor-pointer opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-300"
          >
            <X className="size-4 text-white" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file"
          className={cn(
            "bg-white text-slate-500 font-semibold text-base rounded flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto py-2 w-full",
            className
          )}
        >
          <CloudUpload className="text-gray-400 size-8" />
          Upload file
          <input
            type="file"
            id="file"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept={accept}
          />
          <p className="text-xs font-medium text-slate-400 mt-1">
            JPG, JPEG, PNG, and WEBP are Allowed.
          </p>
        </label>
      )}
    </>
  );
};

export default FileInput;
