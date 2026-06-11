import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import ThemeToggleSwitch from './ThemeToggleSwitch';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay, type AccountRoute } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { getCustomerGreetingName } from '../../utils/customerDisplay';

const SHOP_PURPLE = '#5433EB';

type AccountDropdownProps = {
  visible: boolean;
  onClose: () => void;
  anchorTop: number;
  anchorRight: number;
};

export default function AccountDropdown({
  visible,
  onClose,
  anchorTop,
  anchorRight,
}: AccountDropdownProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { openAccount } = useOverlay();
  const { isAuthenticated, profile } = useCustomer();

  function handleNavigate(route: AccountRoute) {
    onClose();
    openAccount(route);
  }

  const greetingName = getCustomerGreetingName(profile);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1" onPress={onClose}>
        <View
          className="absolute rounded-2xl border px-4 py-4 shadow-lg"
          style={{
            top: anchorTop,
            right: anchorRight,
            minWidth: 220,
            borderColor: colors.border,
            backgroundColor: colors.background,
            shadowColor: '#000000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            {isAuthenticated && profile ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  onPress={() => handleNavigate('Profile')}
                >
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    Hi {greetingName}
                  </Text>
                  {profile.email ? (
                    <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                      {profile.email}
                    </Text>
                  ) : null}
                </Pressable>

                <ThemeToggleSwitch colors={colors} isDark={isDark} onToggle={toggleTheme} />
              </>
            ) : (
              <>
                <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>
                  Account
                </Text>

                <Pressable
                  className="mb-3 items-center rounded-full py-3.5"
                  style={{ backgroundColor: SHOP_PURPLE }}
                  onPress={() => handleNavigate('CustomerSignIn')}
                >
                  <Text className="text-sm font-semibold text-white">
                    Sign in with <Text style={{ fontWeight: '800' }}>shop</Text>
                  </Text>
                </Pressable>

                <Pressable
                  className="mb-4 items-center rounded-full py-3.5"
                  style={{ backgroundColor: colors.brand }}
                  onPress={() => handleNavigate('SignInEmail')}
                >
                  <Text className="text-sm font-semibold text-white">Other sign in options</Text>
                </Pressable>

                <View className="flex-row gap-2">
                  <DropdownAction
                    label="Orders"
                    icon="cube-outline"
                    colors={colors}
                    onPress={() => handleNavigate('Orders')}
                  />
                  <DropdownAction
                    label="Profile"
                    icon="person-outline"
                    colors={colors}
                    onPress={() => handleNavigate('Profile')}
                  />
                </View>

                <ThemeToggleSwitch colors={colors} isDark={isDark} onToggle={toggleTheme} />
              </>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

type DropdownActionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: ReturnType<typeof useTheme>['colors'];
  onPress: () => void;
};

function DropdownAction({ label, icon, colors, onPress }: DropdownActionProps) {
  return (
    <Pressable
      className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full py-2.5"
      style={{ backgroundColor: colors.brandDark }}
      onPress={onPress}
    >
      <Ionicons name={icon} size={14} color="#FFFFFF" />
      <Text className="text-xs font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
