import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#15171C] group-[.toaster]:text-[#FAF8F5] group-[.toaster]:border group-[.toaster]:border-[#262932]",
          description: "group-[.toast]:text-[#9CA3AF]",
          actionButton: "group-[.toast]:bg-[#C9A227] group-[.toast]:text-[#0D0E11]",
          cancelButton: "group-[.toast]:bg-[#0D0E11] group-[.toast]:text-[#9CA3AF]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
