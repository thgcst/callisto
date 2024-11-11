import React, { ReactElement, useState } from "react";

import {
  Tab as HLTab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import clsx from "clsx";

type TabProps = {
  label: string;
  children: React.ReactNode;
};
const Tab: React.FC<TabProps> = ({ children }) => {
  return children;
};
Tab.displayName = "Tab";

type TabsProps = {
  children: React.ReactNode[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  rightSection?: React.ReactNode | ((tab: string) => React.ReactNode);
};

const Tabs: React.FC<TabsProps> = ({
  defaultIndex = 0,
  onChange,
  children,
  rightSection,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  return (
    <TabGroup
      selectedIndex={selectedIndex}
      onChange={(e) => {
        setSelectedIndex(e);
        onChange?.(e);
      }}
    >
      <TabList className="mb-4 flex items-start justify-between  border-b border-b-gray-200">
        <div className="flex items-center gap-x-8">
          {React.Children.map(children, (child) => {
            if (React.isValidElement<TabProps>(child)) {
              if (!child.props.label) {
                throw new Error("All children of Tabs must be Tab components");
              }
              return (
                <HLTab
                  className={clsx(
                    "border-b-2 border-b-transparent pb-4 text-sm font-medium text-gray-500 outline-0  disabled:opacity-50",
                    "data-[selected]:border-b-indigo-600 data-[selected]:text-indigo-600",
                    "hover:border-b-gray-300 hover:text-black",
                  )}
                >
                  {child.props.label}
                </HLTab>
              );
            }
            return null;
          })}
        </div>
        {rightSection instanceof Function
          ? rightSection(
              ((children[selectedIndex] as ReactElement)?.props as TabProps)
                ?.label,
            )
          : rightSection}
      </TabList>
      <TabPanels>
        {React.Children.map(children, (child) => {
          if (React.isValidElement<TabProps>(child)) {
            if (!child.props.children) {
              throw new Error("All children of Tabs must be Tab components");
            }
            return <TabPanel>{child.props.children}</TabPanel>;
          }
          return null;
        })}
      </TabPanels>
    </TabGroup>
  );
};

export { Tab };
export default Tabs;