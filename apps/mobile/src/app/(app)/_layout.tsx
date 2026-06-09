import { Tabs } from 'expo-router';

export default function AppTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true, tabBarActiveTintColor: 'rgb(30 64 175)' }}>
      <Tabs.Screen name="index" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="scores" options={{ title: 'Live' }} />
      <Tabs.Screen name="table" options={{ title: 'Table' }} />
      <Tabs.Screen name="players" options={{ title: 'Players' }} />
    </Tabs>
  );
}
