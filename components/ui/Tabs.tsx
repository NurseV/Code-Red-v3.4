import React, { useState } from 'react';

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
  tabsContainerClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, tabsContainerClassName = '' }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(0);

  const isControlled = activeTab !== undefined && onTabChange !== undefined;
  const currentTab = isControlled ? activeTab : internalActiveTab;

  const handleTabClick = (index: number) => {
    if (isControlled) {
      onTabChange(index);
    } else {
      setInternalActiveTab(index);
    }
  };


  return (
    <div>
      <div className={`border-b border-dark-border ${tabsContainerClassName}`}>
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              onClick={() => handleTabClick(index)}
              className={`${
                index === currentTab
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-dark-text-secondary hover:text-dark-text hover:border-gray-500'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{tabs[currentTab].content}</div>
    </div>
  );
};

export default Tabs;