interface AgencyHeaderProps {
  title: string;
  amount: string;
  color: string;
  borderColor: string;
}

const AgencyHeader = ({
  title,
  amount,
  color,
  borderColor,
}: AgencyHeaderProps) => {
  return (
    <div
      className={`p-4 border-b-8 ${borderColor} bg-white shadow-lg rounded-md`}
    >
      <div className="text-primary text-sm font-medium mb-1">{title}</div>
      <div className={`text-2xl font-semibold ${color}`}>{amount}</div>
    </div>
  );
};

export default AgencyHeader;
