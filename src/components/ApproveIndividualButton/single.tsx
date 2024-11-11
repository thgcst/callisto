import clsx from "clsx";

import { useApproveIndividual } from "@/swr/individual";

type ApproveIndividualButtonProps = {
  individualId: string;
  size?: "sm" | "md";
  onApprove?: () => void;
};

const ApproveIndividualButton: React.FC<ApproveIndividualButtonProps> = ({
  individualId,
  size = "md",
  onApprove,
}) => {
  const { approveIndividual, loading } = useApproveIndividual();
  return (
    <button
      type="button"
      className={clsx(
        "rounded-md bg-green-600 text-sm font-semibold text-white duration-100 ease-in hover:bg-green-700 hover:text-white",
        size === "sm" && "px-2.5 py-1",
        size === "md" && "px-3 py-2",
      )}
      onClick={async () => {
        await approveIndividual({ individualId });
        onApprove?.();
      }}
    >
      <div className="hidden md:block">
        {loading ? "Carregando..." : "Aprovar cadastro"}
      </div>
    </button>
  );
};

export default ApproveIndividualButton;
