import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenLayout from '../../components/layout/ScreenLayout';
import { CONTACT_EMAIL, SOCIAL_LINKS } from '../../data/contactInfo';
import { submitContactForm } from '../../services/contactForm';
import { useTheme } from '../../context/ThemeContext';

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
};

const initialForm: FormState = {
  fullName: '',
  phone: '',
  email: '',
  message: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ContactScreen() {
  const { colors } = useTheme();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit() {
    const fullName = form.fullName.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!fullName || !phone || !email || !message) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitContactForm({ fullName, phone, email, message });
      setForm(initialForm);
      setSuccess(true);
    } catch (submitError) {
      const messageText =
        submitError instanceof Error
          ? submitError.message
          : 'Message could not be sent. Please try again.';
      setError(messageText);
    } finally {
      setSubmitting(false);
    }
  }

  async function openSocialLink(url: string) {
    await Linking.openURL(url);
  }

  async function openEmail() {
    await Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  }

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 bg-white dark:bg-gray-950"
          contentContainerClassName="px-6 pb-8 pt-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-lg text-gray-500 dark:text-gray-400">Reach Out</Text>

          <View className="mt-5">
            <FieldLabel label="Full Name" required />
            <TextInput
              value={form.fullName}
              onChangeText={(value) => updateField('fullName', value)}
              autoCapitalize="words"
              autoCorrect={false}
              className="mt-2 rounded-md border px-4 py-3 text-base text-gray-900 dark:text-gray-100"
              style={{ borderColor: colors.border }}
            />
          </View>

          <View className="mt-5">
            <FieldLabel label="Phone Number" required />
            <TextInput
              value={form.phone}
              onChangeText={(value) => updateField('phone', value)}
              keyboardType="phone-pad"
              autoCorrect={false}
              className="mt-2 rounded-md border px-4 py-3 text-base text-gray-900 dark:text-gray-100"
              style={{ borderColor: colors.border }}
            />
          </View>

          <View className="mt-5">
            <FieldLabel label="Email" required />
            <TextInput
              value={form.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 rounded-md border px-4 py-3 text-base text-gray-900 dark:text-gray-100"
              style={{ borderColor: colors.border }}
            />
          </View>

          <View className="mt-5">
            <FieldLabel label="Your Message" required />
            <TextInput
              value={form.message}
              onChangeText={(value) => updateField('message', value)}
              multiline
              textAlignVertical="top"
              className="mt-2 min-h-[140px] rounded-md border px-4 py-3 text-base text-gray-900 dark:text-gray-100"
              style={{ borderColor: colors.border }}
            />
          </View>

          {error ? <Text className="mt-4 text-sm text-red-600">{error}</Text> : null}

          {success ? (
            <Text className="mt-4 text-sm" style={{ color: colors.brand }}>
              Thanks for reaching out! We will be in touch shortly.
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            className="mt-6 items-center rounded-full py-3.5"
            style={{
              backgroundColor: colors.brand,
              opacity: submitting ? 0.7 : 1,
            }}
            disabled={submitting}
            onPress={() => void handleSubmit()}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-sm font-bold tracking-widest text-white">SEND MESSAGE</Text>
            )}
          </Pressable>

          <View className="mt-10">
            <Text className="text-lg text-gray-500 dark:text-gray-400">Email</Text>
            <Pressable accessibilityRole="link" onPress={() => void openEmail()}>
              <Text
                className="mt-2 text-xl"
                style={{ color: '#2563EB', textDecorationLine: 'underline' }}
              >
                {CONTACT_EMAIL}
              </Text>
            </Pressable>
          </View>

          <View className="mt-10 items-center">
            <View className="flex-row items-center gap-5">
              {SOCIAL_LINKS.map((social) => (
                <Pressable
                  key={social.id}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${social.label}`}
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.cream }}
                  onPress={() => void openSocialLink(social.url)}
                >
                  <Ionicons name={social.icon} size={24} color={colors.brand} />
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

type FieldLabelProps = {
  label: string;
  required?: boolean;
};

function FieldLabel({ label, required }: FieldLabelProps) {
  return (
    <Text className="text-base text-gray-500 dark:text-gray-400">
      {label}
      {required ? <Text className="text-red-500"> *</Text> : null}
    </Text>
  );
}
