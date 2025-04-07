export const colors = {
  primary: {
    main: '#000000',
    dark: '#111111',
    light: '#555555'
  },
  danger: {
    main: '#555555',
    dark: '#333333',
    light: '#888888'
  },
  success: {
    main: '#222222',
    dark: '#111111',
    light: '#444444'
  },
  warning: {
    main: '#444444',
    dark: '#222222',
    light: '#666666'
  },
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};

export const buttonStyle = (variant = 'primary', disabled = false) => {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      backgroundColor: colors.primary.main,
      color: 'white',
      ':hover': {
        backgroundColor: colors.primary.dark
      }
    },
    danger: {
      backgroundColor: colors.danger.main,
      color: 'white',
      ':hover': {
        backgroundColor: colors.danger.dark
      }
    },
    success: {
      backgroundColor: colors.success.main,
      color: 'white',
      ':hover': {
        backgroundColor: colors.success.dark
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.gray[700],
      border: `1px solid ${colors.gray[300]}`,
      ':hover': {
        backgroundColor: colors.gray[50]
      }
    },
    icon: {
      padding: '10px',
      borderRadius: '50%',
      backgroundColor: colors.gray[100],
      color: colors.gray[700],
      ':hover': {
        backgroundColor: colors.gray[200]
      }
    }
  };

  return {
    ...baseStyle,
    ...variants[variant]
  };
};

export const cardStyle = {
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

export const badgeStyle = (variant = 'primary') => {
  const baseStyle = {
    padding: '2px 8px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
  };

  const variants = {
    primary: {
      backgroundColor: colors.primary.light,
      color: colors.primary.dark
    },
    success: {
      backgroundColor: colors.success.light,
      color: colors.success.dark
    },
    warning: {
      backgroundColor: colors.warning.light,
      color: colors.warning.dark
    },
    danger: {
      backgroundColor: colors.danger.light,
      color: colors.danger.dark
    },
    gray: {
      backgroundColor: colors.gray[200],
      color: colors.gray[700]
    }
  };

  return {
    ...baseStyle,
    ...variants[variant]
  };
};
