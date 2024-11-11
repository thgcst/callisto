import { useState } from "react";

import { Address } from "@prisma/client";
import { toast } from "react-toastify";

import api from "@/services/api";

type CreateAddressBody = {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
};

function useCreateAddress() {
  const [loading, setLoading] = useState(false);

  const createAddress = async (body: CreateAddressBody) => {
    setLoading(true);

    try {
      const address = await toast.promise(
        api.post<Address>(`/api/address`, body),
        {
          pending: "Criando endereço...",
          success: "Endereço criado com sucesso!",
          error: {
            render({ data }) {
              // @ts-expect-error data is any
              return data.response?.data?.message || data.message;
            },
          },
        }
      );
      setLoading(false);
      return address.data;
    } catch {
      //
    }

    setLoading(false);
  };

  return { createAddress, loading };
}

export default useCreateAddress;
