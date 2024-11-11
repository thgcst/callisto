import { useMemo } from "react";

import clsx from "clsx";

import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useApproveIndividuals } from "@/swr/individual";

type ApproveIndividualsButtonProps = {
  individualIds: string[];
  size?: "sm" | "md";
  onApprove?: () => void;
};

const ApproveIndividualsButton: React.FC<ApproveIndividualsButtonProps> = ({
  individualIds,
  size = "md",
  onApprove,
}) => {
  const { user } = useUser();
  const { approveIndividuals, loading } = useApproveIndividuals();

  const label = useMemo(() => {
    if (individualIds.length === 1) {
      return "Aprovar cadastro (1)";
    }

    return `Aprovar cadastros (${individualIds.length})`;
  }, [individualIds.length]);

  if (!user || !authorization.can(user, "approve:individual")) {
    return null;
  }

  return (
    <button
      type="button"
      className={clsx(
        "rounded-md bg-green-600 text-sm font-semibold text-white duration-100 ease-in hover:bg-green-700 hover:text-white",
        individualIds.length === 0 && "cursor-not-allowed opacity-50",
        size === "sm" && "px-2.5 py-1",
        size === "md" && "px-3 py-2",
      )}
      onClick={async () => {
        await approveIndividuals({ individualIds });
        onApprove?.();
      }}
      disabled={individualIds.length === 0}
    >
      <div className="hidden md:block">{loading ? "Carregando..." : label}</div>
    </button>
  );
};

export default ApproveIndividualsButton;
