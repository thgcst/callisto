import SelectIndividual from "@/components/SelectIndividual";
import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";
import { useCompany, useUpdateCompany } from "@/swr/company";

import { CompanyPageProps } from "./index.public";

interface EditPartnersProps {
  companyId: CompanyPageProps["company"]["id"];
}

const EditPartners: React.FC<EditPartnersProps> = ({ companyId }) => {
  const { user } = useUser();
  const canWrite = user && authorization.can(user, `edit:company`);
  const { company, mutate } = useCompany(companyId);
  const { updatePartners } = useUpdateCompany();

  const partners = (company?.partners || []).map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const handleAddPartner = async (
    individual: { id: string; name: string } | null,
  ) => {
    if (!company || !individual) return;

    mutate(
      {
        ...company,
        partners: [
          ...company.partners,
          {
            ...company.partners[0],
            id: individual.id,
            name: individual.name,
          },
        ],
      },
      { revalidate: false },
    );
    setTimeout(() => {
      const input = document.getElementsByName(
        `add-partner`,
      )[0] as HTMLInputElement;
      input.focus();
    }, 50);
    await updatePartners(companyId, {
      partners: [...partners.map((item) => item.id), individual.id],
    });

    mutate();
  };

  return (
    <div className="mt-10 sm:mt-0">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Sócios
            </h3>
            {/* <p className="mt-1 text-sm text-gray-600">
              Alunos que chegaram na aula com até 30min de atraso.
            </p> */}
          </div>
        </div>
        <div className="mt-5 grid gap-6 md:col-span-2 md:mt-0">
          <div className="shadow sm:rounded-md">
            <div className="bg-white px-4 py-5 sm:rounded-md sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                {canWrite && (
                  <div className="col-span-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <SelectIndividual
                          name="add-partner"
                          onChange={handleAddPartner}
                          label="Adicionar sócio"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {partners.map((item, index) => (
                  <div className="col-span-6" key={item.id}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-sm text-slate-500">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="relative w-full rounded-md border border-gray-300 bg-slate-100 px-3 py-2 text-left text-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPartners;
