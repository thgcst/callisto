// import { useApproveUser } from "@/swr/users";

type ApproveUserButtonProps = {
  userId: string;
  size: "sm" | "md";
};

const ApproveUserButton: React.FC<ApproveUserButtonProps> = ({
  userId,
  size = "md",
}) => {
  return null;
  // const { approveUser, loading } = useApproveUser();
  // return (
  //   <button
  //     type="button"
  //     className={clsx(
  //       "rounded-md bg-green-600 text-sm font-semibold text-white duration-100 ease-in hover:bg-green-700 hover:text-white",
  //       size === "sm" && "px-2.5 py-1",
  //       size === "md" && "px-3 py-2"
  //     )}
  //     onClick={async () => {
  //       await approveUser({ userId });
  //     }}
  //   >
  //     <div className="hidden md:block">
  //       {loading ? "Carregando..." : "Aprovar cadastro"}
  //     </div>
  //   </button>
  // );
};

export default ApproveUserButton;
