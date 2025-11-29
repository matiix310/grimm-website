type MinecraftIconProps = React.ComponentProps<"svg">;

const MinecraftIcon = (props: MinecraftIconProps) => {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Minecraft icon</title>
      <path d="M20 24h-4v-4H8v4H4V12h4V8h8v4h4v12zM16 0h8v8h-8V0zM0 0h8v8H0V0z" />
    </svg>
  );
};

export default MinecraftIcon;
