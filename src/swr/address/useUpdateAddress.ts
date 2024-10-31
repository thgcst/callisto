import { useState } from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

type UpdateAddressBody = Partial<{
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}>;

function useUpdateAddress() {
  const [loading, setLoading] = useState(false);

  const updateAddress = async (addressId: string, body: UpdateAddressBody) => {
    setLoading(true);

    try {
      await toast.promise(api.patch(`/api/address/${addressId}`, body), {
        pending: "Atualizando endereço...",
        success: "Endereço atualizado com sucesso!",
        error: {
          render({ data }) {
            // @ts-ignore
            return data.response?.data?.message || data.message;
          },
        },
      });
    } catch (error) {
      //
    }

    setLoading(false);
  };

  return { updateAddress, loading };
}

export default useUpdateAddress;
