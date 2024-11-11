import Link from "next/link";

import { PlusIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

const AddIndividualButton: React.FC = () => {
  return (
    <Link
      href="/cadastro/pessoa"
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white duration-100 ease-in hover:bg-indigo-700 hover:text-white"
    >
      <div className="hidden md:block">Cadastrar</div>
      <div className="md:hidden">
        <PlusIcon
          className={clsx(
            "size-5 text-white transition duration-150 ease-in-out group-hover:text-opacity-80"
          )}
        />
      </div>
    </Link>
  );
};

export default AddIndividualButton;
