interface Props {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div>
      <h2 className="text-2xl font-black">{title}</h2>

      {subtitle && (
        <p className="mt-1 text-sm text-white/50">
          {subtitle}
        </p>
      )}
    </div>
  );
}