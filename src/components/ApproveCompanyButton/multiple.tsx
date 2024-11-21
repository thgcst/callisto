import { useMemo } from "react";

import clsx from "clsx";

import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useApproveCompanies } from "@/swr/company";

type ApproveCompaniesButtonProps = {
  companyIds: string[];
  size?: "sm" | "md";
  onApprove?: () => void;
};

const ApproveCompaniesButton: React.FC<ApproveCompaniesButtonProps> = ({
  companyIds,
  size = "md",
  onApprove,
}) => {
  const { user } = useUser();
  const { approveCompanies, loading } = useApproveCompanies();

  const label = useMemo(() => {
    if (companyIds.length === 1) {
      return "Aprovar cadastro (1)";
    }

    return `Aprovar cadastros (${companyIds.length})`;
  }, [companyIds.length]);

  if (!user || !authorization.can(user, "approve:company")) {
    return null;
  }

  return (
    <button
      type="button"
      className={clsx(
        "rounded-md bg-green-600 text-sm font-semibold text-white duration-100 ease-in hover:bg-green-700 hover:text-white",
        companyIds.length === 0 && "cursor-not-allowed opacity-50",
        size === "sm" && "px-2.5 py-1",
        size === "md" && "px-3 py-2",
      )}
      onClick={async () => {
        await approveCompanies({ companyIds });
        onApprove?.();
      }}
      disabled={companyIds.length === 0}
    >
      <div>{loading ? "Carregando..." : label}</div>
    </button>
  );
};

export default ApproveCompaniesButton;
