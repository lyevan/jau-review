
import { Card } from "@radix-ui/themes";
import { LucideIcon } from "lucide-react";
import { CardHeader, CardTitle, CardContent } from "@/app/_components/ui/card";

interface Props {
  icon: LucideIcon;
  title?: string;
  details: string;
  contentTitle?: string;
  imageUrl?: string;
  titleHeaderClasses?: string;
  contentTitleClasses?: string;
  detailsClasses?: string;
  cardClasses?: string;
  iconClasses?: string;
  headerClasses?: string;
  cardContentClasses?: string;
}

const CardSection = ({
  icon,
  title,
  contentTitle,
  details,
  imageUrl,
  cardClasses,
  titleHeaderClasses,
  contentTitleClasses,
  detailsClasses,
  iconClasses,
  headerClasses,
  cardContentClasses,
}: Props) => {
  const Icon = icon;

  const newHeaderClass = imageUrl
    ? `bg-cover bg-center bg-no repeat w-full ${headerClasses}`
    : headerClasses;

  return (
    <Card className={`${cardClasses}`}>
      <CardHeader
        className={`${newHeaderClass}`}
        style={{ ...(imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}) }}
      >
        <Icon color="#35bdb6" className={`${iconClasses || ""}`} />

        <CardTitle className={`${titleHeaderClasses || ""} font-bold`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cardContentClasses || ""}>
        {contentTitle && (
          <h3 className={`${contentTitleClasses || ""} font-bold`}>{contentTitle}</h3>
        )}
        <p className={`${detailsClasses || ""}`}>{details}</p>
      </CardContent>
    </Card>
  );
};

export default CardSection;
