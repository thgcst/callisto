import clsx from "clsx";

import { useApproveCompany } from "@/swr/company";

type ApproveCompanyButtonProps = {
  companyId: string;
  size?: "sm" | "md";
  onApprove?: () => void;
};

const ApproveCompanyButton: React.FC<ApproveCompanyButtonProps> = ({
  companyId,
  size = "md",
  onApprove,
}) => {
  const { approveCompany, loading } = useApproveCompany();
  return (
    <button
      type="button"
      className={clsx(
        "rounded-md bg-green-600 text-sm font-semibold text-white duration-100 ease-in hover:bg-green-700 hover:text-white",
        size === "sm" && "px-2.5 py-1",
        size === "md" && "px-3 py-2",
      )}
      onClick={async () => {
        await approveCompany({ companyId });
        onApprove?.();
      }}
    >
      <div className="hidden md:block">
        {loading ? "Carregando..." : "Aprovar empreendimento"}
      </div>
    </button>
  );
};

export default ApproveCompanyButton;
