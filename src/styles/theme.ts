// Modern Biblical Theme System

export const colors = {
    // Light Theme - Warm and inviting
    light: {
        primary: '#8B6914',       // Golden brown
        secondary: '#5C4033',     // Dark brown
        accent: '#D4AF37',        // Gold
        background: '#FFF8E7',    // Cream
        surface: '#FFFFFF',       // White
        text: '#2C2416',          // Dark brown text
        textSecondary: '#6B5D4F', // Medium brown
        border: '#E8D7C3',        // Light tan
        error: '#C1553D',         // Warm red
        success: '#6B8E23',       // Olive green
    },

    // Dark Theme - Elegant and sophisticated
    dark: {
        primary: '#D4AF37',       // Gold
        secondary: '#B8956A',     // Light tan
        accent: '#F4E4C1',        // Light cream
        background: '#1A1611',    // Very dark brown
        surface: '#2C2416',       // Dark brown
        text: '#F4E4C1',          // Light cream
        textSecondary: '#B8A490', // Light tan
        border: '#3D3428',        // Medium dark brown
        error: '#E07856',         // Coral
        success: '#8FBC8F',       // Light green
    },
};

export const typography = {
    // Font families
    fonts: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
        // For Bible text - will load custom fonts later
        bible: 'Crimson Text',
    },

    // Font sizes
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // Line heights
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
};

export type Theme = {
    colors: typeof colors.light;
    typography: typeof typography;
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    shadows: typeof shadows;
    isDark: boolean;
};

export const createTheme = (isDark: boolean): Theme => ({
    colors: isDark ? colors.dark : colors.light,
    typography,
    spacing,
    borderRadius,
    shadows,
    isDark,
});
