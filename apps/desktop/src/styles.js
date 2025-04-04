export const colors = {
  primary: {
    main: '#4f46e5',
    dark: '#4338ca',
    light: '#818cf8'
  },
  danger: {
    main: '#ef4444',
    dark: '#b91c1c',
    light: '#fca5a5'
  },
  success: {
    main: '#10b981',
    dark: '#047857',
    light: '#6ee7b7'
  },
  warning: {
    main: '#f59e0b',
    dark: '#b45309',
    light: '#fcd34d'
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
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  padding: '20px',
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
