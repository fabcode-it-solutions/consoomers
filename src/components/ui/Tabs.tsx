import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";

type TabItem = {
  value: string;
  label: string;
  content: React.ReactNode;
};

interface TabsComponentProps {
  tabs: TabItem[];
  defaultValue?: string;
}

const TabsComponent: React.FC<TabsComponentProps> = ({ tabs, defaultValue }) => {
  return (
    <Tabs.Root defaultValue={defaultValue ?? tabs[0]?.value}>
      <Tabs.List className="flex space-x-4">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="px-4 py-2 text-sm font-medium text-[#151515] leading-[1.14] border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          className="p-4 border-t-2 border-gray-200"
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export default TabsComponent;
