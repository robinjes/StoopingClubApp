import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import ThemeToggleSwitch from './ThemeToggleSwitch';
import { useCustomer } from '../../context/CustomerContext';
import { useOverlay, type AccountRoute } from '../../context/OverlayContext';
import { useTheme } from '../../context/ThemeContext';
import { useWebAccountSession } from '../../context/WebAccountSessionContext';
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
  const { isAuthenticated, profile, logout } = useCustomer();
  const { webAccountEmail, clearWebAccountSession, requestWebSignOut } = useWebAccountSession();

  const signedInEmail = webAccountEmail ?? profile?.email ?? null;
  const isSignedIn = Boolean(isAuthenticated && profile) || Boolean(webAccountEmail);
  const greetingName = getCustomerGreetingName(profile);

  function handleNavigate(route: AccountRoute) {
    onClose();
    openAccount(route);
  }

  async function handleSignOut() {
    onClose();
    await logout();
    clearWebAccountSession();
    requestWebSignOut();
    openAccount('Orders');
  }

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
            {isSignedIn ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open account"
                  onPress={() => handleNavigate('Orders')}
                >
                  <Text className="text-lg font-bold" style={{ color: colors.text }}>
                    {greetingName ? `Hi ${greetingName}` : 'Account'}
                  </Text>
                  {signedInEmail ? (
                    <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                      {signedInEmail}
                    </Text>
                  ) : null}
                </Pressable>

                <ThemeToggleSwitch colors={colors} isDark={isDark} onToggle={toggleTheme} />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                  className="mt-4 items-center rounded-full border py-3"
                  style={{ borderColor: colors.border }}
                  onPress={() => void handleSignOut()}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    Sign Out
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>
                  Account
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open account"
                  className="mb-4 flex-row items-center justify-center gap-2 rounded-full py-3.5"
                  style={{ backgroundColor: colors.brandDark }}
                  onPress={() => handleNavigate('Orders')}
                >
                  <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">Account</Text>
                </Pressable>

                <ThemeToggleSwitch colors={colors} isDark={isDark} onToggle={toggleTheme} />
              </>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete account"
              className="mt-4 items-center rounded-full border py-3"
              style={{ borderColor: '#DC2626' }}
              onPress={() => handleNavigate('Profile')}
            >
              <Text className="text-sm font-semibold" style={{ color: '#DC2626' }}>
                Delete Account
              </Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
