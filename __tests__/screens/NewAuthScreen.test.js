import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NewAuthScreen from '../../src/screens/auth/NewAuthScreen';
import { AuthProvider } from '../../src/contexts/AuthContext';

// Mock the AuthContext
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: jest.fn(),
    loadRememberedCredentials: jest.fn().mockResolvedValue(null)
  }),
  AuthProvider: ({ children }) => children
}));

describe('NewAuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render login form by default', () => {
    const { getByText, getByPlaceholderText } = render(<NewAuthScreen />);
    
    expect(getByText('Giriş Yap')).toBeTruthy();
    expect(getByPlaceholderText('E-posta adresiniz')).toBeTruthy();
    expect(getByPlaceholderText('Şifreniz')).toBeTruthy();
  });

  test('should switch to register form when register tab is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<NewAuthScreen />);
    
    fireEvent.press(getByText('Kayıt Ol'));
    
    expect(getByPlaceholderText('Ad Soyad')).toBeTruthy();
    expect(getByPlaceholderText('E-posta adresiniz')).toBeTruthy();
    expect(getByPlaceholderText('Telefon numaranız')).toBeTruthy();
  });

  test('should toggle password visibility', () => {
    const { getByPlaceholderText, getByTestId } = render(<NewAuthScreen />);
    
    const passwordInput = getByPlaceholderText('Şifreniz');
    const eyeIcon = getByTestId('eye-icon');
    
    // Initially password should be hidden
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // After pressing eye icon, password should be visible
    fireEvent.press(eyeIcon);
    expect(passwordInput.props.secureTextEntry).toBe(false);
  });

  test('should handle login form input', () => {
    const { getByPlaceholderText } = render(<NewAuthScreen />);
    
    const emailInput = getByPlaceholderText('E-posta adresiniz');
    const passwordInput = getByPlaceholderText('Şifreniz');
    
    fireEvent.changeText(emailInput, 'test@test.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(emailInput.props.value).toBe('test@test.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  test('should handle register form input', () => {
    const { getByText, getByPlaceholderText } = render(<NewAuthScreen />);
    
    // Switch to register form
    fireEvent.press(getByText('Kayıt Ol'));
    
    const nameInput = getByPlaceholderText('Ad Soyad');
    const emailInput = getByPlaceholderText('E-posta adresiniz');
    const phoneInput = getByPlaceholderText('Telefon numaranız');
    
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@test.com');
    fireEvent.changeText(phoneInput, '05551234567');
    
    expect(nameInput.props.value).toBe('Test User');
    expect(emailInput.props.value).toBe('test@test.com');
    expect(phoneInput.props.value).toBe('05551234567');
  });

  test('should show remember me checkbox in login form', () => {
    const { getByText } = render(<NewAuthScreen />);
    
    expect(getByText('Beni Hatırla')).toBeTruthy();
  });

  test('should toggle remember me checkbox', () => {
    const { getByText } = render(<NewAuthScreen />);
    
    const rememberMeText = getByText('Beni Hatırla');
    
    // Initially unchecked
    fireEvent.press(rememberMeText);
    
    // Should be checked now (visual feedback would be tested in integration tests)
  });

  test('should validate email format', async () => {
    const { getByPlaceholderText, getByText } = render(<NewAuthScreen />);
    
    const emailInput = getByPlaceholderText('E-posta adresiniz');
    const passwordInput = getByPlaceholderText('Şifreniz');
    const loginButton = getByText('Giriş Yap');
    
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(getByText('Geçerli bir e-posta adresi girin')).toBeTruthy();
    });
  });

  test('should validate required fields', async () => {
    const { getByText } = render(<NewAuthScreen />);
    
    const loginButton = getByText('Giriş Yap');
    fireEvent.press(loginButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(getByText('Lütfen tüm alanları doldurun')).toBeTruthy();
    });
  });

  test('should validate password confirmation in register form', async () => {
    const { getByText, getByPlaceholderText } = render(<NewAuthScreen />);
    
    // Switch to register form
    fireEvent.press(getByText('Kayıt Ol'));
    
    const nameInput = getByPlaceholderText('Ad Soyad');
    const emailInput = getByPlaceholderText('E-posta adresiniz');
    const phoneInput = getByPlaceholderText('Telefon numaranız');
    const passwordInput = getByPlaceholderText('Şifreniz');
    const confirmPasswordInput = getByPlaceholderText('Şifre tekrar');
    const registerButton = getByText('Hesap Oluştur');
    
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@test.com');
    fireEvent.changeText(phoneInput, '05551234567');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'differentpassword');
    fireEvent.press(registerButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(getByText('Şifreler eşleşmiyor')).toBeTruthy();
    });
  });
});
