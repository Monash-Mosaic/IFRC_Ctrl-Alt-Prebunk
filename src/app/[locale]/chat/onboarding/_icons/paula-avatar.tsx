type PaulaAvatarProps = {
  width?: number | string;
  height?: number | string;
  fill?: string;
};

export default function PaulaAvatar({ width = 56, height = 61, fill = 'none' }: PaulaAvatarProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 56 61" fill={fill} aria-hidden="true">
      <image href="/images/example/paula-avatar.webp" width="56" height="61" />
    </svg>
  );
}
