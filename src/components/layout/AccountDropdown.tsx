import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import ThemeToggleSwitch from './ThemeToggleSwitch';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay, type AccountRoute } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { getCustomerGreetingName } from '../../utils/customerDisplay';

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
                  onPress={() => handleNavigate('Orders')}
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
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  className="mb-4 flex-row items-center justify-center gap-2 rounded-full py-3.5"
                  style={{ backgroundColor: colors.brandDark }}
                  onPress={() => handleNavigate('Orders')}
                >
                  <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">Profile</Text>
                </Pressable>

                <ThemeToggleSwitch colors={colors} isDark={isDark} onToggle={toggleTheme} />
              </>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
