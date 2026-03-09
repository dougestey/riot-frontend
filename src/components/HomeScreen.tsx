'use client';

import { useState } from 'react';
import {
  Page,
  Navbar,
  Block,
  BlockTitle,
  Tabbar,
  TabbarLink,
  Icon,
} from 'konsta/react';

const tabs = [
  { id: 'events', label: 'Events', icon: '🎉' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'saved', label: 'Saved', icon: '❤️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('events');

  return (
    <Page>
      <Navbar title="RIOT" />

      <BlockTitle>{tabs.find((t) => t.id === activeTab)?.label}</BlockTitle>
      <Block strong inset>
        <p>Welcome to RIOT. Discover events near you.</p>
      </Block>

      <Tabbar labels className="left-0 bottom-0 fixed">
        {tabs.map((tab) => (
          <TabbarLink
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            label={tab.label}
            icon={
              <Icon>
                <span className="text-xl">{tab.icon}</span>
              </Icon>
            }
          />
        ))}
      </Tabbar>
    </Page>
  );
}
