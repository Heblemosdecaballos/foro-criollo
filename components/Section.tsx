// components/Section.tsx
type Props = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};
export default function Section({ title, action, children, className = "" }: Props) {
  return (
    <section className={`section ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
