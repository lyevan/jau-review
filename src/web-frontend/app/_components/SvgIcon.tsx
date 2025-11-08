export type SvgIconId =
  | "icon-line-patient-default"
  | "icon-solid-patient-active"
  | "icon-line-doctor-default"
  | "icon-solid-doctor-active"
  | "icon-line-dashboard-default"
  | "icon-solid-dashboard-active"
  | "icon-line-calendar-default"
  | "icon-solid-calendar-active"
  | "icon-appointment-default"
  | "icon-appointment-active"
  | "icon-line-record-default"
  | "icon-solid-record-active"
  | "icon-line-expand"
  | "icon-line-collapse"
  | "icon-default-inventory"
  | "icon-default-shopping-cart"
  | "icon-default-analytics"
  | "icon-default-users"
  | "icon-line-image-active"
  | "icon-line-image-default"
  | "icon-line-file-default";

type SvgIconProps = {
  id: SvgIconId;
  width?: number;
  height?: number;
  className?: string;
};

const DEFAULT_WIDTH = 24;
const DEFAULT_HEIGHT = 24;

const SvgIcon: React.FC<SvgIconProps> = ({
  id,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className,
  ...props
}) => (
  <svg width={width} height={height} className={className} {...props}>
    <use href={`/sprite-icons.svg#${id}`} />
  </svg>
);

export default SvgIcon;
