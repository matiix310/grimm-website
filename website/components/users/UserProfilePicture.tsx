import { cn } from "@/lib/utils";
import Image from "next/image";

type UserProfilePictureProps = {
  src: string;
} & React.ComponentProps<"div">;

const UserProfilePicture = ({ src, className, ...rest }: UserProfilePictureProps) => {
  return (
    <div className={cn("relative", className)} {...rest}>
      <svg className="w-full aspect-square">
        <circle cx="50%" cy="50%" r="50%" fill="var(--primary)" />
      </svg>
      <div className="absolute top-[50%] -translate-y-[50%] right-[5%] rounded-full overflow-hidden aspect-square w-[80%]">
        <Image alt="Image de profil" src={src} fill={true} objectPosition="center" />
      </div>
    </div>
  );
};

export { UserProfilePicture };
