import React, { Fragment, PropsWithChildren, useMemo } from "react";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import { useUser } from "@/contexts/userContext";
import authorization from "@/models/authorization";

import LinkOrButton from "../LinkOrButton";

type LayoutProps = PropsWithChildren & {
  label?: string;
  title?: string;
  rightAccessory?: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({
  label,
  title,
  children,
  rightAccessory,
}) => {
  const { user, logout } = useUser();
  const { pathname, push } = useRouter();
  const showNotificationsMenu = false;

  const navigation = [
    {
      name: "Pessoas",
      href: "/pessoas",
      regExp: /^\/pessoas.*/,
      hide: false,
      // hide: me ? !authorization.roleIsAdmin(me) : true,
    },
    {
      name: "Empreendimentos",
      href: "/empreendimentos",
      regExp: /^\/empreendimentos$/,
    },
    {
      name: "Fórum",
      href: "/forum",
      regExp: /^\/forum$/,
    },
    {
      name: "Usuários",
      href: "/usuarios",
      regExp: /^\/usuarios$/,
      hide: user ? !authorization.can(user, "read:users") : true,
    },
  ];

  const userNavigation = useMemo(() => {
    let pages = [];

    if (user) {
      pages = [
        {
          name: "Minha conta",
          href: "/minha-conta",
        },
        {
          name: "Sair",
          onClick: async () => {
            await logout();
          },
        },
      ];
    } else {
      pages = [
        {
          name: "Entrar",
          href: "/login",
        },
      ];
    }

    return pages;
  }, [logout, user]);

  return (
    <>
      <Head>
        <title>{`${title || label} · Callisto`}</title>
        <meta name="title" content={title || label} key="title" />
      </Head>
      <div className="flex min-h-full flex-col">
        <Disclosure as="nav" className="sticky top-0 z-40 w-full bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <Link href="/" passHref>
                        <div className="relative size-8 cursor-pointer">
                          <Image
                            src="/globe.svg"
                            alt="Logo"
                            width={32}
                            height={32}
                          />
                        </div>
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map(
                          (item) =>
                            !item?.hide && (
                              <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                  item.regExp.test(pathname)
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                  "rounded-md px-3 py-2 text-sm font-medium",
                                )}
                                aria-current={
                                  item.regExp.test(pathname)
                                    ? "page"
                                    : undefined
                                }
                              >
                                {item.name}
                              </Link>
                            ),
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {showNotificationsMenu && (
                        <button
                          type="button"
                          className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="size-6" aria-hidden="true" />
                        </button>
                      )}

                      {/* Profile dropdown */}
                      {user ? (
                        <Menu as="div" className="relative ml-4">
                          <div>
                            <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                              <span className="sr-only">Open user menu</span>
                              <div className="relative size-8">
                                <Image
                                  className="size-8 rounded-full object-cover"
                                  src={
                                    user?.avatar ||
                                    "https://i.ibb.co/k0tSSCy/user.png"
                                  }
                                  alt=""
                                  width={32}
                                  height={32}
                                />
                              </div>
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                              {userNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <LinkOrButton
                                      href={item.href}
                                      className={clsx(
                                        active ? "bg-gray-100" : "",
                                        "block cursor-pointer px-4 py-2 text-sm text-gray-700",
                                      )}
                                      onClick={item.onClick}
                                    >
                                      {item.name}
                                    </LinkOrButton>
                                  )}
                                </Menu.Item>
                              ))}
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      ) : (
                        <Link
                          href="/login"
                          className="text-sm/6 font-semibold text-white"
                        >
                          Log in <span aria-hidden="true">&rarr;</span>
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="ml-4 inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block size-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block size-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                  {navigation.map((item) => (
                    <Link href={item.href} key={item.name} passHref>
                      <Disclosure.Button
                        as="a"
                        className={clsx(
                          item.regExp.test(pathname)
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "block rounded-md px-3 py-2 text-base font-medium",
                        )}
                        aria-current={
                          item.regExp.test(pathname) ? "page" : undefined
                        }
                      >
                        {item.name}
                      </Disclosure.Button>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-700 pb-3 pt-4">
                  {user ? (
                    <div className="mb-3 flex items-center px-5">
                      <div className="shrink-0">
                        <div className="relative size-10">
                          <Image
                            className="size-10 rounded-full object-cover"
                            src={
                              user?.avatar ||
                              "https://i.ibb.co/k0tSSCy/user.png"
                            }
                            alt=""
                            width={40}
                            height={40}
                          />
                        </div>
                      </div>
                      <div className="ml-3 flex h-10 flex-1 flex-col justify-evenly">
                        <div className="text-base font-medium leading-none text-white">
                          {user?.email}
                        </div>
                        <div className="text-xs font-medium leading-none text-gray-400">
                          {user?.name}
                        </div>
                      </div>
                      {showNotificationsMenu && (
                        <button
                          type="button"
                          className="ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                          <span className="sr-only">View notifications</span>
                          <BellIcon className="size-6" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ) : null}
                  <div className="space-y-1 px-2">
                    {userNavigation.map((item) =>
                      item.href ? (
                        <Link passHref key={item.name} href={item.href}>
                          <Disclosure.Button
                            as="a"
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            {item.name}
                          </Disclosure.Button>
                        </Link>
                      ) : (
                        <Disclosure.Button
                          key={item.name}
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                          onClick={item.onClick}
                        >
                          {item.name}
                        </Disclosure.Button>
                      ),
                    )}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        {label && (
          <header className="bg-white shadow">
            <div className="mx-auto flex max-w-7xl flex-row flex-wrap items-center justify-between gap-3 gap-y-4 px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="truncate text-3xl font-bold text-gray-900">
                {label}
              </h1>
              {rightAccessory}
            </div>
          </header>
        )}

        <main className="flex-1">
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <footer className="mx-auto flex w-full max-w-7xl flex-col items-center py-6 sm:px-6 lg:px-8">
          <div className="mb-4 w-full border-t border-gray-200" />

          <div className="flex w-full flex-col items-center gap-1 lg:flex-row lg:justify-center">
            <p className="text-xs text-slate-400 lg:w-1/2">Callisto Inc.</p>
            <p className="order-2 text-xs text-slate-400 lg:order-3 lg:w-1/2 lg:text-right">
              Rio de Janeiro, RJ
            </p>
            <Image
              src="/globe.svg"
              alt="Logo"
              width={24}
              height={24}
              className="order-3 mt-2 lg:order-2 lg:mx-auto lg:mt-0"
            />
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
