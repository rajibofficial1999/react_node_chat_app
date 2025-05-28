import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useMediaQuery } from "@/hooks/media-query";
import { cn } from "@/lib/utils";
import { Drawer } from "vaul";

interface ModalProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  children?: React.ReactNode;
  preventDefaultClose?: boolean;
  preventMobileModal?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  className,
  isOpen,
  setIsOpen,
  onClose,
  children,
  preventDefaultClose = false,
  preventMobileModal = false,
}) => {
  const closeModal = () => {
    if (preventDefaultClose) {
      return;
    }
    onClose && onClose();

    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const { isMobile } = useMediaQuery();

  if (isMobile && !preventMobileModal) {
    return (
      <Drawer.Root
        open={setIsOpen ? isOpen : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <Drawer.Overlay className="fixed inset-0 z-40 bg-gray-100 bg-opacity-10 backdrop-blur" />
        <Drawer.Portal>
          <Drawer.Content
            className={cn(
              "fixed !max-w-none bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t border-gray-200 bg-white pt-4 pb-8",
              className
            )}
          >
            <Drawer.Title className="sr-only">Title</Drawer.Title>
            <Drawer.Description className="sr-only">
              Description
            </Drawer.Description>
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="my-3 h-1 w-12 rounded-full bg-gray-300" />
            </div>

            <div className="mt-2 px-5">{children}</div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogContent
        className={cn("border-0", className, {
          "[&>button]:hidden": preventDefaultClose,
        })}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">DialogTitle</DialogTitle>
          <DialogDescription className="sr-only">
            DialogDescription
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
