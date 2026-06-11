const CONTACT_PAGE_URL = 'https://oaklandstooping.org/contact/';
const WPFORMS_AJAX_URL = 'https://oaklandstooping.org/wp-admin/admin-ajax.php';
const WPFORMS_ID = '29';
const WPFORMS_POST_ID = '11';

export type ContactFormPayload = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
};

type WpFormsToken = {
  token: string;
  tokenTime: string;
};

function parseWpFormsToken(html: string): WpFormsToken | null {
  const tokenMatch = html.match(/data-token="([^"]+)"/);
  const tokenTimeMatch = html.match(/data-token-time="([^"]+)"/);

  if (!tokenMatch || !tokenTimeMatch) {
    return null;
  }

  return {
    token: tokenMatch[1],
    tokenTime: tokenTimeMatch[1],
  };
}

async function fetchWpFormsToken(): Promise<WpFormsToken> {
  const response = await fetch(CONTACT_PAGE_URL);

  if (!response.ok) {
    throw new Error('Could not load the contact form. Please try again.');
  }

  const html = await response.text();
  const token = parseWpFormsToken(html);

  if (!token) {
    throw new Error('Could not prepare the contact form. Please try again.');
  }

  return token;
}

export async function submitContactForm(payload: ContactFormPayload): Promise<void> {
  const { token, tokenTime } = await fetchWpFormsToken();

  const body = new URLSearchParams({
    action: 'wpforms_submit',
    'wpforms[id]': WPFORMS_ID,
    'wpforms[post_id]': WPFORMS_POST_ID,
    'wpforms[fields][0]': payload.fullName.trim(),
    'wpforms[fields][4]': payload.phone.trim(),
    'wpforms[fields][1]': payload.email.trim(),
    'wpforms[fields][2]': payload.message.trim(),
    'wpforms[token]': token,
    'wpforms[token_time]': tokenTime,
    page_title: 'Contact',
    page_url: CONTACT_PAGE_URL,
    page_id: WPFORMS_POST_ID,
  });

  const response = await fetch(WPFORMS_AJAX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Message could not be sent. Please try again.');
  }

  const result = (await response.json()) as { success?: boolean };

  if (!result.success) {
    throw new Error('Message could not be sent. Please check your details and try again.');
  }
}
