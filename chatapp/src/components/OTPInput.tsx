import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

interface Props {
  className?: string;
  onValueChange?: (value: string) => void;
  isDisabled?: boolean;
  clearCodes?: () => void;
}

interface FieldValues {
  [key: number]: number;
}

const OTPInput = forwardRef(
  ({ className, onValueChange, isDisabled }: Props, ref) => {
    const inputRefs = useRef<HTMLInputElement[]>([]);
    const [fieldValue, setFieldValue] = useState<FieldValues>({});

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const value = e.target.value;
      if (!/^\d$/.test(value)) return;

      e.target.value = value;

      // Move to next input if exists
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      if (index + 1 == inputRefs.current.length) {
        inputRefs.current[index].blur();
      }

      setFieldValue((prev) => ({ ...prev, [index]: Number(value) }));
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      if (e.key === "Backspace") {
        if (!e.currentTarget.value && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }

        setFieldValue((prev) => {
          delete prev[index];
          return { ...prev };
        });
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("Text")
        .replace(/\D/g, "")
        .slice(0, 6);
      if (!pastedData) return;

      for (let i = 0; i < pastedData.length; i++) {
        const ref = inputRefs.current[i];
        if (ref) {
          ref.value = pastedData[i];
          setFieldValue((prev) => ({ ...prev, [i]: Number(pastedData[i]) }));
        }
      }

      const nextRef = inputRefs.current[pastedData.length - 1];
      if (nextRef) {
        nextRef.focus();
      }

      if (pastedData.length - 1 === inputRefs.current.length - 1) {
        nextRef.blur();
      }
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        inputRefs.current.forEach((input) => {
          if (input) input.value = "";
        });

        setFieldValue({});
        inputRefs.current[0]?.focus();
      },
    }));

    useEffect(() => {
      if (Object.keys(fieldValue).length > 0) {
        const values = Object.values(fieldValue);
        onValueChange && onValueChange(values.join(""));
      }
    }, [fieldValue]);

    return (
      <div
        className={cn(
          "space-x-1.5 sm:space-x-4 md:space-x-1.5 flex items-center flex-wrap",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Input
              className="py-4 size-10 sm:size-12 md:size-10 xl:size-12 text-center text-xl"
              type="text"
              inputMode="numeric"
              disabled={isDisabled}
              maxLength={1}
              ref={(el) => {
                if (el) inputRefs.current[i] = el;
              }}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
            />
          </div>
        ))}
      </div>
    );
  }
);

export default OTPInput;
