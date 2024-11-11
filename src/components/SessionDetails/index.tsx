import {
  ForwardRefRenderFunction,
  Fragment,
  PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { Dialog, Transition } from "@headlessui/react";
import { formatDistanceToNow } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

type Data = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  browser: string | null;
  cpu: string | null;
  deviceModel: string | null;
  deviceType: string | null;
  deviceVendor: string | null;
  osName: string | null;
  osVersion: string | null;
};

type SessionDetailsRef = {
  open: (data: Data) => void;
};

const SessionDetails: ForwardRefRenderFunction<
  SessionDetailsRef,
  PropsWithChildren
> = (_, ref) => {
  const [data, setData] = useState<Data | null>(null);

  const closeButtonRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      open: (data) => {
        setData(data);
      },
    };
  });

  const handleClose = () => {
    setData(null);
  };

  return (
    <Transition.Root show={!!data} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={closeButtonRef}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                {data && (
                  <>
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 flex flex-col gap-4 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                              Sistema operacional
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {data.osName} {data.osVersion}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                              Dispositivo
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {[
                                data.deviceVendor,
                                data.deviceModel,
                                data.deviceType,
                              ]
                                .filter((item) => !!item)
                                .join(" - ")}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                              Navegador
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {data.browser}
                            </p>
                          </div>
                          {data.cpu && (
                            <div>
                              <h3 className="text-base font-semibold leading-6 text-gray-900">
                                CPU
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                {data.cpu}
                              </p>
                            </div>
                          )}
                          <div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                              Último acesso
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatDistanceToNow(new Date(data.updatedAt), {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                              Primeiro acesso
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                              {formatDistanceToNow(new Date(data.createdAt), {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={handleClose}
                        ref={closeButtonRef}
                      >
                        Fechar
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default forwardRef(SessionDetails);
