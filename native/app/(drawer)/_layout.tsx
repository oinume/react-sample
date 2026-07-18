import { Drawer } from 'expo-router/drawer';

import { CustomDrawerContent } from '@/components/bookmarks/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'front' }}>
      <Drawer.Screen name="index" />
    </Drawer>
  );
}
